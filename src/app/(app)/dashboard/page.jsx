import { auth } from '@clerk/nextjs/server'
import { db } from '../../../db/index.js'
import { properties } from '../../../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = await auth()
  const userProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.userId, userId))
    .orderBy(desc(properties.createdAt))

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

      {userProperties.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-sm text-muted mb-4">No properties yet.</p>
          <Link href="/property/new" className="text-sm text-clay hover:text-clay-dark font-medium transition-colors">
            Screen your first property →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {userProperties.map(p => (
            <Link
              key={p.id}
              href={`/property/${p.id}`}
              className="flex items-center justify-between bg-white border border-border rounded-xl px-5 py-4 hover:border-clay/40 hover:shadow-card transition-all group"
            >
              <div>
                <div className="font-medium text-sm text-ink">{p.address}</div>
                <div className="text-xs text-muted mt-0.5">{p.city} · {p.propertyType}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted font-mono">
                  {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-muted group-hover:text-clay transition-colors text-sm">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Demo shortcut */}
      <div className="mt-10 pt-8 border-t border-border">
        <Link href="/demo" className="text-xs text-muted hover:text-subtle transition-colors">
          Try demo with Hotel Mac, Point Richmond →
        </Link>
      </div>
    </div>
  )
}
