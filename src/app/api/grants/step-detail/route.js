import { auth } from '../../../../auth.js'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { grantName, step, contact } = await req.json()
  if (!grantName || !step) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const contactLine = contact?.email
    ? `The program contact is ${contact.name ?? 'the program office'} at ${contact.email}${contact.phone ? ` / ${contact.phone}` : ''}.`
    : ''

  const prompt = `A property owner is working on applying for the "${grantName}" grant program.

They need to complete this specific step:
"${step}"

${contactLine}

Give them 3–5 practical bullet points explaining exactly HOW to do this step. Be concrete:
- Mention real actions (who to call, what to say, what documents to prepare)
- If there's a form or application, describe what information they'll need
- If there's a call to make, suggest what to ask
- Keep each bullet to 1–2 sentences

Return ONLY a JSON object: { "bullets": ["bullet 1", "bullet 2", ...] }
No markdown, no preamble.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].text.trim()
    const json = raw.startsWith('{') ? raw : raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    const { bullets } = JSON.parse(json)

    return NextResponse.json({ bullets })
  } catch (err) {
    console.error('[step-detail] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
