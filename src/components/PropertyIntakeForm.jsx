'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const PROPERTY_TYPES = [
  'Historic Commercial', 'Historic Residential', 'Mixed Use',
  'Small Business', 'Industrial / Warehouse', 'Religious / Civic',
]

const BUDGET_OPTIONS = [
  { label: 'Not sure yet', value: 'unsure' },
  { label: 'Under $250K', value: '<250k' },
  { label: '$250K – $500K', value: '250k-500k' },
  { label: '$500K – $1M', value: '500k-1m' },
  { label: '$1M – $3M', value: '1m-3m' },
  { label: 'Over $3M', value: '>3m' },
]

function useGooglePlaces(inputRef, onSelect) {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    if (!apiKey || !inputRef.current) return

    // Load Google Maps script if not already loaded
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

  const canSubmit = address.length > 4 && propertyType && scope.length > 20 && !loading

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

  const inputClass = 'w-full px-4 py-3 text-sm bg-white border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-colors'
  const labelClass = 'block text-xs font-medium text-subtle uppercase tracking-wider mb-2'

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-ink tracking-tight mb-2">
          Tell us about your property
        </h1>
        <p className="text-subtle text-sm leading-relaxed">
          We'll screen every federal, state, and local incentive against your address and project scope.
        </p>
      </div>

      <div className="space-y-6">
        {/* Address — Google Places Autocomplete */}
        <div>
          <label className={labelClass}>Property address</label>
          <input
            ref={addressInputRef}
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="123 Main St"
            className={inputClass}
            autoComplete="off"
          />
        </div>

        {/* City/State/Zip */}
        <div>
          <label className={labelClass}>City, State, ZIP</label>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="San Francisco, CA 94103"
            className={inputClass}
          />
        </div>

        {/* Property type */}
        <div>
          <label className={labelClass}>Property type</label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setPropertyType(type)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                  propertyType === type
                    ? 'bg-clay text-white border-clay font-medium'
                    : 'bg-white border-border text-subtle hover:border-clay hover:text-ink'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className={labelClass}>
            Project scope
            <span className="normal-case font-normal text-muted ml-1">— what are you trying to do?</span>
          </label>
          <textarea
            value={scope}
            onChange={e => setScope(e.target.value)}
            placeholder="Full rehabilitation including seismic upgrade, facade restoration, interior renovation…"
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Budget */}
        <div>
          <label className={labelClass}>
            Estimated budget <span className="normal-case font-normal text-muted">— optional</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBudget(opt.value)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                  budget === opt.value
                    ? 'bg-clay text-white border-clay font-medium'
                    : 'bg-white border-border text-subtle hover:border-clay hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start date */}
        <div>
          <label className={labelClass}>
            Target start date <span className="normal-case font-normal text-muted">— optional</span>
          </label>
          <input
            type="text"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            placeholder="Q3 2026 / Summer 2026 / TBD"
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 text-center -mb-2">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 text-sm font-medium rounded-lg transition-all ${
            canSubmit
              ? 'bg-clay text-white hover:bg-clay-dark cursor-pointer'
              : 'bg-base text-muted cursor-not-allowed'
          }`}
        >
          {loading ? 'Screening…' : 'Screen for eligible grants →'}
        </button>
      </div>
    </div>
  )
}
