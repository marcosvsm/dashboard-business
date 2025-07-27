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
    validateForm: Function
  },
  methods: {
    generatePDF() {
      const isValid = this.validateForm()
      if(isValid){
      var data = this.invoiceData;
      var options = {
        maxWidth: "70"
      };
      var headerRight = {
        maxWidth: "80",
        align: "right",
        lineHeightFactor: "1.15"
      };
      var customerLeft = {
        maxWidth: "100",
        align: "left",
        lineHeightFactor: "1.15"
      };
      var headerTable = {
        maxWidth: "20",
        align: "center"
      };
      const doc = new jspdf();
      const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
      const addHeader = () => {
        // Header Background (Light Blue)
        doc.setFillColor(240, 248, 255); // AliceBlue
        doc.rect(0, 0, pageWidth, 60, 'F');
        doc.setFontSize(24); // ≈ 2.142rem (34.272px)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 126, 202); // Existing blue for TAX INVOICE
        doc.setCharSpace(-0.405); // -0.54px ≈ -0.405pt
        doc.text("TAX INVOICE", 15, 20, options);
        doc.setCharSpace(0); // Reset letter spacing for subsequent text
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text("INVOICE", 200, 20, headerRight);
        doc.setFontSize(10);
        doc.text(data.company.name, 200, 30, headerRight);
        if (data.company.abn)
          doc.text("ABN: " + data.company.abn, 200, 35, headerRight);
        if (data.company.phone)
          doc.text("Phone: " + data.company.phone, 200, 40, headerRight);
        if (data.company.email)
        doc.text(data.company.email, 200, 45, headerRight);
        doc.setLineWidth(0.2);
        doc.setDrawColor(235, 233, 241);
        
        // HEADER CUSTOMER DATA LEFT
        doc.text("BILL TO", 15, 70, customerLeft);
        if(data.customer?.name){
          doc.text(data.customer.name, 15, 75, customerLeft);
          if (data.customer?.abn)
            doc.text("ABN: " + data.customer.abn, 15, 80, customerLeft);
          if (data.customer?.phone)  
            doc.text("Phone: " + data.customer.phone, 15, 85, customerLeft);
          if (data.customer?.email)
            doc.text(data.customer.email, 15, 90, customerLeft);
        }
        const lengthNumber = data.number.length;
        // HEADER INVOICE RIGHT
        doc.text("Invoice Number: ", 170, 70, headerRight);
        if(lengthNumber<=13)
          doc.text(data.number, 190, 70, headerRight);
        else{
          const desc = lengthNumber-10;
          doc.text(data.number, 190+desc, 70, headerRight);
        }
        doc.text("Invoice Date: ", 170, 75, headerRight);
        doc.text(formatDateForDisplay(data.date), 190, 75, headerRight);
        doc.text("Payment Due: ", 170, 80, headerRight);
        if(data.dueDate)
          doc.text(formatDateForDisplay(data.dueDate), 190, 80, headerRight);
        doc.text("Amount Due: ", 170, 85, headerRight);
        doc.text("$" + data.amount, 190, 85, headerRight);

        // HEADER TABLE
        doc.text("DESCRIPTION", 15, 100);
        doc.text("QTY", 120, 100, headerTable);
        doc.text("PRICE", 150, 100, headerTable);
        doc.text("AMOUNT", 180, 100, headerTable);
        doc.line(0, 101, 220, 101);
      };

      const addFooter = () => {
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerPosition = pageHeight - 10; // 10 units from the bottom of the page
        doc.setFillColor(240, 248, 255); // AliceBlue
        doc.rect(0, footerPosition - 10, 210, 20, 'F'); // Rectangle for footer background
        doc.setTextColor(0, 0, 0); // Black color
        doc.text('THANK YOU FOR YOUR BUSINESS!', 75, footerPosition);
        doc.textWithLink('Powered by Simplify Business', 82, footerPosition+5,{url:"https://simplifybusiness.com.au"});
      };

      addHeader();
      var row = 110;
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      const marginBottom = 40;
      
      for (var i = 0; i < data.items.length; i++) {
        if (row > pageHeight - marginBottom) {
          addFooter();
          doc.addPage();
          addHeader();
          row = 110; // Reset row position for new page
        }

        if (!data.items[i].description)
          data.items[i].description = "";
        // TABLE ROW
        doc.text(data.items[i]?.name || "", 15, row);
        if (data.items[i].description.length > 45) {
          let x = 45;
          let j = 0;
          let xRow = 1;
          let loop = true;
          while (loop) {
            if (x <= data.items[i].description.length)
              doc.text(data.items[i].description.slice(j, x), 15, row + 4 * xRow);
            else {
              doc.text(data.items[i].description.slice(j, data.items[i].description.length), 15, row + 4 * xRow);
              loop = false;
            }
            xRow++;
            j = x;
            x += 45;
          }
        } else {
          doc.text(data.items[i].description, 15, row + 4);
        }
        var item = parseFloat(data.items[i].price).toFixed(2)
        doc.text(data.items[i].quantity, 120, row, headerTable);
        doc.text("$" + item, 150, row, headerTable);
        doc.text("$" + data.items[i].amount, 180, row, headerTable);
        row += 15;
      }

      var rowSubtotal = row + 20;
      var rowGst = row + 25;
      var rowTotal = row + 30;

      if (rowSubtotal > pageHeight - marginBottom) {
        addFooter();
        doc.addPage();
        addHeader();
        rowSubtotal = 110;
        rowGst = rowSubtotal + 5;
        rowTotal = rowSubtotal + 10;
      }
      if(data.company?.paymentDetail?.payid && this.paymentDetails && this.selectedPaymentMethod === 'PAYID'){
        // Add Payment Icon (PNG from img folder)
        try {
          const img = require('@/assets/img/payid.png') // Adjust path if needed (e.g., '@/assets/img/payment-icon.png')
          doc.addImage(img, 'PNG', 53, rowSubtotal-12, 20, 20) // 20x20px icon, positioned left of header
          doc.text(data.company.paymentDetail?.payid, 15, rowGst, customerLeft);
          doc.text(data.company.paymentDetail?.name, 15, rowTotal, customerLeft);
        } catch (e) {
          doc.text("Payid: "+data.company.paymentDetail?.payid, 15, rowGst, customerLeft);
          doc.text("name: "+data.company.paymentDetail?.name, 15, rowTotal, customerLeft);
          console.warn('Payment icon not found:', e)
        }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("PAYMENT DETAILS -", 15, rowSubtotal, customerLeft);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(data.note, 15, rowTotal+5, customerLeft);
      }else if(data.note)
        doc.text(data.note, 15, rowSubtotal, customerLeft);
      doc.text("Subtotal:", 150, rowSubtotal, headerTable);
      doc.text("GST:", 150, rowGst, headerTable);
      doc.text("Total:", 150, rowTotal, headerTable);
      doc.text("$" + data.amount, 180, rowSubtotal, headerTable);
      doc.text("$0.00", 180, rowGst, headerTable);
      doc.text("$" + data.amount, 180, rowTotal, headerTable);

      addFooter();

      doc.save("Invoice#" + data.number + ".pdf");
      }else{
          this.$toast.error('Please correct the errors in the form to Download the PDF.',
          {
            position: "top-right",
            icon: AlertCircleIcon,
            closeButton: false,
            hideProgressBar: true,
            timeout: 3000
          })
      }
    }
  }
}
</script>

<style>
</style>
