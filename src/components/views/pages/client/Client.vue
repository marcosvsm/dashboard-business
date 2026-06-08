<template>
  <section class="client-page">
    <nav aria-label="breadcrumb">
      <ol class="px-0 pt-1 mb-0 bg-transparent breadcrumb me-sm-6">
        <li class="text-sm breadcrumb-item">
          <router-link :to="{ name: 'client-list' }">{{ t('Client List') }}</router-link>
        </li>
        <li class="text-sm breadcrumb-item active" aria-current="page">{{ t('Client') }}</li>
      </ol>
    </nav>

    <b-row class="mt-2">
      <b-col lg="8">
        <b-card no-body class="client-hero-card mb-2">
          <b-card-body class="client-hero-body">
            <div class="client-hero-header">
              <div class="client-identity">
                <div class="client-avatar">
                  <span>{{ clientInitials }}</span>
                </div>

                <div>
                  <p class="client-eyebrow mb-1">{{ t('Client Profile') }}</p>
                  <h2 class="client-name mb-1">{{ client.name || t('Unnamed Client') }}</h2>
                  <p class="client-subtitle mb-0">
                    {{ invoiceCount }} {{ invoiceCount === 1 ? t('invoice') : t('invoices') }}
                    <span class="client-subtitle-separator">•</span>
                    {{ overdueCount }} {{ overdueCount === 1 ? t('overdue') : t('overdue') }}
                  </p>
                </div>
              </div>

              <div class="client-actions">
                <b-button
                  v-b-toggle.sidebar-invoice-add-new-customer
                  variant="primary"
                  class="client-action-btn"
                >
                  <base-feather-icon icon="EditIcon" size="16" class="mr-50" />
                  {{ t('Edit') }}
                </b-button>
              </div>
            </div>

            <div class="client-contact-grid">
              <div class="client-contact-item">
                <span class="client-contact-label">ABN</span>
                <span class="client-contact-value">{{ client.abn || t('Not added') }}</span>
              </div>
              <div class="client-contact-item">
                <span class="client-contact-label">{{ t('Phone') }}</span>
                <span class="client-contact-value">{{ client.phone || t('Not added') }}</span>
              </div>
              <div class="client-contact-item">
                <span class="client-contact-label">Email</span>
                <span class="client-contact-value">{{ client.email || t('Not added') }}</span>
              </div>
            </div>
          </b-card-body>
        </b-card>

        <b-row>
          <b-col md="6" class="mb-2">
            <b-card class="client-stat-card client-stat-card-success h-100">
              <b-card-body>
                <div class="client-stat-top">
                  <div>
                    <p class="client-stat-label mb-1">{{ t('Amount Received') }}</p>
                    <h3 class="client-stat-value mb-0">{{ formattedAmountReceived }}</h3>
                  </div>
                  <div class="client-stat-icon bg-gradient-green">
                    <base-feather-icon icon="TrendingUpIcon" size="24" />
                  </div>
                </div>
                <p class="mb-0">
                  {{ paidInvoiceCount }} {{ paidInvoiceCount === 1 ? t('paid invoice') : t('paid invoices') }}
                </p>
              </b-card-body>
            </b-card>
          </b-col>

          <b-col md="6" class="mb-2">
            <b-card class="client-stat-card client-stat-card-warning h-100">
              <b-card-body>
                <div class="client-stat-top">
                  <div>
                    <p class="client-stat-label mb-1">{{ t('Outstanding') }}</p>
                    <h3 class="client-stat-value mb-0">{{ formattedOutstandingAmount }}</h3>
                  </div>
                  <div class="client-stat-icon bg-gradient-orange">
                    <base-feather-icon icon="RepeatIcon" size="24" />
                  </div>
                </div>
                <p class="mb-0">
                  {{ overdueCount }} {{ overdueCount === 1 ? t('invoice overdue') : t('invoices overdue') }}
                </p>
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>

        <b-card no-body role="region" aria-labelledby="recent-invoices-title" class="invoice-panel">
          <b-card-body class="invoice-panel-header">
            <div>
              <p class="client-eyebrow mb-1">{{ t('Billing Activity') }}</p>
              <h5 id="recent-invoices-title" class="invoice-panel-title mb-0">{{ t('Last Invoices') }}</h5>
            </div>

            <b-button :to="{ name: 'invoices' }" variant="outline-primary" size="sm" class="invoice-panel-link">
              {{ t('View All') }}
            </b-button>
          </b-card-body>

          <b-card-body class="pt-0">
            <div v-if="recentInvoices.length" class="invoice-list">
              <div
                v-for="invoice in recentInvoices"
                :key="invoice.id"
                class="invoice-item"
              >
                <div class="invoice-item-main">
                  <div class="invoice-item-meta">
                    <p class="invoice-item-date mb-1">{{ formatDateForDisplay(invoice.invoice_date) }}</p>
                    <div class="d-flex align-items-center flex-wrap">
                      <span class="invoice-number">#{{ invoice.name }}</span>
                      <span :class="['invoice-status-badge', invoiceStatusBadgeClass(invoice)]">
                        {{ invoiceStatusLabel(invoice) }}
                      </span>
                    </div>
                  </div>

                  <div class="invoice-item-actions">
                    <span class="invoice-item-amount">{{ currencyFormatter.format(invoice.amount) }}</span>
                    <router-link
                      :to="{ name: 'invoice', params: { id: invoice.id } }"
                      class="invoice-view-link"
                    >
                      <base-feather-icon icon="EyeIcon" size="16" class="mr-50" />
                      {{ t('View') }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="invoice-empty-state">
              <div class="invoice-empty-icon">
                <base-feather-icon icon="AlertCircleIcon" size="18" />
              </div>
              <h6 class="mb-1">{{ t('No invoices could be found') }}</h6>
              <p class="mb-2 text-muted">{{ t('Create the first invoice for this client to start tracking activity here.') }}</p>
              <b-button :to="{ name: 'add-invoice' }" variant="primary" size="sm">
                {{ t('Create Invoice') }}
              </b-button>
            </div>
          </b-card-body>
        </b-card>
      </b-col>

      <b-col lg="4">
        <b-card class="client-side-card mb-2">
          <b-card-body>
            <p class="client-eyebrow mb-1">{{ t('Quick Snapshot') }}</p>
            <h5 class="invoice-panel-title mb-2">{{ t('Account Health') }}</h5>

            <div class="snapshot-row">
              <span>{{ t('Collection rate') }}</span>
              <span class="snapshot-details">{{ collectionRate }}%</span>
            </div>
            <b-progress
              :value="collectionRate"
              max="100"
              height="8px"
              variant="success"
              class="snapshot-progress mb-2"
            />

            <div class="snapshot-row">
              <span>{{ t('Last invoice') }}</span>
              <span class="snapshot-details">{{ lastInvoiceLabel }}</span>
            </div>
            <div class="snapshot-row">
              <span>{{ t('Outstanding invoices') }}</span>
              <span class="snapshot-details">{{ unpaidInvoiceCount }}</span>
            </div>
            <div class="snapshot-row mb-0">
              <span>{{ t('Client email') }}</span>
              <span class="snapshot-text">{{ client.email || t('Not added') }}</span>
            </div>
          </b-card-body>
        </b-card>

        <b-card class="client-side-card client-side-card-accent">
          <b-card-body>
            <p class="client-eyebrow mb-1">{{ t('Next Step') }}</p>
            <h5 class="invoice-panel-title mb-1">{{ t('Keep this client active') }}</h5>
            <p class="text-muted mb-2">
              {{ t('Update details, review recent billing, and keep overdue work visible from one place.') }}
            </p>

            <div class="side-actions">
              <b-button
                v-b-toggle.sidebar-invoice-add-new-customer
                variant="primary"
                block
                class="mb-1"
              >
                {{ t('Update Client Details') }}
              </b-button>
              <b-button :to="{ name: 'add-invoice' }" variant="outline-primary" block>
                {{ t('Create New Invoice') }}
              </b-button>
            </div>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <invoice-sidebar-add-new-customer
      :addCustomerToInvoice="addCustomerToInvoice"
      :customerToEdit="client"
      :invoice-count="invoiceCount"
      @delete-requested="showMsgBoxTwo"
    />
  </section>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { dateNow, formatDateForDisplay } from '@/libs/dateUtils.js'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import InvoiceSidebarAddNewCustomer from '@/components/uiComponents/InvoiceSidebarAddNewCustomer.vue'

const emptyClient = () => ({
  id: null,
  name: '',
  email: '',
  abn: '',
  phone: '',
  invoice: [],
})

export default {
  components: {
    BaseFeatherIcon,
    InvoiceSidebarAddNewCustomer,
  },
  data() {
    return {
      client: emptyClient(),
      isDeleting: false,
      t: null,
      currencyFormatter: new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
      }),
      formatDateForDisplay,
    }
  },
  created() {
    const { t } = useI18nUtils()
    this.t = t
    this.fetchClient()
  },
  computed: {
    invoices() {
      return Array.isArray(this.client.invoice) ? this.client.invoice : []
    },
    recentInvoices() {
      return [...this.invoices]
        .sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date))
        .slice(0, 5)
    },
    invoiceCount() {
      return this.invoices.length
    },
    paidInvoiceCount() {
      return this.invoices.filter(invoice => Number(invoice.status) === 1).length
    },
    unpaidInvoiceCount() {
      return this.invoices.filter(invoice => Number(invoice.status) === 0).length
    },
    overdueCount() {
      return this.invoices.filter(invoice => this.isInvoiceOverdue(invoice)).length
    },
    amountReceived() {
      return this.invoices.reduce((total, invoice) => {
        if (Number(invoice.status) === 1) {
          return total + parseFloat(invoice.amount || 0)
        }
        return total
      }, 0)
    },
    outstandingAmount() {
      return this.invoices.reduce((total, invoice) => {
        if (Number(invoice.status) === 0) {
          return total + parseFloat(invoice.amount || 0)
        }
        return total
      }, 0)
    },
    formattedAmountReceived() {
      return this.currencyFormatter.format(this.amountReceived)
    },
    formattedOutstandingAmount() {
      return this.currencyFormatter.format(this.outstandingAmount)
    },
    collectionRate() {
      if (!this.invoiceCount) return 0
      return Math.round((this.paidInvoiceCount / this.invoiceCount) * 100)
    },
    lastInvoiceLabel() {
      if (!this.recentInvoices.length) return this.t('No invoices yet')
      return this.formatDateForDisplay(this.recentInvoices[0].invoice_date)
    },
    clientInitials() {
      if (!this.client.name) return 'CL'
      return this.client.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('')
    },
    hasInvoices() {
      return this.invoiceCount > 0
    },
  },
  methods: {
    isInvoiceOverdue(invoice) {
      return Number(invoice.status) === 0 && Boolean(invoice.due_date) && invoice.due_date < dateNow()
    },
    invoiceStatusLabel(invoice) {
      if (Number(invoice.status) === 1) return this.t('Paid')
      return this.isInvoiceOverdue(invoice) ? this.t('Overdue') : this.t('Open')
    },
    invoiceStatusBadgeClass(invoice) {
      if (Number(invoice.status) === 1) return 'invoice-status-badge--paid'
      return this.isInvoiceOverdue(invoice) ? 'invoice-status-badge--overdue' : 'invoice-status-badge--unpaid'
    },
    async fetchClient() {
      const id = this.$route.params.id
      await this.$store.dispatch('customers/get', { id, include: ['invoice'] })
      const customer = this.$store.getters['customers/customer']
      this.client = {
        ...emptyClient(),
        ...(customer || {}),
        invoice: Array.isArray(customer && customer.invoice) ? customer.invoice : [],
      }
    },
    addCustomerToInvoice(updateCustomer) {
      this.client = {
        ...this.client,
        id: updateCustomer.id,
        name: updateCustomer.name,
        email: updateCustomer.email,
        abn: updateCustomer.abn,
        phone: updateCustomer.phone,
      }
    },
    extractApiErrorMessage(error) {
      // JSON:API errors come back as { errors: [ { title, detail, status } ] }.
      // We prefer `detail` (specific reason, e.g. "Delete the related invoices
      // first.") and fall back to `title`, then to a generic string.
      const errors = error && error.response && error.response.data && error.response.data.errors
      if (Array.isArray(errors) && errors.length) {
        return errors[0].detail || errors[0].title || null
      }
      return null
    },
    async handleClientDelete() {
      this.isDeleting = true
      try {
        await this.$store.dispatch('customers/destroy', this.client.id)
        this.$toast.success(`Client ${this.client.name} deleted`, {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 2000,
        })
        this.$router.push({ name: 'client-list' })
      } catch (error) {
        const message = this.extractApiErrorMessage(error) || this.t('Failed to delete client. Please try again.')
        this.$toast.error(message, {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 4000,
        })
      } finally {
        this.isDeleting = false
      }
    },
    showMsgBoxTwo() {
      this.$bvModal.msgBoxConfirm(`Are you sure you want to delete the ${this.client.name} client? This action cannot be undone.`, {
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
      })
        .then(value => {
          if (value) this.handleClientDelete()
        })
        .catch(() => {})
    },
  },
}
</script>

