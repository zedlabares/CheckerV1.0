// ============================================================
// ExportButtons.tsx
// Triggers PDF and Excel export of the current validation result.
// Uses dynamic imports so jsPDF and xlsx don't bloat the initial bundle.
// ============================================================

import { useState } from 'react'
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react'
import { ValidationResult } from '../types/posFile'
import { exportToPDF, exportToExcel } from '../lib/exportUtils'

interface Props {
  result: ValidationResult
}

export function ExportButtons({ result }: Props) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [xlsxLoading, setXlsxLoading] = useState(false)

  const handlePDF = async () => {
    setPdfLoading(true)
    try {
      await exportToPDF(result)
    } catch (e) {
      console.error('PDF export failed:', e)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleExcel = async () => {
    setXlsxLoading(true)
    try {
      await exportToExcel(result)
    } catch (e) {
      console.error('Excel export failed:', e)
    } finally {
      setXlsxLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <ExportButton
        onClick={handlePDF}
        loading={pdfLoading}
        icon={<FileDown className="h-4 w-4" />}
        label="Export PDF"
      />
      <ExportButton
        onClick={handleExcel}
        loading={xlsxLoading}
        icon={<FileSpreadsheet className="h-4 w-4" />}
        label="Export Excel"
        variant="secondary"
      />
    </div>
  )
}

function ExportButton({
  onClick,
  loading,
  icon,
  label,
  variant = 'primary',
}: {
  onClick: () => void
  loading: boolean
  icon: React.ReactNode
  label: string
  variant?: 'primary' | 'secondary'
}) {
  const base =
    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-pass disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-pass text-navy-900 hover:bg-pass/90',
    secondary: 'border border-navy-600 bg-navy-800 text-slate-300 hover:border-navy-500 hover:text-slate-100',
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${base} ${variants[variant]}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  )
}
