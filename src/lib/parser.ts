// ============================================================
// parser.ts
// Parses a raw .001 POS remittance file into structured data.
//
// File format (from VBA analysis):
//   Each line: [2-char line number][12-char value field][CRLF or LF]
//   Currency values: stored as integer cents (divide by 100 to get PHP)
//   Lines 32–34 (i=31–33 in 0-based): plain integers, no division
//   Lines 1–3, 35 (i=0–2, 34): text fields
// ============================================================

import { ParsedLine, ParsedAccumulators } from '../types/posFile'
import { LINE_ITEM_MAP } from './lineItemDefinitions'

/** Round a number to 2 decimal places (matches VBA Format("#,###,##0.00")) */
export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Attempt to decode an ArrayBuffer as text, trying UTF-8 first,
 * then falling back to windows-1252 (ANSI) for legacy POS files.
 */
export function decodeFileBuffer(buffer: ArrayBuffer): string {
  // Try UTF-8 first
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true })
    return decoder.decode(buffer)
  } catch {
    // Fall back to Windows-1252 (covers ANSI/Latin-1 range)
    try {
      const decoder = new TextDecoder('windows-1252', { fatal: false })
      return decoder.decode(buffer)
    } catch {
      // Last resort: latin-1 (iso-8859-1)
      const decoder = new TextDecoder('iso-8859-1', { fatal: false })
      return decoder.decode(buffer)
    }
  }
}

/**
 * Split raw file text into lines, normalising CRLF and LF.
 * Strips trailing empty lines to match VBA's vbCrLf split behavior.
 */
function splitLines(content: string): string[] {
  // Normalise Windows CRLF → LF, then split
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  // Remove trailing empty lines (VBA Split may produce one; we want exactly 65 data lines)
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop()
  }
  return lines
}

/**
 * Extract the 12-character value field from a single .001 line.
 * Characters at index 2–13 (0-based), trimmed.
 * Returns the raw string so callers can decide how to decode it.
 */
function extractRawValue(line: string): string {
  if (line.length < 3) return ''
  return line.substring(2, 14).trim()
}

/**
 * Parse a raw integer string value as a currency amount (÷ 100).
 * Returns 0 if parsing fails.
 */
function parseCurrency(raw: string): number {
  const n = parseFloat(raw)
  return isNaN(n) ? 0 : n / 100
}

/**
 * Parse a raw string as an integer (no division).
 * Returns the string as-is if non-numeric (e.g., text fields).
 */
function parseInteger(raw: string): number {
  const n = parseInt(raw, 10)
  return isNaN(n) ? 0 : n
}

/**
 * Main parser: converts raw .001 file content into an array of ParsedLine objects
 * and the intermediate accumulator values needed by the calculator.
 *
 * @param content  Decoded text content of the .001 file
 * @returns        { lines, accumulators } or throws a descriptive error
 */
export function parseFile(content: string): {
  lines: ParsedLine[]
  accumulators: ParsedAccumulators
} {
  const rawLines = splitLines(content)

  if (rawLines.length < 65) {
    throw new Error(
      `File appears incomplete — expected at least 65 lines, found ${rawLines.length}. ` +
      `Please verify this is a valid POS .001 remittance file.`
    )
  }

  // ─── Accumulators (all in raw cents / integers before ÷100) ───────────────
  let oldACCSales = 0
  let totGrossAmount = 0
  let totalDeductions = 0          // sum of file lines 7–22 (0-based i=6..21)
  let totalNASD = 0                // sum of file lines 24–28 (0-based i=23..27)
  let newAccNV = 0                 // file line 37 (0-based i=36)
  let totGrossAmountNV = 0         // file line 39 (0-based i=38)
  let totalDeductionsNV = 0        // sum of file lines 41–56 (0-based i=40..55)
  let totalNASD_NV = 0             // sum of file lines 58–62 (0-based i=57..61)

  const parsedLines: ParsedLine[] = []

  for (let i = 0; i < 65; i++) {
    const lineItem = i + 1            // 1-based line item number
    const line = rawLines[i] ?? ''
    const raw = extractRawValue(line)
    const meta = LINE_ITEM_MAP.get(lineItem)

    // Determine decode mode from metadata (with sensible fallback)
    const mode = meta?.decodeMode ?? 'currency'
    const isTextField = mode === 'text'
    const isIntegerField = mode === 'integer'

    let tenantValue: number | string
    if (isTextField) {
      tenantValue = raw
    } else if (isIntegerField) {
      tenantValue = parseInteger(raw)
    } else {
      // Currency: divide raw integer by 100
      tenantValue = parseCurrency(raw)
    }

    parsedLines.push({ lineItem, rawValue: raw, tenantValue, isTextField, isIntegerField })

    // ─── Populate accumulators from specific line positions ───────────────
    // VBA used 0-based `i`; our `i` here is also 0-based (lineItem = i+1)

    // i=3 → Line 4: Old Accumulated Sales (VAT)
    if (i === 3) {
      oldACCSales = parseFloat(raw) || 0
    }
    // i=5 → Line 6: Total Gross Amount (VAT)
    if (i === 5) {
      totGrossAmount = parseFloat(raw) || 0
    }
    // i=6..21 → Lines 7–22: components of Total Deductions (VAT)
    if (i >= 6 && i <= 21) {
      totalDeductions += parseFloat(raw) || 0
    }
    // i=23..27 → Lines 24–28: Non-Approved Store Discounts (VAT)
    if (i >= 23 && i <= 27) {
      totalNASD += parseFloat(raw) || 0
    }
    // i=36 → Line 37: Old Accumulated Sales (Non-VAT)
    if (i === 36) {
      newAccNV = parseFloat(raw) || 0
    }
    // i=38 → Line 39: Total Gross Amount (Non-VAT)
    if (i === 38) {
      totGrossAmountNV = parseFloat(raw) || 0
    }
    // i=40..55 → Lines 41–56: components of Total Deductions (Non-VAT)
    if (i >= 40 && i <= 55) {
      totalDeductionsNV += parseFloat(raw) || 0
    }
    // i=57..61 → Lines 58–62: Non-Approved Store Discounts (Non-VAT)
    if (i >= 57 && i <= 61) {
      totalNASD_NV += parseFloat(raw) || 0
    }
  }

  return {
    lines: parsedLines,
    accumulators: {
      oldACCSales,
      totGrossAmount,
      totalDeductions,
      totalNASD,
      newAccNV,
      totGrossAmountNV,
      totalDeductionsNV,
      totalNASD_NV,
    },
  }
}
