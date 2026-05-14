import { auth } from '../../../../../auth.js'
import { db } from '../../../../../db/index.js'
import { properties, grantWorkbooks, grantStates, statusHistory } from '../../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Fetch recent Gmail threads matching grant-related senders/subjects
async function fetchGrantEmails(accessToken, grantNames) {
  const query = [
    'in:anywhere',
    'newer_than:90d',
    '(' + [
      'subject:grant',
      'subject:preservation',
      'subject:incentive',
      'subject:tax credit',
      'subject:shines',
      'subject:SBA',
      'subject:CHBC',
      'subject:Mills Act',
      'subject:historic',
      ...grantNames.slice(0, 5).map(n => `subject:"${n.split(' ').slice(0, 3).join(' ')}"`)
    ].join(' OR ') + ')',
  ].join(' ')

  const searchRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads?q=${encodeURIComponent(query)}&maxResults=20`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!searchRes.ok) throw new Error(`Gmail API error: ${searchRes.status}`)
  const { threads = [] } = await searchRes.json()

  // Fetch full thread content for each
  const fullThreads = await Promise.all(
    threads.slice(0, 10).map(async ({ id }) => {
      const r = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!r.ok) return null
      return r.json()
    })
  )

  return fullThreads.filter(Boolean)
}

function extractBody(payload) {
  if (!payload) return ''
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8').slice(0, 2000)
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractBody(part)
      if (text) return text
    }
  }
  return ''
}

function getHeader(headers, name) {
  return headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

export async function POST(req, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const gmailToken = session._gmailAccessToken
  if (!gmailToken) {
    return NextResponse.json({ error: 'Gmail not connected. Sign in with Google to enable inbox sync.', gmailRequired: true }, { status: 403 })
  }

  const { propertyId } = await params

  // Verify ownership
  const [property] = await db.select().from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, session.user.id)))
    .limit(1)
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [workbook] = await db.select().from(grantWorkbooks)
    .where(eq(grantWorkbooks.propertyId, propertyId)).limit(1)
  if (!workbook) return NextResponse.json({ error: 'No workbook' }, { status: 404 })

  const grants = workbook.researchedGrants ?? []
  const states = await db.select().from(grantStates)
    .where(eq(grantStates.workbookId, workbook.id))

  // Fetch grant-related emails from Gmail
  const threads = await fetchGrantEmails(gmailToken, grants.map(g => g.name))
  if (threads.length === 0) return NextResponse.json({ ok: true, updates: [], message: 'No grant-related emails found in the last 90 days.' })

  // Summarize threads for Claude
  const threadSummaries = threads.map(thread => {
    const msgs = thread.messages ?? []
    const latest = msgs[msgs.length - 1]
    const headers = latest?.payload?.headers ?? []
    return {
      id: thread.id,
      subject: getHeader(headers, 'subject'),
      from: getHeader(headers, 'from'),
      date: getHeader(headers, 'date'),
      snippet: latest?.snippet ?? '',
      body: extractBody(latest?.payload).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 800),
    }
  })

  // Ask Claude to match threads to grants and classify
  const prompt = `You are reviewing email threads to find replies related to grant applications for a property.

Property: ${property.address}, ${property.city} (${property.propertyType})

Active grants being tracked:
${grants.filter(g => g.status === 'eligible').map(g => `- ${g.id}: ${g.name}`).join('\n')}

Email threads:
${JSON.stringify(threadSummaries, null, 2)}

For each email thread that is clearly a reply from a grant agency, program administrator, or consultant related to one of the grants above, return a match.

Return a JSON array:
[
  {
    "threadId": "gmail thread id",
    "grantId": "grant-id from the list above",
    "status": "Replied — Interested" | "Replied — Ineligible" | "Replied — Needs More Info" | "Replied — Meeting Requested" | "Replied — Approved" | "Replied — Closed / No Funding",
    "note": "1-2 sentence plain-English summary of the reply",
    "nextAction": "Specific next step the owner should take",
    "from": "sender name / org"
  }
]

Only include threads you are confident match a grant. If no threads match, return []. Return ONLY the JSON array.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].text.trim()
  const updates = JSON.parse(raw.startsWith('[') ? raw : '[]')

  // Apply updates
  const applied = []
  for (const u of updates) {
    const state = states.find(s => s.grantId === u.grantId)
    if (!state) continue

    // Only update if this is a newer/different status
    if (state.workflowStatus === u.status) continue

    await db.update(grantStates)
      .set({ workflowStatus: u.status, updatedAt: new Date() })
      .where(eq(grantStates.id, state.id))

    await db.insert(statusHistory).values({
      grantStateId: state.id,
      event: u.status,
      note: `${u.note} (auto-detected from inbox — from: ${u.from})`,
    })

    applied.push({ grantId: u.grantId, status: u.status, note: u.note, nextAction: u.nextAction })
  }

  return NextResponse.json({ ok: true, updates: applied, scanned: threads.length })
}