<style scoped>
.client-page {
  padding-bottom: 1rem;
}

.client-hero-card,
.client-stat-card,
.invoice-panel,
.client-side-card {
  border: 1px solid #e6edf7;
  border-radius: 0.428rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.client-hero-card {
  background:
    radial-gradient(circle at top right, rgba(45, 206, 204, 0.18), transparent 28%),
    linear-gradient(135deg, #0f4c81 0%, #0366d6 55%, #2d8cff 100%);
  border: none;
}

.client-hero-body {
  padding: 1.75rem;
  color: #fff;
}

.client-hero-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.client-identity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.25rem;
  height: 4.25rem;
  border-radius: 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 32px rgba(7, 35, 74, 0.22);
}

.client-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0366d6;
}

.client-hero-body .client-eyebrow {
  color: rgba(255, 255, 255, 0.72);
}

.client-name {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
}

.client-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.client-subtitle-separator {
  margin: 0 0.45rem;
}

.client-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.client-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 9.5rem;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
}

.client-contact-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.client-contact-item {
  padding: 1rem 1.1rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.client-contact-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 0.35rem;
}

.client-contact-value {
  display: block;
  color: #fff;
  font-weight: 600;
  word-break: break-word;
}

.client-stat-card {
  background: #fff;
}

.client-stat-card .card-body,
.client-side-card .card-body {
  padding: 1.25rem;
}

