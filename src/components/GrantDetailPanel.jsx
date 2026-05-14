'use client'

import { useState, useEffect } from 'react'

const WORKFLOW_STATUSES = ['Not started', 'Draft email ready', 'Contact made', 'Sent', 'Replied']

/* ── mini icons ──────────────────────────────────────────── */

function CheckIcon({ pass }) {
  if (pass === true) return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="7" fill="oklch(0.96 0.03 150)"/>
      <path d="M4 7l2 2 4-4" stroke="oklch(0.42 0.09 150)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (pass === false) return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="7" fill="oklch(0.97 0.025 25)"/>
      <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="oklch(0.58 0.16 25)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="7" fill="oklch(0.97 0.04 85)"/>
      <path d="M7 4v3.5M7 9.5v.5" stroke="oklch(0.45 0.10 70)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function DpCheckbox({ checked }) {
  return (
    <div className="dp-cbox">
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M3 3l9 9M12 3l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

/* ── type / status helpers ───────────────────────────────── */

function typeBadgeClass(type) {
  if (type === 'Federal') return 'badge-sq federal'
  if (type === 'State')   return 'badge-sq state'
  return 'badge-sq city'
}

function statusBadgeClass(status) {
  if (!status || status === 'Not started') return 'badge b-mute'
  if (status === 'Sent')   return 'badge b-info'
  if (status === 'Replied') return 'badge b-done'
  if (status === 'Contact made') return 'badge b-open'
  return 'badge'
}

/* ── main component ──────────────────────────────────────── */

export default function GrantDetailPanel({
  grant, demo, propertyId,
  onClose, onStatusChange, onEmailSave, onChecklistToggle, onReplyLogged,
}) {
  const [emailMode, setEmailMode]     = useState('view')
  const [emailBody, setEmailBody]     = useState(grant.emailBody || grant.draftEmail?.body || '')
  const [draftEmail, setDraftEmail]   = useState(grant.draftEmail || null)
  const [draftLoading, setDraftLoading] = useState(false)
  const [draftError, setDraftError]   = useState(null)
  const [saving, setSaving]           = useState(false)
  const [replyMode, setReplyMode]     = useState(false)
  const [replyText, setReplyText]     = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyResult, setReplyResult] = useState(null)

  // Esc to close
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleLogReply = async () => {
    if (!replyText.trim()) return
    setReplyLoading(true)
    setReplyResult(null)
    try {
      const res = await fetch(`/api/grants/${propertyId}/${grant.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailContent: replyText }),
      })
      const data = await res.json()
      if (data.ok) {
        setReplyResult(data)
        onStatusChange(grant.id, data.status)
        if (onReplyLogged) onReplyLogged(data)
        setReplyText('')
        setReplyMode(false)
      }
    } finally {
      setReplyLoading(false)
    }
  }

  const handleEmailSave = async () => {
    setSaving(true)
    await onEmailSave(grant.id, emailBody)
    setSaving(false)
    setEmailMode('view')
  }

  const handleCopy = () => navigator.clipboard.writeText(emailBody)

  const handleGenerateDraft = async () => {
    setDraftLoading(true)
    setDraftError(null)
    try {
      const res = await fetch('/api/grants/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, grant }),
      })
      const data = await res.json()
      if (data.ok) {
        setDraftEmail(data.draft)
        setEmailBody(data.draft.body)
      } else {
        setDraftError(data.error || 'Failed to generate draft')
      }
    } catch (e) {
      setDraftError(e.message)
    } finally {
      setDraftLoading(false)
    }
  }

  const isIneligible  = grant.status === 'ineligible'
  const checkedCount  = (grant.checklist || []).filter(c => c.done).length
  const history       = grant.statusHistory || []

  // Initials for firm avatar
  const firmInitial = grant.hireRecommendation?.firm?.charAt(0) ?? '?'

  return (
    <>
      {/* scrim */}
      <div className="detail-scrim" onClick={onClose} />

      {/* panel */}
      <div className="detail-panel">
        {/* ── dp-top ── */}
        <div className="dp-top">
          <div className="dp-info">
            <div className="dp-name">{grant.name}</div>
            <div className="dp-meta">
              <span className={typeBadgeClass(grant.type)}>{grant.type}</span>
              <span className={`badge${isIneligible ? ' b-bad' : ' b-open'}`}>
                <span className="dot" />
                {isIneligible ? 'Not eligible' : 'Eligible'}
              </span>
              {grant.deadline && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-4)' }}>
                  Due {grant.deadline}
                </span>
              )}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>

        {/* ── dp-body ── */}
        <div className="dp-body">

          {/* Estimated value */}
          <div className="dp-section">
            <h4>Estimated value</h4>
            <div className="dp-big-val">{grant.estValue || '—'}</div>
            {grant.valueNote && <div className="dp-big-sub">{grant.valueNote}</div>}
          </div>

          {/* Why ineligible */}
          {isIneligible && grant.ineligibleReason && (
            <div className="dp-section">
              <h4>Why this grant didn't qualify</h4>
              <div style={{
                background: 'var(--st-bad-soft)', border: '1px solid var(--st-bad-border)',
                borderRadius: 'var(--radius)', padding: '12px 14px',
                color: 'var(--st-bad)', fontSize: 13, lineHeight: 1.5,
              }}>
                {grant.ineligibleReason}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 8 }}>
                Re-screen automatically if your project scope or property status changes.
              </div>
            </div>
          )}

          {/* Use this grant for */}
          {!isIneligible && grant.useFor && (
            <div className="dp-section">
              <h4>Use this grant for</h4>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>{grant.useFor}</p>
            </div>
          )}

          {/* Eligibility */}
          {(grant.eligibilityChecks || []).length > 0 && (
            <div className="dp-section">
              <h4>Eligibility</h4>
              <div className="dp-checklist">
                {grant.eligibilityChecks.map((c, i) => (
                  <div key={i} className="dp-ci" style={{ cursor: 'default' }}>
                    <CheckIcon pass={c.pass} />
                    <span style={{ flex: 1, color: c.pass === false ? 'var(--st-bad)' : 'var(--ink-2)' }}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pre-app checklist */}
          {(grant.checklist || []).length > 0 && (
            <div className="dp-section">
              <h4>
                Pre-application checklist
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>
                  {checkedCount}/{grant.checklist.length}
                </span>
              </h4>
              <div className="dp-checklist">
                {grant.checklist.map((item, i) => (
                  <div
                    key={i}
                    className={`dp-ci${item.done ? ' done' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onChecklistToggle(grant.id, i, !item.done)}
                  >
                    <DpCheckbox checked={item.done} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application steps */}
          {(grant.steps || []).length > 0 && !isIneligible && (
            <div className="dp-section">
              <h4>Application steps</h4>
              <div className="dp-steps">
                {grant.steps.map((step, i) => (
                  <div key={i} className="dp-step">{step}</div>
                ))}
              </div>
            </div>
          )}

          {/* Pre-drafted email */}
          {!isIneligible && (
            <div className="dp-section">
              <h4>Draft email</h4>
              {!draftEmail && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleGenerateDraft}
                    disabled={draftLoading}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {draftLoading ? 'Generating…' : '✦ Generate draft email'}
                  </button>
                  {draftError && (
                    <span style={{ fontSize: 12, color: 'var(--st-bad)' }}>{draftError}</span>
                  )}
                </div>
              )}
              {draftEmail && (
              <div className="email-card">
                <div className="email-row">
                  <span className="ek">To</span>
                  <span className="ev" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{draftEmail.to}</span>
                </div>
                <div className="email-row">
                  <span className="ek">Subject</span>
                  <span className="ev">{draftEmail.subject}</span>
                </div>
                <div className="email-row body-row">
                  {emailMode === 'view'
                    ? <pre>{emailBody}</pre>
                    : <textarea
                        value={emailBody}
                        onChange={e => setEmailBody(e.target.value)}
                        rows={14}
                        style={{
                          width: '100%', border: 0, outline: 'none', resize: 'none',
                          fontFamily: 'inherit', fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)',
                          background: 'transparent',
                        }}
                      />
                  }
                </div>
                <div className="email-actions">
                  {!demo && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => { onStatusChange(grant.id, 'Sent'); onClose() }}
                    >
                      Send via Gmail
                    </button>
                  )}
                  {emailMode === 'view'
                    ? <button className="btn btn-sm" onClick={() => setEmailMode('edit')}>Edit</button>
                    : <>
                        <button className="btn btn-sm btn-primary" onClick={handleEmailSave} disabled={saving}>
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setEmailMode('view')}>Cancel</button>
                      </>
                  }
                  <button className="btn btn-sm" onClick={handleCopy}>Copy</button>
                  {grant.link && (
                    <a href={grant.link} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      Open portal ↗
                    </a>
                  )}
                </div>
              </div>
              )}

              {demo && (
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 10 }}>
                  <strong style={{ color: 'var(--ink)' }}>Demo mode:</strong> Email edits are not saved.{' '}
                  <a href="/sign-up" style={{ color: 'var(--accent)' }}>Create an account</a> to save your workbook.
                </div>
              )}
            </div>
          )}

          {/* Key contact */}
          {grant.contact && (
            <div className="dp-section">
              <h4>Key contact</h4>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--bg-sunk)', border: '1px solid var(--border)',
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, flexShrink: 0,
                }}>
                  {grant.contact.name?.charAt(0) ?? '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{grant.contact.name}</div>
                  {grant.contact.title && (
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{grant.contact.title}</div>
                  )}
                  {grant.contact.email && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
                      {grant.contact.email}
                    </div>
                  )}
                  {grant.contact.phone && (
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{grant.contact.phone}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hire a firm */}
          {grant.hireRecommendation?.needed && (
            <div className="dp-section">
              <h4>Hire a firm</h4>
              <div className="firm-card">
                <div className="firm-name">
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--accent-soft)', border: '1px solid var(--accent-soft-border)',
                    display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12, color: 'var(--accent)',
                  }}>
                    {firmInitial}
                  </div>
                  {grant.hireRecommendation.firm}
                  <span className="warm-pill">Warm match</span>
                </div>
                {grant.hireRecommendation.reason && (
                  <div className="firm-why">{grant.hireRecommendation.reason}</div>
                )}
                <div className="firm-meta">
                  {grant.hireRecommendation.contact && <span>{grant.hireRecommendation.contact}</span>}
                  {grant.hireRecommendation.email   && <span>{grant.hireRecommendation.email}</span>}
                </div>
                {grant.hireRecommendation.email && !demo && (
                  <div style={{ marginTop: 10 }}>
                    <button className="btn btn-sm btn-accent">
                      Send intro →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status history */}
          {history.length > 0 && (
            <div className="dp-section">
              <h4>Status history</h4>
              <div className="timeline">
                {history.map((event, i) => {
                  const isSent  = event.event?.toLowerCase().includes('sent')
                  const isReply = event.event?.toLowerCase().includes('repl')
                  return (
                    <div key={i} className={`tl-item${isSent ? ' tl-sent' : isReply ? ' tl-reply' : ''}`}>
                      <div className="tl-dot" />
                      <div className="tl-body">
                        <div className="tl-line">{event.event}</div>
                        {event.note && (
                          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>{event.note}</div>
                        )}
                        <div className="tl-ts">
                          {new Date(event.createdAt || event.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Log a reply */}
          {!demo && grant.status === 'eligible' && (
            <div className="dp-section" style={{ borderBottom: 0 }}>
              <h4>Log a reply</h4>

              {!replyMode && (
                <button className="btn btn-sm" onClick={() => setReplyMode(true)}>
                  + Log a reply
                </button>
              )}

              {replyMode && (
                <>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="giq-textarea"
                    placeholder="Paste the email reply here — Claude will parse the status, extract next steps, and surface any new programs mentioned…"
                    style={{ marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleLogReply}
                      disabled={replyLoading || !replyText.trim()}
                    >
                      {replyLoading ? 'Analyzing…' : 'Analyze & log reply'}
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => { setReplyMode(false); setReplyText('') }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {replyResult && (
                <div className="reply-result" style={{ marginTop: 12 }}>
                  <div className="rr-status">{replyResult.status}</div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{replyResult.note}</p>
                  {replyResult.nextAction && (
                    <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 500 }}>
                      Next: {replyResult.nextAction}
                    </p>
                  )}
                  {replyResult.newGrants?.length > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--st-open-border)' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                        {replyResult.newGrants.length} new program{replyResult.newGrants.length > 1 ? 's' : ''} added:
                      </div>
                      {replyResult.newGrants.map(g => (
                        <div key={g.id} style={{ fontSize: 12 }}>· {g.name} — {g.estValue}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
