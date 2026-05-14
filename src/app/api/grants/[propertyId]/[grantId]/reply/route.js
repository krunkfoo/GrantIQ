import { auth } from '../../../../../../auth.js'
import { db } from '../../../../../../db/index.js'
import { properties, grantWorkbooks, grantStates, statusHistory } from '../../../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId, grantId } = await params
  const { emailContent } = await req.json()

  // Verify property ownership
  const [property] = await db.select().from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, session.user.id)))
    .limit(1)
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get workbook + current grant state
  const [workbook] = await db.select().from(grantWorkbooks)
    .where(eq(grantWorkbooks.propertyId, propertyId)).limit(1)
  if (!workbook) return NextResponse.json({ error: 'No workbook' }, { status: 404 })

  const [state] = await db.select().from(grantStates)
    .where(and(eq(grantStates.workbookId, workbook.id), eq(grantStates.grantId, grantId)))
    .limit(1)

  // Find the grant in researchedGrants
  const grants = workbook.researchedGrants ?? []
  const grant = grants.find(g => g.id === grantId)

  // Ask Claude to parse the reply
  const prompt = `You are parsing an email reply from a grant agency.

Property: ${property.address}, ${property.city} (${property.propertyType})
Grant being tracked: ${grant?.name ?? grantId}

Email reply:
---
${emailContent}
---

Return a JSON object with:
{
  "status": one of "Replied — Interested" | "Replied — Ineligible" | "Replied — Needs More Info" | "Replied — Meeting Requested" | "Replied — Approved" | "Replied — Closed / No Funding",
  "note": "1-2 sentence summary of what the reply says, in plain English",
  "nextAction": "The specific next step the owner should take, e.g. 'Apply during June 2026 window' or 'Schedule call with Mary Haidri'",
  "deadline": "Any new deadline mentioned (null if none)",
  "newGrants": [
    {
      "id": "kebab-case-id",
      "name": "Full program name",
      "type": "Federal" | "State" | "Local",
      "estValue": "$X–$Y",
      "estValueNum": 10000,
      "useFor": "What this covers",
      "status": "eligible" | "watch",
      "deadline": "Specific deadline or null",
      "applicationLink": "URL or null",
      "contact": { "name": "...", "title": "...", "email": "...", "phone": "..." },
      "eligibilityChecks": [],
      "checklist": [],
      "steps": [],
      "draftEmail": null,
      "hireRecommendation": { "needed": false }
    }
  ]
}

Only include newGrants if the reply explicitly mentions additional programs the owner should pursue. Return ONLY the JSON object.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].text.trim()
  const parsed = JSON.parse(raw.startsWith('{') ? raw : raw.replace(/^```json?\n?/, '').replace(/\n?```$/, ''))

  // Update grant state
  if (state) {
    await db.update(grantStates)
      .set({ workflowStatus: parsed.status, updatedAt: new Date() })
      .where(eq(grantStates.id, state.id))

    await db.insert(statusHistory).values({
      grantStateId: state.id,
      event: parsed.status,
      note: parsed.note,
    })
  }

  // Add any new grants to the workbook
  if (parsed.newGrants?.length > 0) {
    const existingIds = new Set(grants.map(g => g.id))
    const toAdd = parsed.newGrants.filter(g => !existingIds.has(g.id))

    if (toAdd.length > 0) {
      const updated = [...grants, ...toAdd]
      await db.update(grantWorkbooks)
        .set({ researchedGrants: updated })
        .where(eq(grantWorkbooks.id, workbook.id))

      // Create grantState rows for new grants
      for (const g of toAdd) {
        await db.insert(grantStates).values({
          workbookId: workbook.id,
          grantId: g.id,
          workflowStatus: 'Not started',
          emailBody: null,
        })
      }
    }
  }

  return NextResponse.json({
    ok: true,
    status: parsed.status,
    note: parsed.note,
    nextAction: parsed.nextAction,
    deadline: parsed.deadline,
    newGrants: parsed.newGrants ?? [],
  })
}
