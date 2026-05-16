'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import GrantDetailPanel from './GrantDetailPanel.jsx'

/* ── helpers ─────────────────────────────────────────────── */

function formatValue(num) {
  if (!num) return '—'
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${num.toLocaleString()}`
}

function typeBadge(type) {
  if (type === 'Federal') return 'badge-sq federal'
  if (type === 'State')   return 'badge-sq state'
  return 'badge-sq city'
}

function exportCSV(grants, property) {
  const headers = ['Grant name', 'Type', 'Status', 'Est. value', 'Deadline', 'Contact name', 'Contact email', 'Use for', 'Application link']
  const rows = grants.map(g => [
    g.name,
    g.type,
    g.status,
    g.estValue || '',
    g.deadline || '',
    g.contact?.name || '',
    g.contact?.email || '',
    g.useFor || '',
    g.applicationLink || '',
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${property.address.replace(/[^a-z0-9]/gi, '_')}_grants.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ── inline SVG icons ────────────────────────────────────── */

const Icons = {
  building: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="11" rx="1"/>
      <path d="M5 14V9h6v5M5 6h1M8 6h1M11 6h1M5 9h1M11 9h1"/>
    </svg>
  ),
  table: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="2" y="2" width="12" height="12" rx="1"/>
      <path d="M2 6h12M2 10h12M6 6v6M10 6v6"/>
    </svg>
  ),
  inbox: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10l2.5-6h7L14 10"/>
      <rect x="2" y="10" width="12" height="4" rx="1"/>
      <path d="M5.5 12.5h5"/>
    </svg>
  ),
  people: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6" cy="5" r="2.5"/>
      <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5"/>
      <circle cx="12" cy="5" r="2" opacity="0.6"/>
      <path d="M14 14c0-2-1.34-3.72-3.2-4.35" opacity="0.6"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="8" cy="8" r="2.5"/>
      <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.93 3.93l1.06 1.06M11.01 11.01l1.06 1.06M3.93 12.07l1.06-1.06M11.01 4.99l1.06-1.06"/>
    </svg>
  ),
  sync: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 8a6 6 0 0111.2-3M14 8a6 6 0 01-11.2 3"/>
      <path d="M11.5 2.5l1.7 2.5M4.5 13.5L2.8 11"/>
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l2.5 2.5 5.5-5.5"/>
    </svg>
  ),
  x: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 2l8 8M10 2l-8 8"/>
    </svg>
  ),
  pin: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="6" cy="5" r="2"/>
      <path d="M6 11C6 11 2 7.5 2 5a4 4 0 018 0c0 2.5-4 6-4 6z"/>
    </svg>
  ),
  clock: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="6" cy="6" r="4.5"/>
      <path d="M6 3.5V6l2 1.5"/>
    </svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="12" height="8" rx="1"/>
      <path d="M1 4l6 4 6-4"/>
    </svg>
  ),
  link: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M4.5 7.5a3 3 0 004.24 0l1.5-1.5a3 3 0 00-4.24-4.24l-.75.75"/>
      <path d="M7.5 4.5a3 3 0 00-4.24 0L1.76 6a3 3 0 004.24 4.24l.75-.75"/>
    </svg>
  ),
  cards: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="4" height="4" rx="0.5" fill="currentColor"/>
      <rect x="7" y="1" width="4" height="4" rx="0.5" fill="currentColor"/>
      <rect x="1" y="7" width="4" height="4" rx="0.5" fill="currentColor"/>
      <rect x="7" y="7" width="4" height="4" rx="0.5" fill="currentColor"/>
    </svg>
  ),
  tableSmall: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="10" height="2" rx="0.5" fill="currentColor"/>
      <rect x="1" y="5" width="10" height="2" rx="0.5" fill="currentColor"/>
      <rect x="1" y="9" width="10" height="2" rx="0.5" fill="currentColor"/>
    </svg>
  ),
  search: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="5" cy="5" r="3.5"/>
      <path d="M7.5 7.5L10 10"/>
    </svg>
  ),
  arrowLeft: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2L4 7l5 5"/>
    </svg>
  ),
  arrowRight: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2l5 5-5 5"/>
    </svg>
  ),
}

/* ── eligibility mini-icons ──────────────────────────────── */

function PfIcon({ pass, label }) {
  const title = label ? `${label}: ${pass === true ? 'Passes' : pass === false ? 'Fails' : 'Unknown'}` : undefined
  if (pass === true) return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }} title={title}>
      <circle cx="6.5" cy="6.5" r="6.5" fill="oklch(0.96 0.03 150)"/>
      <path d="M3.5 6.5l2 2 4-4" stroke="oklch(0.42 0.09 150)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (pass === false) return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }} title={title}>
      <circle cx="6.5" cy="6.5" r="6.5" fill="oklch(0.97 0.025 25)"/>
      <path d="M4 4l5 5M9 4l-5 5" stroke="oklch(0.58 0.16 25)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }} title={title}>
      <circle cx="6.5" cy="6.5" r="6.5" fill="oklch(0.97 0.04 85)"/>
      <path d="M6.5 3.5v4M6.5 9v.5" stroke="oklch(0.45 0.10 70)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Checklist mini progress bar ─────────────────────────── */

function MiniProgress({ done, total }) {
  if (!total) return <span style={{ color: 'var(--ink-5)' }}>—</span>
  const pct = total > 0 ? (done / total) * 100 : 0
  const all = done === total
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 56 }}>
      <div style={{
        flex: 1, height: 4, borderRadius: 2,
        background: 'var(--bg-sunk)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2, width: `${pct}%`,
          background: all ? 'oklch(0.55 0.14 150)' : 'var(--accent)',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', flexShrink: 0 }}>
        {done}/{total}
      </span>
    </div>
  )
}

/* ── Workbook table ──────────────────────────────────────── */

function WorkbookTable({ filtered, onSelect, onSelectAtEmail }) {
  return (
    <div className="workbook-wrap">
      <table className="workbook">
        <thead>
          <tr>
            <th className="col-name">Grant name</th>
            <th>Type</th>
            <th className="col-value">Est. value</th>
            <th className="col-use">Use for</th>
            <th className="col-elig">Eligibility</th>
            <th className="col-mono">Checklist</th>
            <th className="col-mono">Steps</th>
            <th className="col-mono">Email</th>
            <th className="col-mono">Link</th>
            <th className="col-contact">Contact</th>
            <th className="col-mono">Deadline</th>
            <th className="col-hire">Firm</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(g => {
            const isIneligible = g.status === 'ineligible'
            const checkedCount = (g.checklist || []).filter(c => c.done).length
            const totalCount   = (g.checklist || []).length
            const isStuck      = !isIneligible && totalCount > 0 && checkedCount === 0
              && (!g.workflowStatus || g.workflowStatus === 'Not started')
            return (
              <tr
                key={g.id}
                onClick={() => onSelect(g)}
                className={`${isIneligible ? 'row-ineligible' : ''}${isStuck ? ' row-stuck' : ''}`}
              >
                <td className="col-name">
                  <div className="gname">{g.name}</div>
                  {g.description && (
                    <div className="gdesc">{g.description}</div>
                  )}
                </td>
                <td>
                  <span className={typeBadge(g.type)}>{g.type}</span>
                </td>
                <td className="col-value">{isIneligible ? '—' : (g.estValue || (g.estValueNum === 0 ? 'Variable' : '—'))}</td>
                <td className="col-use">{g.useFor}</td>
                <td className="col-elig">
                  <div className="pf">
                    {(g.eligibilityChecks || []).slice(0, 5).map((c, i) => (
                      <div key={i} className={`pf-row${c.pass === false ? ' fail' : ''}`} title={c.label}>
                        <PfIcon pass={c.pass} label={c.label} />
                        {c.label}
                      </div>
                    ))}
                    {(g.eligibilityChecks || []).length > 5 && (
                      <div className="pf-row" style={{ color: 'var(--ink-5)' }}>
                        +{g.eligibilityChecks.length - 5} more
                      </div>
                    )}
                  </div>
                </td>
                <td className="col-mono">
                  <MiniProgress done={checkedCount} total={totalCount} />
                </td>
                <td className="col-mono">{g.steps?.length || '—'}</td>
                <td
                  className="col-mono"
                  onClick={e => { e.stopPropagation(); g.draftEmail && onSelectAtEmail(g) }}
                  style={{ cursor: g.draftEmail ? 'pointer' : 'default' }}
                >
                  {g.draftEmail
                    ? <span className="tbtn sent" title="Click to open email">{Icons.mail} Ready</span>
                    : '—'}
                </td>
                <td className="col-mono">
                  {g.applicationLink
                    ? <a href={g.applicationLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                        {Icons.link} ↗
                      </a>
                    : '—'}
                </td>
                <td className="col-contact">
                  {g.contact
                    ? <>
                        <div className="who">{g.contact.name}</div>
                        <div className="mail">{g.contact.email || g.contact.title}</div>
                      </>
                    : '—'}
                </td>
                <td className="col-mono">{g.deadline || '—'}</td>
                <td className="col-hire">
                  {g.hireRecommendation?.needed
                    ? <>
                        <div className="hfirm">{g.hireRecommendation.firm}</div>
                        <div className="hwhy">{g.hireRecommendation.reason?.slice(0, 60)}</div>
                      </>
                    : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div style={{ padding: '56px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
          No grants match this filter.
        </div>
      )}
    </div>
  )
}

/* ── Card grid ───────────────────────────────────────────── */

function CardGrid({ filtered, onSelect }) {
  return (
    <div className="cards-wrap">
      <div className="cards-grid">
        {filtered.map(g => {
          const isIneligible = g.status === 'ineligible'
          return (
            <div
              key={g.id}
              onClick={() => onSelect(g)}
              className={`gcard${isIneligible ? ' ineligible' : ''}`}
            >
              <div className="gc-head">
                <span className={typeBadge(g.type)}>{g.type}</span>
                <div className="gc-name">{g.name}</div>
              </div>
              {g.description && <div className="gc-desc">{g.description}</div>}

              {!isIneligible && (
                <div className="gc-value">
                  <span className="v">{g.estValue || (g.estValueNum === 0 ? 'Variable' : '—')}</span>
                  <span className="vlbl">estimated</span>
                </div>
              )}

              {isIneligible && g.ineligibleReason && (
                <div style={{ fontSize: 12, color: 'var(--st-bad)', lineHeight: 1.4 }}>
                  {g.ineligibleReason}
                </div>
              )}

              {(g.eligibilityChecks || []).length > 0 && (
                <div className="gc-pf">
                  {g.eligibilityChecks.slice(0, 4).map((c, i) => (
                    <div key={i} className={`gc-pf-row${c.pass === false ? ' fail' : ''}`} title={c.label}>
                      <PfIcon pass={c.pass} label={c.label} />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}

              <div className="gc-foot">
                {g.draftEmail && <span className="tbtn sent">{Icons.mail} Email ready</span>}
                <span className="g-spacer" />
                {g.deadline && (
                  <span className="ddl">{Icons.clock} {g.deadline}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '56px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
          No grants match this filter.
        </div>
      )}
    </div>
  )
}

/* ── Consultants view (grouped by specialty) ─────────────── */

const SPECIALTY_KEYWORDS = {
  'Historic Preservation': ['historic', 'preservation', 'heritage', 'nhtp', 'shpo'],
  'Seismic / Structural': ['seismic', 'structural', 'engineering', 'geotechnical'],
  'Architecture': ['architect', 'design', 'facade', 'restoration'],
  'Grant Writing': ['grant', 'writer', 'writing', 'funding', 'proposal'],
  'Tax Credits': ['tax credit', 'htc', 'nmtc', 'cpa', 'accounting'],
}

function detectSpecialty(reason = '') {
  const lower = reason.toLowerCase()
  for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return specialty
  }
  return 'General Consultant'
}

function ConsultantsView({ consultants, grants, onSelectGrant }) {
  if (consultants.length === 0) {
    return (
      <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
        No consultant recommendations yet — run research on a property to see firms.
      </div>
    )
  }

  // Group by specialty
  const grouped = new Map()
  for (const c of consultants) {
    const specialty = detectSpecialty(c.grants[0]?.reason)
    if (!grouped.has(specialty)) grouped.set(specialty, [])
    grouped.get(specialty).push(c)
  }

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
        These firms are recommended based on your grant research. Click any grant to open it.
      </p>
      {[...grouped.entries()].map(([specialty, firms]) => (
        <div key={specialty}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', marginBottom: 10 }}>
            {specialty}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {firms.map(c => (
              <div key={c.firm} style={{
                background: 'var(--bg-panel)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '18px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.firm}</div>
                    {c.contact && <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{c.contact}</div>}
                    {c.email && (
                      <a href={`mailto:${c.email}`} style={{ fontSize: 12, color: 'var(--accent)', display: 'block', marginTop: 4, textDecoration: 'none' }}>
                        {c.email}
                      </a>
                    )}
                  </div>
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="btn btn-sm btn-primary" style={{ flexShrink: 0 }}>
                      Email firm →
                    </a>
                  )}
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {c.grants.map(g => {
                    const fullGrant = grants.find(gr => gr.id === g.id)
                    return (
                      <button
                        key={g.id}
                        onClick={() => fullGrant && onSelectGrant(fullGrant)}
                        style={{
                          textAlign: 'left', background: 'var(--bg-sunk)', border: '1px solid var(--border)',
                          borderRadius: 'calc(var(--radius) - 2px)', padding: '10px 14px', cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{g.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 3, lineHeight: 1.4 }}>{g.reason}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main component ──────────────────────────────────────── */

export default function GrantWorkbook({ property, grants: initialGrants, workbookId, demo, researchedAt }) {
  const [grants, setGrants] = useState(() =>
    [...initialGrants].sort((a, b) => (b.estValueNum || 0) - (a.estValueNum || 0))
  )
  const [view, setView] = useState('table')
  const [mainView, setMainView] = useState('workbook') // 'workbook' | 'consultants'
  const [selectedGrant, setSelectedGrant] = useState(null)
  const [selectedGrantOpenAt, setSelectedGrantOpenAt] = useState(null) // 'email' | null
  const [openFilter, setOpenFilter] = useState('open') // default to showing eligible only
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [rerunning, setRerunning] = useState(false)
  const scrollRef = useRef(null)
  const savedScrollRef = useRef(0)

  /* ── persistence ── */

  const persist = useCallback(async (grantId, patch) => {
    if (demo || !workbookId) return
    await fetch(`/api/grants/${property.id}/${grantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  }, [demo, workbookId, property.id])

  const updateGrant = useCallback((grantId, changes) => {
    setGrants(prev => prev.map(g => g.id === grantId ? { ...g, ...changes } : g))
    setSelectedGrant(prev => (prev?.id === grantId ? { ...prev, ...changes } : prev))
  }, [])

  const handleStatusChange = useCallback((grantId, workflowStatus) => {
    updateGrant(grantId, { workflowStatus })
    persist(grantId, { workflowStatus })
  }, [updateGrant, persist])

  const handlePatch = useCallback((grantId, changes) => {
    updateGrant(grantId, changes)
    persist(grantId, changes)
  }, [updateGrant, persist])

  const handleChecklistToggle = useCallback((grantId, itemIndex, done) => {
    setGrants(prev => prev.map(g => {
      if (g.id !== grantId) return g
      const checklist = g.checklist.map((c, i) => i === itemIndex ? { ...c, done } : c)
      return { ...g, checklist }
    }))
    setSelectedGrant(prev => prev?.id === grantId ? {
      ...prev,
      checklist: prev.checklist.map((c, i) => i === itemIndex ? { ...c, done } : c),
    } : prev)
    persist(grantId, { checklistIndex: itemIndex, done })
  }, [persist])

  const handleRerunResearch = useCallback(async () => {
    if (demo || rerunning) return
    setRerunning(true)
    try {
      await fetch(`/api/grants/research/${property.id}`, { method: 'POST' })
      window.location.reload()
    } catch {
      setRerunning(false)
    }
  }, [demo, rerunning, property.id])

  /* ── open panel with optional scroll-to section ── */
  const openPanel = useCallback((grant, openAt = null) => {
    if (scrollRef.current) savedScrollRef.current = scrollRef.current.scrollTop
    setSelectedGrant(grant)
    setSelectedGrantOpenAt(openAt)
  }, [])

  const closePanel = useCallback(() => {
    setSelectedGrant(null)
    setSelectedGrantOpenAt(null)
    // Restore scroll position after paint
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = savedScrollRef.current
    })
  }, [])

  /* ── keyboard navigation ← → ── */
  useEffect(() => {
    const filtered = grants.filter(g => {
      if (openFilter === 'open'       && g.status !== 'eligible') return false
      if (openFilter === 'watch'      && g.workflowStatus !== 'Sent') return false
      if (openFilter === 'ineligible' && g.status !== 'ineligible') return false
      if (typeFilter === 'federal'    && g.type !== 'Federal') return false
      if (typeFilter === 'state'      && g.type !== 'State') return false
      if (typeFilter === 'local'      && g.type !== 'Local') return false
      if (search && !g.name?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })

    const handleKey = (e) => {
      if (!selectedGrant) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const idx = filtered.findIndex(g => g.id === selectedGrant.id)
      if (e.key === 'ArrowRight' && idx < filtered.length - 1) {
        openPanel(filtered[idx + 1])
      }
      if (e.key === 'ArrowLeft' && idx > 0) {
        openPanel(filtered[idx - 1])
      }
      if (e.key === 'Escape') closePanel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [selectedGrant, grants, openFilter, typeFilter, search, openPanel, closePanel])

  /* ── consultants — aggregate hireRecommendation across all grants ── */
  const consultants = (() => {
    const map = new Map()
    for (const g of grants) {
      const hr = g.hireRecommendation
      if (!hr?.needed || !hr.firm) continue
      if (!map.has(hr.firm)) {
        map.set(hr.firm, { firm: hr.firm, contact: hr.contact, email: hr.email, grants: [] })
      }
      map.get(hr.firm).grants.push({ name: g.name, id: g.id, reason: hr.reason })
    }
    return [...map.values()]
  })()

  /* ── stats ── */

  const eligibleGrants  = grants.filter(g => g.status === 'eligible')
  const totalValue      = eligibleGrants.reduce((sum, g) => sum + (g.estValueNum || 0), 0)
  const sentCount       = grants.filter(g => ['Sent', 'Replied'].includes(g.workflowStatus)).length
  const repliedCount    = grants.filter(g => g.workflowStatus === 'Replied').length
  const pendingCount    = grants.filter(g => g.workflowStatus === 'Sent').length

  /* ── filtering ── */

  const filtered = grants.filter(g => {
    if (openFilter === 'open'       && g.status !== 'eligible') return false
    if (openFilter === 'watch'      && g.workflowStatus !== 'Sent') return false
    if (openFilter === 'ineligible' && g.status !== 'ineligible') return false
    if (typeFilter === 'federal'    && g.type !== 'Federal') return false
    if (typeFilter === 'state'      && g.type !== 'State') return false
    if (typeFilter === 'local'      && g.type !== 'Local') return false
    if (search && !g.name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const openCount       = grants.filter(g => g.status === 'eligible').length
  const watchCount      = grants.filter(g => g.workflowStatus === 'Sent').length
  const ineligibleCount = grants.filter(g => g.status === 'ineligible').length

  /* ── keyboard nav index display ── */
  const selectedIdx = selectedGrant ? filtered.findIndex(g => g.id === selectedGrant.id) : -1

  return (
    <div className="giq-app">
      {/* ── Topbar ── */}
      <header className="giq-topbar">
        <a href={demo ? '/' : '/dashboard'} className="brand">
          <div className="brand-mark">iQ</div>
          GrantIQ
        </a>
        <div className="crumbs">
          {!demo && (
            <>
              <Link href="/dashboard" style={{ color: 'var(--ink-4)', textDecoration: 'none', fontSize: 13 }}>
                Dashboard
              </Link>
              <span className="sep">/</span>
            </>
          )}
          <strong>{property.address}</strong>
        </div>
        <div className="t-spacer" />
        <div className="t-actions">
          {!demo && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleRerunResearch}
              disabled={rerunning}
              title="Re-run grant research with latest AI prompt"
            >
              {rerunning ? 'Re-running…' : '↺ Re-run research'}
            </button>
          )}
          {!demo && (
            <a href="/sign-out" className="btn btn-sm btn-ghost">Sign out</a>
          )}
        </div>
      </header>

      <div className="giq-main">
        {/* ── Sidebar ── */}
        <aside className="giq-sidebar">
          <div className="prop-card">
            <div className="pc-head">
              {Icons.building}
              {property.address}
            </div>
            <div className="pc-addr">{property.city}</div>
            {researchedAt && (
              <div style={{ fontSize: 10.5, color: 'var(--ink-5)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                Researched {new Date(researchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>

          <div className="s-label">Workbook</div>

          <button
            className={`s-nav${mainView === 'workbook' ? ' active' : ''}`}
            onClick={() => setMainView('workbook')}
          >
            <span className="s-ico">{Icons.table}</span>
            Grant workbook
            <span className="s-count">{eligibleGrants.length}</span>
          </button>

          <button
            className={`s-nav${mainView === 'consultants' ? ' active' : ''}`}
            onClick={() => setMainView('consultants')}
          >
            <span className="s-ico">{Icons.people}</span>
            Consultants
            {consultants.length > 0 && <span className="s-count">{consultants.length}</span>}
          </button>

          <div className="s-label">Account</div>

          <button className="s-nav" onClick={() => {}}>
            <span className="s-ico">{Icons.settings}</span>
            Settings
          </button>

          <div className="s-spacer" />

        </aside>

        {/* ── Content ── */}
        <div className="giq-content" ref={scrollRef}>
          {/* Page header */}
          <div className="page-header">
            <div className="ph-title">
              <div className="ph-prop">Property workbook · v1</div>
              <h1 className="ph-h1">
                {property.address}
                {pendingCount > 0 && (
                  <span className="badge b-watch">
                    <span className="dot" />
                    {pendingCount} replies pending
                  </span>
                )}
              </h1>
              <div className="ph-meta">
                {Icons.pin}
                {property.address}
                {property.propertyType && <> · {property.propertyType}</>}
                {property.nrStatus && <> · {property.nrStatus}</>}
              </div>
            </div>
            <div className="summary-bar">
              <div className="s-cell">
                <span className="s-lbl">Eligible</span>
                <span className="s-num">{eligibleGrants.length}</span>
                <span className="s-delta">grants</span>
              </div>
              <div className="s-cell">
                <span className="s-lbl">Est. value</span>
                <span className="s-num">{formatValue(totalValue)}</span>
                <span className="s-delta up">+</span>
              </div>
              {sentCount > 0 && (
                <div className="s-cell">
                  <span className="s-lbl">Sent</span>
                  <span className="s-num">{sentCount}</span>
                  <span className="s-delta">emails</span>
                </div>
              )}
              {repliedCount > 0 && (
                <div className="s-cell">
                  <span className="s-lbl">Replies</span>
                  <span className="s-num">{repliedCount}</span>
                  <span className="s-delta">received</span>
                </div>
              )}
            </div>
          </div>

          {/* Toolbar — hidden in consultants view */}
          <div className="giq-toolbar" style={{ display: mainView === 'consultants' ? 'none' : undefined }}>
            {/* Status seg */}
            <div className="seg">
              {[
                { val: 'all',        label: 'All',        cnt: grants.length },
                { val: 'open',       label: 'Open',       cnt: openCount },
                { val: 'watch',      label: 'Needs info', cnt: watchCount },
                { val: 'ineligible', label: 'Ineligible', cnt: ineligibleCount },
              ].map(({ val, label, cnt }) => (
                <button key={val} className={openFilter === val ? 'on' : ''} onClick={() => setOpenFilter(val)}>
                  {label}
                  <span className="cnt">{cnt}</span>
                </button>
              ))}
            </div>

            {/* Type seg */}
            <div className="seg">
              {[
                { val: 'all',     label: 'All' },
                { val: 'federal', label: 'Federal' },
                { val: 'state',   label: 'State' },
                { val: 'local',   label: 'Local' },
              ].map(({ val, label }) => (
                <button key={val} className={typeFilter === val ? 'on' : ''} onClick={() => setTypeFilter(val)}>
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="toolbar-search">
              {Icons.search}
              <input
                type="text"
                placeholder="Search grants…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="toolbar-grow" />

            {/* Keyboard nav hint when panel open */}
            {selectedGrant && selectedIdx >= 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-4)' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedIdx + 1}/{filtered.length}</span>
                <span title="Previous (←)">{Icons.arrowLeft}</span>
                <span title="Next (→)">{Icons.arrowRight}</span>
              </div>
            )}

            {/* View seg */}
            <div className="seg">
              <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>
                {Icons.tableSmall} Workbook
              </button>
              <button className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')}>
                {Icons.cards} Cards
              </button>
            </div>

            <button className="btn btn-sm" onClick={() => exportCSV(grants, property)}>
              Export .csv
            </button>
          </div>

          {/* Main view */}
          {mainView === 'consultants'
            ? <ConsultantsView
                consultants={consultants}
                grants={grants}
                onSelectGrant={g => { setMainView('workbook'); openPanel(g) }}
              />
            : view === 'table'
              ? <WorkbookTable
                  filtered={filtered}
                  onSelect={g => openPanel(g)}
                  onSelectAtEmail={g => openPanel(g, 'email')}
                />
              : <CardGrid filtered={filtered} onSelect={g => openPanel(g)} />
          }
        </div>
      </div>

      {/* Detail panel */}
      {selectedGrant && (
        <GrantDetailPanel
          grant={selectedGrant}
          demo={demo}
          property={property}
          openAt={selectedGrantOpenAt}
          onClose={closePanel}
          onStatusChange={handleStatusChange}
          onChecklistToggle={handleChecklistToggle}
          onPatch={handlePatch}
        />
      )}
    </div>
  )
}
