// ============================================================
// ErrorBanner.tsx
// Displays a dismissible error message when file processing fails.
// ============================================================

import { AlertCircle, X } from 'lucide-react'
import { useAppStore } from '../hooks/store'

export function ErrorBanner() {
  const { error, setError } = useAppStore()
  if (!error) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-fail/30 bg-fail/10 px-5 py-4"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-fail" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-fail">Unable to process file</p>
        <p className="mt-0.5 text-sm text-slate-300">{error}</p>
      </div>
      <button
        onClick={() => setError(null)}
        className="flex-shrink-0 rounded p-0.5 text-slate-muted hover:text-slate-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-fail"
        aria-label="Dismiss error"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
