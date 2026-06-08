<template>
  <section class="invoice-list-section">

    <div class="invoice-list-header">
      <div>
        <h4 class="invoice-list-title mb-0">
          {{ t('Invoices') }}
        </h4>
        <p class="invoice-list-subtitle mb-0">{{ t('Manage and track your invoices.') }}</p>
      </div>
    </div>

    <div class="invoice-search-row">
      <div class="invoice-search-wrap">
        <base-feather-icon icon="SearchIcon" size="15" class="invoice-search-icon" />
        <b-form-input
          v-model="searchQuery"
          :placeholder="t('Search by invoice or customer...')"
          class="invoice-search-input"
        />
      </div>

      <div class="invoice-status-filter" role="tablist">
        <button
          v-for="option in statusFilterOptions"
          :key="option.value"
          type="button"
          :class="['invoice-status-pill', `invoice-status-pill--${option.value}`, { 'invoice-status-pill--active': statusFilter === option.value }]"
          @click="statusFilter = option.value"
        >
          {{ t(option.label) }}
        </button>
      </div>
    </div>

    <template v-if="loading">
      <div class="invoice-loading">
        <b-spinner small />
        <span>{{ t('Loading') }}…</span>
      </div>
    </template>

    <template v-else-if="filteredInvoices && filteredInvoices.length">
      <div class="invoice-items">
        <div
          v-for="(invoice, index) in filteredInvoices"
          :key="index"
          :class="['invoice-item', { 'invoice-item--expanded': expandedCard === index }, `invoice-item--${getStatusKey(invoice)}`]"
        >
          <!-- Collapsed row -->
          <div class="invoice-row" @click="toggleCard(index)">
            <div class="invoice-col invoice-col--ref">
              <span class="invoice-ref">{{ invoice.name }}</span>
              <span class="invoice-label">{{ t('Invoice') }}</span>
            </div>

            <div class="invoice-col invoice-col--customer">
              <span v-if="invoice.customer" class="invoice-customer">{{ invoice.customer.name.substring(0, 28) }}</span>
              <span v-else class="invoice-customer invoice-customer--empty">&mdash;</span>
              <span class="invoice-label">{{ t('Customer') }}</span>
            </div>

            <div class="invoice-col invoice-col--amount">
              <span class="invoice-amount">${{ invoice.amount }}</span>
              <span class="invoice-label">{{ t('Total') }}</span>
            </div>

            <div class="invoice-col invoice-col--date invoice-col--hide-xs">
              <span class="invoice-date">{{ formatDateForDisplay(invoice.invoice_date) }}</span>
              <span class="invoice-label">{{ t('Date') }}</span>
            </div>


            <div class="invoice-col invoice-col--toggle">
              <base-feather-icon
                :icon="expandedCard === index ? 'ChevronUpIcon' : 'ChevronDownIcon'"
                size="18"
                class="invoice-toggle-icon"
              />
            </div>
          </div>

          <!-- Expanded panel -->
          <transition name="expand">
            <div v-show="expandedCard === index" class="invoice-expanded">
              <div class="invoice-expanded-grid">
                <div class="invoice-expanded-item">
                  <span class="invoice-expanded-label">{{ t('Due Date') }}</span>
                  <span class="invoice-expanded-value">{{ formatDateForDisplay(invoice.due_date) || '—' }}</span>
                </div>
                <div class="invoice-expanded-item invoice-col--show-xs">
                  <span class="invoice-expanded-label">{{ t('Invoice Date') }}</span>
                  <span class="invoice-expanded-value">{{ formatDateForDisplay(invoice.invoice_date) }}</span>
                </div>
                <div class="invoice-expanded-item">
                  <span class="invoice-expanded-label">{{ t('Status') }}</span>
                  <span
                    :class="[
                      'invoice-status-badge',
                      `invoice-status-badge--${getStatusKey(invoice)}`,
                      { 'invoice-status-badge--clickable': invoice.status === 1 },
                    ]"
                    :role="invoice.status === 1 ? 'button' : null"
                    :tabindex="invoice.status === 1 ? 0 : null"
                    :title="invoice.status === 1 ? t('Edit paid date') : null"
                    @click.stop="invoice.status === 1 && openMarkPaidModal(invoice)"
                    @keydown.enter.stop="invoice.status === 1 && openMarkPaidModal(invoice)"
                  >
                    {{ t(invoiceStatusText(invoice)) }}
                  </span>
                </div>
                <div v-if="invoice.status === 1 && invoice.paid_date" class="invoice-expanded-item">
                  <span class="invoice-expanded-label">{{ t('Paid Date') }}</span>
                  <span class="invoice-expanded-value">{{ formatDateForDisplay(invoice.paid_date) }}</span>
                </div>
              </div>

              <div class="d-flex align-items-center justify-content-between w-100 invoice-actions">
                <div class="d-flex align-items-center invoice-actions-left">
                  <router-link
                    :to="{ name: 'invoice', params: { id: invoice.id } }"
                    class="invoice-action-btn invoice-action-btn--view"
                  >
                    <base-feather-icon icon="EyeIcon" size="15" />
                    {{ t('View') }}
                  </router-link>

                  <button
                    v-if="invoice.status === 0 || invoice.status === null"
                    class="invoice-action-btn invoice-action-btn--paid"
                    @click.stop="openMarkPaidModal(invoice)"
                  >
                    <base-feather-icon icon="CheckIcon" size="15" />
                    {{ t('Mark Paid') }}
                  </button>

                  <button
                    v-if="invoice.status === 1"
                    class="invoice-action-btn invoice-action-btn--unpaid"
                    @click.stop="updateInvoiceStatus(invoice, 0)"
                  >
                    <base-feather-icon icon="RotateCcwIcon" size="15" />
                    {{ t('Mark Unpaid') }}
                  </button>
                </div>

                <button
                  class="invoice-action-btn invoice-action-btn--delete"
                  @click.stop="showMsgBoxTwo(invoice.id)"
                >
                  <base-feather-icon icon="Trash2Icon" size="15" />
                  {{ t('Delete') }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </template>

    <template v-else-if="!loading">
      <div class="invoice-empty-state">
        <div class="invoice-empty-icon">
          <base-feather-icon icon="FileTextIcon" size="20" />
        </div>
        <p class="invoice-empty-title mb-1">{{ t('No invoices found') }}</p>
        <p class="invoice-empty-copy mb-2">{{ t('Your invoices will appear here once created.') }}</p>
        <b-button :to="{ name: 'add-invoice' }" variant="primary">
          <base-feather-icon icon="PlusIcon" size="14" />
          {{ t('Create Invoice') }}
        </b-button>
      </div>
    </template>

    <invoice-edit-sidebar :invoice="invoice" />
    <mark-paid-modal
      :visible.sync="markPaidModalVisible"
      :invoice-date="markPaidInvoice && markPaidInvoice.invoice_date"
      :initial-paid-date="markPaidInvoice && markPaidInvoice.paid_date"
      @confirm="handleMarkPaidConfirm"
    />
  </section>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import MarkPaidModal from '@/components/uiComponents/MarkPaidModal.vue'
import { formatDateForDisplay, dateNow } from '@/libs/dateUtils.js'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  components: { BaseFeatherIcon, MarkPaidModal },
  data() {
    return {
      invoices: [],
      invoice: {},
      expandedCard: null,
      loading: false,
      t: null,
      now: dateNow(),
      searchQuery: '',
      statusFilter: 'all',
      statusFilterOptions: [
        { value: 'all', label: 'All' },
        { value: 'open', label: 'Open' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
      ],
      markPaidModalVisible: false,
      markPaidInvoice: null,
    }
  },
  created() {
    this.loading = true
    const { t } = useI18nUtils()
    this.t = t
    this.fetchInvoices()
  },
  computed: {
    filteredInvoices() {
      const query = this.searchQuery.trim().toLowerCase()
      return this.invoices.filter(invoice => {
        if (this.statusFilter !== 'all' && this.getStatusKey(invoice) !== this.statusFilter) return false
        if (!query) return true
        return invoice.ref?.toLowerCase().includes(query)
          || invoice.customer?.name.toLowerCase().includes(query)
      })
    },
  },
  methods: {
    async fetchInvoices() {
      try {
        await this.$store.dispatch('invoices/list', ['customer'])
        this.invoices = this.$store.getters['invoices/list']
      } catch (error) {
        this.$toast.error('Failed to load invoices. Please try again.', {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      } finally {
        this.loading = false
      }
    },
    async handleInvoiceDelete(invoiceId) {
      try {
        await this.$store.dispatch('invoices/destroy', invoiceId)
        this.invoices = this.invoices.filter(invoice => invoice.id !== invoiceId)
      } catch (e) {
        this.$toast.error('Something went wrong! Try again later or contact the support.', {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      }
    },
    async updateInvoiceStatus(invoice, status, paidDate = null) {
      try {
        const attributes = { status }
        if (status === 1 && paidDate) {
          attributes.paid_date = paidDate
        }
        const payload = {
          data: {
            type: 'invoices',
            id: invoice.id,
            attributes,
          },
        }
        await this.$store.dispatch('invoices/update', payload)
        invoice.status = status
        invoice.paid_date = status === 1 ? (paidDate || invoice.paid_date) : null
      } catch (e) {
        this.$toast.error('Something went wrong! Try again later or contact the support.', {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      }
    },
    openMarkPaidModal(invoice) {
      this.markPaidInvoice = invoice
      this.markPaidModalVisible = true
    },
    async handleMarkPaidConfirm(paidDate) {
      if (!this.markPaidInvoice) return
      await this.updateInvoiceStatus(this.markPaidInvoice, 1, paidDate)
      this.markPaidInvoice = null
    },
    showMsgBoxTwo(id) {
      this.$bvModal.msgBoxConfirm('Please confirm that you want to delete this invoice.', {
        title: 'Please Confirm',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        cancelVariant: 'primary',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      }).then(value => {
        if (value) this.handleInvoiceDelete(id)
      }).catch(() => {})
    },
    toggleCard(index) {
      this.expandedCard = this.expandedCard === index ? null : index
    },
    getStatusKey(invoice) {
      if (invoice.status === 1) return 'paid'
      if (invoice.status === 0 && invoice.due_date < this.now) return 'overdue'
      return 'open'
    },
    invoiceStatusText(invoice) {
      const key = this.getStatusKey(invoice)
      if (key === 'paid') return 'Paid'
      if (key === 'overdue') return 'Overdue'
      return 'Open'
    },
    formatDateForDisplay,
  },
}
</script>

<style scoped>
/* ── Layout ───────────────────────────────────────────── */
.invoice-list-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.invoice-list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.invoice-list-title {
  font-weight: 500;
  color: rgb(3, 102, 214);
}

.invoice-list-subtitle {
  margin-top: 0.25rem;
  color: #6e6b7b;
  font-size: 0.95rem;
}

/* ── New Invoice button ───────────────────────────────── */
.invoice-new-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  border-radius: 0.358rem;
  border-color: #0366d6;
  background: #0366d6;
  color: #fff !important;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: olor 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, background 0s, border 0s;
  white-space: nowrap;
}

.invoice-new-btn:hover {
  box-shadow: 0 8px 25px -8px rgba(115, 103, 240, 0.5);
}

/* ── Search ───────────────────────────────────────────── */
.invoice-search-row {
  display: inline-grid;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.invoice-search-wrap {
  position: relative;
  width: 100%;
  max-width: 360px;
}

.invoice-search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: #b9b9c3;
  pointer-events: none;
}

.invoice-search-input {
  padding-left: 2.25rem !important;
  border-radius: 0.357rem !important;
  border-color: #d8d6de !important;
}

.invoice-search-input:focus {
  border-color: #0366d6 !important;
  box-shadow: 0 3px 10px 0 rgba(34, 41, 47, 0.1) !important;
}

/* ── Status filter ────────────────────────────────────── */
.invoice-status-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.invoice-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border: 1px solid #d8d6de;
  border-radius: 999px;
  background: #fff;
  color: #6e6b7b;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

.invoice-status-pill:hover {
  border-color: #b9b9c3;
  color: rgba(38, 43, 67, 0.9);
}

.invoice-status-pill--active {
  border-color: #0366d6;
  background: rgba(3, 102, 214, 0.1);
  color: #0366d6;
}

.invoice-status-pill--open.invoice-status-pill--active {
  border-color: #b9b9c3;
  background: #f4f6f8;
  color: #5f6673;
}

.invoice-status-pill--paid.invoice-status-pill--active {
  border-color: rgba(40, 199, 111, 0.5);
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.invoice-status-pill--overdue.invoice-status-pill--active {
  border-color: rgba(234, 84, 85, 0.5);
  background: rgba(245, 54, 92, 0.12);
  color: #c1121f;
}

/* ── Invoice items ────────────────────────────────────── */
.invoice-items {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.invoice-item {
  border: 1px solid #ebe9f1;
  border-left: 3px solid #ebe9f1;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 4px 24px 0 rgba(34, 41, 47, 0.04);
  overflow: hidden;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.invoice-item:hover {
  box-shadow: 0 4px 24px 0 rgba(34, 41, 47, 0.1);
}

.invoice-item--paid {
  border-left-color: #28c76f;
}

.invoice-item--overdue {
  border-left-color: #ea5455;
}

.invoice-item--open {
  border-left-color: #b9b9c3;
}

/* ── Collapsed row ────────────────────────────────────── */
.invoice-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  cursor: pointer;
  user-select: none;
}

.invoice-col {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.invoice-col--ref {
  flex: 0 0 auto;
  min-width: 90px;
}

.invoice-col--customer {
  flex: 1 1 auto;
  min-width: 0;
}

.invoice-col--amount {
  flex: 0 0 auto;
  min-width: 80px;
  text-align: right;
  align-items: flex-end;
}

.invoice-col--date {
  flex: 0 0 auto;
  min-width: 90px;
  text-align: right;
  align-items: flex-end;
}

.invoice-col--status {
  flex: 0 0 auto;
  align-items: flex-end;
}

.invoice-col--toggle {
  flex: 0 0 auto;
  align-items: center;
  padding-left: 0.25rem;
}

.invoice-ref {
  color: rgba(38, 43, 67, 0.9);
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
}

.invoice-customer {
  overflow: hidden;
  color: rgba(38, 43, 67, 0.9);
  font-size: 1rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invoice-customer--empty {
  color: #b9b9c3;
}

.invoice-amount {
  color: rgba(38, 43, 67, 0.9);
  font-weight: 500;
}

.invoice-date {
  color: rgba(38, 43, 67, 0.9);
  font-size: 1rem;
  font-weight: 400;
}

.invoice-label {
  font-weight: 400;
  letter-spacing: 0.02em;
  font-size:0.85rem;
}

.invoice-toggle-icon {
  color: #b9b9c3;
  transition: color 0.15s ease;
}

.invoice-item--expanded .invoice-toggle-icon {
  color: #7367f0;
}

/* ── Status badge ─────────────────────────────────────── */
.invoice-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.55rem;
  border-radius: 0.358rem;
  font-weight: 500;
  white-space: nowrap;
}

.invoice-status-badge--paid {
  color: #15803d;
  background: rgba(34, 197, 94, 0.12);
  border-color: #cfe9dc;
}

.invoice-status-badge--unpaid {
  color: #5f6673;
  background-color: #f4f6f8;
  border-color: #dfe4ea;
}

.invoice-status-badge--overdue {
  background: rgba(245, 54, 92, 0.12);
  color: #c1121f;
  border-color: #f1d0cc;
}

.invoice-status-badge--clickable {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.invoice-status-badge--clickable:hover,
.invoice-status-badge--clickable:focus {
  opacity: 0.85;
  outline: none;
}

/* ── Expanded panel ───────────────────────────────────── */
.invoice-expanded {
  padding: 0.85rem 1rem 1rem;
  border-top: 1px solid #ebe9f1;
  background: #f8f8f8;
}

.invoice-expanded-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  margin-bottom: 0.9rem;
}

.invoice-expanded-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.invoice-expanded-label {
  font-weight: 400;
  letter-spacing: 0.02em;
  font-size: 0.85rem;
}

.invoice-expanded-value {
  color: rgba(38, 43, 67, 0.9);
  font-size: 1rem;
  font-weight: 500;
}

/* ── Actions ──────────────────────────────────────────── */
.invoice-actions {
  gap: 0.5rem;
}

.invoice-actions-left {
  gap: 0.5rem;
  flex-shrink: 0;
}

.invoice-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  background: none;
}

.invoice-action-btn--view {
  color: #0366d6;
  background: transparent;
  border-color: #0366d6;
}

.invoice-action-btn--view:hover {
  background: rgba(3, 102, 214, 0.2);
}

.invoice-action-btn--paid {
  color: #28c76f;
  background: transparent;
  border-color: rgba(40, 199, 111, 0.5);
}

.invoice-action-btn--paid:hover {
  background: rgba(40, 199, 111, 0.12);
}

.invoice-action-btn--unpaid {
  color: #6e6b7b;
  background: transparent;
  border-color: rgba(110, 107, 123, 0.4);
}

.invoice-action-btn--unpaid:hover {
  background: rgba(110, 107, 123, 0.12);
}

.invoice-action-btn--delete {
  color: #ea5455;
  background: transparent;
  border-color: rgba(234, 84, 85, 0.5);
}

.invoice-action-btn--delete:hover {
  background: rgba(234, 84, 85, 0.12);
}

/* ── Loading ──────────────────────────────────────────── */
.invoice-loading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 2rem 0;
  color: #6e6b7b;
  font-size: 0.875rem;
}

/* ── Empty state ──────────────────────────────────────── */
.invoice-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  border: 1px dashed #ebe9f1;
  border-radius: 1rem;
  background: #fafafa;
  text-align: center;
}

.invoice-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.85rem;
  border-radius: 50%;
  color: #0366d6;
  background: rgba(3, 102, 214, 0.1);
}

.invoice-empty-title {
  font-size: 1rem;
  font-weight: 500;
}

.invoice-empty-copy {
  font-size: 0.875rem;
}

/* ── Expand transition ────────────────────────────────── */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease;
}

.expand-enter,
.expand-leave-to {
  opacity: 0;
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 575px) {
  .invoice-col--hide-xs {
    display: none;
  }

  .invoice-col--show-xs {
    display: flex;
  }

  .invoice-search-wrap {
    max-width: 100%;
  }

}

@media (min-width: 576px) {
  .invoice-col--show-xs {
    display: none;
  }
}

@media (max-width: 400px) {
  .invoice-row {
    gap: 0.35rem;
    padding: 0.75rem 0.75rem;
  }

  .invoice-col--status {
    display: none;
  }
}
</style>
