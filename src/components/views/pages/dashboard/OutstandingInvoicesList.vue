<template>
  <b-card role="region" aria-labelledby="unpaid-invoices-title" class="card-stats unpaid-invoices-card mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column unpaid-invoices-body">
      <div class="unpaid-invoices-header">
        <div class="unpaid-invoices-heading">
          <h5 id="unpaid-invoices-title" class="card-title text-uppercase text-muted mb-0" style="color: #0366d6 !important">
            {{ t('Outstanding Invoices') }}
          </h5>
          <p class="unpaid-invoices-subtitle mb-0">
            {{ t('Invoices waiting to be collected.') }}
          </p>
        </div>
        <b-link
          :to="{ name: 'invoices' }"
          class="unpaid-invoices-link"
          aria-label="View all outstanding invoices"
        >
          <span>{{ t('View All') }}</span>
          <base-feather-icon icon="ArrowRightIcon" size="14" />
        </b-link>
      </div>

      <div class="unpaid-invoices-list">
        <div role="list" class="invoice-list">
          <div
            v-for="(invoice, index) in unpaidInvoices"
            :key="invoice.id || index"
            :class="['invoice-item']"
            role="listitem"
          >
            <div class="invoice-item-main">
              <router-link
                :to="{
                  name: 'invoice',
                  params: { id: invoice.id }
                }"
                class="invoice-item-link"
              >
                <div class="invoice-item-topline">
                  <span class="invoice-ref">#{{ invoice.name }}</span>
                  <span :class="['invoice-status-badge', getInvoiceBadgeClass(invoice)]">
                    {{ getInvoiceStatusLabel(invoice) }}
                  </span>
                </div>
                <span class="invoice-customer">{{ getCustomerName(invoice) }}</span>
                <div class="invoice-meta">
                  <span>{{ t('Issued') }} {{ formatDateForDisplay(invoice.invoice_date) }}</span>
                  <span v-if="invoice.due_date">{{ t('Due') }} {{ formatDateForDisplay(invoice.due_date) }}</span>
                </div>
              </router-link>

              <div class="invoice-item-side">
                <span v-if="hideAmount" class="invoice-amount tpc-hero-value--masked">••••••</span>
                <span v-else class="invoice-amount">{{ currencyFormatter.format(invoice.amount) }}</span>
                <b-button
                  size="sm"
                  class="paid-button flex-shrink-0"
                  @click="openMarkPaidModal(invoice)"
                  :aria-label="`Mark invoice ${invoice.name} as paid`"
                >
                  <base-feather-icon icon="CheckIcon" size="14" />
                  {{ t('Paid') }}
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-card-body>
    <mark-paid-modal
      :visible.sync="markPaidModalVisible"
      :invoice-date="markPaidInvoice && markPaidInvoice.invoice_date"
      @confirm="handleMarkPaidConfirm"
    />
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';
import MarkPaidModal from '@/components/uiComponents/MarkPaidModal.vue';

export default {
  components: { BaseFeatherIcon, MarkPaidModal },
  props: {
    unpaidInvoices: { type: Array, required: true },
    t: { type: Function, required: true },
    currencyFormatter: { required: true },
    formatDateForDisplay: { type: Function, required: true },
    hideAmount: { type: Boolean, required: true },
  },
  data() {
    return {
      markPaidModalVisible: false,
      markPaidInvoice: null,
    };
  },
  computed: {
    totalOutstandingAmount() {
      return this.unpaidInvoices.reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);
    },
  },
  methods: {
    openMarkPaidModal(invoice) {
      this.markPaidInvoice = invoice;
      this.markPaidModalVisible = true;
    },
    handleMarkPaidConfirm(paidDate) {
      if (!this.markPaidInvoice) return;
      this.$emit('update-invoice-status', this.markPaidInvoice, 1, paidDate);
      this.markPaidInvoice = null;
    },
    getCustomerName(invoice) {
      return invoice.customer?.name?.substring(0, 36) || this.t('Unknown');
    },
    getInvoiceStatus(invoice) {
      if (!invoice.due_date) {
        return 'open';
      }

      const dueDate = new Date(invoice.due_date);
      if (Number.isNaN(dueDate.getTime())) {
        return 'open';
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      const diffInDays = Math.round((dueDate.getTime() - today.getTime()) / 86400000);

      if (diffInDays < 0) {
        return 'overdue';
      }

      if (diffInDays <= 7) {
        return 'due-soon';
      }

      return 'open';
    },
    getInvoiceBadgeClass(invoice) {
      return `invoice-status-badge--${this.getInvoiceStatus(invoice)}`;
    },
    getInvoiceStatusLabel(invoice) {
      const status = this.getInvoiceStatus(invoice);

      if (status === 'overdue') {
        return this.t('Overdue');
      }

      if (status === 'due-soon') {
        return this.t('Due Soon');
      }

      return this.t('Open');
    },
  },
}
</script>

<style scoped>
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
.unpaid-invoices-card {
  border: 1px solid #e9ecef;
  border-radius: 0.428rem;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
}

.unpaid-invoices-body {
  gap: 0.85rem;
}

.unpaid-invoices-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.unpaid-invoices-heading {
  min-width: 0;
}

.unpaid-invoices-subtitle {
  margin-top: 0.35rem;
}

.unpaid-invoices-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #0366d6 !important;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.unpaid-invoices-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 0;
}

.invoice-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.invoice-item {
  padding: 0.9rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.invoice-item:hover {
  transform: translateY(-1px);
  border-color: rgba(3, 102, 214, 0.2);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.invoice-item-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.invoice-item-link {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  text-decoration: none;
}

.invoice-item-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.invoice-ref {
  color: rgba(38, 43, 67, 0.9);
  font-weight: 500;
}

.invoice-customer {
  overflow: hidden;
  color: rgba(38, 43, 67, 0.9);
  font-size: 1rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invoice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: #6b7280;
  font-size: 0.78rem;
}

.invoice-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.invoice-status-badge--open {
  background: rgba(3, 102, 214, 0.1);
  color: #0366d6;
}

.invoice-status-badge--due-soon {
  background: rgba(251, 99, 64, 0.12);
  color: #d9480f;
}

.invoice-status-badge--overdue {
  background: rgba(245, 54, 92, 0.12);
  color: #c1121f;
}

.invoice-item-side {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.65rem;
  min-width: 122px;
}

.invoice-amount {
  color: rgba(38, 43, 67, 0.9);
  font-weight: 500;
}

.paid-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-width: 84px;
  min-height: 34px;
  padding: 0.4rem 0.75rem;
  color: white;
  background-color: #0366d6 !important;
  border-color: #0366d6 !important;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.6rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.paid-button:hover,
.paid-button:focus {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(3, 102, 214, 0.2);
  background-color: #0366d6 !important;
  border-color: #0366d6 !important;
}

.tpc-hero-value--masked {
  color: #94a3b8;
  letter-spacing: 0.08em;
}

@media (max-width: 575px) {

  .invoice-item-main {
    flex-direction: column;
  }

  .invoice-item-side {
    width: 100%;
    min-width: 0;
    align-items: stretch;
  }

  .invoice-amount {
    text-align: left;
  }
}

@media (max-width: 430px) {
  .unpaid-invoices-header,
  .invoice-item-topline {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
