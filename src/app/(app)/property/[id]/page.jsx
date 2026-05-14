import { auth } from '@clerk/nextjs/server'
import { db } from '../../../../db/index.js'
import { properties, grantWorkbooks, grantStates, checklistStates } from '../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { grants as allGrants } from '../../../../data/grants.js'
import GrantWorkbookClient from '../../../../components/GrantWorkbook.jsx'

export default async function PropertyPage({ params }) {
  const { id } = await params
  const { userId } = await auth()

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
      .values({ propertyId: id })
      .returning()

    // Seed grant states
    await db.insert(grantStates).values(
      allGrants.map(g => ({
        workbookId: workbook.id,
        grantId: g.id,
        workflowStatus: g.status === 'ineligible' ? 'Ineligible' : 'Not started',
        emailBody: g.draftEmail?.body ?? null,
      }))
    )
  }

  // Load all grant states
  const states = await db
    .select()
    .from(grantStates)
    .where(eq(grantStates.workbookId, workbook.id))

  // Load all checklist states in one query via workbook join
  const allChecklists = await db
    .select({ grantStateId: checklistStates.grantStateId, itemIndex: checklistStates.itemIndex, done: checklistStates.done })
    .from(checklistStates)
    .innerJoin(grantStates, eq(checklistStates.grantStateId, grantStates.id))
    .where(eq(grantStates.workbookId, workbook.id))

  // Merge DB state into grant definitions
  const mergedGrants = allGrants.map(g => {
    const state = states.find(s => s.grantId === g.id)
    const itemChecks = allChecklists.filter(c => c.grantStateId === state?.id)
    return {
      ...g,
      stateId: state?.id ?? null,
      workflowStatus: state?.workflowStatus ?? g.workflowStatus,
      emailBody: state?.emailBody ?? g.draftEmail?.body ?? '',
      notes: state?.notes ?? '',
      checklist: g.checklist.map((item, i) => {
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
