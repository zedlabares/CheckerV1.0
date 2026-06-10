// ============================================================
// validator.ts
// Orchestrates the full pipeline:
//   1. Parse .001 file into structured lines + accumulators
//   2. Compute admin-expected values
//   3. Compare tenant vs admin (rounded to 2dp) → Pass / Failed
//   4. Return a complete ValidationResult
// ============================================================

import { ValidationRow, ValidationResult, ValidationSummary } from '../types/posFile'
import { LINE_ITEMS } from './lineItemDefinitions'
import { parseFile, round2, decodeFileBuffer } from './parser'
import { computeAdminValues, getAdminValue } from './calculator'

/** Anomaly registry: lineItems known to have issues in original VBA */
const KNOWN_ANOMALIES: Record<number, string> = {
  57: 'Known anomaly: in the original VBA, this admin value was written without ÷100. ' +
      'This field is not validated (no Pass/Failed check). Displayed for reference only.',
}

/**
 * Process a raw ArrayBuffer from a .001 file upload.
 * Handles UTF-8, ASCII, and Windows-1252 (ANSI) encodings.
 *
 * @param buffer    Raw bytes from FileReader
 * @param filename  Original filename (used in result metadata)
 * @returns         Complete ValidationResult
 */
export function processFile(buffer: ArrayBuffer, filename: string): ValidationResult {
  // ── Step 1: Decode bytes to string ──────────────────────────────────────
  const content = decodeFileBuffer(buffer)

  // ── Step 2: Parse lines and accumulate raw values ────────────────────────
  const { lines, accumulators } = parseFile(content)

  // ── Step 3: Compute admin-expected values ────────────────────────────────
  const adminValues = computeAdminValues(accumulators)

  // ── Step 4: Build per-row validation grid ────────────────────────────────
  const rows: ValidationRow[] = LINE_ITEMS.map((meta) => {
    const parsed = lines.find(l => l.lineItem === meta.lineItem)
    const tenantValue = parsed?.tenantValue ?? null
    const adminValue = getAdminValue(meta.lineItem, adminValues)

    let status = null
    if (meta.isValidated && tenantValue !== null && adminValue !== null) {
      // Round both to 2dp before comparing — per stakeholder decision
      const tenantRounded = round2(typeof tenantValue === 'number' ? tenantValue : 0)
      const adminRounded = round2(adminValue)
      status = tenantRounded === adminRounded ? 'Pass' : 'Failed'
    }

    const row: ValidationRow = {
      lineItem: meta.lineItem,
      definition: meta.definition,
      tenantValue,
      adminValue: meta.isValidated ? adminValue : null,
      status: status as 'Pass' | 'Failed' | null,
      isValidated: meta.isValidated,
    }

    // Attach anomaly note if applicable
    if (KNOWN_ANOMALIES[meta.lineItem]) {
      row.hasKnownAnomaly = true
      row.anomalyNote = KNOWN_ANOMALIES[meta.lineItem]
    }

    return row
  })

  // ── Step 5: Build summary ────────────────────────────────────────────────
  const validatedRows = rows.filter(r => r.isValidated)
  const passed = validatedRows.filter(r => r.status === 'Pass').length
  const failed = validatedRows.filter(r => r.status === 'Failed').length
  const summary: ValidationSummary = {
    totalChecked: validatedRows.length,
    passed,
    failed,
    allPassed: failed === 0,
  }

  // ── Step 6: Extract metadata from the parsed lines ───────────────────────
  const tenantLine = lines.find(l => l.lineItem === 1)
  const terminalLine = lines.find(l => l.lineItem === 2)
  const dateLine = lines.find(l => l.lineItem === 3)

  return {
    filename,
    processedAt: new Date(),
    tenantCode: String(tenantLine?.tenantValue ?? '').trim() || 'Unknown',
    terminalNumber: String(terminalLine?.tenantValue ?? '').trim() || 'Unknown',
    posDate: String(dateLine?.tenantValue ?? '').trim() || 'Unknown',
    rows,
    summary,
  }
}

/**
 * Format a POS date string (mmddyyyy or yyyymmdd) for display.
 * Returns the raw string if format is not recognised.
 */
export function formatPosDate(raw: string): string {
  if (!raw || raw === 'Unknown') return raw
  // mmddyyyy format
  if (/^\d{8}$/.test(raw)) {
    const mm = raw.substring(0, 2)
    const dd = raw.substring(2, 4)
    const yyyy = raw.substring(4, 8)
    return `${mm}/${dd}/${yyyy}`
  }
  return raw
}

/**
 * Format a currency value for display.
 * Uses Philippine Peso formatting with 2 decimal places.
 */
export function formatCurrency(value: number | string | null): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  return value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
