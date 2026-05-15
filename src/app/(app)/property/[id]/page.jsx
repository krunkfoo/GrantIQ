import { auth } from '../../../../auth.js'
import { db } from '../../../../db/index.js'
import { properties, grantWorkbooks, grantStates, checklistStates } from '../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import GrantWorkbookClient from '../../../../components/GrantWorkbook.jsx'
import ResearchingLoader from '../../../../components/ResearchingLoader.jsx'

export default async function PropertyPage({ params }) {
  const { id } = await params
  const session = await auth()
  const userId = session.user.id

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, userId)))
    .limit(1)

  if (!property) notFound()

  // Get or create workbook
  let [workbook] = await db
    .select()
    .from(grantWorkbooks)
    .where(eq(grantWorkbooks.propertyId, id))
    .limit(1)

  if (!workbook) {
    ;[workbook] = await db
      .insert(grantWorkbooks)
      .values({ propertyId: id, researchStatus: 'pending' })
      .returning()
  }

  // Research not done yet — show animated loader (triggers research client-side)
  if (workbook.researchStatus !== 'done') {
    return (
      <ResearchingLoader
        propertyId={id}
        address={`${property.address}${property.city ? `, ${property.city}` : ''}`}
      />
    )
  }

  // Research complete — merge grants with user state
  const aiGrants = workbook.researchedGrants ?? []

  const states = await db
    .select()
    .from(grantStates)
    .where(eq(grantStates.workbookId, workbook.id))

  const allChecklists = await db
    .select({
      grantStateId: checklistStates.grantStateId,
      itemIndex: checklistStates.itemIndex,
      done: checklistStates.done,
    })
    .from(checklistStates)
    .innerJoin(grantStates, eq(checklistStates.grantStateId, grantStates.id))
    .where(eq(grantStates.workbookId, workbook.id))

  const mergedGrants = aiGrants.map(g => {
    const state = states.find(s => s.grantId === g.id)
    const itemChecks = allChecklists.filter(c => c.grantStateId === state?.id)
    return {
      ...g,
      stateId: state?.id ?? null,
      workflowStatus: state?.workflowStatus ?? (g.status === 'ineligible' ? 'Ineligible' : 'Not started'),
      // User-edited email body takes precedence; otherwise use Claude's draft
      emailBody: state?.emailBody ?? g.draftEmail?.body ?? '',
      notes: state?.notes ?? '',
      checklist: (g.checklist ?? []).map((item, i) => {
        const saved = itemChecks.find(c => c.itemIndex === i)
        return { ...item, done: saved ? saved.done : item.done }
      }),
    }
  })

  return (
    <GrantWorkbookClient
      property={property}
      grants={mergedGrants}
      workbookId={workbook.id}
      demo={false}
    />
  )
}