.client-stat-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.client-stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0366d6;
}

.client-stat-value {
  color: rgba(38, 43, 67, 0.9);
  font-size: 1.714rem;
}


.client-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.95rem;
  color: #fff;
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.12);
}

.invoice-panel {
  background: linear-gradient(180deg, #fbfdff 0%, #ffffff 100%);
}

.invoice-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
}

.invoice-panel-title {
  color: rgba(38, 43, 67, 0.9);
  font-weight: 700;
}

.invoice-panel-link {
  border-radius: 999px;
}

.invoice-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.invoice-item {
  padding: 1rem 1.05rem;
  border-radius: 0.9rem;
  border: 1px solid #edf2f8;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.invoice-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}

.invoice-item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.invoice-item-date {
  font-weight: 500;
  color: rgba(38, 43, 67, 0.9);
}

.invoice-number {
  color: rgba(38, 43, 67, 0.9);
}

.invoice-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.6rem;
  padding: 0.22rem 0.55rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1;
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

.invoice-item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.invoice-item-amount {
  font-weight: 500;
  color: rgba(38, 43, 67, 0.9);
  white-space: nowrap;
}

.invoice-view-link {
  display: inline-flex;
  align-items: center;
  color: #0366d6;
  font-weight: 600;
}

.invoice-empty-state {
  padding: 2rem 1rem;
  text-align: center;
}

.invoice-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  background: rgba(3, 102, 214, 0.1);
  color: #0366d6;
}

