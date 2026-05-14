'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import GrantDetailPanel from './GrantDetailPanel.jsx'

const TYPE_COLORS = {
  Federal: 'bg-blue-50 text-blue-600 border-blue-100',
  State: 'bg-purple-50 text-purple-600 border-purple-100',
  Local: 'bg-amber-50 text-amber-600 border-amber-100',
}

const STATUS_COLORS = {
  'Not started': 'bg-base text-muted',
  'Draft email ready': 'bg-amber-50 text-amber-700',
  'Contact made': 'bg-blue-50 text-blue-700',
  'Sent': 'bg-green-50 text-green-700',
  'Replied': 'bg-green-100 text-green-800',
  'Ineligible': 'bg-red-50 text-red-600',
}

function formatValue(num) {
  if (!num) return '—'
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
  return `$${num.toLocaleString()}`
}

function CheckBadge({ pass }) {
  if (pass === true) return <span className="text-green-600 text-xs">✓</span>
  if (pass === false) return <span className="text-red-500 text-xs">✗</span>
  return <span className="text-amber-500 text-xs">?</span>
}

function TableRow({ grant, onClick }) {
  const isIneligible = grant.status === 'ineligible'
  return (
    <tr
      onClick={onClick}
      className={`border-b border-border cursor-pointer transition-colors hover:bg-base/50 ${isIneligible ? 'opacity-40' : ''}`}
    >
      <td className="px-3 py-2.5 min-w-[190px]">
        <div className="text-xs font-medium text-ink leading-tight">{grant.name}</div>
        {isIneligible && (
          <div className="text-xs text-red-500 mt-0.5 leading-tight max-w-[170px] truncate" title={grant.ineligibleReason}>
            {grant.ineligibleReason?.slice(0, 65)}…
          </div>
        )}
      </td>
      <td className="px-3 py-2.5 min-w-[72px]">
        <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_COLORS[grant.type] || 'bg-base text-muted border-border'}`}>
          {grant.type}
        </span>
      </td>
      <td className="px-3 py-2.5 min-w-[110px]">
        <span className={`text-xs font-mono ${isIneligible ? 'text-muted' : 'text-ink font-medium'}`}>
          {isIneligible ? '—' : grant.estValue}
        </span>
      </td>
      <td className="px-3 py-2.5 min-w-[160px]">
        <span className="text-xs text-subtle line-clamp-2 leading-tight">{grant.useFor}</span>
      </td>
      <td className="px-3 py-2.5 min-w-[90px]">
        <div className="flex gap-0.5 flex-wrap">
          {grant.eligibilityChecks.slice(0, 4).map((c, i) => <CheckBadge key={i} pass={c.pass} />)}
          {grant.eligibilityChecks.length > 4 && <span className="text-xs text-muted">+{grant.eligibilityChecks.length - 4}</span>}
        </div>
      </td>
      <td className="px-3 py-2.5 min-w-[80px]">
        <span className="font-mono text-xs text-muted">
          {grant.checklist.filter(c => c.done).length}/{grant.checklist.length}
        </span>
      </td>
      <td className="px-3 py-2.5 min-w-[55px]">
        <span className="font-mono text-xs text-muted">{grant.steps.length}</span>
      </td>
      <td className="px-3 py-2.5 min-w-[80px]">
        {grant.draftEmail ? <span className="text-xs text-clay font-medium">Ready</span> : <span className="text-xs text-muted">—</span>}
      </td>
      <td className="px-3 py-2.5 min-w-[50px]">
        {grant.link
          ? <a href={grant.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-clay hover:underline">Link ↗</a>
          : <span className="text-muted text-xs">—</span>}
      </td>
      <td className="px-3 py-2.5 min-w-[140px]">
        {grant.contact
          ? <div><div className="text-xs font-medium text-ink">{grant.contact.name}</div><div className="text-xs text-muted truncate max-w-[130px]">{grant.contact.title}</div></div>
          : <span className="text-muted text-xs">—</span>}
      </td>
      <td className="px-3 py-2.5 min-w-[140px]">
        <div>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[grant.workflowStatus] || 'bg-base text-muted'}`}>
            {grant.workflowStatus}
          </span>
          <div className="text-xs text-muted mt-0.5 truncate max-w-[130px]">{grant.deadline}</div>
        </div>
      </td>
      <td className="px-3 py-2.5 min-w-[80px]">
        {grant.hireRecommendation?.needed
          ? <span className="text-xs text-amber-600 font-medium">Suggested</span>
          : <span className="text-xs text-muted">No</span>}
      </td>
      <td className="px-3 py-2.5 min-w-[160px]">
        {grant.hireRecommendation?.email
          ? <span className="text-xs font-mono text-clay truncate block max-w-[150px]">{grant.hireRecommendation.email}</span>
          : <span className="text-xs text-muted">—</span>}
      </td>
    </tr>
  )
}

