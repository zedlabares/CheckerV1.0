// ============================================================
// Header.tsx
// Application header with placeholder branding.
// ============================================================

import { ShieldCheck } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-navy-700 bg-navy-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pass/15 text-pass">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight tracking-tight text-slate-100">
              POS File Checker
            </p>
            <p className="text-xs text-slate-muted leading-tight">
              Remittance Validator
            </p>
          </div>
        </div>

        {/* Right: placeholder for future nav */}
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-navy-600 bg-navy-800 px-3 py-1 text-xs font-medium text-slate-400">
            Admin · Phase 1
          </span>
        </div>
      </div>
    </header>
  )
}
