import { useState } from 'react'

const TYPE_COLORS = {
  Federal: 'bg-blue-50 text-blue-700 border-blue-100',
  State: 'bg-purple-50 text-purple-700 border-purple-100',
  Local: 'bg-amber-50 text-amber-700 border-amber-100',
  Private: 'bg-green-50 text-green-700 border-green-100',
}

function CheckIcon({ pass }) {
  if (pass === true) return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <circle cx="7" cy="7" r="7" fill="#22c55e" fillOpacity="0.12"/>
      <path d="M4 7l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (pass === false) return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <circle cx="7" cy="7" r="7" fill="#ef4444" fillOpacity="0.1"/>
      <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <circle cx="7" cy="7" r="7" fill="#f59e0b" fillOpacity="0.12"/>
      <path d="M7 4v3.5M7 9.5v.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function GrantDetailPanel({ grant, onClose }) {
  const [checklistState, setChecklistState] = useState(
    grant.checklist.map(item => item.done)
  )
  const [emailMode, setEmailMode] = useState('view') // view | edit
  const [emailBody, setEmailBody] = useState(grant.draftEmail?.body || '')
  const [activeTab, setActiveTab] = useState('overview')

  const toggleChecklist = (i) => {
    setChecklistState(prev => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  const checkedCount = checklistState.filter(Boolean).length

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div
        className="relative w-full max-w-xl bg-white border-l border-border h-full overflow-y-auto slide-in-right flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${TYPE_COLORS[grant.type] || 'bg-base text-subtle border-border'}`}>
                  {grant.type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  grant.status === 'eligible' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {grant.status === 'eligible' ? 'Eligible' : 'Not eligible'}
                </span>
              </div>
              <h2 className="text-base font-semibold text-ink leading-tight">{grant.name}</h2>
              <div className="text-lg font-mono font-semibold text-clay mt-1">{grant.estValue}</div>
            </div>
            <button onClick={onClose} className="text-muted hover:text-ink transition-colors p-1 mt-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3">
            {['overview', 'email', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-base text-ink font-medium'
                    : 'text-muted hover:text-subtle'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-6 py-5 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Ineligible reason */}
              {grant.status === 'ineligible' && grant.ineligibleReason && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <p className="text-xs font-medium text-red-700 mb-1">Why this grant doesn't apply</p>
                  <p className="text-sm text-red-600 leading-relaxed">{grant.ineligibleReason}</p>
                </div>
              )}

              {/* Use for */}
              <div>
                <h3 className="text-xs font-medium text-subtle uppercase tracking-wider mb-2">What it covers</h3>
                <p className="text-sm text-ink leading-relaxed">{grant.useFor}</p>
              </div>

              {/* Eligibility checks */}
              {grant.eligibilityChecks.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-subtle uppercase tracking-wider mb-3">Eligibility checks</h3>
                  <div className="space-y-2">
                    {grant.eligibilityChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckIcon pass={check.pass} />
                        <span className="text-sm text-ink">{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-app checklist */}
              {grant.checklist.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-medium text-subtle uppercase tracking-wider">Pre-application checklist</h3>
                    <span className="text-xs font-mono text-clay">{checkedCount}/{grant.checklist.length}</span>
                  </div>
                  <div className="space-y-2">
                    {grant.checklist.map((item, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checklistState[i]}
                          onChange={() => toggleChecklist(i)}
                          className="mt-0.5"
                        />
                        <span className={`text-sm leading-5 transition-colors ${
                          checklistState[i] ? 'line-through text-muted' : 'text-ink group-hover:text-ink'
                        }`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              {grant.steps.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-subtle uppercase tracking-wider mb-3">How to apply</h3>
                  <div className="space-y-3">
                    {grant.steps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="font-mono text-xs text-clay font-medium flex-shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-ink leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {grant.contact && (
                <div>
                  <h3 className="text-xs font-medium text-subtle uppercase tracking-wider mb-3">Key contact</h3>
                  <div className="bg-base rounded-lg p-4 border border-border">
                    <div className="font-medium text-sm text-ink">{grant.contact.name}</div>
                    <div className="text-xs text-muted mt-0.5">{grant.contact.title}</div>
                    <div className="mt-2 space-y-1">
                      {grant.contact.email && (
                        <div className="text-xs font-mono text-clay">{grant.contact.email}</div>
                      )}
                      {grant.contact.phone && (
                        <div className="text-xs text-muted">{grant.contact.phone}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Hire recommendation */}
              {grant.hireRecommendation?.needed && (
                <div>
                  <h3 className="text-xs font-medium text-subtle uppercase tracking-wider mb-3">Recommended firm</h3>
                  <div className="border border-clay-light rounded-lg p-4 bg-amber-50/30">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-clay-light flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-mono text-clay font-medium">
                          {grant.hireRecommendation.firm?.charAt(0) || 'F'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-ink">{grant.hireRecommendation.firm}</div>
                        <div className="text-xs text-muted mt-0.5">{grant.hireRecommendation.contact}</div>
                        <p className="text-xs text-subtle mt-2 leading-relaxed">{grant.hireRecommendation.reason}</p>
                        {grant.hireRecommendation.email && (
                          <button
                            onClick={() => setActiveTab('email')}
                            className="mt-3 text-xs text-clay hover:text-clay-dark font-medium transition-colors"
                          >
                            Send warm intro → {grant.hireRecommendation.email}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              {grant.draftEmail ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-subtle uppercase tracking-wider">Pre-drafted outreach</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEmailMode(emailMode === 'view' ? 'edit' : 'view')}
                        className="text-xs text-clay hover:text-clay-dark font-medium transition-colors"
                      >
                        {emailMode === 'view' ? 'Edit' : 'Preview'}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(emailBody)}
                        className="text-xs text-muted hover:text-ink transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg overflow-hidden">
                    {/* Email header */}
                    <div className="border-b border-border px-4 py-3 bg-base space-y-1">
                      <div className="flex gap-2 text-xs">
                        <span className="text-muted w-8 flex-shrink-0">To</span>
                        <span className="text-ink font-mono">{grant.draftEmail.to}</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-muted w-8 flex-shrink-0">Subj</span>
                        <span className="text-ink">{grant.draftEmail.subject}</span>
                      </div>
                    </div>

                    {/* Email body */}
                    <div className="p-4">
                      {emailMode === 'view' ? (
                        <pre className="text-sm text-ink whitespace-pre-wrap font-sans leading-relaxed">{emailBody}</pre>
                      ) : (
                        <textarea
                          value={emailBody}
                          onChange={e => setEmailBody(e.target.value)}
                          rows={16}
                          className="w-full text-sm text-ink leading-relaxed resize-none focus:outline-none font-sans"
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-border px-4 py-3 bg-base flex gap-2">
                      <button className="px-4 py-1.5 bg-clay text-white text-xs rounded font-medium hover:bg-clay-dark transition-colors">
                        Send via Gmail
                      </button>
                      <button className="px-4 py-1.5 border border-border text-ink text-xs rounded hover:bg-white transition-colors">
                        Open in Gmail
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(emailBody)}
                        className="px-4 py-1.5 border border-border text-ink text-xs rounded hover:bg-white transition-colors"
                      >
                        Copy text
                      </button>
                    </div>
                  </div>

                  {grant.hireRecommendation?.needed && (
                    <div className="bg-clay-light/30 rounded-lg p-3 text-xs text-subtle leading-relaxed">
                      <span className="font-medium text-ink">Warm intro note: </span>
                      {grant.hireRecommendation.reason}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted">No email drafted — this grant requires a different contact method.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-xs font-medium text-subtle uppercase tracking-wider mb-4">Status history</h3>
              <div className="relative">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
                <div className="space-y-4">
                  {grant.statusHistory.map((event, i) => (
                    <div key={i} className="flex gap-4 pl-8 relative">
                      <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-clay" />
                      <div>
                        <div className="text-xs font-mono text-muted">{event.date}</div>
                        <div className="text-sm text-ink font-medium mt-0.5">{event.event}</div>
                        {event.note && <div className="text-xs text-subtle mt-0.5">{event.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with deadline */}
        {grant.deadline && grant.status === 'eligible' && (
          <div className="sticky bottom-0 bg-white border-t border-border px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-muted">Deadline</span>
            <span className="text-xs font-mono text-ink">{grant.deadline}</span>
          </div>
        )}
      </div>
    </div>
  )
}
