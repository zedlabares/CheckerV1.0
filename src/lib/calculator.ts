// ============================================================
// calculator.ts
// Computes all 11 admin-expected values (Column D) from the
// raw accumulator integers, faithfully replicating the VBA
// formulas in ReadTextFileAndWriteToColumns.
//
// All accumulator inputs are raw integer cents (×100).
// All outputs are rounded to 2 decimal places to match VBA's
// Format("#,###,##0.00") behavior, per stakeholder decision.
//
// Philippine VAT rate: 12% (back-calculated as 12/112 of gross)
// ============================================================

import { ParsedAccumulators } from '../types/posFile'
import { round2 } from './parser'

/** All 11 admin-computed values, keyed by their LineItem number */
export interface AdminValues {
  /** LineItem 5 — New Accumulated Sales (VAT) */
  line5_newAccSalesVAT: number
  /** LineItem 6 — Total Gross Amount (VAT) */
  line6_totalGrossVAT: number
  /** LineItem 7 — Total Deductions (VAT) */
  line7_totalDeductionsVAT: number
  /** LineItem 24 — Total Non-Approved Store Discounts (VAT) */
  line24_totalNASD_VAT: number
  /** LineItem 30 — Total VAT/Tax Amount */
  line30_totalVAT: number
  /** LineItem 31 — Total Net Sales Amount (VAT) */
  line31_netSalesVAT: number
  /** LineItem 36 — Amount (Non-VAT section; expected = same as line31) */
  line36_amountNonVAT: number
  /** LineItem 38 — New Accumulated Sales (Non-VAT) */
  line38_newAccSalesNonVAT: number
  /** LineItem 40 — Total Deductions (Non-VAT) */
  line40_totalDeductionsNonVAT: number
  /** LineItem 64 — Total Net Sales Amount (Non-VAT) */
  line64_netSalesNonVAT: number
  /** LineItem 65 — Grand Total Net Sales */
  line65_grandTotal: number
}

/**
 * Compute all admin-expected values from the parsed accumulators.
 *
 * Formula derivations (using raw integer cents; divide by 100 at output):
 *
 *   VAT component:
 *     vatOnNetSales = (totGrossAmount - totalDeductions) * 0.12 / 1.12
 *     netSalesExclVAT = totGrossAmount - totalDeductions - vatOnNetSales
 *                     = (totGrossAmount - totalDeductions) / 1.12
 *
 *   Line 5 (New Acc Sales VAT):
 *     oldACCSales/100 + netSalesExclVAT/100
 *     Note: VBA adds OldAcc (÷100) to Format(netSalesExclVAT÷100)
 *
 *   Line 6 (Total Gross Amount VAT):
 *     The VBA formula expands to: totGrossAmount / 100
 *     (The VAT strip/add cancel out — this is a structural identity check)
 *
 *   Line 7 (Total Deductions VAT):
 *     totalDeductions / 100
 *
 *   Line 24 (Total NASD VAT):
 *     totalNASD / 100
 *
 *   Line 30 (Total VAT):
 *     vatOnNetSales / 100
 *
 *   Line 31 (Net Sales VAT):
 *     netSalesExclVAT / 100
 *
 *   Line 36 (Amount Non-VAT section):
 *     Same formula as Line 31 — the Non-VAT "Amount" header mirrors VAT net sales
 *
 *   Line 38 (New Acc Sales Non-VAT):
 *     newAccNV/100 + (totGrossAmountNV - totalDeductionsNV)/100
 *
 *   Line 40 (Total Deductions Non-VAT):
 *     totalDeductionsNV / 100
 *
 *   Line 64 (Net Sales Non-VAT):
 *     (totGrossAmountNV - totalDeductionsNV) / 100
 *
 *   Line 65 (Grand Total Net Sales):
 *     netSalesExclVAT/100 + (totGrossAmountNV - totalDeductionsNV)/100
 */
export function computeAdminValues(acc: ParsedAccumulators): AdminValues {
  const {
    oldACCSales,
    totGrossAmount,
    totalDeductions,
    totalNASD,
    newAccNV,
    totGrossAmountNV,
    totalDeductionsNV,
  } = acc

  // Core VAT-section intermediates (still in raw cents)
  const vatOnNetSales = (totGrossAmount - totalDeductions) * 0.12 / 1.12
  const netSalesExclVAT = totGrossAmount - totalDeductions - vatOnNetSales

  // Core Non-VAT-section intermediate (raw cents)
  const netSalesNonVAT = totGrossAmountNV - totalDeductionsNV

  return {
    // ── VAT Section ────────────────────────────────────────────────────────

    // Line 5: OldAcc ÷100  +  NetSalesVAT ÷100
    line5_newAccSalesVAT:    round2(oldACCSales / 100 + netSalesExclVAT / 100),

    // Line 6: Gross amount (identity formula — always equals tenant's reported gross)
    line6_totalGrossVAT:     round2(totGrossAmount / 100),

    // Line 7: Sum of deduction components
    line7_totalDeductionsVAT: round2(totalDeductions / 100),

    // Line 24: Sum of non-approved store discount components
    line24_totalNASD_VAT:    round2(totalNASD / 100),

    // Line 30: VAT back-calculated at 12/112 of gross-net
    line30_totalVAT:         round2(vatOnNetSales / 100),

    // Line 31: Net sales excluding VAT
    line31_netSalesVAT:      round2(netSalesExclVAT / 100),

    // ── Non-VAT Section ────────────────────────────────────────────────────

    // Line 36: "Amount" header — expected to match VAT net sales
    line36_amountNonVAT:     round2(netSalesExclVAT / 100),

    // Line 38: Non-VAT new accumulated sales = Old Non-VAT Acc + Non-VAT Net Sales
    line38_newAccSalesNonVAT: round2(newAccNV / 100 + netSalesNonVAT / 100),

    // Line 40: Sum of Non-VAT deduction components
    line40_totalDeductionsNonVAT: round2(totalDeductionsNV / 100),

    // Line 64: Non-VAT net sales
    line64_netSalesNonVAT:   round2(netSalesNonVAT / 100),

    // Line 65: Grand Total = VAT net sales + Non-VAT net sales
    line65_grandTotal:       round2((netSalesExclVAT + netSalesNonVAT) / 100),
  }
}

/**
 * Look up the admin-computed value for a given lineItem number.
 * Returns null for line items that are not validated.
 */
export function getAdminValue(lineItem: number, admin: AdminValues): number | null {
  switch (lineItem) {
    case 5:  return admin.line5_newAccSalesVAT
    case 6:  return admin.line6_totalGrossVAT
    case 7:  return admin.line7_totalDeductionsVAT
    case 24: return admin.line24_totalNASD_VAT
    case 30: return admin.line30_totalVAT
    case 31: return admin.line31_netSalesVAT
    case 36: return admin.line36_amountNonVAT
    case 38: return admin.line38_newAccSalesNonVAT
    case 40: return admin.line40_totalDeductionsNonVAT
    case 64: return admin.line64_netSalesNonVAT
    case 65: return admin.line65_grandTotal
    default: return null
  }
}
