import { auth } from '../../../../../auth.js'
import { db } from '../../../../../db/index.js'
import { properties, grantWorkbooks, grantStates } from '../../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // seconds — Render allows up to 60s on free tier

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BUDGET_LABELS = {
  unsure: 'not yet determined',
  '<250k': 'under $250,000',
  '250k-500k': '$250,000–$500,000',
  '500k-1m': '$500,000–$1,000,000',
  '1m-3m': '$1,000,000–$3,000,000',
  '>3m': 'over $3,000,000',
}

function buildPrompt(property) {
  const budget = BUDGET_LABELS[property.budget] ?? property.budget ?? 'not yet determined'
  const today = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return `You are a grant research expert specializing in US property rehabilitation, historic preservation, and small business incentives. Today is ${today}.

A property owner has submitted the following details:
- Address: ${property.address}
- City / State / ZIP: ${property.city}
- Property type: ${property.propertyType}
- Project scope: ${property.scope}
- Estimated budget: ${budget}
- Target start date: ${property.startDate || 'not specified'}

Your job: Research and return EVERY applicable grant, tax credit, loan program, and regulatory incentive for this specific property. Include both eligible AND ineligible programs (with clear reasons why ineligible). Be ruthlessly specific — use the actual address, city, and jurisdiction to determine eligibility.

Rules:
1. Include federal programs (Historic Tax Credit, SBA 504, ADA tax credits, USDA, NEH, etc.)
2. Include state programs (CA State Historic Tax Credit, CalOSBA, CDFI programs, etc.)
3. Include city/county programs SPECIFIC to this jurisdiction (SF Shines, Richmond grants, Sonoma TIF, etc.). Only include local programs that actually exist for this city/county — do not invent programs.
4. Flag ineligible programs with exact reasons (wrong jurisdiction, wrong property type, wrong use, etc.)
5. Use real contacts: actual program administrator names, emails, phone numbers, and application URLs where you know them. Mark as "Confirm current contact" if uncertain.
6. Be specific about dollar amounts. Use ranges. Never say "varies" without a range.
7. Rank eligible grants by est. value (highest first).
8. Return at most 12 grants total. Prioritize the highest-value eligible programs; lump minor ineligible programs into a single "Other programs reviewed — ineligible" entry if needed.
9. Keep checklist labels SHORT (under 8 words each). Keep steps SHORT (1 sentence each). Max 4 steps and 4 checklist items per grant. Max 2 eligibilityChecks per grant.

Return a JSON array. Each element must match this EXACT schema (no extra fields):
{
  "id": "kebab-case-id",
  "name": "Full program name",
  "type": "Federal" | "State" | "Local" | "Regulatory",
  "estValue": "$X–$Y or X% of QREs",
  "estValueNum": 50000,
  "useFor": "One sentence: what project scope this covers",
  "status": "eligible" | "ineligible" | "watch",
  "ineligibleReason": "Specific reason if ineligible, null otherwise",
  "deadline": "Specific deadline or 'Rolling' or 'Annual — typically [month]'",
  "applicationLink": "https://... or null",
  "eligibilityChecks": [
    { "label": "Short requirement label", "pass": true | false | null }
  ],
  "checklist": [
    { "label": "Short action item", "done": false }
  ],
  "steps": ["Step 1 sentence.", "Step 2 sentence."],
  "contact": {
    "name": "First Last",
    "title": "Title",
    "email": "email@domain.com",
    "phone": "(XXX) XXX-XXXX"
  } | null,
  "hireRecommendation": {
    "needed": true | false,
    "reason": "One sentence referencing this property",
    "firm": "Firm name or null",
    "contact": "Contact name or null",
    "email": "firm@email.com or null"
  }
}

Return ONLY the JSON array. No markdown, no explanation, no preamble. Start with [ and end with ].`
}

export async function POST(req, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId } = await params

  // Verify ownership
  const [property] = await db.select().from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, session.user.id)))
    .limit(1)
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get workbook
  const [workbook] = await db.select().from(grantWorkbooks)
    .where(eq(grantWorkbooks.propertyId, propertyId)).limit(1)
  if (!workbook) return NextResponse.json({ error: 'No workbook' }, { status: 404 })

  // Mark as running
  await db.update(grantWorkbooks)
    .set({ researchStatus: 'running' })
    .where(eq(grantWorkbooks.id, workbook.id))

  try {
    const message = await client.messages.create(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        messages: [{ role: 'user', content: buildPrompt(property) }],
      },
      {
        headers: { 'anthropic-beta': 'output-128k-2025-02-19' },
      }
    )

    const raw = message.content[0].text.trim()

    // Strip any accidental markdown fences
    const stripped = raw.startsWith('[') ? raw : raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')

    // Detect truncation — if stop_reason is max_tokens the JSON is incomplete
    if (message.stop_reason === 'max_tokens') {
      throw new Error('Claude response was truncated (max_tokens reached). The property scope may be too broad — try narrowing the project description.')
    }

    let grants
    try {
      grants = JSON.parse(stripped)
    } catch (parseErr) {
      // Attempt to salvage a partial array by closing it
      const lastComma = stripped.lastIndexOf(',')
      const truncated = lastComma > 0 ? stripped.slice(0, lastComma) + ']' : null
      if (truncated) {
        try {
          grants = JSON.parse(truncated)
          console.warn('Salvaged partial grants array — some grants may be missing')
        } catch {
          throw new Error(`JSON parse failed: ${parseErr.message}. Response length: ${stripped.length} chars. stop_reason: ${message.stop_reason}`)
        }
      } else {
        throw new Error(`JSON parse failed: ${parseErr.message}. Response length: ${stripped.length} chars.`)
      }
    }

    // Save researched grants to workbook
    await db.update(grantWorkbooks)
      .set({ researchStatus: 'done', researchedGrants: grants })
      .where(eq(grantWorkbooks.id, workbook.id))

    // Sync grantStates — upsert one row per grant
    for (const g of grants) {
      const existing = await db.select().from(grantStates)
        .where(and(eq(grantStates.workbookId, workbook.id), eq(grantStates.grantId, g.id)))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(grantStates).values({
          workbookId: workbook.id,
          grantId: g.id,
          workflowStatus: g.status === 'ineligible' ? 'Ineligible' : 'Not started',
          emailBody: null,
        })
      }
    }

    return NextResponse.json({ ok: true, count: grants.length })
  } catch (err) {
    console.error('Grant research error:', err)
    await db.update(grantWorkbooks)
      .set({ researchStatus: 'error' })
      .where(eq(grantWorkbooks.id, workbook.id))
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId } = await params

  const [workbook] = await db.select().from(grantWorkbooks)
    .where(eq(grantWorkbooks.propertyId, propertyId)).limit(1)

  if (!workbook) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    status: workbook.researchStatus,
    grants: workbook.researchedGrants ?? null,
  })
}
