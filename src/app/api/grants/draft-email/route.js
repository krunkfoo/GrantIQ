import { auth } from '../../../../auth.js'
import { db } from '../../../../db/index.js'
import { properties } from '../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId, grant } = await req.json()
  if (!propertyId || !grant) return NextResponse.json({ error: 'Missing propertyId or grant' }, { status: 400 })

  // Verify ownership
  const [property] = await db.select().from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, session.user.id)))
    .limit(1)
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const prompt = `You are helping a property owner draft a professional outreach email to a grant program administrator.

Property details:
- Address: ${property.address}, ${property.city}
- Property type: ${property.propertyType}
- Project scope: ${property.scope}

Grant program: ${grant.name}
Program type: ${grant.type}
Contact: ${grant.contact ? `${grant.contact.name}, ${grant.contact.title} — ${grant.contact.email}` : 'Program administrator'}
Application link: ${grant.applicationLink || 'N/A'}

Write a professional, concise inquiry email from the property owner to this program. The email should:
1. Briefly introduce the property and project
2. Explain why they believe they qualify
3. Ask a specific, useful question about next steps or eligibility
4. Be 150–200 words max — concise and professional
5. Sign off with "[Your name]" and "[Your email]" as literal placeholders

Return ONLY a JSON object with this schema:
{
  "to": "Contact Name <email@domain.com>",
  "subject": "Subject line referencing the actual property address",
  "body": "Full email body text"
}

No markdown, no preamble. Start with { and end with }.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].text.trim()
    const jsonText = raw.startsWith('{') ? raw : raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    const draft = JSON.parse(jsonText)

    return NextResponse.json({ ok: true, draft })
  } catch (err) {
    console.error('Draft email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
