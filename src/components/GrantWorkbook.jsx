import { useState } from 'react'
import { grants, property, summaryStats } from '../data/grants'
import GrantDetailPanel from './GrantDetailPanel'

const TYPE_COLORS = {
  Federal: 'bg-blue-50 text-blue-600 border-blue-100',
  State: 'bg-purple-50 text-purple-600 border-purple-100',
  Local: 'bg-amber-50 text-amber-600 border-amber-100',
  Private: 'bg-green-50 text-green-600 border-green-100',
}

const STATUS_COLORS = {
  eligible: 'bg-green-50 text-green-700',
  ineligible: 'bg-red-50 text-red-600',
  'Draft email ready': 'bg-amber-50 text-amber-700',
  'Contact made': 'bg-blue-50 text-blue-700',
  'Not started': 'bg-base text-muted',
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

// Dense 13-column spreadsheet row
function TableRow({ grant, onClick }) {
  const isIneligible = grant.status === 'ineligible'
  const passCount = grant.eligibilityChecks.filter(c => c.pass === true).length

  return (
    <tr
      onClick={onClick}
      className={`border-b border-border cursor-pointer transition-colors hover:bg-base/50 ${isIneligible ? 'opacity-50' : ''}`}
    >
      {/* 1. Name */}
      <td className="px-3 py-2.5 min-w-[180px]">
        <div className="text-xs font-medium text-ink leading-tight">{grant.name}</div>
        {isIneligible && (
          <div className="text-xs text-red-500 mt-0.5 leading-tight truncate max-w-[170px]" title={grant.ineligibleReason}>
            {grant.ineligibleReason?.slice(0, 60)}…
          </div>
        )}
      </td>
      {/* 2. Type */}
      <td className="px-3 py-2.5 min-w-[70px]">
        <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_COLORS[grant.type] || 'bg-base text-muted border-border'}`}>
          {grant.type}
        </span>
      </td>
      {/* 3. Est. value */}
      <td className="px-3 py-2.5 min-w-[110px]">
        <span className={`text-xs font-mono ${isIneligible ? 'text-muted' : 'text-ink font-medium'}`}>
          {isIneligible ? '—' : grant.estValue}
        </span>
      </td>
      {/* 4. Use for */}
      <td className="px-3 py-2.5 min-w-[160px]">
        <span className="text-xs text-subtle line-clamp-2 leading-tight">{grant.useFor}</span>
      </td>
      {/* 5. Eligibility */}
      <td className="px-3 py-2.5 min-w-[90px]">
        <div className="flex gap-0.5 flex-wrap">
          {grant.eligibilityChecks.slice(0, 4).map((c, i) => (
            <CheckBadge key={i} pass={c.pass} />
          ))}
          {grant.eligibilityChecks.length > 4 && (
            <span className="text-xs text-muted">+{grant.eligibilityChecks.length - 4}</span>
          )}
        </div>
      </td>
      {/* 6. Pre-app checklist */}
      <td className="px-3 py-2.5 min-w-[80px]">
        <span className="font-mono text-xs text-muted">
          {grant.checklist.filter(c => c.done).length}/{grant.checklist.length}
        </span>
      </td>
      {/* 7. Steps */}
      <td className="px-3 py-2.5 min-w-[60px]">
        <span className="font-mono text-xs text-muted">{grant.steps.length}</span>
      </td>
      {/* 8. Draft email */}
      <td className="px-3 py-2.5 min-w-[80px]">
        {grant.draftEmail ? (
          <span className="text-xs text-clay font-medium">Ready</span>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>
      {/* 9. Link */}
      <td className="px-3 py-2.5 min-w-[50px]">
        {grant.link ? (
          <a
            href={grant.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs text-clay hover:underline"
          >
            Link ↗
          </a>
        ) : <span className="text-muted text-xs">—</span>}
      </td>
      {/* 10. Contact */}
      <td className="px-3 py-2.5 min-w-[140px]">
        {grant.contact ? (
          <div>
            <div className="text-xs font-medium text-ink">{grant.contact.name}</div>
            <div className="text-xs text-muted truncate max-w-[130px]">{grant.contact.title}</div>
          </div>
        ) : <span className="text-muted text-xs">—</span>}
      </td>
      {/* 11. Status/deadline */}
      <td className="px-3 py-2.5 min-w-[130px]">
        <div>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[grant.workflowStatus] || 'bg-base text-muted'}`}>
            {grant.workflowStatus}
          </span>
          <div className="text-xs text-muted mt-0.5 truncate max-w-[120px]">{grant.deadline}</div>
        </div>
      </td>
      {/* 12. Hire recommendation */}
      <td className="px-3 py-2.5 min-w-[80px]">
        {grant.hireRecommendation?.needed ? (
          <span className="text-xs text-amber-600 font-medium">Suggested</span>
        ) : (
          <span className="text-xs text-muted">No</span>
        )}
      </td>
      {/* 13. Firm email */}
      <td className="px-3 py-2.5 min-w-[160px]">
        {grant.hireRecommendation?.email ? (
          <span className="text-xs font-mono text-clay truncate block max-w-[150px]">{grant.hireRecommendation.email}</span>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>
    </tr>
  )
}

// Card view
function GrantCard({ grant, onClick }) {
  const isIneligible = grant.status === 'ineligible'
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-border rounded-xl p-5 cursor-pointer hover:border-clay/40 hover:shadow-card transition-all ${isIneligible ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex gap-1.5 flex-wrap">
          <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_COLORS[grant.type] || 'bg-base text-muted border-border'}`}>
            {grant.type}
          </span>
          {isIneligible && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
              Not eligible
            </span>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${STATUS_COLORS[grant.workflowStatus] || 'bg-base text-muted'}`}>
          {grant.workflowStatus}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-ink leading-tight mb-1">{grant.name}</h3>

      {isIneligible ? (
        <p className="text-xs text-red-500 leading-relaxed mt-2">
          {grant.ineligibleReason}
        </p>
      ) : (
        <>
          <div className="font-mono text-base font-semibold text-clay mb-2">{grant.estValue}</div>
          <p className="text-xs text-subtle leading-relaxed line-clamp-2">{grant.useFor}</p>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {grant.draftEmail && (
                <span className="text-xs text-clay font-medium">Email ready</span>
              )}
              {grant.hireRecommendation?.needed && (
                <span className="text-xs text-amber-600">Firm suggested</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-mono">
                {grant.checklist.filter(c => c.done).length}/{grant.checklist.length} tasks
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function GrantWorkbook({ tweaks, demo, onReset }) {
  const [view, setView] = useState('table')
  const [selectedGrant, setSelectedGrant] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = grants.filter(g => {
    if (statusFilter === 'eligible' && g.status !== 'eligible') return false
    if (statusFilter === 'ineligible' && g.status !== 'ineligible') return false
    if (typeFilter !== 'all' && g.type !== typeFilter) return false
    return true
  })

  const eligibleGrants = grants.filter(g => g.status === 'eligible')
  const totalValue = eligibleGrants.reduce((sum, g) => sum + g.estValueNum, 0)

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-surface/95 backdrop-blur-sm">
        <span className="font-mono text-sm font-medium text-ink">Grant<span className="text-clay">IQ</span></span>
        <div className="flex items-center gap-3">
          {demo && (
            <span className="text-xs font-mono px-2 py-0.5 bg-clay-light/60 border border-clay/30 text-clay-dark rounded font-medium">
              DEMO
            </span>
          )}
          <span className="text-xs text-muted hidden sm:block">{property.address}, {property.city}</span>
          <span className="text-xs text-muted font-mono hidden sm:block">{property.nrStatus}</span>
          {demo && onReset && (
            <button
              onClick={onReset}
              className="text-xs text-muted hover:text-ink transition-colors underline underline-offset-2"
            >
              Exit demo
            </button>
          )}
        </div>
      </nav>

      {/* Property header */}
      <div className="border-b border-border bg-white px-6 py-5">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-ink tracking-tight">{property.name}</h1>
              <p className="text-sm text-muted mt-0.5">{property.address} · {property.city}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded">{property.nrStatus}</span>
                <span className="text-xs px-2 py-0.5 bg-base text-subtle border border-border rounded">{property.district}</span>
                <span className="text-xs px-2 py-0.5 bg-base text-subtle border border-border rounded">{property.type}</span>
              </div>
            </div>

            {/* Summary bar */}
            <div className="flex gap-6 sm:gap-8 flex-wrap">
              <div className="text-center sm:text-right">
                <div className="font-mono text-xl font-semibold text-ink">{eligibleGrants.length}</div>
                <div className="text-xs text-muted">eligible grants</div>
              </div>
              <div className="text-center sm:text-right">
                <div className="font-mono text-xl font-semibold text-clay">{formatValue(totalValue)}+</div>
                <div className="text-xs text-muted">total value</div>
              </div>
              <div className="text-center sm:text-right">
                <div className="font-mono text-xl font-semibold text-ink">{summaryStats.emailsSent}</div>
                <div className="text-xs text-muted">sent</div>
              </div>
              <div className="text-center sm:text-right">
                <div className="font-mono text-xl font-semibold text-ink">{summaryStats.replies}</div>
                <div className="text-xs text-muted">replies</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border bg-surface px-6 py-3 sticky top-[57px] z-20 bg-surface/95 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <div className="flex border border-border rounded-lg overflow-hidden bg-white">
              {['all', 'eligible', 'ineligible'].map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 text-xs capitalize transition-colors ${
                    statusFilter === f ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="flex border border-border rounded-lg overflow-hidden bg-white">
              {['all', 'Federal', 'State', 'Local'].map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-3 py-1.5 text-xs transition-colors ${
                    typeFilter === f ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* View toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setView('table')}
              title="Spreadsheet view"
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
                view === 'table' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="10" height="2" rx="0.5" fill="currentColor"/>
                <rect x="1" y="5" width="10" height="2" rx="0.5" fill="currentColor"/>
                <rect x="1" y="9" width="10" height="2" rx="0.5" fill="currentColor"/>
              </svg>
              Table
            </button>
            <button
              onClick={() => setView('cards')}
              title="Card view"
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
                view === 'cards' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="7" y="1" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="1" y="7" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="7" y="7" width="4" height="4" rx="0.5" fill="currentColor"/>
              </svg>
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">
        {view === 'table' ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-base">
                  {[
                    'Grant name', 'Type', 'Est. value', 'Use for',
                    'Eligibility', 'Checklist', 'Steps', 'Email',
                    'Link', 'Contact', 'Status / Deadline', 'Hire?', 'Firm email'
                  ].map((col, i) => (
                    <th key={i} className="px-3 py-2.5 text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <TableRow key={g.id} grant={g} onClick={() => setSelectedGrant(g)} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(g => (
              <GrantCard key={g.id} grant={g} onClick={() => setSelectedGrant(g)} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-muted">No grants match this filter.</p>
          </div>
        )}

        {/* Legend for ineligible */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted">
          <div className="w-3 h-px bg-border" />
          <span>Faded rows are ineligible — reasons shown inline and in detail panel.</span>
        </div>
      </div>

      {/* Detail panel */}
      {selectedGrant && (
        <GrantDetailPanel grant={selectedGrant} onClose={() => setSelectedGrant(null)} />
      )}
    </div>
  )
}
