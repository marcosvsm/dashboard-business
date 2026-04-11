<template>
  <b-button 
    variant="outline-primary"
    class="mb-75"
    @click="generatePDF"
    block
  >
    Download
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
    selectedPaymentMethod: String,
    validateForm: Function,
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
      const safeFilename = value => String(value || 'invoice').replace(/[^a-z0-9-_]/gi, '_')

      const splitText = (text, width) => doc.splitTextToSize(safeText(text), width)

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
        doc.text('TAX INVOICE', layout.left, 20)
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
        }

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
        }

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
        const subtotalY = currentY + 5
        const gstY = subtotalY + 5
        const totalY = gstY + 5

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)

        doc.text('Subtotal:', layout.priceX, subtotalY, { align: 'left' })
        doc.text('GST:', layout.priceX, gstY, { align: 'left' })
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('Total:', layout.priceX, totalY, { align: 'left' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(formatCurrency(data.amount), layout.amountX, subtotalY, { align: 'center' })
        doc.text('$0.00', layout.amountX, gstY, { align: 'center' })
        doc.setFont('helvetica', 'bold')
        doc.text(formatCurrency(data.amount), layout.amountX, totalY, { align: 'center' })

        currentY = totalY + 8
      }

      const getPaymentAndNotesBlockHeight = () => {
        const payIdEnabled =
          data.company?.paymentDetail?.payid &&
          this.paymentDetails &&
          this.selectedPaymentMethod === 'PAYID'

        const noteText = safeText(data.note).trim()
        const hasNote = !!noteText

        const payIdText = payIdEnabled ? safeText(data.company?.paymentDetail?.payid).trim() : ''
        const paymentNameText = payIdEnabled ? safeText(data.company?.paymentDetail?.name).trim() : ''

        const payIdLines = payIdText ? splitText(payIdText, 92) : []
        const paymentNameLines = paymentNameText ? splitText(paymentNameText, 100) : []
        const noteLines = hasNote ? splitText(noteText, 104) : []

        const hasAnyContent =
          payIdEnabled || payIdLines.length || paymentNameLines.length || noteLines.length

        if (!hasAnyContent) return 0

        const titleHeight = 6
        const topPadding = 8
        const bottomPadding = 7
        const lineHeight = 4
        const dividerGap = payIdEnabled && hasNote ? 4 : 0
        const logoSpaceHeight = payIdEnabled ? 2 : 0

        const paymentContentHeight =
          (payIdLines.length * lineHeight) +
          (paymentNameLines.length ? paymentNameLines.length * lineHeight + 1 : 0)

        const noteContentHeight = noteLines.length ? noteLines.length * lineHeight : 0

        return (
          topPadding +
          titleHeight +
          logoSpaceHeight +
          paymentContentHeight +
          dividerGap +
          noteContentHeight +
          bottomPadding
        )
      }

      const renderPaymentAndNotes = () => {
        const payIdEnabled =
          data.company?.paymentDetail?.payid &&
          this.paymentDetails &&
          this.selectedPaymentMethod === 'PAYID'

        const noteText = safeText(data.note).trim()
        const hasNote = !!noteText

        const payIdText = payIdEnabled ? safeText(data.company?.paymentDetail?.payid).trim() : ''
        const paymentNameText = payIdEnabled ? safeText(data.company?.paymentDetail?.name).trim() : ''

        const payIdLines = payIdText ? splitText(payIdText, 92) : []
        const paymentNameLines = paymentNameText ? splitText(paymentNameText, 100) : []
        const noteLines = hasNote ? splitText(noteText, 104) : []

        const hasAnyContent =
          payIdEnabled || payIdLines.length || paymentNameLines.length || noteLines.length

        if (!hasAnyContent) return

        const sectionTitle = hasNote ? 'NOTES & PAYMENT DETAILS' : 'PAYMENT DETAILS'

        const titleHeight = 6
        const topPadding = 8
        const bottomPadding = 7
        const lineHeight = 4
        const dividerGap = payIdEnabled && hasNote ? 4 : 0

        const paymentContentHeight =
          (payIdLines.length * lineHeight) +
          (paymentNameLines.length ? paymentNameLines.length * lineHeight + 1 : 0)

        const noteContentHeight = noteLines.length ? noteLines.length * lineHeight : 0

        const logoSpaceHeight = payIdEnabled ? 2 : 0

        const blockHeight =
          topPadding +
          titleHeight +
          logoSpaceHeight +
          paymentContentHeight +
          dividerGap +
          noteContentHeight +
          bottomPadding

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

        // Payment details
        if (payIdEnabled) {
          try {
            const img = require('@/assets/img/payid.png')
            doc.addImage(img, 'PNG', layout.left-2, sectionY-10, 16, 16)
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

          if (payIdLines.length) {
            doc.text(payIdLines, layout.left, sectionY)
            sectionY += payIdLines.length * lineHeight
          }

          if (paymentNameLines.length) {
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(75, 85, 99)
            doc.text(paymentNameLines, layout.left, sectionY)
            sectionY += paymentNameLines.length * lineHeight + 1
          }
        }

        // Divider between payment details and notes
        if (payIdEnabled && hasNote) {
          doc.setDrawColor(226, 232, 240)
          doc.setLineWidth(0.2)
          doc.line(layout.left, sectionY + 1, boxX + boxWidth - 6, sectionY + 1)
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

      doc.save(`Invoice_${safeFilename(data.number)}.pdf`)
    },
  },
}
</script>

<style>
</style>
