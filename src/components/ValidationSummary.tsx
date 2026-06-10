// ============================================================
// ValidationSummary.tsx
// Displays the file metadata bar and the Pass/Failed/Total
// summary badges above the validation table.
// ============================================================

import { CheckCircle2, XCircle, ClipboardList, RotateCcw } from 'lucide-react'
import { ValidationResult } from '../types/posFile'
import { formatPosDate } from '../lib/validator'
import { useFileProcessor } from '../hooks/useFileProcessor'

interface Props {
  result: ValidationResult
}

export function ValidationSummary({ result }: Props) {
  const { handleReset } = useFileProcessor()
  const { passed, failed, totalChecked, allPassed } = result.summary

  return (
    <div className="space-y-4">
      {/* Overall result banner */}
      {allPassed ? (
        <div className="flex items-center gap-3 rounded-xl border border-pass/30 bg-pass/10 px-5 py-3.5">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-pass" />
          <p className="text-sm font-semibold text-pass">
            All {totalChecked} checks passed — file is valid.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-fail/30 bg-fail/10 px-5 py-3.5">
          <XCircle className="h-5 w-5 flex-shrink-0 text-fail" />
          <p className="text-sm font-semibold text-fail">
            {failed} of {totalChecked} checks failed — review highlighted rows below.
          </p>
        </div>
      )}

      {/* File metadata + action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Metadata pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          <MetaPill label="File" value={result.filename} mono />
          <MetaPill label="Tenant" value={result.tenantCode} />
          <MetaPill label="Terminal" value={result.terminalNumber} />
          <MetaPill label="Date" value={formatPosDate(result.posDate)} />
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-navy-500 hover:bg-navy-700 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-pass"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Upload Another File
        </button>
      </div>

      {/* Pass / Failed / Total stat row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Passed"
          value={passed}
          color="pass"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Failed"
          value={failed}
          color="fail"
        />
        <StatCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Checked"
          value={totalChecked}
          color="neutral"
        />
      </div>
    </div>
  )
}

function MetaPill({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-navy-700 px-2.5 py-1 text-xs text-slate-300">
      <span className="text-slate-muted">{label}:</span>
      <span className={mono ? 'font-mono' : 'font-medium'}>{value || '—'}</span>
    </span>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'pass' | 'fail' | 'neutral'
}) {
  const colorMap = {
    pass: 'text-pass bg-pass/10 border-pass/20',
    fail: 'text-fail bg-fail/10 border-fail/20',
    neutral: 'text-slate-300 bg-navy-700 border-navy-600',
  }

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-xs font-medium opacity-80">{label}</p>
      </div>
    </div>
  )
}
