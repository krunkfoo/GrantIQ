import { auth } from '../../../auth.js'
import { db } from '../../../db/index.js'
import { properties, grantWorkbooks } from '../../../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

function formatValue(num) {
  if (!num) return null
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${num.toLocaleString()}`
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session.user.id
  const userProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.userId, userId))
    .orderBy(desc(properties.createdAt))

  // Fetch workbooks for all properties to get estimated values
  const workbooks = userProperties.length > 0
    ? await db
        .select()
        .from(grantWorkbooks)
        .where(eq(grantWorkbooks.propertyId, userProperties[0].id)) // handled per-property below
        .limit(0) // placeholder — we'll do a full query
    : []

  // Build a map of propertyId → workbook data
  const workbookMap = new Map()
  if (userProperties.length > 0) {
    // Fetch all workbooks for this user's properties
    const allWorkbooks = await Promise.all(
      userProperties.map(p =>
        db.select().from(grantWorkbooks).where(eq(grantWorkbooks.propertyId, p.id)).limit(1)
      )
    )
    allWorkbooks.forEach((rows, i) => {
      if (rows[0]) workbookMap.set(userProperties[i].id, rows[0])
    })
  }

  // Compute estimated value per property
  const propertyStats = userProperties.map(p => {
    const wb = workbookMap.get(p.id)
    const grants = wb?.researchedGrants ?? []
    const eligible = grants.filter(g => g.status === 'eligible')
    const totalValue = eligible.reduce((sum, g) => sum + (g.estValueNum || 0), 0)
    return {
      ...p,
      researchStatus: wb?.researchStatus ?? 'pending',
      eligibleCount: eligible.length,
      totalValue,
    }
  })

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Your properties</h1>
          <p className="text-sm text-muted mt-0.5">Each property has its own grant workbook.</p>
        </div>
        <Link
          href="/property/new"
          className="px-4 py-2 bg-clay text-white text-sm font-medium rounded-lg hover:bg-clay-dark transition-colors"
        >
          + Add property
        </Link>
      </div>

      {propertyStats.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-sm text-muted mb-2">No properties yet.</p>
          <Link href="/property/new" className="inline-block px-5 py-2.5 bg-clay text-white text-sm font-medium rounded-lg hover:bg-clay-dark transition-colors mb-6">
            Screen your first property →
          </Link>
          <div className="mt-4 pt-6 border-t border-border">
            <p className="text-xs text-muted mb-3">Want to see what it looks like first?</p>
            <Link href="/demo" className="inline-flex items-center gap-1.5 text-sm text-clay font-medium hover:text-clay-dark transition-colors">
              <span>Try the Hotel Mac demo</span>
              <span>→</span>
            </Link>
            <p className="text-xs text-muted mt-1">Point Richmond, CA · Historic hotel rehabilitation</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {propertyStats.map(p => {
            const val = formatValue(p.totalValue)
            return (
              <Link
                key={p.id}
                href={`/property/${p.id}`}
                className="flex items-center justify-between bg-white border border-border rounded-xl px-5 py-4 hover:border-clay/40 hover:shadow-card transition-all group"
              >
                <div>
                  <div className="font-medium text-sm text-ink">{p.address}</div>
                  <div className="text-xs text-muted mt-0.5">{p.city} · {p.propertyType}</div>
                </div>
                <div className="flex items-center gap-4">
                  {p.researchStatus === 'done' && p.eligibleCount > 0 && (
                    <div className="text-right">
                      {val && (
                        <div className="text-sm font-semibold text-ink">{val}</div>
                      )}
                      <div className="text-xs text-muted">{p.eligibleCount} eligible grant{p.eligibleCount !== 1 ? 's' : ''}</div>
                    </div>
                  )}
                  {p.researchStatus === 'running' && (
                    <span className="text-xs text-muted font-mono animate-pulse">Researching…</span>
                  )}
                  {p.researchStatus === 'pending' && (
                    <span className="text-xs text-muted">Pending</span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted font-mono">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-muted group-hover:text-clay transition-colors text-sm">→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {propertyStats.length > 0 && (
        <div className="mt-10 pt-8 border-t border-border">
          <Link href="/demo" className="text-xs text-muted hover:text-subtle transition-colors">
            Try demo with Hotel Mac, Point Richmond →
          </Link>
        </div>
      )}
    </div>
  )
}
