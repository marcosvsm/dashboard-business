/**
 * Frontend GST preview helper.
 *
 * PREVIEW ONLY — the backend (App\Services\Invoices\InvoiceGstCalculatorService)
 * is authoritative. These functions exist so the invoice form can show live
 * totals as the user types without a roundtrip. After save, totals are
 * refreshed from the backend response and may differ by a cent on edge cases.
 *
 * Money math runs through integer cents to avoid float drift. Per-line cents
 * are rounded HALF_UP before being summed into invoice totals, matching the
 * backend rounding strategy exactly.
 */

export const GST_RATE = 10
export const PRICE_MODE_EXCLUSIVE = 'gst_exclusive'
export const PRICE_MODE_INCLUSIVE = 'gst_inclusive'

const toNumber = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

// Round half-up to the nearest cent.
const roundCents = (cents) => Math.floor(cents + 0.5)

const toCents = (dollars) => roundCents(dollars * 100)

const formatCents = (cents) => (cents / 100).toFixed(2)

/**
 * Decide whether GST applies based on the company's GST settings + invoice date.
 * Mirrors the backend rule: must be GST-registered AND (no effective-from
 * date OR invoice_date >= that date).
 *
 * @param {object} company - Company resource (deserialized).
 * @param {string} invoiceDate - YYYY-MM-DD.
 * @returns {boolean}
 */
export function companyGstAppliesByDefault(company, invoiceDate) {
  if (!company || !company.gst_registered) return false
  const from = company.gst_registered_from
  if (!from) return true
  if (!invoiceDate) return true
  return invoiceDate >= from
}

/**
 * Compute invoice preview totals.
 *
 * @param {Array<{quantity:any, price:any}>} items
 * @param {boolean} gstApplied
 * @param {string} priceMode - PRICE_MODE_EXCLUSIVE | PRICE_MODE_INCLUSIVE
 * @returns {{
 *   subtotal: string,
 *   gst_amount: string,
 *   amount: string,
 *   items: Array<{amount: string}>
 * }}
 */
export function calculateInvoicePreview(items, gstApplied, priceMode) {
  let subtotalCents = 0
  let gstCents = 0
  let totalCents = 0

  const itemSnapshots = []

  ;(items || []).forEach((item) => {
    const qty = toNumber(item.quantity)
    const price = toNumber(item.price)
    // Phase 6 rule: visible line amount = qty * unit_price, regardless of GST mode.
    const rawCents = toCents(qty * price)

    let lineSubtotal = rawCents
    let lineGst = 0
    let lineTotal = rawCents

    if (gstApplied) {
      if (priceMode === PRICE_MODE_INCLUSIVE) {
        lineTotal = rawCents
        lineGst = roundCents((rawCents * 10) / 110)
        lineSubtotal = lineTotal - lineGst
      } else {
        lineSubtotal = rawCents
        lineGst = roundCents((rawCents * 10) / 100)
        lineTotal = lineSubtotal + lineGst
      }
    }

    subtotalCents += lineSubtotal
    gstCents += lineGst
    totalCents += lineTotal

    itemSnapshots.push({ amount: formatCents(rawCents) })
  })

  return {
    subtotal: formatCents(subtotalCents),
    gst_amount: formatCents(gstCents),
    amount: formatCents(totalCents),
    items: itemSnapshots,
  }
}
