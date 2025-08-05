<template>
  <b-card role="region" aria-labelledby="unpaid-invoices-title" class="unpaid-invoices-card">
    <b-card-body>
      <b-row>
        <b-col class="d-flex align-items-center">
          <h5 id="unpaid-invoices-title" class="card-title text-uppercase text-muted mb-0" style="color: #0366d6 !important">
            {{ t('Outstanding Invoices') }}
          </h5>
        </b-col>
        <b-col class="d-flex justify-content-end">
          <b-link :to="{ name: 'invoices' }" variant="outline-primary" size="sm" aria-label="View all outstanding invoices">
            {{ t('View All') }}
          </b-link>
        </b-col>
      </b-row>
    </b-card-body>
    <b-card-body class="unpaid-invoices-list">
      <div role="list" class="invoice-list">
        <div
          v-for="(invoice, index) in unpaidInvoices"
          :key="index"
          :class="['invoice-item', { 'bg-light': index % 2 === 0 }]"
          role="listitem"
        >
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex flex-column">
              <div class="d-flex align-items-center">
                <h6 class="mb-0 text-dark text-sm font-weight-bold">
                  {{ formatDateForDisplay(invoice.invoice_date) }}
                </h6>
              </div>
              <span class="text-xs text-muted">#{{ invoice.name }} - {{ invoice.customer?.name.substring(0,25) || 'Unknown' }}</span>
            </div>
            <div class="d-flex align-items-center text-sm font-weight-bolder">
              <span class="text-nowrap mr-2">{{ currencyFormatter.format(invoice.amount) }}</span>
              <b-button
                size="sm"
                class="paid-button flex-shrink-0"
                @click="$emit('update-invoice-status', invoice, 1)"
                :aria-label="`Mark invoice ${invoice.name} as paid`"
              >
                <base-feather-icon icon="DollarSignIcon" size="16" />
                {{ t('Paid') }}
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

export default {
  components: { BaseFeatherIcon },
  props: {
    unpaidInvoices: { type: Array, required: true },
    t: { type: Function, required: true },
    currencyFormatter: { required: true },
    formatDateForDisplay: { type: Function, required: true },
  },
}
</script>

<style scoped>
/* Styles for the list */
.unpaid-invoices-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.unpaid-invoices-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0;
}

.invoice-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invoice-item {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.invoice-item.bg-light {
  background-color: #f8f9fa;
}

.invoice-item:hover {
  background-color: #f1f3f5;
}

.paid-button {
  color: white;
  background-color: #0366d6 !important;
  border-color: #0366d6 !important;
  min-width: 70px;
  min-height: 36px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.paid-button:hover,
.paid-button:focus {
  transform: scale(1.05);
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #0366d6 !important;
  border-color: #0366d6 !important;
}
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
</style>