// ============================================================
// ValidationTable.tsx
// 65-row validation grid replicating Columns A–E of the
// spreadsheet. Features:
//   - Left-border color stripe per row status
//   - Section separator between VAT and Non-VAT sections
//   - Anomaly warning tooltip on row 57
//   - Sticky header row
//   - Responsive horizontal scroll on mobile
// ============================================================

import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { ValidationRow } from '../types/posFile'
import { formatCurrency } from '../lib/validator'

interface Props {
  rows: ValidationRow[]
}

type FilterMode = 'all' | 'validated' | 'failed'

export function ValidationTable({ rows }: Props) {
  const [filter, setFilter] = useState<FilterMode>('all')
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const displayRows = rows.filter(row => {
    if (filter === 'validated') return row.isValidated
    if (filter === 'failed') return row.status === 'Failed'
    return true
  })

  const failedCount = rows.filter(r => r.status === 'Failed').length
  const validatedCount = rows.filter(r => r.isValidated).length

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-navy-800 p-1">
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
          All Lines <span className="ml-1.5 rounded-md bg-navy-600 px-1.5 py-0.5 text-xs">{rows.length}</span>
        </FilterTab>
        <FilterTab active={filter === 'validated'} onClick={() => setFilter('validated')}>
          Validated Only <span className="ml-1.5 rounded-md bg-navy-600 px-1.5 py-0.5 text-xs">{validatedCount}</span>
        </FilterTab>
        <FilterTab active={filter === 'failed'} onClick={() => setFilter('failed')}>
          Failed <span className={`ml-1.5 rounded-md px-1.5 py-0.5 text-xs ${failedCount > 0 ? 'bg-fail/30 text-fail' : 'bg-navy-600'}`}>{failedCount}</span>
        </FilterTab>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto rounded-xl border border-navy-700">
        <table className="min-w-full table-fixed text-sm">
          <colgroup>
            <col className="w-12" />
            <col className="w-72" />
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-24" />
          </colgroup>

          {/* Sticky header */}
          <thead className="sticky top-0 z-10 bg-navy-900">
            <tr>
              <Th className="text-center">#</Th>
              <Th>Line Item Definition</Th>
              <Th className="text-right">Tenant File Value</Th>
              <Th className="text-right">Admin Expected</Th>
              <Th className="text-center">Status</Th>
            </tr>
          </thead>

          <tbody>
            {displayRows.map((row, idx) => {
              // Insert a section separator before line 35 (start of Non-VAT section)
              const showSectionBreak = filter === 'all' && row.lineItem === 35
              const isExpanded = expandedRow === row.lineItem

              return [
                showSectionBreak && (
                  <tr key={`sep-${row.lineItem}`} className="bg-navy-900/80">
                    <td colSpan={5}>
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="h-px flex-1 bg-navy-600" />
                        <span className="text-xs font-semibold tracking-widest text-slate-muted uppercase">
                          Non-VAT Sales Section
                        </span>
                        <div className="h-px flex-1 bg-navy-600" />
                      </div>
                    </td>
                  </tr>
                ),
                <tr
                  key={row.lineItem}
                  className={[
                    'group border-b border-navy-700/50 transition-colors duration-100',
                    'hover:bg-navy-700/30',
                    idx === 0 && 'border-t border-t-transparent',
                    row.isValidated ? 'bg-navy-800/20' : 'bg-transparent',
                  ].join(' ')}
                >
                  {/* Left color stripe + line item number */}
                  <td className="relative py-2.5 pl-4 pr-3 text-center">
                    {/* Left border accent */}
                    <div
                      className={[
                        'absolute inset-y-0 left-0 w-0.5',
                        row.status === 'Pass' ? 'bg-pass' :
                        row.status === 'Failed' ? 'bg-fail' :
                        row.isValidated ? 'bg-navy-500' : 'bg-transparent',
                      ].join(' ')}
                    />
                    <span className="font-mono text-xs text-slate-muted">{row.lineItem}</span>
                  </td>

                  {/* Definition */}
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={row.isValidated ? 'font-medium text-slate-200' : 'text-slate-300'}>
                        {row.definition}
                      </span>
                      {row.hasKnownAnomaly && (
                        <AnomalyBadge note={row.anomalyNote ?? ''} />
                      )}
                    </div>
                  </td>

                  {/* Tenant value */}
                  <td className="py-2.5 pr-4 text-right">
                    <span className={[
                      'font-mono text-sm',
                      row.isValidated ? 'text-slate-200' : 'text-slate-400',
                    ].join(' ')}>
                      {row.tenantValue !== null
                        ? (typeof row.tenantValue === 'number'
                          ? formatCurrency(row.tenantValue)
                          : String(row.tenantValue))
                        : <span className="text-slate-muted">—</span>
                      }
                    </span>
                  </td>

                  {/* Admin expected */}
                  <td className="py-2.5 pr-4 text-right">
                    <span className={[
                      'font-mono text-sm',
                      row.adminValue !== null ? 'text-slate-300' : 'text-slate-muted',
                    ].join(' ')}>
                      {row.adminValue !== null
                        ? formatCurrency(row.adminValue)
                        : '—'
                      }
                    </span>
                  </td>

                  {/* Status badge + expand toggle */}
                  <td className="py-2.5 pr-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {row.status === 'Pass' && (
                        <StatusBadge status="Pass" />
                      )}
                      {row.status === 'Failed' && (
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : row.lineItem)}
                          className="flex items-center gap-1 focus:outline-none"
                          aria-expanded={isExpanded}
                          aria-label={`Details for line ${row.lineItem}`}
                        >
                          <StatusBadge status="Failed" />
                          {isExpanded
                            ? <ChevronUp className="h-3 w-3 text-fail" />
                            : <ChevronDown className="h-3 w-3 text-fail" />
                          }
                        </button>
                      )}
                      {row.status === null && (
                        <span className="text-xs text-slate-muted">—</span>
                      )}
                    </div>
                  </td>
                </tr>,

                /* Expanded detail tray for Failed rows */
                isExpanded && row.status === 'Failed' && (
                  <tr key={`detail-${row.lineItem}`} className="bg-fail/5 border-b border-navy-700/50">
                    <td />
                    <td colSpan={4} className="px-4 py-3">
                      <div className="space-y-2 text-xs">
                        <p className="font-semibold text-fail">Discrepancy Detail</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-navy-800 p-3">
                            <p className="text-slate-muted mb-1">Tenant reported</p>
                            <p className="font-mono text-base text-slate-200">
                              {typeof row.tenantValue === 'number'
                                ? formatCurrency(row.tenantValue)
                                : String(row.tenantValue)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-navy-800 p-3">
                            <p className="text-slate-muted mb-1">Admin expected</p>
                            <p className="font-mono text-base text-slate-200">
                              {formatCurrency(row.adminValue)}
                            </p>
                          </div>
                        </div>
                        {typeof row.tenantValue === 'number' && row.adminValue !== null && (
                          <p className="text-slate-muted">
                            Difference:{' '}
                            <span className={Math.abs(row.tenantValue - (row.adminValue as number)) > 0.01 ? 'text-fail font-semibold' : 'text-slate-300'}>
                              {formatCurrency(row.tenantValue - (row.adminValue as number))}
                            </span>
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              ]
            })}
          </tbody>
        </table>

        {displayRows.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-muted">
            No rows match the selected filter.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`border-b border-navy-700 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-muted ${className}`}
    >
      {children}
    </th>
  )
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-pass',
        active
          ? 'bg-navy-700 text-slate-100 shadow-sm'
          : 'text-slate-muted hover:text-slate-300',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }: { status: 'Pass' | 'Failed' }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        status === 'Pass'
          ? 'bg-pass/15 text-pass ring-1 ring-inset ring-pass/30'
          : 'bg-fail/15 text-fail ring-1 ring-inset ring-fail/30',
      ].join(' ')}
    >
      {status}
    </span>
  )
}

function AnomalyBadge({ note }: { note: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="flex items-center text-warn focus:outline-none"
        aria-label="Known anomaly — click for details"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
      </button>
      {show && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-lg border border-warn/30 bg-navy-900 p-3 text-xs text-slate-300 shadow-xl">
          <p className="mb-1 font-semibold text-warn">Known Anomaly</p>
          {note}
        </div>
      )}
    </div>
  )
}