function GrantCard({ grant, onClick }) {
  const isIneligible = grant.status === 'ineligible'
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-border rounded-xl p-5 cursor-pointer hover:border-clay/40 transition-all ${isIneligible ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex gap-1.5 flex-wrap">
          <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_COLORS[grant.type] || 'bg-base text-muted border-border'}`}>{grant.type}</span>
          {isIneligible && <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">Not eligible</span>}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${STATUS_COLORS[grant.workflowStatus] || 'bg-base text-muted'}`}>
          {grant.workflowStatus}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-ink leading-tight mb-1">{grant.name}</h3>
      {isIneligible
        ? <p className="text-xs text-red-500 leading-relaxed mt-2">{grant.ineligibleReason}</p>
        : <>
            <div className="font-mono text-base font-semibold text-clay mb-2">{grant.estValue}</div>
            <p className="text-xs text-subtle leading-relaxed line-clamp-2">{grant.useFor}</p>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex gap-3">
                {grant.draftEmail && <span className="text-xs text-clay font-medium">Email ready</span>}
                {grant.hireRecommendation?.needed && <span className="text-xs text-amber-600">Firm suggested</span>}
              </div>
              <span className="text-xs text-muted font-mono">
                {grant.checklist.filter(c => c.done).length}/{grant.checklist.length} tasks
              </span>
            </div>
          </>
      }
    </div>
  )
}

