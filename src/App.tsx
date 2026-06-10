// ============================================================
// App.tsx
// Root application layout.
// Conditionally renders:
//   - Upload view (FileUploader) when no result is loaded
//   - Results view (Summary + Table + Export) when result exists
// ============================================================

import { Header } from './components/Header'
import { FileUploader } from './components/FileUploader'
import { ValidationSummary } from './components/ValidationSummary'
import { ValidationTable } from './components/ValidationTable'
import { ExportButtons } from './components/ExportButtons'
import { ErrorBanner } from './components/ErrorBanner'
import { useAppStore } from './hooks/store'

export default function App() {
  const { result } = useAppStore()

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorBanner />

        {!result ? (
          /* ── Upload State ─────────────────────────────────────────── */
          <div className="flex flex-col items-center gap-10 py-12">
            {/* Hero */}
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
                Validate your POS remittance file
              </h1>
              <p className="mt-3 max-w-xl text-base text-slate-muted">
                Upload a{' '}
                <code className="rounded bg-navy-800 px-1.5 py-0.5 font-mono text-sm text-pass">
                  .001
                </code>{' '}
                file exported from your POS terminal. The system checks 11 critical
                fields against admin-computed expected values and reports Pass or Failed.
              </p>
            </div>

            <FileUploader />

            {/* How it works */}
            <div className="w-full max-w-2xl">
              <HowItWorks />
            </div>
          </div>
        ) : (
          /* ── Results State ────────────────────────────────────────── */
          <div className="space-y-6">
            {/* Summary + metadata */}
            <ValidationSummary result={result} />

            {/* Export + table header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-100">Validation Detail</h2>
                <p className="text-xs text-slate-muted">
                  65 line items · 11 validated fields · processed{' '}
                  {result.processedAt.toLocaleTimeString('en-PH')}
                </p>
              </div>
              <ExportButtons result={result} />
            </div>

            {/* Full 65-row table */}
            <ValidationTable rows={result.rows} />
          </div>
        )}
      </main>

      <footer className="border-t border-navy-800 py-6 text-center text-xs text-slate-muted">
        POS File Checker · Files are processed locally in your browser and never uploaded to any server.
      </footer>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { step: '1', label: 'Upload', desc: 'Select or drop your .001 POS file' },
    { step: '2', label: 'Parse', desc: '65 line items decoded from fixed-width format' },
    { step: '3', label: 'Calculate', desc: 'Admin values derived using VAT 12/112 rules' },
    { step: '4', label: 'Validate', desc: '11 critical fields compared — Pass or Failed' },
  ]
  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/40 p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-muted">
        How it works
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {steps.map(({ step, label, desc }) => (
          <div key={step} className="flex flex-col gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-pass">
              {step}
            </div>
            <p className="text-sm font-semibold text-slate-200">{label}</p>
            <p className="text-xs text-slate-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
