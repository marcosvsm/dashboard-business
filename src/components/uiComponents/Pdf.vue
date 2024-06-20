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

export default {
  props: {
    invoiceData: Object
  },
  methods: {
    generatePDF() {
      var data = this.invoiceData;
      var options = {
        maxWidth: "50"
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
      
      const addHeader = () => {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 126, 202);
        doc.text("TAX INVOICE", 15, 20, options);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text("INVOICE", 200, 20, headerRight);
        doc.setFontSize(10);
        doc.text(data.company.name, 200, 30, headerRight);
        if (data.company.abn == null)
          data.company.abn = "";
        else
          doc.text("ABN: " + data.company.abn, 200, 35, headerRight);
        if (data.company.phone == null)
          data.company.phone = "";
        else
          doc.text("Phone: " + data.company.phone, 200, 40, headerRight);
        
        doc.text(data.company.email, 200, 45, headerRight);
        doc.line(0, 60, 220, 60);

        // HEADER CUSTOMER DATA LEFT
        doc.text("BILL TO", 15, 70, customerLeft);
        doc.text(data.customer.name, 15, 75, customerLeft);
        if (data.customer.abn != '')
          doc.text("ABN: " + data.customer.abn, 15, 80, customerLeft);
        if (data.customer.phone != '')  
          doc.text("Phone: " + data.customer.phone, 15, 85, customerLeft);
        if (data.customer.email != '')
          doc.text("Email: " + data.customer.email, 15, 90, customerLeft);

        // HEADER INVOICE RIGHT
        doc.text("Invoice Number: ", 170, 70, headerRight);
        doc.text(data.number, 190, 70, headerRight);
        doc.text("Invoice Date: ", 170, 75, headerRight);
        doc.text(data.date, 190, 75, headerRight);
        doc.text("Payment Due: ", 170, 80, headerRight);
        doc.text(data.dueDate, 190, 80, headerRight);
        doc.text("Amount Due: ", 170, 85, headerRight);
        doc.text("$" + data.amount, 190, 85, headerRight);

        // HEADER TABLE
        doc.text("ITEMS/DESCRIPTION", 15, 100);
        doc.text("QTY", 120, 100, headerTable);
        doc.text("PRICE", 150, 100, headerTable);
        doc.text("AMOUNT", 180, 100, headerTable);
      };

      const addFooter = () => {
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerPosition = pageHeight - 20; // 20 units from the bottom of the page
        doc.setFillColor(173, 216, 230); // Light blue color
        doc.rect(0, footerPosition - 10, 210, 20, 'F'); // Rectangle for footer background
        doc.setTextColor(0, 0, 0); // Black color
        doc.text('THANK YOU FOR YOUR BUSINESS!', 75, footerPosition);
      };

      addHeader();
      var row = 110;
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      const marginBottom = 30;
      
      for (var i = 0; i < data.items.length; i++) {
        if (row > pageHeight - marginBottom) {
          addFooter();
          doc.addPage();
          addHeader();
          row = 110; // Reset row position for new page
        }

        if (data.items[i].description == null)
          data.items[i].description = "";
        // TABLE ROW
        doc.text(data.items[i].itemName, 15, row);
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
        doc.text(data.items[i].quantity, 120, row, headerTable);
        doc.text("$" + data.items[i].price, 150, row, headerTable);
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

      doc.line(0, row + 10, 220, row + 10);
      doc.text(data.note, 15, rowSubtotal, customerLeft);
      doc.text("Subtotal:", 150, rowSubtotal, headerTable);
      doc.text("GST:", 150, rowGst, headerTable);
      doc.text("Total:", 150, rowTotal, headerTable);
      doc.text("$" + data.amount, 180, rowSubtotal, headerTable);
      doc.text("$" + data.amount, 180, rowTotal, headerTable);

      addFooter();

      doc.save("invoice-" + data.date + ".pdf");
    }
  }
}
</script>

<style>
</style>
