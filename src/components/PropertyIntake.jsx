import { useState } from 'react'

const PROPERTY_TYPES = [
  'Historic Commercial',
  'Historic Residential',
  'Mixed Use',
  'Small Business',
  'Industrial / Warehouse',
  'Religious / Civic',
]

const BUDGET_OPTIONS = [
  { label: 'Not sure yet', value: 'unsure' },
  { label: 'Under $250K', value: '<250k' },
  { label: '$250K – $500K', value: '250k-500k' },
  { label: '$500K – $1M', value: '500k-1m' },
  { label: '$1M – $3M', value: '1m-3m' },
  { label: 'Over $3M', value: '>3m' },
]

export default function PropertyIntake({ onSubmit, onDemo }) {
  const [address, setAddress] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [propertyType, setPropertyType] = useState('')
  const [scope, setScope] = useState('')
  const [budget, setBudget] = useState('unsure')
  const [startDate, setStartDate] = useState('')

  const handleAddressChange = (e) => {
    setAddress(e.target.value)
    setShowSuggestion(e.target.value.length > 5)
  }

  const handleSuggestionClick = () => {
    setAddress('50 Washington Ave, Point Richmond, CA 94801')
    setShowSuggestion(false)
  }

  const canSubmit = address.length > 6 && propertyType && scope.length > 20

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-ink">Grant<span className="text-clay">IQ</span></span>
        </div>
        <span className="text-xs text-muted font-mono">Step 1 of 3</span>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 pt-16 pb-16">
        <div className="w-full max-w-lg">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-ink tracking-tight mb-2">
              Tell us about your property
            </h1>
            <p className="text-subtle text-sm leading-relaxed">
              We'll screen every federal, state, and local incentive against your address and project scope.
            </p>
            {/* Demo mode CTA */}
            <button
              onClick={onDemo}
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 text-xs bg-clay-light/60 border border-clay/30 text-clay-dark rounded-lg hover:bg-clay-light transition-colors"
            >
              <span className="font-mono font-medium">DEMO</span>
              <span className="text-subtle">Try with Hotel Mac · 50 Washington Ave, Point Richmond CA</span>
              <span className="text-clay">→</span>
            </button>
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
                  placeholder="50 Washington Ave, Point Richmond, CA"
                  className="w-full px-4 py-3 text-sm bg-white border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-colors"
                />
                {showSuggestion && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-panel z-10">
                    <button
                      onMouseDown={handleSuggestionClick}
                      className="w-full text-left px-4 py-3 text-sm text-ink hover:bg-base transition-colors rounded-lg flex items-center gap-3"
                    >
                      <span className="text-muted text-xs font-mono">📍</span>
                      <div>
                        <div className="font-medium">50 Washington Ave</div>
                        <div className="text-xs text-muted">Point Richmond, CA 94801 · NR Historic District</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Property type */}
            <div>
              <label className="block text-xs font-medium text-subtle uppercase tracking-wider mb-2">
                Property type
              </label>
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
                placeholder="Full rehabilitation including seismic upgrade, facade restoration, interior renovation, and conversion to boutique lodging…"
                rows={4}
                className="w-full px-4 py-3 text-sm bg-white border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-colors resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs font-mono ${scope.length > 20 ? 'text-clay' : 'text-muted'}`}>
                  {scope.length} chars
                </span>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-medium text-subtle uppercase tracking-wider mb-2">
                Estimated budget
                <span className="normal-case font-normal text-muted ml-1">— optional</span>
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
                Target start date
                <span className="normal-case font-normal text-muted ml-1">— optional</span>
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Q3 2026 / Summer 2026 / TBD"
                className="w-full px-4 py-3 text-sm bg-white border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              onClick={() => canSubmit && onSubmit({ address, propertyType, scope, budget, startDate })}
              disabled={!canSubmit}
              className={`w-full py-3 text-sm font-medium rounded-lg transition-all ${
                canSubmit
                  ? 'bg-clay text-white hover:bg-clay-dark cursor-pointer'
                  : 'bg-base text-muted cursor-not-allowed'
              }`}
            >
              Screen for eligible grants →
            </button>

            {!canSubmit && (
              <p className="text-xs text-center text-muted">
                Enter an address, property type, and project scope to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
