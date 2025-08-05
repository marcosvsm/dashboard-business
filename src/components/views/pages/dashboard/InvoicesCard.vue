<template>
  <b-card class="card-stats mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column">
      <b-row class="flex-nowrap align-items-center">
        <b-col>
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">{{ t('Invoices') }}</h5>
          <span class="h2 font-weight-bold mb-0">{{ getNumberInvoices }}</span>
        </b-col>
        <b-col cols="auto">
          <router-link :to="{ name: 'invoices'}">
            <div class="icon icon-shape bg-gradient-blue text-white rounded-circle shadow">
              <base-feather-icon icon="FileTextIcon" size="30" />
            </div>
          </router-link>
        </b-col>
      </b-row>
      <b-row class="flex-nowrap align-items-center mt-1">
        <b-col cols="6">
           <div class="d-flex justify-content-between">
          <span class="font-weight-bold">{{ t('Paid') }}</span>
          <span>{{ getInvoicePaid }}</span>
        </div>
        <b-progress :value="getInvoicePaid" :max="getNumberInvoices" variant="primary" class="mt-1" />
        </b-col>
        <b-col cols="6">
          <div class="d-flex justify-content-between">
          <span class="font-weight-bold">{{ t('Unpaid') }}</span>
          <span>{{ getInvoiceUnpaid }}</span>
        </div>
        <b-progress :value="getInvoiceUnpaid" :max="getNumberInvoices" variant="warning" class="mt-1" />
        </b-col>
      </b-row>
      
      <div class="last-invoice mt-auto">
        <span class="text-muted">{{ t('Last Invoice') }}:</span> <p>{{ getLastInvoice }}</p>
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

export default {
  components: { BaseFeatherIcon },
  props: {
    invoices: { type: Array, required: true },
    t: { type: Function, required: true },
    currencyFormatter: { required: true },
    formatDateForDisplay: { type: Function, required: true },
    formatDateForInvoiceDisplay: { type: Function, required: true },
  },
  computed: {
    getNumberInvoices() {
      return this.invoices.length;
    },
    getInvoicePaid() {
      return this.invoices.filter(inv => inv.status === 1).length;
    },
    getInvoiceUnpaid() {
      return this.invoices.filter(inv => inv.status === 0).length;
    },
    getLastInvoice() {
      if (!this.invoices.length) return 'N/A';
      const latest = this.invoices.reduce((max, inv) => {
        const date = new Date(inv.invoice_date);
        return date > max ? date : max;
      }, new Date(0));
      return this.formatDateForInvoiceDisplay(latest);
    },
  },
}
</script>

<style scoped>
/* Styles specific to this card */
/* Add global dashboard styles here if needed */
.card{
  height:100%;
}
.card-stats{
  height: 100%;
}
.card-stats .card-body{
  height: 100%;
  padding:0.75rem !important;
}
.card-body{
  padding:0.75rem !important;
}
.icon-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  transition: width 0.2s ease, height 0.2s ease; /* Smooth resizing */
}
/* Reduce icon size and adjust layout on smaller screens */
@media (max-width: 820px) {
  .icon-shape {
    width: 40px;
    height: 40px;
  }
  .icon-shape .feather {
    width: 24px; /* Reduce icon size */
    height: 24px;
  }
}

.bg-gradient-blue {
  background: linear-gradient(87deg, #0366d6 0, #1a91ff 100%);
}
</style>