<template>
  <b-button
    variant="outline-primary"
    class="mb-75"
    @click="generatePDF"
    block
    :disabled="!invoiceData.id || hasUnsavedChanges"
    v-b-tooltip.hover
    :title="!invoiceData.id ? $t('Save the invoice first to download it') : (hasUnsavedChanges ? $t('Save changes before downloading') : '')"
  >
    {{ $t('Download') }}
  </b-button>
</template>

<script>
import jspdf from 'jspdf'
import { formatDateForDisplay } from '@/libs/dateUtils.js'
import { AlertCircleIcon } from 'vue-feather-icons'

export default {
  props: {
    invoiceData: Object,
    paymentDetails: {
      type: Boolean,
    },
    // Array of payment method ids to render on this invoice. Valid entries
    // are 'payid' and 'bank'; either, both, or neither may be present.
    selectedPaymentMethods: {
      type: Array,
      default: () => [],
    },
    validateForm: Function,
    hasUnsavedChanges: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    generatePDF() {
      const isValid = this.validateForm()

      if (!isValid) {
        this.$toast.error('Please correct the errors in the form to Download the PDF.', {
          position: 'top-right',
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
        return
      }

      const data = this.invoiceData || {}
      // Snapshot drives display — never recompute GST inside the PDF.
      const isTaxInvoice = !!(data.gst_registered_snapshot || data.gst_applied)
      const subtotalForDisplay = data.subtotal != null ? data.subtotal : data.amount
      const gstForDisplay = data.gst_amount != null ? data.gst_amount : '0.00'
      const doc = new jspdf()

      const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight()

      const layout = {
        left: 15,
        right: pageWidth - 10,
        billToLeft: 15,
        invoiceInfoRight: pageWidth - 15,
        tableTop: 100,
        itemStartY: 110,
        qtyX: 120,
        priceX: 150,
        amountX: 180,
        bottomMargin: 28,
        footerHeight: 16,
        contentWidth: 95,
        noteWidth: 115,
        rightBlockWidth: 60,
      }

      const formatCurrency = value => `$${Number(value || 0).toFixed(2)}`
      const safeText = value => String(value || '')
      const safeFilename = value =>
        String(value || 'invoice')
          .trim()
          .replace(/[^a-z0-9-_ ]/gi, '')
          .replace(/\s+/g, '-')

      const getShortCompanyName = value => {
        const words = safeText(value)
          .trim()
          .split(/\s+/)
          .filter(Boolean)

        if (words.length === 0) {
          return 'Company'
        }

        if (words.length <= 2) {
          return safeFilename(words.join(' '))
        }

        return safeFilename(`${words[0]} ${words[words.length - 1]}`)
      }

      const splitText = (text, width) => doc.splitTextToSize(safeText(text), width)

      // Australian-style address: street / region + state + postcode / country.
      // Returns an array of lines (already trimmed) so empty fields are
      // skipped without leaving blank rows in the PDF.
      const formatAddressLines = entity => {
        if (!entity) return []
        const lines = []
        const street = safeText(entity.address).trim()
        if (street) lines.push(street)
        const stateZip = [safeText(entity.state).trim(), safeText(entity.postcode).trim()]
          .filter(Boolean)
          .join(' ')
        const cityLine = [safeText(entity.region).trim(), stateZip].filter(Boolean).join(', ')
        if (cityLine) lines.push(cityLine)
        const country = safeText(entity.country).trim()
        if (country) lines.push(country)
        return lines
      }

      const ensurePageSpace = neededHeight => {
        if (currentY + neededHeight > pageHeight - layout.bottomMargin) {
          addFooter()
          doc.addPage()
          addHeader()
          currentY = layout.itemStartY
        }
      }

      const drawLabelValueRight = (label, value, y) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.text(label, 170, y, { align: 'right' })
        doc.text(safeText(value), 190, y, { align: 'right' })
      }

      const drawWrappedBlock = (lines, x, y, lineHeight = 4) => {
        if (!lines.length) return y
        doc.text(lines, x, y)
        return y + (lines.length - 1) * lineHeight
      }

      const getItemLines = item => {
        const rawName = safeText(item?.name).trim()
        const rawDescription = safeText(item?.description).trim()
        const nameLines = rawName ? splitText(rawName, 95) : []
        const descriptionLines = rawDescription ? splitText(rawDescription, 95) : []
        return {
          nameLines,
          descriptionLines,
        }
      }

      const getItemRowHeight = item => {
        const { nameLines, descriptionLines } = getItemLines(item)
        const lineCount = nameLines.length + descriptionLines.length
        return Math.max(15, Math.max(lineCount, 1) * 4 + 3)
      }

      const addHeader = () => {
        doc.setFillColor(240, 248, 255)
        doc.rect(0, 0, pageWidth, 60, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(24)
        doc.setTextColor(0, 126, 202)
        doc.setCharSpace(-0.405)
        doc.text(isTaxInvoice ? 'TAX INVOICE' : 'INVOICE', layout.left, 20)
        doc.setCharSpace(0)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('INVOICE', layout.invoiceInfoRight, 20, { align: 'right' })

        doc.setFontSize(10)
        const companyNameLines = splitText(data.company?.name, layout.rightBlockWidth)
        let companyY = 30
        if (companyNameLines.length) {
          doc.text(companyNameLines, layout.invoiceInfoRight, companyY, { align: 'right' })
          companyY += companyNameLines.length * 4
        }

        if (data.company?.abn) {
          doc.text(`ABN: ${data.company.abn}`, layout.invoiceInfoRight, companyY, { align: 'right' })
          companyY += 5
        }
        if (data.company?.phone) {
          doc.text(`Phone: ${data.company.phone}`, layout.invoiceInfoRight, companyY, { align: 'right' })
          companyY += 5
        }
        if (data.company?.email) {
          const emailLines = splitText(data.company.email, layout.rightBlockWidth)
          doc.text(emailLines, layout.invoiceInfoRight, companyY, { align: 'right' })
          companyY += emailLines.length * 4
        }

        const companyAddressLines = formatAddressLines(data.company)
        companyAddressLines.forEach(line => {
          const wrapped = splitText(line, layout.rightBlockWidth)
          doc.text(wrapped, layout.invoiceInfoRight, companyY, { align: 'right' })
          companyY += wrapped.length * 4
        })

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.text('BILL TO', layout.billToLeft, 70)

        doc.setFont('helvetica', 'normal')
        let customerY = 75
        const customerNameLines = splitText(data.customer?.name, 90)
        if (customerNameLines.length && safeText(data.customer?.name)) {
          doc.text(customerNameLines, layout.billToLeft, customerY)
          customerY += customerNameLines.length * 4 + 1
        }
        if (data.customer?.abn) {
          doc.text(`ABN: ${data.customer.abn}`, layout.billToLeft, customerY)
          customerY += 5
        }
        if (data.customer?.phone) {
          doc.text(`Phone: ${data.customer.phone}`, layout.billToLeft, customerY)
          customerY += 5
        }
        if (data.customer?.email) {
          const customerEmailLines = splitText(data.customer.email, 90)
          doc.text(customerEmailLines, layout.billToLeft, customerY)
          customerY += customerEmailLines.length * 4 + 1
        }

        const customerAddressLines = formatAddressLines(data.customer)
        customerAddressLines.forEach(line => {
          const wrapped = splitText(line, 90)
          doc.text(wrapped, layout.billToLeft, customerY)
          customerY += wrapped.length * 4
        })

        drawLabelValueRight('Invoice Number:', safeText(data.number), 70)
        drawLabelValueRight('Invoice Date:', formatDateForDisplay(data.date), 75)
        drawLabelValueRight('Payment Due:', data.dueDate ? formatDateForDisplay(data.dueDate) : '', 80)
        drawLabelValueRight('Amount Due:', formatCurrency(data.amount), 85)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text('DESCRIPTION', layout.left, layout.tableTop)
        doc.text('QTY', layout.qtyX, layout.tableTop, { align: 'center' })
        doc.text('PRICE', layout.priceX, layout.tableTop, { align: 'center' })
        doc.text('AMOUNT', layout.amountX, layout.tableTop, { align: 'center' })

        doc.setLineWidth(0.2)
        doc.setDrawColor(235, 233, 241)
        doc.line(0, layout.tableTop + 1, pageWidth, layout.tableTop + 1)
      }

      const addFooter = () => {
        const footerY = pageHeight - 10
        doc.setFillColor(240, 248, 255)
        doc.rect(0, footerY - 8, pageWidth, 16, 'F')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.text('THANK YOU FOR YOUR BUSINESS!', pageWidth / 2, footerY - 1, { align: 'center' })
        doc.textWithLink('Powered by Simplify Business', pageWidth / 2, footerY + 4, {
          url: 'https://simplifybusiness.com.au',
          align: 'center',
        })
      }

      const renderItemRow = item => {
        const { nameLines, descriptionLines } = getItemLines(item)
        const rowHeight = getItemRowHeight(item)

        ensurePageSpace(rowHeight)

        let textY = currentY

        // Name first if it exists
        if (nameLines.length) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          doc.text(nameLines, layout.left, textY)
          textY += nameLines.length * 4
        }

        // Description should start at top if name is empty
        if (descriptionLines.length) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          doc.text(descriptionLines, layout.left, textY)
        }

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(safeText(item?.quantity), layout.qtyX, currentY, { align: 'center' })
        doc.text(formatCurrency(item?.price), layout.priceX, currentY, { align: 'center' })
        doc.text(formatCurrency(item?.amount), layout.amountX, currentY, { align: 'center' })

        currentY += rowHeight
      }

      const ensureFinalSectionSpace = () => {
        const totalsHeight = 18
        const paymentHeight = getPaymentAndNotesBlockHeight()
        const combinedHeight = totalsHeight + paymentHeight

        if (currentY + combinedHeight > pageHeight - layout.bottomMargin) {
          addFooter()
          doc.addPage()
          addHeader()
          currentY = layout.itemStartY
        }
      }

      const renderTotals = () => {
        const lineGap = 5
        let lineY = currentY + lineGap

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)

        if (isTaxInvoice) {
          // Subtotal
          doc.text('Subtotal:', layout.priceX, lineY, { align: 'left' })
          doc.text(formatCurrency(subtotalForDisplay), layout.amountX, lineY, { align: 'center' })
          lineY += lineGap

          // GST (10%)
          doc.text('GST (10%):', layout.priceX, lineY, { align: 'left' })
          doc.text(formatCurrency(gstForDisplay), layout.amountX, lineY, { align: 'center' })
          lineY += lineGap
        }

        // Grand total — always shown
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('Total:', layout.priceX, lineY, { align: 'left' })
        doc.text(formatCurrency(data.amount), layout.amountX, lineY, { align: 'center' })

        currentY = lineY + 8
      }

      // ----------------------------------------------------------------
      // Payment + Notes block
      //
      // The block is composed of up to three sections: PayID, Bank Account,
      // and Notes. Each is included only when the corresponding source data
      // is present AND the user selected it for this invoice via
      // `selectedPaymentMethods` (an array of 'payid' / 'bank').
      //
      // Source priority:
      //   1. Invoice snapshot columns (payid_snapshot, bank_*_snapshot) —
      //      authoritative for any invoice that has been saved with the
      //      new snapshot system.
      //   2. Live `data.company.paymentDetail` — fallback for legacy
      //      invoices and unsaved drafts.
      // ----------------------------------------------------------------
      const lineHeight = 4

      const buildPaymentBlocks = () => {
        const pd = data.company?.paymentDetail
        const wantsPayment = !!this.paymentDetails
        const methods = Array.isArray(this.selectedPaymentMethods) ? this.selectedPaymentMethods : []

        const showPayidFlag = pd?.show_payid !== false // backend default = true
        const showBankFlag  = pd?.show_bank_details !== false

        // Snapshot fields win over live company data when present. For an
        // unsaved draft the snapshot fields are undefined so we drop back
        // to the live PaymentDetail.
        const payidValue        = data.payid_snapshot || pd?.payid || ''
        const payidNameValue    = data.payid_name_snapshot || pd?.name || ''
        const bankAccountName   = data.bank_account_name_snapshot   || pd?.account_name   || ''
        const bankBsb           = data.bank_bsb_snapshot            || pd?.bsb            || ''
        const bankAccountNumber = data.bank_account_number_snapshot || pd?.account_number || ''
        const bankName          = data.bank_name_snapshot           || pd?.bank_name      || ''

        const hasPayidValue = !!payidValue
        const hasBankValues = !!(bankAccountName && bankBsb && bankAccountNumber)

        const payIdEnabled = wantsPayment && methods.includes('payid') && hasPayidValue && showPayidFlag
        const bankEnabled  = wantsPayment && methods.includes('bank')  && hasBankValues  && showBankFlag

        const formatBsb = (raw) => {
          const digits = String(raw || '').replace(/\D/g, '')
          return digits.length === 6 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : (raw || '')
        }

        const payId = payIdEnabled
          ? {
            payIdLines:        splitText(safeText(payidValue).trim(), 92),
            paymentNameLines:  payidNameValue ? splitText(safeText(payidNameValue).trim(), 100) : [],
          }
          : null

        const bank = bankEnabled
          ? {
            bankNameLines:       bankName ? splitText(safeText(bankName).trim(), 100) : [],
            accountNameLines:    splitText(safeText(bankAccountName).trim(), 100),
            bsbLine:             `BSB: ${formatBsb(bankBsb)}`,
            accountNumberLine:   `Account: ${safeText(bankAccountNumber).trim()}`,
          }
          : null

        const noteText  = safeText(data.note).trim()
        const noteLines = noteText ? splitText(noteText, 104) : []

        return { payId, bank, noteLines }
      }

      const measurePaymentBlock = ({ payId, bank, noteLines }) => {
        const hasPayId = !!payId
        const hasBank  = !!bank
        const hasNote  = noteLines.length > 0

        if (!hasPayId && !hasBank && !hasNote) return 0

        const titleHeight    = 6
        const topPadding     = 8
        const bottomPadding  = 7
        const dividerGap     = 6

        const payIdLogoSpace = hasPayId ? 2 : 0
        const payIdContent   = hasPayId
          ? (payId.payIdLines.length * lineHeight)
            + (payId.paymentNameLines.length ? payId.paymentNameLines.length * lineHeight + 1 : 0)
          : 0

        const bankContent = hasBank
          ? (bank.bankNameLines.length * lineHeight)
            + (bank.accountNameLines.length * lineHeight)
            + (2 * lineHeight) + 2
          : 0

        const noteContent = hasNote ? noteLines.length * lineHeight : 0

        const dividersBetween =
          ((hasPayId && hasBank) ? dividerGap : 0) +
          (((hasPayId || hasBank) && hasNote) ? dividerGap : 0)

        return (
          topPadding
          + titleHeight
          + payIdLogoSpace
          + payIdContent
          + bankContent
          + dividersBetween
          + noteContent
          + bottomPadding
        )
      }

      const drawDivider = (boxX, boxWidth, atY) => {
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.2)
        doc.line(layout.left, atY + 1, boxX + boxWidth - 6, atY + 1)
      }

      const getPaymentAndNotesBlockHeight = () => measurePaymentBlock(buildPaymentBlocks())

      const renderPaymentAndNotes = () => {
        const blocks = buildPaymentBlocks()
        const blockHeight = measurePaymentBlock(blocks)
        if (!blockHeight) return

        const { payId, bank, noteLines } = blocks
        const hasNote = noteLines.length > 0
        const sectionTitle = hasNote
          ? (payId || bank ? 'NOTES & PAYMENT DETAILS' : 'NOTES')
          : 'PAYMENT DETAILS'

        const boxX = layout.left - 2
        const boxY = currentY - 5
        const boxWidth = 122

        doc.setFillColor(248, 250, 252)
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.3)
        doc.roundedRect(boxX, boxY, boxWidth, blockHeight, 2, 2, 'FD')

        let sectionY = currentY

        // Title
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10.5)
        doc.setTextColor(31, 41, 55)
        doc.text(sectionTitle, layout.left, sectionY)
        sectionY += 7

        // PayID block
        if (payId) {
          try {
            const img = require('@/assets/img/payid.png')
            doc.addImage(img, 'PNG', layout.left - 2, sectionY - 10, 16, 16)
          } catch (e) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(100, 116, 139)
            doc.text('PayID', layout.left, sectionY)
          }

          sectionY += 4

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(17, 24, 39)

          if (payId.payIdLines.length) {
            doc.text(payId.payIdLines, layout.left, sectionY)
            sectionY += payId.payIdLines.length * lineHeight
          }
          if (payId.paymentNameLines.length) {
            doc.setTextColor(75, 85, 99)
            doc.text(payId.paymentNameLines, layout.left, sectionY)
            sectionY += payId.paymentNameLines.length * lineHeight + 1
          }
        }

        // Divider between PayID and Bank
        if (payId && bank) {
          drawDivider(boxX, boxWidth, sectionY)
          sectionY += 6
        }

        // Bank Account block
        if (bank) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.setTextColor(31, 41, 55)
          doc.text('Bank Account', layout.left, sectionY)
          sectionY += 4

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(17, 24, 39)

          if (bank.bankNameLines.length) {
            doc.text(bank.bankNameLines, layout.left, sectionY)
            sectionY += bank.bankNameLines.length * lineHeight
          }
          doc.text(bank.accountNameLines, layout.left, sectionY)
          sectionY += bank.accountNameLines.length * lineHeight
          doc.text(bank.bsbLine, layout.left, sectionY)
          sectionY += lineHeight
          doc.text(bank.accountNumberLine, layout.left, sectionY)
          sectionY += lineHeight + 2
        }

        // Divider before Notes
        if ((payId || bank) && hasNote) {
          drawDivider(boxX, boxWidth, sectionY)
          sectionY += 6
        }

        // Notes
        if (hasNote) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.setTextColor(100, 116, 139)
          doc.text('Notes', layout.left, sectionY)
          sectionY += 4

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(17, 24, 39)
          doc.text(noteLines, layout.left, sectionY)
          sectionY += noteLines.length * lineHeight
        }

        currentY = boxY + blockHeight + 6
      }

      addHeader()

      let currentY = layout.itemStartY
      const items = Array.isArray(data.items) ? data.items : []

      items.forEach(item => renderItemRow(item))
      ensureFinalSectionSpace()
      renderTotals()
      renderPaymentAndNotes()
      addFooter()

      const companyName = getShortCompanyName(data.company?.name)
      const invoiceNumber = safeFilename(data.number || data.ref || 'Invoice')
      doc.save(`Invoice-${invoiceNumber}-${companyName}.pdf`)
    },
  },
}
</script>

<style>
</style>
