import { useState, useEffect } from 'react'
import { loadingSteps } from '../data/grants'

export default function LoadingResearch({ onComplete }) {
  const [completedSteps, setCompletedSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const intervals = loadingSteps.map((_, i) =>
      setTimeout(() => {
        setCurrentStep(i + 1)
        setCompletedSteps(prev => [...prev, i])
      }, 600 + i * 700)
    )

    const doneTimer = setTimeout(() => {
      setDone(true)
    }, 600 + loadingSteps.length * 700 + 400)

    return () => {
      intervals.forEach(clearTimeout)
      clearTimeout(doneTimer)
    }
  }, [])

  const progress = Math.round((completedSteps.length / loadingSteps.length) * 100)

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <nav className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
        <span className="font-mono text-sm font-medium text-ink">Grant<span className="text-clay">IQ</span></span>
        <span className="text-xs text-muted font-mono">Step 2 of 3</span>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 pt-16 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-ink tracking-tight mb-2">
              Screening your property
            </h1>
            <p className="text-subtle text-sm">
              50 Washington Ave, Point Richmond CA 94801
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-subtle">{progress}% complete</span>
              {done && <span className="text-xs font-mono text-clay font-medium">Done</span>}
            </div>
            <div className="h-1 bg-base rounded-full overflow-hidden">
              <div
                className="h-full bg-clay rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-0">
            {loadingSteps.map((step, i) => {
              const isComplete = completedSteps.includes(i)
              const isCurrent = currentStep === i && !isComplete
              const isPending = i > currentStep

              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 py-2.5 border-b border-border/50 last:border-b-0 transition-all duration-300 ${
                    isPending ? 'opacity-30' : 'opacity-100'
                  } ${isComplete ? 'fade-up' : ''}`}
                >
                  <div className="mt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center">
                    {isComplete ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="7" fill="#b89878" fillOpacity="0.15"/>
                        <path d="M4 7l2 2 4-4" stroke="#b89878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : isCurrent ? (
                      <div className="flex gap-0.5">
                        {[0,1,2].map(d => (
                          <div
                            key={d}
                            className="w-1 h-1 rounded-full bg-clay"
                            style={{ animation: `pulse-dot 1.2s ease-in-out ${d * 0.2}s infinite` }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-border" />
                    )}
                  </div>
                  <span className={`text-sm leading-5 ${
                    isComplete ? 'text-ink' : isCurrent ? 'text-ink font-medium' : 'text-muted'
                  }`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          {done && (
            <div className="mt-8 fade-up">
              <div className="bg-white border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-subtle">Eligible grants found</span>
                  <span className="font-mono text-sm font-semibold text-ink">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-subtle">Estimated total value</span>
                  <span className="font-mono text-sm font-semibold text-clay">$2.2M+</span>
                </div>
              </div>
              <button
                onClick={onComplete}
                className="w-full py-3 text-sm font-medium bg-clay text-white rounded-lg hover:bg-clay-dark transition-colors"
              >
                View your grant workbook →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
