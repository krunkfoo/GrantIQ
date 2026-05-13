export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-mono text-sm font-medium text-ink">Grant<span className="text-clay">IQ</span></span>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-xs text-muted hover:text-ink transition-colors">Sign in</Link>
          <Link href="/sign-up" className="text-xs px-3 py-1.5 bg-clay text-white rounded-lg hover:bg-clay-dark transition-colors font-medium">
            Get started
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-24">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-clay-light/60 border border-clay/30 rounded-full text-xs text-clay-dark font-medium mb-8">
            Historic property owners · Small business operators
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold text-ink tracking-tight leading-tight mb-5">
            Every grant your property qualifies for,<br />
            <span className="text-clay">already written up.</span>
          </h1>

          <p className="text-base text-subtle leading-relaxed mb-10 max-w-md mx-auto">
            Enter your address and project scope. GrantIQ screens every federal, state, and local incentive and returns a workbook of eligible grants with pre-drafted outreach emails and consultant matches.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up" className="px-6 py-3 bg-clay text-white text-sm font-medium rounded-lg hover:bg-clay-dark transition-colors">
              Screen my property →
            </Link>
            <Link href="/demo" className="px-6 py-3 border border-border text-sm text-subtle hover:text-ink hover:border-clay/40 rounded-lg transition-colors">
              See demo · Hotel Mac, Point Richmond
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-8 text-center max-w-md">
          {[
            { value: '40+', label: 'grant programs screened' },
            { value: '$500K+', label: 'avg eligible value found' },
            { value: '< 2 min', label: 'from address to workbook' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="font-mono text-xl font-semibold text-clay">{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
