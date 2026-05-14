'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  { label: 'Geocoding your address…',                      meta: 'geo.parcel.api' },
  { label: 'Checking historic district boundaries…',       meta: 'nps.gov/nr' },
  { label: 'Looking up National Register eligibility…',    meta: 'nps.gov/htc' },
  { label: 'Searching federal Historic Tax Credit programs…', meta: 'nps.gov/htc' },
  { label: 'Scanning California state incentive programs…', meta: 'ohp.parks.ca.gov' },
  { label: 'Checking city and county grant boundaries…',   meta: 'ci.richmond.ca.us' },
  { label: 'Matching SF / local small business grants…',   meta: 'oewd.org' },
  { label: 'Researching SBA and CDFI financing programs…', meta: 'sba.gov' },
  { label: 'Evaluating ADA and regulatory cost savings…',  meta: 'ada.gov' },
  { label: 'Identifying consultant firms in your area…',   meta: 'directory.match()' },
  { label: 'Drafting outreach emails…',                    meta: 'compose.draft' },
  { label: 'Building your grant workbook…',                meta: 'workbook.build' },
]

function CheckSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SparkleSVG() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2M2.93 2.93l1.41 1.41M8.66 8.66l1.41 1.41M2.93 10.07l1.41-1.41M8.66 4.34l1.41-1.41" stroke="var(--ink-4)" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export default function ResearchingLoader({ propertyId, address }) {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (started) return
    setStarted(true)

    const interval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
    }, 2500)

    fetch(`/api/grants/research/${propertyId}`, { method: 'POST' })
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.error ?? `HTTP ${res.status}`) })
        return res.json()
      })
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
        setError(`Research failed: ${err.message}. Check that ANTHROPIC_API_KEY is set in your deployment.`)
      })

    return () => clearInterval(interval)
  }, [propertyId, router, started])

  const pct = Math.round(((stepIndex + 1) / STEPS.length) * 100)

  if (error) {
    return (
      <div className="loading-shell">
        <div className="loading-card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--st-bad)', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={() => { setError(null); setStarted(false) }}
            className="btn btn-primary"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="loading-shell">
      <div className="loading-card">
        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 8,
            background: 'var(--ink)', color: '#fff',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '-0.04em',
            flexShrink: 0,
          }}>
            iQ
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13.5, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {address || 'Your property'}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-4)', flexShrink: 0 }}>
            {pct}%
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: 'var(--bg-sunk)', borderRadius: 1, marginBottom: 22, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', background: 'var(--ink)', borderRadius: 1,
              width: `${pct}%`, transition: 'width 0.7s ease-out',
            }}
          />
        </div>

        {/* Steps */}
        {STEPS.map((step, i) => {
          const done = i < stepIndex
          const run = i === stepIndex
          const cls = `lstep${run ? ' run' : done ? ' done' : ''}`
          return (
            <div key={step.label} className={cls}>
              <div className="ls-ico">
                {done
                  ? <CheckSVG />
                  : <div className="ls-ring" />
                }
              </div>
              <span style={{ flex: 1 }}>{step.label}</span>
              <span className="ls-meta">{step.meta}</span>
            </div>
          )
        })}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-2)',
          color: 'var(--ink-4)', fontSize: 12,
        }}>
          <SparkleSVG />
          You don't have to wait — we'll email when it's ready.
        </div>
      </div>
    </div>
  )
}
