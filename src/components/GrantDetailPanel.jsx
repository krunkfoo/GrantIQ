'use client'

import { useState, useEffect } from 'react'

const WORKFLOW_STATUSES = ['Not started', 'Contact made', 'Applied', 'Approved', 'Not pursuing']

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

function useFill(property) {
  return (text) => {
    if (!text || !property) return text
    return text
      .replaceAll('{{ADDRESS}}', property.address ?? '')
      .replaceAll('{{CITY}}', property.city?.split(',')[0]?.trim() ?? property.city ?? '')
      .replaceAll('{{STATE}}', 'California')
      .replaceAll('{{SCOPE}}', property.scope ?? '')
      .replaceAll('{{BUDGET}}', property.budget ?? '')
      .replaceAll('{{START_DATE}}', property.startDate ?? '')
      .replaceAll('{ADDRESS}', property.address ?? '')
      .replaceAll('{CITY}', property.city?.split(',')[0]?.trim() ?? '')
  }
}

export default function GrantDetailPanel({
  grant, demo, property,
  onClose, onStatusChange, onChecklistToggle, onPatch,
}) {
  const fill = useFill(property)
  const [editingContact, setEditingContact] = useState(false)
  const [contactDraft, setContactDraft]     = useState(grant.contact ?? {})
  const [notes, setNotes]                   = useState(grant.notes ?? '')
  const [notesSaved, setNotesSaved]         = useState(false)
  const [emailBody, setEmailBody]           = useState(() => fill(grant.draftEmail?.body ?? ''))
  const [emailEditing, setEmailEditing]     = useState(false)
  const [copied, setCopied]                 = useState(false)
  const [expandedStep, setExpandedStep]     = useState(null) // index of expanded step
  const [stepDetail, setStepDetail]         = useState({})   // { [index]: { loading, bullets } }

  // Esc to close
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const saveContact = () => {
    onPatch?.(grant.id, { contact: contactDraft })
    setEditingContact(false)
  }

  const saveNotes = () => {
    onPatch?.(grant.id, { notes })
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(emailBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openInMail = () => {
    const to  = grant.draftEmail?.to?.match(/<(.+)>/)?.[1] ?? grant.contact?.email ?? ''
    const sub = encodeURIComponent(fill(grant.draftEmail?.subject ?? ''))
    const bod = encodeURIComponent(emailBody)
    window.location.href = `mailto:${to}?subject=${sub}&body=${bod}`
  }

  const handleStepClick = async (step, index) => {
    if (expandedStep === index) { setExpandedStep(null); return }
    setExpandedStep(index)
    if (stepDetail[index]) return // already loaded
    setStepDetail(d => ({ ...d, [index]: { loading: true } }))

    if (demo) {
      setStepDetail(d => ({ ...d, [index]: { loading: false, bullets: ['__signup__'] } }))
      return
    }

    try {
      const res = await fetch('/api/grants/step-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantName: grant.name,
          step: fill(step),
          contact: grant.contact,
          property: { address: property?.address, city: property?.city, scope: property?.scope },
        }),
      })
      const data = await res.json()
      setStepDetail(d => ({ ...d, [index]: { loading: false, bullets: data.bullets ?? [] } }))
    } catch {
      setStepDetail(d => ({ ...d, [index]: { loading: false, bullets: ['Could not load detail — try again.'] } }))
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
              {grant.applicationLink && (
                <a
                  href={grant.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11.5, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                >
                  Program page ↗
                </a>
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

          {/* ── Ready-to-send email ── hero section for eligible grants */}
          {!isIneligible && grant.draftEmail && (
            <div className="dp-section" style={{
              background: 'var(--bg-sunk)', borderRadius: 'var(--radius)',
              padding: '16px', margin: '0 -2px', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>Ready to send</h4>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => setEmailEditing(v => !v)}>
                    {emailEditing ? 'Done' : 'Edit'}
                  </button>
                  <button className="btn btn-sm" onClick={copyEmail}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={openInMail}>
                    Open in Mail ↗
                  </button>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-panel)', border: '1px solid var(--border)',
                borderRadius: 'calc(var(--radius) - 2px)', overflow: 'hidden',
              }}>
                <div style={{
                  padding: '10px 14px', borderBottom: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', width: 42, flexShrink: 0 }}>To</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{grant.draftEmail.to}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', width: 42, flexShrink: 0 }}>Subject</span>
                    <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{fill(grant.draftEmail.subject)}</span>
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  {emailEditing
                    ? <textarea
                        value={emailBody}
                        onChange={e => setEmailBody(e.target.value)}
                        style={{
                          width: '100%', border: 0, outline: 'none', resize: 'none',
                          fontFamily: 'inherit', fontSize: 13, lineHeight: 1.65,
                          color: 'var(--ink-2)', background: 'transparent', minHeight: 180,
                        }}
                      />
                    : <pre style={{
                        margin: 0, fontFamily: 'inherit', fontSize: 13,
                        lineHeight: 1.65, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      }}>
                        {emailBody}
                      </pre>
                  }
                </div>
              </div>
            </div>
          )}

          {/* Why ineligible */}
          {isIneligible && grant.ineligibleReason && (
            <div className="dp-section">
              <h4>Why this grant didn't qualify</h4>
              <div style={{
                background: 'var(--st-bad-soft)', border: '1px solid var(--st-bad-border)',
                borderRadius: 'var(--radius)', padding: '12px 14px',
                color: 'var(--st-bad)', fontSize: 13, lineHeight: 1.5,
              }}>
                {fill(grant.ineligibleReason)}
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
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>{fill(grant.useFor)}</p>
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

          {/* Application steps — click to expand how-to */}
          {(grant.steps || []).length > 0 && !isIneligible && (
            <div className="dp-section">
              <h4>Application steps <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--ink-4)', textTransform: 'none', letterSpacing: 0 }}>— click any step for guidance</span></h4>
              <div className="dp-steps">
                {grant.steps.map((step, i) => {
                  const open = expandedStep === i
                  const det  = stepDetail[i]
                  return (
                    <div key={i}>
                      <div
                        className="dp-step"
                        onClick={() => handleStepClick(step, i)}
                        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}
                      >
                        <span>{fill(step)}</span>
                        <span style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0, marginTop: 2 }}>
                          {open ? '▲' : '▼'}
                        </span>
                      </div>
                      {open && (
                        <div style={{
                          margin: '0 0 4px 0', padding: '12px 14px',
                          background: 'var(--bg-sunk)', borderRadius: '0 0 var(--radius) var(--radius)',
                          borderTop: '1px solid var(--border)',
                        }}>
                          {det?.loading && (
                            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Loading guidance…</div>
                          )}
                          {det?.bullets && (
                            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {det.bullets.map((b, bi) => (
                                <li key={bi} style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                                  {b === '__signup__'
                                    ? <><a href="/sign-up" style={{ color: 'var(--accent)', fontWeight: 500 }}>Create a free account</a> to get step-by-step guidance for each application step.</>
                                    : b
                                  }
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}


          {/* Key contact — editable */}
          <div className="dp-section">
            <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Key contact
              {!demo && (
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ fontWeight: 400, fontSize: 11 }}
                  onClick={() => { setContactDraft(grant.contact ?? {}); setEditingContact(v => !v) }}
                >
                  {editingContact ? 'Cancel' : 'Edit'}
                </button>
              )}
            </h4>

            {editingContact ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'name',  label: 'Name',    placeholder: 'First Last' },
                  { key: 'title', label: 'Title',   placeholder: 'Program Officer' },
                  { key: 'email', label: 'Email',   placeholder: 'name@agency.gov' },
                  { key: 'phone', label: 'Phone',   placeholder: '(510) 555-0100' },
                  { key: 'url',   label: 'Link',    placeholder: 'https://...' },
                ].map(({ key, label, placeholder }) => (
                  <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                    <input
                      value={contactDraft[key] ?? ''}
                      onChange={e => setContactDraft(d => ({ ...d, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="giq-input"
                      style={{ fontSize: 13 }}
                    />
                  </label>
                ))}
                <button className="btn btn-sm btn-primary" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={saveContact}>
                  Save contact
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--bg-sunk)', border: '1px solid var(--border)',
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, flexShrink: 0,
                }}>
                  {(contactDraft.name || grant.contact?.name)?.charAt(0) ?? '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                    {contactDraft.name || grant.contact?.name || <span style={{ color: 'var(--ink-4)' }}>No contact — click Edit to add</span>}
                  </div>
                  {(contactDraft.title || grant.contact?.title) && (
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{contactDraft.title || grant.contact?.title}</div>
                  )}
                  {(contactDraft.email || grant.contact?.email) && (
                    <a
                      href={`mailto:${contactDraft.email || grant.contact?.email}`}
                      style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', marginTop: 6, textDecoration: 'none' }}
                    >
                      {contactDraft.email || grant.contact?.email}
                    </a>
                  )}
                  {(contactDraft.phone || grant.contact?.phone) && (
                    <a
                      href={`tel:${(contactDraft.phone || grant.contact?.phone).replace(/\D/g, '')}`}
                      style={{ display: 'block', fontSize: 12, color: 'var(--ink-3)', marginTop: 2, textDecoration: 'none' }}
                    >
                      {contactDraft.phone || grant.contact?.phone}
                    </a>
                  )}
                  {(contactDraft.url || grant.applicationLink) && (
                    <a
                      href={contactDraft.url || grant.applicationLink}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', fontSize: 12, color: 'var(--accent)', marginTop: 4, textDecoration: 'none' }}
                    >
                      Program page ↗
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes / corrections */}
          {!demo && (
            <div className="dp-section">
              <h4>Notes &amp; corrections</h4>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="giq-textarea"
                placeholder="Add context about this property, correct any info Claude got wrong, or note next steps…"
                rows={4}
              />
              <button
                className="btn btn-sm"
                style={{ marginTop: 8, alignSelf: 'flex-start' }}
                onClick={saveNotes}
              >
                {notesSaved ? '✓ Saved' : 'Save note'}
              </button>
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
                  <div className="firm-why">{fill(grant.hireRecommendation.reason)}</div>
                )}
                <div className="firm-meta">
                  {grant.hireRecommendation.contact && <span>{grant.hireRecommendation.contact}</span>}
                  {grant.hireRecommendation.email   && <span>{grant.hireRecommendation.email}</span>}
                </div>
                {grant.hireRecommendation.email && !demo && (
                  <div style={{ marginTop: 10 }}>
                    <a
                      className="btn btn-sm btn-accent"
                      href={(() => {
                        const hr = grant.hireRecommendation
                        const sub = encodeURIComponent(`${grant.name} — Seeking Consultant for ${grant.type} Application`)
                        const body = encodeURIComponent(
                          `Hi${hr.contact ? ` ${hr.contact.split(' ')[0]}` : ''},\n\n` +
                          `I'm working on a grant application for ${grant.name} and was referred to ${hr.firm} as a firm with relevant experience.\n\n` +
                          `${hr.reason}\n\n` +
                          `Would you have 20 minutes to connect this week to discuss whether we'd be a good fit?\n\n` +
                          `Thank you,\n[Your name]\n[Your phone]`
                        )
                        return `mailto:${hr.email}?subject=${sub}&body=${body}`
                      })()}
                    >
                      Send intro →
                    </a>
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

        </div>
      </div>
    </>
  )
}
