'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  'Geocoding your address…',
  'Checking historic district boundaries…',
  'Looking up National Register eligibility…',
  'Searching federal Historic Tax Credit programs…',
  'Scanning California state incentive programs…',
  'Checking city and county grant boundaries…',
  'Matching SF / local small business grants…',
  'Researching SBA and CDFI financing programs…',
  'Evaluating ADA and regulatory cost savings…',
  'Identifying consultant firms in your area…',
  'Drafting outreach emails…',
  'Building your grant workbook…',
]

export default function ResearchingLoader({ propertyId, address }) {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (started) return
    setStarted(true)

    // Cycle through steps every ~2.5s for visual effect
    const interval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
    }, 2500)

    // Kick off research
    fetch(`/api/grants/research/${propertyId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        clearInterval(interval)
        if (data.ok) {
          router.refresh()
        } else {
          setError(data.error ?? 'Research failed — please try again.')
        }
      })
      .catch(err => {
        clearInterval(interval)
        setError('Network error — please refresh the page.')
      })

    return () => clearInterval(interval)
  }, [propertyId, router, started])

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => { setError(null); setStarted(false) }}
            className="px-4 py-2 text-sm bg-clay text-white rounded-lg"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="max-w-md w-full px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="font-mono text-sm text-clay mb-2">GrantIQ</div>
          <h1 className="text-xl font-semibold text-ink mb-1">Researching your property</h1>
          <p className="text-sm text-subtle">{address}</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-10">
          {STEPS.map((step, i) => {
            const done = i < stepIndex
            const active = i === stepIndex
            const pending = i > stepIndex
            return (
              <div key={step} className={`flex items-center gap-3 transition-opacity duration-300 ${pending ? 'opacity-30' : 'opacity-100'}`}>
                <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                  done ? 'bg-clay' : active ? 'border-2 border-clay' : 'border-2 border-border'
                }`}>
                  {done && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />}
                </div>
                <span className={`text-sm ${active ? 'text-ink font-medium' : done ? 'text-subtle' : 'text-muted'}`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-clay rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.round(((stepIndex + 1) / STEPS.length) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-2 text-right">
          {Math.round(((stepIndex + 1) / STEPS.length) * 100)}% complete
        </p>
      </div>
    </div>
  )
}
