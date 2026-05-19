import { db } from '../../../../db/index.js'
import { properties, grantWorkbooks, grantStates, checklistStates } from '../../../../db/schema.js'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import GrantWorkbookClient from '../../../../components/GrantWorkbook.jsx'
import Link from 'next/link'

export default async function AdminPropertyPage({ params }) {
  const { id } = await params

  // God mode: no userId check
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1)

  if (!property) notFound()

  const [workbook] = await db
    .select()
    .from(grantWorkbooks)
    .where(eq(grantWorkbooks.propertyId, id))
    .limit(1)

  if (!workbook || workbook.researchStatus !== 'done') {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontSize: 13, color: '#a09e9b', marginBottom: 16 }}>
          Research status: <strong>{workbook?.researchStatus ?? 'no workbook'}</strong>
        </div>
        <Link href="/admin" style={{ fontSize: 13, color: '#b89878', textDecoration: 'none' }}>
          ← Back to admin
        </Link>
      </div>
    )
  }

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
    const state     = states.find(s => s.grantId === g.id)
    const itemChecks = allChecklists.filter(c => c.grantStateId === state?.id)
    return {
      ...g,
      stateId: state?.id ?? null,
      workflowStatus: state?.workflowStatus ?? (g.status === 'ineligible' ? 'Ineligible' : 'Not started'),
      emailBody: state?.emailBody ?? g.draftEmail?.body ?? '',
      notes: state?.notes ?? '',
      checklist: (g.checklist ?? []).map((item, i) => {
        const saved = itemChecks.find(c => c.itemIndex === i)
        return { ...item, done: saved ? saved.done : item.done }
      }),
    }
  })

  return (
    <>
      {/* God mode banner */}
      <div style={{
        background: '#b89878', color: '#fff',
        padding: '8px 24px', fontSize: 12, fontFamily: 'var(--font-mono)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span>⚡ God mode — viewing as owner</span>
        <span style={{ opacity: 0.7 }}>·</span>
        <span style={{ opacity: 0.8 }}>{property.address}</span>
        <div style={{ flex: 1 }} />
        <Link href="/admin" style={{ color: '#fff', opacity: 0.75, textDecoration: 'none', fontSize: 11 }}>
          ← Admin
        </Link>
      </div>

      <GrantWorkbookClient
        property={property}
        grants={mergedGrants}
        workbookId={workbook.id}
        researchedAt={workbook.updatedAt ?? workbook.createdAt}
        demo={false}
      />
    </>
  )
}