export default function GrantWorkbook({ property, grants: initialGrants, workbookId, demo, gmailConnected }) {
  const [grants, setGrants] = useState(initialGrants)
  const [view, setView] = useState('table')
  const [selectedGrant, setSelectedGrant] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

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
    if (selectedGrant?.id === grantId) {
      setSelectedGrant(prev => prev ? { ...prev, ...changes } : null)
    }
  }, [selectedGrant])

  const handleStatusChange = useCallback((grantId, workflowStatus) => {
    updateGrant(grantId, { workflowStatus })
    persist(grantId, { workflowStatus })
  }, [updateGrant, persist])

  const handleEmailSave = useCallback((grantId, emailBody) => {
    updateGrant(grantId, { emailBody })
    persist(grantId, { emailBody })
  }, [updateGrant, persist])

  const handleReplyLogged = useCallback((data) => {
    // Note: status update is handled by onStatusChange in the panel itself
    // Here we just merge any new grants discovered from the reply
    if (data.newGrants?.length > 0) {
      setGrants(prev => {
        const existingIds = new Set(prev.map(g => g.id))
        const toAdd = data.newGrants
          .filter(g => !existingIds.has(g.id))
          .map(g => ({
            ...g,
            workflowStatus: 'Not started',
            checklist: g.checklist ?? [],
            eligibilityChecks: g.eligibilityChecks ?? [],
            steps: g.steps ?? [],
          }))
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev
      })
    }
  }, [updateGrant])

  const handleSyncInbox = useCallback(async () => {
    if (demo || syncing) return
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch(`/api/inbox/sync/${property.id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSyncResult({ error: data.error ?? `HTTP ${res.status}`, gmailRequired: data.gmailRequired })
      } else {
        setSyncResult({ updates: data.updates, scanned: data.scanned, message: data.message })
        // Apply any status updates returned
        if (data.updates?.length > 0) {
          data.updates.forEach(u => {
            updateGrant(u.grantId, { workflowStatus: u.status })
          })
        }
      }
    } catch (err) {
      setSyncResult({ error: err.message })
    } finally {
      setSyncing(false)
    }
  }, [demo, syncing, property.id, updateGrant])

  const handleChecklistToggle = useCallback((grantId, itemIndex, done) => {
    setGrants(prev => prev.map(g => {
      if (g.id !== grantId) return g
      const checklist = g.checklist.map((c, i) => i === itemIndex ? { ...c, done } : c)
      return { ...g, checklist }
    }))
    if (selectedGrant?.id === grantId) {
      setSelectedGrant(prev => prev ? {
        ...prev,
        checklist: prev.checklist.map((c, i) => i === itemIndex ? { ...c, done } : c)
      } : null)
    }
    persist(grantId, { checklistIndex: itemIndex, done })
  }, [selectedGrant, persist])

  const filtered = grants.filter(g => {
    if (statusFilter === 'eligible' && g.status !== 'eligible') return false
    if (statusFilter === 'ineligible' && g.status !== 'ineligible') return false
    if (typeFilter !== 'all' && g.type !== typeFilter) return false
    return true
  })

  const eligibleGrants = grants.filter(g => g.status === 'eligible')
  const totalValue = eligibleGrants.reduce((sum, g) => sum + (g.estValueNum || 0), 0)
  const sentCount = grants.filter(g => ['Sent', 'Replied'].includes(g.workflowStatus)).length
  const repliedCount = grants.filter(g => g.workflowStatus === 'Replied').length

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <Link href={demo ? '/' : '/dashboard'} className="font-mono text-sm font-medium text-ink">
          Grant<span className="text-clay">IQ</span>
        </Link>
        <div className="flex items-center gap-3">
          {demo && (
            <>
              <span className="text-xs font-mono px-2 py-0.5 bg-clay-light/60 border border-clay/30 text-clay-dark rounded font-medium">DEMO</span>
              <Link href="/sign-up" className="text-xs px-3 py-1.5 bg-clay text-white rounded-lg hover:bg-clay-dark transition-colors font-medium">
                Save this workbook →
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Property header */}
      <div className="border-b border-border bg-white px-6 py-5">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">{property.address}</h1>
            <p className="text-sm text-muted mt-0.5">{property.city} · {property.propertyType}</p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            {[
              { value: eligibleGrants.length, label: 'eligible grants' },
              { value: `${formatValue(totalValue)}+`, label: 'total value', clay: true },
              { value: sentCount, label: 'sent' },
              { value: repliedCount, label: 'replies' },
            ].map(s => (
              <div key={s.label} className="text-right">
                <div className={`font-mono text-xl font-semibold ${s.clay ? 'text-clay' : 'text-ink'}`}>{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
            {!demo && (
              <button
                onClick={handleSyncInbox}
                disabled={syncing}
                title={gmailConnected ? 'Scan your inbox for grant replies' : 'Sign in with Google to enable inbox sync'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  gmailConnected
                    ? 'border-clay/40 text-clay hover:bg-clay-light/40'
                    : 'border-border text-muted cursor-not-allowed'
                } ${syncing ? 'opacity-60' : ''}`}
              >
                {syncing ? (
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 6a5 5 0 009.9-1M11 6a5 5 0 00-9.9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 2l1.9 3M3 10L1.1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
                {syncing ? 'Syncing…' : 'Sync inbox'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sync result banner */}
      {syncResult && (
        <div className={`px-6 py-2.5 text-xs flex items-center justify-between gap-3 ${
          syncResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'
        }`}>
          <span>
            {syncResult.error
              ? syncResult.gmailRequired
                ? 'Gmail not connected — sign in with Google to enable inbox sync.'
                : `Sync failed: ${syncResult.error}`
              : syncResult.message
                ? syncResult.message
                : `Scanned ${syncResult.scanned} thread${syncResult.scanned !== 1 ? 's' : ''} — ${syncResult.updates?.length ?? 0} grant${syncResult.updates?.length !== 1 ? 's' : ''} updated.`
            }
          </span>
          <button onClick={() => setSyncResult(null)} className="text-current opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="border-b border-border bg-surface/95 backdrop-blur-sm px-6 py-3 sticky top-[57px] z-20">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex border border-border rounded-lg overflow-hidden bg-white">
              {['all', 'eligible', 'ineligible'].map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 text-xs capitalize transition-colors ${statusFilter === f ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex border border-border rounded-lg overflow-hidden bg-white">
              {['all', 'Federal', 'State', 'Local'].map(f => (
                <button key={f} onClick={() => setTypeFilter(f)}
                  className={`px-3 py-1.5 text-xs transition-colors ${typeFilter === f ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden bg-white">
            {[
              { val: 'table', icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="2" rx="0.5" fill="currentColor"/><rect x="1" y="5" width="10" height="2" rx="0.5" fill="currentColor"/><rect x="1" y="9" width="10" height="2" rx="0.5" fill="currentColor"/></svg>, label: 'Table' },
              { val: 'cards', icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="4" height="4" rx="0.5" fill="currentColor"/><rect x="7" y="1" width="4" height="4" rx="0.5" fill="currentColor"/><rect x="1" y="7" width="4" height="4" rx="0.5" fill="currentColor"/><rect x="7" y="7" width="4" height="4" rx="0.5" fill="currentColor"/></svg>, label: 'Cards' },
            ].map(({ val, icon, label }) => (
              <button key={val} onClick={() => setView(val)}
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${view === val ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}>
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">
        {view === 'table' ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-base">
                  {['Grant name','Type','Est. value','Use for','Eligibility','Checklist','Steps','Email','Link','Contact','Status / Deadline','Hire?','Firm email'].map((col, i) => (
                    <th key={i} className="px-3 py-2.5 text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => <TableRow key={g.id} grant={g} onClick={() => setSelectedGrant(g)} />)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(g => <GrantCard key={g.id} grant={g} onClick={() => setSelectedGrant(g)} />)}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-16 text-center"><p className="text-sm text-muted">No grants match this filter.</p></div>
        )}

        <div className="mt-6 flex items-center gap-2 text-xs text-muted">
          <div className="w-3 h-px bg-border" />
          <span>Faded rows are ineligible — reasons shown inline and in the detail panel.</span>
        </div>
      </div>

      {selectedGrant && (
        <GrantDetailPanel
          grant={selectedGrant}
          demo={demo}
          propertyId={property.id}
          onClose={() => setSelectedGrant(null)}
          onStatusChange={handleStatusChange}
          onEmailSave={handleEmailSave}
          onChecklistToggle={handleChecklistToggle}
          onReplyLogged={handleReplyLogged}
        />
      )}
    </div>
  )
}
