import { auth } from '../../../../auth.js'
import { db } from '../../../../db/index.js'
import { properties, grantWorkbooks, grantStates, checklistStates } from '../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { grants as allGrants } from '../../../../data/grants.js'
import { renderGrant } from '../../../../data/grantTemplates.js'
import GrantWorkbookClient from '../../../../components/GrantWorkbook.jsx'

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
      .values({ propertyId: id })
      .returning()

    await db.insert(grantStates).values(
      allGrants.map(g => ({
        workbookId: workbook.id,
        grantId: g.id,
        workflowStatus: g.status === 'ineligible' ? 'Ineligible' : 'Not started',
        // Don't pre-save emailBody — render from template at display time
        // so it always uses the actual property values
        emailBody: null,
      }))
    )
  }

  const states = await db
    .select()
    .from(grantStates)
    .where(eq(grantStates.workbookId, workbook.id))

  const allChecklists = await db
    .select({ grantStateId: checklistStates.grantStateId, itemIndex: checklistStates.itemIndex, done: checklistStates.done })
    .from(checklistStates)
    .innerJoin(grantStates, eq(checklistStates.grantStateId, grantStates.id))
    .where(eq(grantStates.workbookId, workbook.id))

  const mergedGrants = allGrants.map(g => {
    const rendered = renderGrant(g, property)
    const state = states.find(s => s.grantId === g.id)
    const itemChecks = allChecklists.filter(c => c.grantStateId === state?.id)
    return {
      ...rendered,
      stateId: state?.id ?? null,
      workflowStatus: state?.workflowStatus ?? rendered.workflowStatus,
      // Use user-edited email from DB if it exists; otherwise render from template
      emailBody: state?.emailBody ?? rendered.draftEmail?.body ?? '',
      notes: state?.notes ?? '',
      checklist: rendered.checklist.map((item, i) => {
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
