export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-sm font-medium text-ink mb-4">Grant<span className="text-clay">IQ</span></div>
        <p className="text-sm text-muted mb-4">Page not found.</p>
        <Link href="/" className="text-sm text-clay hover:underline">Go home →</Link>
      </div>
    </div>
  )
}
