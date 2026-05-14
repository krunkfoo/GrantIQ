export const dynamic = 'force-dynamic'

import Link from 'next/link'
import SignOutButton from '../../components/SignOutButton.jsx'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <Link href="/dashboard" className="font-mono text-sm font-medium text-ink">
          Grant<span className="text-clay">IQ</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/property/new" className="text-xs px-3 py-1.5 bg-clay text-white rounded-lg hover:bg-clay-dark transition-colors font-medium">
            + New property
          </Link>
          <SignOutButton />
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
