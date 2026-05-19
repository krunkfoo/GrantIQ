import { db } from '../../db/index.js'
import { users, properties, grantWorkbooks } from '../../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

function formatValue(num) {
  if (!num) return null
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${num.toLocaleString()}`
}

function statusPill(status) {
  const map = {
    done:    { bg: 'oklch(0.96 0.03 150)', color: 'oklch(0.42 0.09 150)', label: 'Done' },
    running: { bg: 'oklch(0.97 0.04 85)',  color: 'oklch(0.45 0.10 70)',  label: 'Running' },
    error:   { bg: 'oklch(0.97 0.025 25)', color: 'oklch(0.58 0.16 25)', label: 'Error' },
    pending: { bg: '#f0efed',              color: '#737373',               label: 'Pending' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  )
}

export default async function AdminPage() {
  // Fetch all users ordered by signup date
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt))

  // Fetch all properties
  const allProperties = await db.select().from(properties).orderBy(desc(properties.createdAt))

  // Fetch all workbooks
  const allWorkbooks = await db.select().from(grantWorkbooks)

  // Build workbook map by propertyId
  const wbMap = new Map(allWorkbooks.map(w => [w.propertyId, w]))

  // Group properties by userId
  const propsByUser = new Map()
  for (const p of allProperties) {
    if (!propsByUser.has(p.userId)) propsByUser.set(p.userId, [])
    propsByUser.get(p.userId).push(p)
  }

  // Platform-wide stats
  const totalUsers     = allUsers.length
  const totalProps     = allProperties.length
  const doneWorkbooks  = allWorkbooks.filter(w => w.researchStatus === 'done').length
  const totalEligible  = allWorkbooks.reduce((sum, w) => {
    const grants = w.researchedGrants ?? []
    return sum + grants.filter(g => g.status === 'eligible').length
  }, 0)
  const totalValue = allWorkbooks.reduce((sum, w) => {
    const grants = w.researchedGrants ?? []
    return sum + grants.filter(g => g.status === 'eligible').reduce((s, g) => s + (g.estValueNum || 0), 0)
  }, 0)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 36 }}>
        {[
          { label: 'Total users',       value: totalUsers },
          { label: 'Properties',        value: totalProps },
          { label: 'Research complete', value: doneWorkbooks },
          { label: 'Eligible grants',   value: totalEligible },
          { label: 'Total est. value',  value: formatValue(totalValue) ?? '$0' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10,
            padding: '16px 18px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, color: '#1a1917', letterSpacing: '-0.02em' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: '#a09e9b', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── User table ── */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          All users
        </h2>
        <p style={{ margin: 0, fontSize: 12.5, color: '#a09e9b' }}>
          Click any property to open the full workbook in god mode.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {allUsers.map(user => {
          const props = propsByUser.get(user.id) ?? []
          return (
            <div key={user.id} style={{
              background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'hidden',
            }}>
              {/* User row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px', borderBottom: props.length > 0 ? '1px solid #f0efed' : 'none',
                background: '#fafaf9',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: '#1a1917', color: '#fff',
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}>
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{user.name ?? '—'}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#737373', marginTop: 1 }}>{user.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#a09e9b' }}>
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#b89878', marginTop: 2 }}>
                    {props.length} propert{props.length !== 1 ? 'ies' : 'y'}
                  </div>
                </div>
              </div>

              {/* Properties */}
              {props.map((prop, i) => {
                const wb     = wbMap.get(prop.id)
                const grants = wb?.researchedGrants ?? []
                const eligible   = grants.filter(g => g.status === 'eligible')
                const totalVal   = eligible.reduce((s, g) => s + (g.estValueNum || 0), 0)
                const sentCount  = grants.filter(g => ['Sent', 'Replied'].includes(g.workflowStatus)).length

                return (
                  <Link
                    key={prop.id}
                    href={`/admin/property/${prop.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '12px 18px 12px 60px',
                      borderBottom: i < props.length - 1 ? '1px solid #f0efed' : 'none',
                      textDecoration: 'none', color: 'inherit',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{prop.address}</div>
                      <div style={{ fontSize: 12, color: '#a09e9b', marginTop: 1 }}>
                        {prop.city} · {prop.propertyType}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                      {wb && statusPill(wb.researchStatus)}

                      {wb?.researchStatus === 'done' && (
                        <>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#1a1917' }}>
                              {formatValue(totalVal) ?? '—'}
                            </div>
                            <div style={{ fontSize: 11, color: '#a09e9b' }}>
                              {eligible.length} eligible · {grants.length} total
                            </div>
                          </div>
                          {sentCount > 0 && (
                            <div style={{ fontSize: 11, color: '#6b6966', fontFamily: 'var(--font-mono)' }}>
                              {sentCount} sent
                            </div>
                          )}
                        </>
                      )}

                      <div style={{ fontSize: 11, color: '#a09e9b', fontFamily: 'var(--font-mono)' }}>
                        {new Date(prop.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>

                      <span style={{ color: '#b89878', fontSize: 13 }}>→</span>
                    </div>
                  </Link>
                )
              })}

              {props.length === 0 && (
                <div style={{ padding: '10px 18px 10px 60px', fontSize: 12, color: '#a09e9b' }}>
                  No properties yet
                </div>
              )}
            </div>
          )
        })}

        {allUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: 64, color: '#a09e9b', fontSize: 13 }}>
            No users yet.
          </div>
        )}
      </div>
    </div>
  )
}
