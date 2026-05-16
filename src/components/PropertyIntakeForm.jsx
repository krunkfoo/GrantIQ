'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const PROPERTY_TYPES = [
  'Historic Hotel',
  'Retail Storefront',
  'Warehouse Conversion',
  'Mixed-Use',
  'Office / Commercial',
  'Other',
]

const BUDGET_OPTIONS = [
  { label: 'Not sure yet', value: 'unsure' },
  { label: 'Under $100K', value: '<100k' },
  { label: '$100K – $500K', value: '100k-500k' },
  { label: '$500K+', value: '>500k' },
]

function useGooglePlaces(inputRef, onSelect) {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    if (!apiKey || !inputRef.current) return

    if (!window.google?.maps?.places) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.onload = () => attachAutocomplete(inputRef.current, onSelect)
      document.head.appendChild(script)
    } else {
      attachAutocomplete(inputRef.current, onSelect)
    }
  }, [inputRef, onSelect])
}

function attachAutocomplete(input, onSelect) {
  if (!input || !window.google?.maps?.places) return

  const autocomplete = new window.google.maps.places.Autocomplete(input, {
    types: ['address'],
    componentRestrictions: { country: 'us' },
    fields: ['address_components', 'formatted_address'],
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.address_components) return

    const components = place.address_components
    const get = (type) => components.find(c => c.types.includes(type))?.long_name ?? ''
    const getShort = (type) => components.find(c => c.types.includes(type))?.short_name ?? ''

    const streetNumber = get('street_number')
    const route = get('route')
    const city = get('locality') || get('sublocality') || get('neighborhood')
    const state = getShort('administrative_area_level_1')
    const zip = get('postal_code')

    onSelect({
      address: [streetNumber, route].filter(Boolean).join(' '),
      city: [city, state, zip].filter(Boolean).join(', '),
    })
  })
}

export default function PropertyIntakeForm() {
  const router = useRouter()
  const addressInputRef = useRef(null)

  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [scope, setScope] = useState('')
  const [budget, setBudget] = useState('unsure')
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePlaceSelect = useCallback(({ address: a, city: c }) => {
    setAddress(a)
    setCity(c)
  }, [])

  useGooglePlaces(addressInputRef, handlePlaceSelect)

  const canSubmit = address.length > 4 && propertyType && scope.length > 5 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, city, propertyType, scope, budget, startDate }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const property = await res.json()
      if (!property.id) throw new Error('Unexpected response from server')
      router.push(`/property/${property.id}`)
    } catch (err) {
      setError('Something went wrong — please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="intake-shell">
      {/* ── Form side ── */}
      <div className="intake-form-side">
        <div className="eyebrow">
          <span className="edot" />
          GrantIQ · Property intake
        </div>
        <h1 className="h1">Tell us about<br />your property</h1>
        <p className="sub">
          We'll screen every federal, state, and local incentive against your
          address and project scope — usually in under two minutes.
        </p>

        {/* Progress indicator */}
        {(() => {
          const steps = [
            { label: 'Address', done: address.length > 4 },
            { label: 'Type', done: !!propertyType },
            { label: 'Scope', done: scope.length > 5 },
            { label: 'Review', done: false },
          ]
          const completedSteps = steps.filter(s => s.done).length
          return (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 28 }}>
              {steps.map((step, i) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: step.done ? 'var(--accent, #4f7396)' : i === completedSteps ? 'var(--ink-2, #444)' : 'var(--ink-4, #aaa)',
                    fontSize: 12, fontWeight: step.done || i === completedSteps ? 600 : 400,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      background: step.done ? 'var(--accent, #4f7396)' : i === completedSteps ? 'var(--border, #e0e0e0)' : 'var(--bg-sunk, #f5f5f5)',
                      border: `1.5px solid ${step.done ? 'var(--accent, #4f7396)' : 'var(--border, #ddd)'}`,
                      display: 'grid', placeItems: 'center',
                      color: step.done ? 'white' : 'var(--ink-3)',
                      fontSize: 10,
                    }}>
                      {step.done
                        ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        : i + 1
                      }
                    </div>
                    {step.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: 20, height: 1.5,
                      background: step.done ? 'var(--accent, #4f7396)' : 'var(--border, #ddd)',
                    }} />
                  )}
                </div>
              ))}
            </div>
          )
        })()}

        {/* Property address */}
        <div className="field">
          <div className="lbl">Property address</div>
          <div className="addr-wrap">
            <input
              ref={addressInputRef}
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Main St"
              className="giq-input"
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>

        {/* City / State / ZIP */}
        <div className="field">
          <div className="lbl">City, State, ZIP</div>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="San Francisco, CA 94103"
            className="giq-input"
          />
        </div>

        {/* Property type */}
        <div className="field">
          <div className="lbl">Property type</div>
          <div className="chips">
            {PROPERTY_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setPropertyType(type)}
                className={`chip${propertyType === type ? ' on' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div className="field">
          <div className="lbl">
            Project scope
            <span className="opt">what are you trying to do?</span>
          </div>
          <textarea
            value={scope}
            onChange={e => setScope(e.target.value)}
            placeholder="Full rehabilitation including seismic upgrade, facade restoration, interior renovation…"
            className="giq-textarea"
          />
          <div className="hint">Be specific — the more detail, the more grants we can match.</div>
        </div>

        {/* Budget */}
        <div className="field">
          <div className="lbl">
            Estimated budget
            <span className="opt">optional</span>
          </div>
          <div className="chips">
            {BUDGET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setBudget(opt.value)}
                className={`chip${budget === opt.value ? ' on' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target start date */}
        <div className="field">
          <div className="lbl">
            Target start date
            <span className="opt">optional</span>
          </div>
          <input
            type="text"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            placeholder="Q3 2026 / Summer 2026 / TBD"
            className="giq-input"
          />
        </div>

        {error && (
          <p style={{ color: 'var(--st-bad)', fontSize: '12.5px', marginTop: '14px' }}>{error}</p>
        )}

        <div className="cta-row">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn btn-primary btn-lg"
          >
            {loading ? 'Screening…' : 'Screen for eligible grants →'}
          </button>
          <span className="secondary">Usually takes &lt; 2 min</span>
        </div>
      </div>

      {/* ── Aside ── */}
      <aside className="intake-aside">
        <div className="eyebrow">
          <span className="edot" />
          Coverage
        </div>
        <div style={{ marginBottom: 28 }}>
          <div className="aside-stat">
            <span className="num">1,247</span>
            <span className="desc">Federal incentive programs</span>
          </div>
          <div className="aside-stat">
            <span className="num">3,889</span>
            <span className="desc">State grant &amp; tax credit programs</span>
          </div>
          <div className="aside-stat">
            <span className="num">44,600</span>
            <span className="desc">City and county grant boundaries</span>
          </div>
          <div className="aside-stat" style={{ borderBottom: 0 }}>
            <span className="num">820</span>
            <span className="desc">Verified consultant firms</span>
          </div>
        </div>

        <div className="aside-note">
          <h4>How it works</h4>
          Enter your property address and project scope. GrantIQ geocodes your
          parcel, checks historic district overlays, and cross-references every
          applicable federal, state, and local program — then builds a workbook
          with eligibility status, estimated values, and pre-drafted outreach
          emails for each grant.
        </div>

        <div className="aside-note" style={{ marginTop: 18 }}>
          <h4>Privacy</h4>
          Your address is used solely for grant matching. We never share or sell
          your data.
        </div>
      </aside>
    </div>
  )
}
