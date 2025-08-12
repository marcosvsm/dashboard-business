<template>
  <section class="faq-section">
    <div class="header">
      <h4>Frequently Asked Questions</h4>
    </div>
    <div class="accordion" role="tablist">
      <b-card no-body class="mb-1" v-for="(faq, index) in faqs" :key="index">
        <b-card-header header-tag="header" class="p-1 custom-variant" role="tab">
          <b-button block v-b-toggle="'accordion-'+index">{{ faq.question }}</b-button>
        </b-card-header>
        <b-collapse :id="'accordion-'+index" visible accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-card-text>
              <template v-if="index === 0">
                Navigate to the <router-link to="/invoice/create" class="faq-link">Invoice</router-link> section and click on 'Create'. Fill in the necessary details such as invoice number, date, due date, client information, items or services provided, and payment terms. Click 'Save' and then 'Download' to generate the invoice.
              </template>
              <template v-else-if="index === 1">
                While creating or editing an invoice in the <router-link to="/invoice/create" class="faq-link">Invoice</router-link> section, you can add items by clicking 'Add Item' and entering the item details. To remove an item, click the X icon next to the item you wish to delete.
              </template>
              <template v-else-if="index === 2">
                This feature is not yet available, but we are working on adding the ability to send invoices directly to clients from the <router-link to="/invoices" class="faq-link">Invoice</router-link> section. Stay tuned for updates!
              </template>
              <template v-else-if="index === 3">
                In the <router-link to="/invoice/list" class="faq-link">Invoice</router-link> section, each invoice will display its status: green for paid, red for overdue, or no color for invoices not yet paid but still on time. You can filter invoices by clients name or view details for more information.
              </template>
              <template v-else-if="index === 4">
                This feature is not yet available, but we plan to add invoice template customization in the invoice section, allowing you to modify fields like logo, colors, and layout. Check back for future updates!
              </template>
              <template v-else-if="index === 5">
                Navigate to the <router-link to="/client/list" class="faq-link">Clients</router-link> section, where you can add a new client by clicking 'Add Client' and entering their details. To edit or delete, select the client from the list and choose the appropriate action.
              </template>
              <template v-else-if="index === 6">
                Ensure you have a stable internet connection and that all required fields in the invoice are filled. If the issue persists, contact support through the <router-link to="/help" class="faq-link">Help</router-link> section or email <b-link href="mailto:support@simplifybusiness.com.au" class="faq-link">support@simplifybusiness.com.au</b-link>.
              </template>
              <template v-else-if="index === 7">
                Navigate to the <router-link to="/tax/calculator" class="faq-link">Tax Calculator</router-link> section. Select your income source, enter your annual business income (before tax) in AUD, choose the tax year (e.g., 2024-2025), select your business type (Sole Trader, Partnership, or Company), and input your total expenses (if you have to be deducted from your tax). You can also toggle advanced options like including the Medicare Levy (2%) or indicating GST registration to calculate your tax obligations accurately.
              </template>
              <template v-else-if="index === 8">
                You can easily change the platform language by clicking on the language name and flag icon located right next to the menu. A dropdown will appear with available language options—simply select your preferred language to apply the change instantly.
              </template>
              <template v-else-if="index === 9">
                Yes, most features of the platform are free to use. As a welcome to early users, we’re offering the full platform with all premium features (like our Grow+ plan) completely free!
              </template>
            </b-card-text>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>    
  </section>
</template>

<script>
import ValidationError from "@/components/uiComponents/ValidationError"
import BaseFeatherIcon from '../../../uiComponents/BaseFeatherIcon.vue'

export default {
  components: {
    ValidationError,
    BaseFeatherIcon,
  },
  data() {
    return {
      faqs: [
        {
          question: "How do I create a new invoice?",
          answer: ""
        },
        {
          question: "How do I add or remove items from an invoice?",
          answer: ""
        },
        {
          question: "Can I send invoices directly to clients from the platform?",
          answer: ""
        },
        {
          question: "How can I track the payment status of an invoice?",
          answer: ""
        },
        {
          question: "Is it possible to customize invoice templates?",
          answer: ""
        },
        {
          question: "How do I manage client information?",
          answer: ""
        },
        {
          question: "What should I do if I encounter an error while downloading an invoice?",
          answer: ""
        },
        {
          question: "How do I use the Tax Calculator?",
          answer: ""
        },
        {
          question: "How do I change the platform language?",
          answer: ""
        },
        {
          question: "Is the platform free to use?",
          answer: ""
        }
      ]
    }
  },
  created() {},
  methods: {}
}
</script>

<style scoped>
.custom-variant {
  background-color: #007eca !important;
  color: white;
  border-color: #007eca !important;
  box-shadow: none !important;
}
.custom-variant button,button:hover, button:focus{
  background-color: transparent !important;
  box-shadow: none !important;
  border-color: transparent !important;
}

.custom-variant:hover, .custom-variant:focus {
  background-color: #0066a1 !important;
  border-color: #0066a1 !important;
  box-shadow: none !important;
}

.faq-link {
  color: #007eca;
  text-decoration: none;
}

.faq-link:hover {
  color: #0066a1;
  text-decoration: underline;
}

.header h4 {
  font-size: 1.8rem !important;
  font-weight: bold;
  color: #333;
}

.header {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.faq-section{
  padding-bottom:20px;
}
</style>