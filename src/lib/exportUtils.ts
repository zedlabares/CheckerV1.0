// ============================================================
// exportUtils.ts
// PDF and Excel export of validation results.
// Uses jsPDF + jsPDF-AutoTable for PDF, SheetJS (xlsx) for Excel.
// ============================================================

import { ValidationResult } from '../types/posFile'
import { formatCurrency, formatPosDate } from './validator'

// ─── PDF Export ─────────────────────────────────────────────────────────────

/**
 * Generate and trigger download of a PDF validation report.
 * Layout mirrors the spreadsheet: columns A–E with header metadata.
 */
export async function exportToPDF(result: ValidationResult): Promise<void> {
  // Dynamic import to keep initial bundle small
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // ── Header block ──────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(15, 28, 46)        // navy-900
  doc.text('POS File Validation Report', 14, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 100, 120)
  doc.text(`File: ${result.filename}`, 14, 23)
  doc.text(`Tenant Code: ${result.tenantCode}`, 14, 28)
  doc.text(`Terminal No.: ${result.terminalNumber}`, 70, 28)
  doc.text(`POS Date: ${formatPosDate(result.posDate)}`, 140, 28)
  doc.text(`Processed: ${result.processedAt.toLocaleString('en-PH')}`, 14, 33)

  // ── Summary badges ────────────────────────────────────────────────────
  const { passed, failed, totalChecked } = result.summary
  const summaryY = 38
  doc.setFillColor(0, 200, 150)
  doc.roundedRect(14, summaryY, 36, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(`✓ ${passed} Passed`, 32, summaryY + 5.5, { align: 'center' })

  doc.setFillColor(229, 62, 62)
  doc.roundedRect(54, summaryY, 36, 8, 2, 2, 'F')
  doc.text(`✗ ${failed} Failed`, 72, summaryY + 5.5, { align: 'center' })

  doc.setFillColor(42, 78, 122)
  doc.roundedRect(94, summaryY, 44, 8, 2, 2, 'F')
  doc.text(`${totalChecked} Checks Total`, 116, summaryY + 5.5, { align: 'center' })

  // ── Validation table ─────────────────────────────────────────────────
  const tableData = result.rows.map(row => [
    String(row.lineItem),
    row.definition,
    row.tenantValue !== null ? (typeof row.tenantValue === 'number' ? formatCurrency(row.tenantValue) : String(row.tenantValue)) : '—',
    row.adminValue !== null ? formatCurrency(row.adminValue) : '—',
    row.status ?? '—',
  ])

  autoTable(doc, {
    startY: summaryY + 12,
    head: [['#', 'Line Item Definition', 'Tenant File Value (C)', 'Admin Expected (D)', 'Status (E)']],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 50, 70],
    },
    headStyles: {
      fillColor: [15, 28, 46],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 90 },
      2: { cellWidth: 42, halign: 'right', font: 'courier' },
      3: { cellWidth: 42, halign: 'right', font: 'courier' },
      4: { cellWidth: 22, halign: 'center' },
    },
    didDrawCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        const status = data.cell.raw as string
        if (status === 'Pass') {
          doc.setTextColor(0, 160, 100)
        } else if (status === 'Failed') {
          doc.setTextColor(220, 50, 50)
        } else {
          doc.setTextColor(120, 140, 160)
        }
      }
    },
    alternateRowStyles: {
      fillColor: [245, 248, 252],
    },
    margin: { left: 14, right: 14 },
  })

  // ── Footer ────────────────────────────────────────────────────────────
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(140, 150, 160)
    doc.text(
      `POS File Checker  |  Page ${p} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 6,
      { align: 'center' }
    )
  }

  const safeName = result.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  doc.save(`validation_${safeName}.pdf`)
}

// ─── Excel Export ────────────────────────────────────────────────────────────

/**
 * Generate and trigger download of an Excel (.xlsx) validation report.
 * Mirrors the structure of the original POSFileChecker spreadsheet:
 *   Col A: Line Item #
 *   Col B: Definition
 *   Col C: Tenant File Value
 *   Col D: Admin Expected
 *   Col E: Status
 */
export async function exportToExcel(result: ValidationResult): Promise<void> {
  // Dynamic import to keep initial bundle small
  const XLSX = await import('xlsx')

  const wb = XLSX.utils.book_new()

  // ── Metadata sheet ────────────────────────────────────────────────────
  const metaData = [
    ['POS File Validation Report'],
    [],
    ['File', result.filename],
    ['Tenant Code', result.tenantCode],
    ['Terminal Number', result.terminalNumber],
    ['POS Date', formatPosDate(result.posDate)],
    ['Processed At', result.processedAt.toLocaleString('en-PH')],
    [],
    ['Checks Passed', result.summary.passed],
    ['Checks Failed', result.summary.failed],
    ['Total Checks', result.summary.totalChecked],
    ['Overall Result', result.summary.allPassed ? 'ALL PASS' : `${result.summary.failed} FAILED`],
  ]
  const metaSheet = XLSX.utils.aoa_to_sheet(metaData)
  metaSheet['!cols'] = [{ wch: 20 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(wb, metaSheet, 'Summary')

  // ── Validation data sheet ─────────────────────────────────────────────
  const headers = ['Line Item #', 'Line Item Definition', 'Tenant File Value', 'Admin Expected Value', 'Status']
  const dataRows = result.rows.map(row => [
    row.lineItem,
    row.definition,
    row.tenantValue !== null
      ? (typeof row.tenantValue === 'number' ? row.tenantValue : String(row.tenantValue))
      : null,
    row.adminValue !== null ? row.adminValue : null,
    row.status ?? '',
  ])

  const wsData = [headers, ...dataRows]
  const dataSheet = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  dataSheet['!cols'] = [
    { wch: 12 },
    { wch: 45 },
    { wch: 20 },
    { wch: 22 },
    { wch: 10 },
  ]

  XLSX.utils.book_append_sheet(wb, dataSheet, 'Validation')

  // ── Trigger download ──────────────────────────────────────────────────
  const safeName = result.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  XLSX.writeFile(wb, `validation_${safeName}.xlsx`)
}
