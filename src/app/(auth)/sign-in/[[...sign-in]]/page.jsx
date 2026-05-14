'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.6 2.41v2h2.59c1.52-1.4 2.39-3.46 2.39-5.87z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.72 5.29-1.94l-2.58-2c-.72.48-1.64.77-2.71.77-2.08 0-3.84-1.4-4.47-3.29H.86v2.07A8 8 0 008 16z" fill="#34A853"/>
      <path d="M3.53 9.54A4.82 4.82 0 013.28 8c0-.54.09-1.06.25-1.54V4.39H.86A8 8 0 000 8c0 1.29.31 2.51.86 3.61l2.67-2.07z" fill="#FBBC05"/>
      <path d="M8 3.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 00.86 4.39L3.53 6.46C4.16 4.57 5.92 3.18 8 3.18z" fill="#EA4335"/>
    </svg>
  )
}

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-colors'
  const labelClass = 'block text-xs font-medium text-subtle uppercase tracking-wider mb-1.5'

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <span className="font-mono text-lg font-medium text-ink">Grant<span className="text-clay">IQ</span></span>
      </div>

      <div className="w-full max-w-sm bg-white border border-border rounded-2xl p-8 shadow-card">
        <h1 className="text-xl font-semibold text-ink mb-6 text-center">Sign in</h1>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm text-ink hover:bg-base transition-colors mb-5"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium bg-clay text-white rounded-lg hover:bg-clay-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          No account?{' '}
          <Link href="/sign-up" className="text-clay hover:text-clay-dark font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
