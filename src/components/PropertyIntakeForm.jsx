'use client'

import { useState } from 'react'
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

export default function PropertyIntakeForm() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [propertyType, setPropertyType] = useState('')
  const [scope, setScope] = useState('')
  const [budget, setBudget] = useState('unsure')
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAddressChange = (e) => {
    setAddress(e.target.value)
    setShowSuggestion(e.target.value.length > 5)
  }

  const handleSuggestionClick = () => {
    setAddress('50 Washington Ave')
    setCity('Point Richmond, CA 94801')
    setShowSuggestion(false)
  }

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
        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-subtle uppercase tracking-wider mb-2">
            Property address
          </label>
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              onFocus={() => address.length > 5 && setShowSuggestion(true)}
              onBlur={() => setTimeout(() => setShowSuggestion(false), 150)}
              placeholder="123 Main St"
              className="w-full px-4 py-3 text-sm bg-white border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-colors"
            />
            {showSuggestion && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-panel z-10">
                <button
                  onMouseDown={handleSuggestionClick}
                  className="w-full text-left px-4 py-3 text-sm text-ink hover:bg-base transition-colors rounded-lg flex items-center gap-3"
                >
                  <div>
                    <div className="font-medium">50 Washington Ave</div>
                    <div className="text-xs text-muted">Point Richmond, CA 94801 · NR Historic District</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* City/State/Zip */}
        <div>
          <label className="block text-xs font-medium text-subtle uppercase tracking-wider mb-2">City, State, ZIP</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Richmond, CA 94801"
            className="w-full px-4 py-3 text-sm bg-white border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-colors"
          />
        </div>

        {/* Property type */}
        <div>
          <label className="block text-xs font-medium text-subtle uppercase tracking-wider mb-2">Property type</label>
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
          <label className="block text-xs font-medium text-subtle uppercase tracking-wider mb-2">
            Project scope
            <span className="normal-case font-normal text-muted ml-1">— what are you trying to do?</span>
          </label>
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Full rehabilitation including seismic upgrade, facade restoration, interior renovation…"
            rows={4}
            className="w-full px-4 py-3 text-sm bg-white border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-colors resize-none"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xs font-medium text-subtle uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-medium text-subtle uppercase tracking-wider mb-2">
            Target start date <span className="normal-case font-normal text-muted">— optional</span>
          </label>
          <input
            type="text"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Q3 2026 / Summer 2026 / TBD"
            className="w-full px-4 py-3 text-sm bg-white border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-colors"
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
