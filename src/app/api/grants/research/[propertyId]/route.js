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
6. Draft emails should use the actual property address and project scope — no brackets or placeholder text.
7. Be specific about dollar amounts. Use ranges. Never say "varies" without a range.
8. Rank eligible grants by est. value (highest first).

Return a JSON array. Each element must match this exact schema:
{
  "id": "kebab-case-id",
  "name": "Full program name",
  "type": "Federal" | "State" | "Local" | "Regulatory",
  "estValue": "$X–$Y or X% of QREs",
  "estValueNum": 50000,
  "useFor": "Plain-English description of what project scope this covers",
  "status": "eligible" | "ineligible" | "watch",
  "ineligibleReason": "Specific reason if ineligible, null otherwise",
  "deadline": "Specific deadline or 'Rolling' or 'Annual — typically [month]'",
  "applicationLink": "https://... (real URL or null)",
  "eligibilityChecks": [
    { "label": "Requirement description", "pass": true | false | null }
  ],
  "checklist": [
    { "label": "Action item", "done": false }
  ],
  "steps": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "draftEmail": {
    "to": "Name <email@domain.com>",
    "subject": "Subject line with actual address",
    "body": "Full email body — use actual address and project scope. Sign off with [Your name] and [Your email] only."
  } | null,
  "contact": {
    "name": "First Last",
    "title": "Title",
    "email": "email@domain.com",
    "phone": "(XXX) XXX-XXXX"
  } | null,
  "hireRecommendation": {
    "needed": true | false,
    "reason": "Specific reason referencing this property",
    "firm": "Firm name if applicable",
    "contact": "Contact name",
    "email": "firm@email.com"
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
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: buildPrompt(property) }],
    })

    const raw = message.content[0].text.trim()

    // Strip any accidental markdown fences
    const jsonText = raw.startsWith('[') ? raw : raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    const grants = JSON.parse(jsonText)

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