.client-side-card {
  background: #fff;
}

.client-side-card-accent {
  background:
    radial-gradient(circle at top right, rgba(45, 206, 204, 0.18), transparent 26%),
    linear-gradient(180deg, #ffffff 0%, #f4f9ff 100%);
}

.snapshot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid #edf2f8;
  color: #4f5d73;
}

.snapshot-row.mb-0 {
  border-bottom: none;
  padding-bottom: 0;
}

.snapshot-progress {
  border-radius: 999px;
  background: #e8eef7;
}

.snapshot-text {
  max-width: 16rem;
  text-align: right;
  word-break: break-word;
  color:rgba(38, 43, 67, 0.9);
  font-weight: 600;
}

.side-actions .btn {
  border-radius: 0.85rem;
}

.bg-gradient-green {
  background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%);
}

.bg-gradient-orange {
  background: linear-gradient(87deg, #fb6340 0, #fbb140 100%);
}

@media (max-width: 991.98px) {
  .client-contact-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .client-hero-body {
    padding: 1.25rem;
  }

  .client-hero-header,
  .invoice-panel-header,
  .invoice-item-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .client-actions,
  .invoice-item-actions {
    width: 100%;
  }

  .client-action-btn,
  .invoice-item-actions {
    justify-content: flex-start;
  }

  .client-name {
    font-size: 1.6rem;
  }
}

.snapshot-details{
  color:rgba(38, 43, 67, 0.9);
  font-weight: 600;
}
</style>
