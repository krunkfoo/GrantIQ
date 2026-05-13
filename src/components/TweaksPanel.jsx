import { useState } from 'react'

const SCREENS = [
  { label: 'Property intake', value: 'intake' },
  { label: 'Research loading', value: 'loading' },
  { label: 'Grant workbook', value: 'workbook' },
]

export default function TweaksPanel({ currentScreen, onJumpTo, tweaks, onTweaksChange, demo }) {
  const [open, setOpen] = useState(false)

  const update = (key, val) => onTweaksChange({ ...tweaks, [key]: val })

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-9 h-9 rounded-full bg-ink text-white shadow-panel flex items-center justify-center hover:bg-subtle transition-colors"
        title="Prototype tweaks"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="2" stroke="white" strokeWidth="1.5"/>
          <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.5 2.5l1.4 1.4M10.1 10.1l1.4 1.4M2.5 11.5l1.4-1.4M10.1 3.9l1.4-1.4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-16 right-5 z-50 w-64 bg-white border border-border rounded-xl shadow-panel overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-medium text-ink">Prototype tweaks</span>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-ink">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Demo mode indicator */}
            {demo && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-clay-light/50 rounded border border-clay/20">
                <span className="text-xs font-mono font-medium text-clay-dark">DEMO MODE</span>
                <span className="text-xs text-muted">Hotel Mac data</span>
              </div>
            )}

            {/* Jump to screen */}
            <div>
              <label className="block text-xs text-muted mb-2 uppercase tracking-wider font-medium">Jump to screen</label>
              <div className="space-y-1">
                {SCREENS.map(s => (
                  <label key={s.value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="screen"
                      checked={currentScreen === s.value}
                      onChange={() => onJumpTo(s.value)}
                      className="w-3 h-3"
                      style={{ accentColor: '#b89878' }}
                    />
                    <span className="text-xs text-ink group-hover:text-clay transition-colors">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <label className="block text-xs text-muted mb-2 uppercase tracking-wider font-medium">
                Table density
              </label>
              <div className="flex gap-1">
                {['compact', 'normal', 'relaxed'].map(d => (
                  <button
                    key={d}
                    onClick={() => update('density', d)}
                    className={`flex-1 text-xs py-1.5 rounded border transition-colors capitalize ${
                      tweaks.density === d
                        ? 'bg-ink text-white border-ink'
                        : 'border-border text-muted hover:border-clay hover:text-ink'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar counts */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-muted uppercase tracking-wider font-medium">Show sidebar counts</span>
                <div
                  onClick={() => update('sidebarCounts', !tweaks.sidebarCounts)}
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${tweaks.sidebarCounts ? 'bg-clay' : 'bg-border'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${tweaks.sidebarCounts ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>

            {/* Accent color */}
            <div>
              <label className="block text-xs text-muted mb-2 uppercase tracking-wider font-medium">
                Accent color
              </label>
              <div className="flex gap-2">
                {['#b89878', '#7c9a7e', '#7a8ea8', '#a07a9a'].map(color => (
                  <button
                    key={color}
                    onClick={() => update('accent', color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${tweaks.accent === color ? 'border-ink scale-110' : 'border-transparent'}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
