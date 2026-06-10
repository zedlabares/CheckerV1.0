// ============================================================
// Static metadata for all 65 POS file line items.
// Mirrors Column A (LineItem) and Column B (Line Item Definition)
// of the original spreadsheet.
// ============================================================

export interface LineItemMeta {
  lineItem: number;
  definition: string;
  /**
   * Decode mode:
   *   'currency' — divide raw integer by 100
   *   'integer'  — keep as plain integer (no division)
   *   'text'     — keep raw string as-is
   */
  decodeMode: 'currency' | 'integer' | 'text';
  /** Whether Column E has a Pass/Failed formula for this row */
  isValidated: boolean;
  /** Section: 'vat' for lines 1–34, 'nonvat' for lines 35–65 */
  section: 'vat' | 'nonvat';
}

export const LINE_ITEMS: LineItemMeta[] = [
  // ─────────────────────────────────────────────────────────
  // Section A: VAT Sales (lines 1–34)
  // ─────────────────────────────────────────────────────────
  { lineItem: 1,  definition: 'Tenant Code',                               decodeMode: 'text',     isValidated: false, section: 'vat' },
  { lineItem: 2,  definition: 'POS Terminal Number',                        decodeMode: 'text',     isValidated: false, section: 'vat' },
  { lineItem: 3,  definition: 'Date (mmddyyyy)',                            decodeMode: 'text',     isValidated: false, section: 'vat' },
  { lineItem: 4,  definition: 'Old Accumulated Sales',                      decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 5,  definition: 'New Accumulated Sales',                      decodeMode: 'currency', isValidated: true,  section: 'vat' },
  { lineItem: 6,  definition: 'Total Gross Amount',                         decodeMode: 'currency', isValidated: true,  section: 'vat' },
  { lineItem: 7,  definition: 'Total Deductions',                           decodeMode: 'currency', isValidated: true,  section: 'vat' },
  { lineItem: 8,  definition: 'Total Promo Sales Amount',                   decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 9,  definition: 'Total Discount',                             decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 10, definition: 'Total Refund Amount',                        decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 11, definition: 'Total Returned Items Amount',                decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 12, definition: 'Total Other Taxes',                          decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 13, definition: 'Total Service Charge Amount',                decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 14, definition: 'Total Adjustment Discount',                  decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 15, definition: 'Total Void Amount',                          decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 16, definition: 'Total Discount Cards',                       decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 17, definition: 'Total Delivery Charges',                     decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 18, definition: 'Total Gift Certificates/Checks Redeemed',   decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 19, definition: 'Store Specific Discount 1 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 20, definition: 'Store Specific Discount 2 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 21, definition: 'Store Specific Discount 3 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 22, definition: 'Store Specific Discount 4 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 23, definition: 'Store Specific Discount 5 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 24, definition: 'Total of all Non-Approved Store Discounts',  decodeMode: 'currency', isValidated: true,  section: 'vat' },
  { lineItem: 25, definition: 'Store Specific Discount 1 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 26, definition: 'Store Specific Discount 2 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 27, definition: 'Store Specific Discount 3 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 28, definition: 'Store Specific Discount 4 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 29, definition: 'Store Specific Discount 5 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'vat' },
  { lineItem: 30, definition: 'Total VAT/Tax Amount',                       decodeMode: 'currency', isValidated: true,  section: 'vat' },
  { lineItem: 31, definition: 'Total Net Sales Amount',                     decodeMode: 'currency', isValidated: true,  section: 'vat' },
  // Lines 32–34: plain integers (no ÷100), per VBA branch `If i >= 31 And i <= 34`
  { lineItem: 32, definition: 'Total Cover Count',                          decodeMode: 'integer',  isValidated: false, section: 'vat' },
  { lineItem: 33, definition: 'Control Number',                             decodeMode: 'integer',  isValidated: false, section: 'vat' },
  { lineItem: 34, definition: 'Total Number of Sales Transactions',         decodeMode: 'integer',  isValidated: false, section: 'vat' },

  // ─────────────────────────────────────────────────────────
  // Section B: Non-VAT Sales (lines 35–65)
  // ─────────────────────────────────────────────────────────
  { lineItem: 35, definition: 'Sales Type',                                 decodeMode: 'text',     isValidated: false, section: 'nonvat' },
  { lineItem: 36, definition: 'Amount',                                     decodeMode: 'currency', isValidated: true,  section: 'nonvat' },
  { lineItem: 37, definition: 'Old Accumulated Sales',                      decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 38, definition: 'New Accumulated Sales',                      decodeMode: 'currency', isValidated: true,  section: 'nonvat' },
  { lineItem: 39, definition: 'Total Gross Amount',                         decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 40, definition: 'Total Deductions',                           decodeMode: 'currency', isValidated: true,  section: 'nonvat' },
  { lineItem: 41, definition: 'Total Promo Sales Amount',                   decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 42, definition: 'Senior Citizen Discount / PWD Discount',     decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 43, definition: 'Total Refund Amount',                        decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 44, definition: 'Total Returned Items Amount',                decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 45, definition: 'Total Other Taxes',                          decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 46, definition: 'Total Service Charge Amount',                decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 47, definition: 'Total Adjustment Discount',                  decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 48, definition: 'Total Void Amount',                          decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 49, definition: 'Total Discount Cards',                       decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 50, definition: 'Total Delivery Charges',                     decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 51, definition: 'Total Gift Certificates/Checks Redeemed',   decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 52, definition: 'Store Specific Discount 1 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 53, definition: 'Store Specific Discount 2 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 54, definition: 'Store Specific Discount 3 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 55, definition: 'Store Specific Discount 4 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 56, definition: 'Store Specific Discount 5 (Approved)',       decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  // Line 57: Total of all Non-Approved Store Discounts (Non-VAT).
  // ⚠️ KNOWN ANOMALY: In the original VBA, this value is written WITHOUT dividing by 100.
  // We replicate the original behavior faithfully. The UI surfaces a warning on this row.
  { lineItem: 57, definition: 'Total of all Non-Approved Store Discounts',  decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 58, definition: 'Store Specific Discount 1 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 59, definition: 'Store Specific Discount 2 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 60, definition: 'Store Specific Discount 3 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 61, definition: 'Store Specific Discount 4 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 62, definition: 'Store Specific Discount 5 (Not Approved)',   decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 63, definition: 'Total VAT/Tax Amount',                       decodeMode: 'currency', isValidated: false, section: 'nonvat' },
  { lineItem: 64, definition: 'Total Net Sales Amount',                     decodeMode: 'currency', isValidated: true,  section: 'nonvat' },
  { lineItem: 65, definition: 'Grand Total Net Sales',                      decodeMode: 'currency', isValidated: true,  section: 'nonvat' },
]

/** Quick O(1) lookup by lineItem number */
export const LINE_ITEM_MAP = new Map<number, LineItemMeta>(
  LINE_ITEMS.map(m => [m.lineItem, m])
)
