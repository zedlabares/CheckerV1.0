// ============================================================
// Core domain types for POS File Checker
// ============================================================

/** A single decoded line from the .001 file */
export interface ParsedLine {
  /** 1-based line number as labelled in the .001 file spec (1–65) */
  lineItem: number;
  /** Raw 12-character value string extracted from positions 3–14 */
  rawValue: string;
  /** Decoded value: currency lines divided by 100, text/integer lines kept as-is */
  tenantValue: number | string;
  /** True for non-currency lines (Tenant Code, Terminal No., Date, text fields) */
  isTextField: boolean;
  /** True for plain-integer lines (Cover Count, Control Number, Transactions, Sales Type) */
  isIntegerField: boolean;
}

/** Validation status for a single line item */
export type ValidationStatus = 'Pass' | 'Failed' | null;

/** A single row in the validation grid — equivalent to one row in the spreadsheet */
export interface ValidationRow {
  /** Line item number 1–65 */
  lineItem: number;
  /** Human-readable field name (Column B) */
  definition: string;
  /** Tenant-reported value from file (Column C) */
  tenantValue: number | string | null;
  /** Admin-computed expected value (Column D) — null when not validated */
  adminValue: number | string | null;
  /** Pass / Failed / null (null = not a validated field) */
  status: ValidationStatus;
  /** Whether this row participates in Pass/Failed checking */
  isValidated: boolean;
  /** Whether this row carries a known anomaly (e.g., Row 58 missing ÷100) */
  hasKnownAnomaly?: boolean;
  /** Description of the known anomaly if present */
  anomalyNote?: string;
}

/** Summary statistics for a processed file */
export interface ValidationSummary {
  totalChecked: number;   // always 11 in the current spec
  passed: number;
  failed: number;
  allPassed: boolean;
}

/** Complete result object after processing a .001 file */
export interface ValidationResult {
  filename: string;
  processedAt: Date;
  tenantCode: string;
  terminalNumber: string;
  posDate: string;        // raw date string from file (mmddyyyy format)
  rows: ValidationRow[];
  summary: ValidationSummary;
}

/** Raw intermediate calculation variables extracted during parsing */
export interface ParsedAccumulators {
  oldACCSales: number;          // raw cents: file line 4
  totGrossAmount: number;       // raw cents: file line 6
  totalDeductions: number;      // raw cents: sum of file lines 7–22
  totalNASD: number;            // raw cents: sum of file lines 24–28
  newAccNV: number;             // raw cents: file line 37 (Old Acc Sales Non-VAT)
  totGrossAmountNV: number;     // raw cents: file line 39
  totalDeductionsNV: number;    // raw cents: sum of file lines 41–56
  totalNASD_NV: number;         // raw cents: sum of file lines 58–62 (note: written raw per original VBA bug)
}

/** Application-level state managed by Zustand */
export interface AppState {
  result: ValidationResult | null;
  isProcessing: boolean;
  error: string | null;
  setResult: (result: ValidationResult) => void;
  setProcessing: (v: boolean) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}
