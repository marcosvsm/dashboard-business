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
        methods:{
          generatePDF(){
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
              doc.text(data.company.name,15,20,options);
              doc.text("INVOICE",200,20,headerRight);
              doc.setFontSize(10);
              doc.text(data.company.name,200,30,headerRight);
              if(data.company.abn == null)
                data.company.abn = "";
              if(data.company.phone == null)
                data.company.phone = "";
              doc.text("ABN: "+data.company.abn,200,40,headerRight);
              doc.text("Phone: "+data.company.phone,200,50,headerRight);
              
              doc.line(0,60,220,60);
              
              //HEADER CUSTOMER DATA LEFT
              if(data.customer.abn == null)
                data.customer.abn = "";
              if(data.customer.phone == null)
                data.customer.phone = "";
              if(data.customer.email == null)
                data.customer.email = "";
              doc.text("BILL TO",15,70,customerLeft);
              doc.text(data.customer.name,15,75,customerLeft);
              doc.text("ABN: "+data.customer.abn,15,80,customerLeft);
              doc.text("Phone: "+data.customer.phone,15,85,customerLeft);
              doc.text("Email: "+data.customer.email,15,90,customerLeft);

                //HEADER INVOICE RIGHT
              doc.text("Invoice Number: ",170,70,headerRight);
              doc.text(data.number,190,70,headerRight);
              doc.text("Invoice Date: ",170,75,headerRight);
              doc.text(data.date,190,75,headerRight);
              doc.text("Payment Due: ",170,80,headerRight);
              doc.text(data.dueDate,190,80,headerRight);
              doc.text("Amount Due: ",170,85,headerRight);
              doc.text("$"+data.amount,190,85,headerRight);
                
                //HEADER TABLE
              doc.text("ITEMS/DESCRIPTION",15,100);
              doc.text("QUANTITY",120,100,headerTable);
              doc.text("PRICE",150,100,headerTable);
              doc.text("AMOUNT",180,100,headerTable);
        
            var row = 110;  
            for(var i=0;i < data.items.length; i++){
            if(data.items[i].description == null)
            data.items[i].description = "";
                //TABLE ROW
              doc.text(data.items[i].itemName,15,row);
              if(data.items[i].description.length > 45){
                let x = 45;
                let j = 0;
                let xRow = 1;
                let loop = true;
                while(loop){
                    if(x <= data.items[i].description.length)
                      doc.text(data.items[i].description.slice(j,x),15,row+4*xRow);
                    else{
                      doc.text(data.items[i].description.slice(j,data.items[i].description.length),15,row+4*xRow);
                      loop = false;
                    }
                    xRow++; 
                    j = x;
                    x+= 45;
                }
              }
              else
              var itemAmount = data.items[i].quantity*data.items[i].price
              doc.text(data.items[i].description,15,row+4);
              doc.text(data.items[i].quantity,120,row,headerTable);
              doc.text("$"+data.items[i].price,150,row,headerTable);    
              doc.text("$"+itemAmount,180,row,headerTable);
              row +=  15;
            }
            var rowSubtotal = row + 20;
            var rowTotal = row + 30; 
            doc.line(0,row+10,220,row+10);
            doc.text(data.note,15,rowSubtotal,customerLeft);
            doc.text("Subtotal:",150,rowSubtotal,headerTable);
            doc.text("Total:",150,rowTotal,headerTable);
            doc.text("$"+data.amount,180,rowSubtotal,headerTable);
            doc.text("$"+data.amount,180,rowTotal,headerTable);


          
            doc.save("invoice-"+data.date+".pdf");
          }
      }
  }
</script>
<style>

</style>
