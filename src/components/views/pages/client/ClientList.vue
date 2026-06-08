<template>
  <section class="client-list-page">
    <nav aria-label="breadcrumb">
      <ol class="px-0 pt-1 mb-0 bg-transparent breadcrumb me-sm-6">
        <li class="text-sm breadcrumb-item">
          <router-link :to="{ name: 'client-list' }">{{ t('Client') }}</router-link>
        </li>
        <li class="text-sm breadcrumb-item active" aria-current="page">{{ t('List') }}</li>
      </ol>
    </nav>
    <div class="client-list-header mb-2">
      <div>
        <h4 class="client-list-title mb-0">
          {{ t('Client Directory') }}
        </h4>
        <p class="client-list-subtitle mb-0">{{ t('Manage your clients.') }}</p>
      </div>
      <b-button
            variant="outline-primary"
            class="client-list-add-btn"
            v-b-toggle.sidebar-invoice-add-new-customer
          >
            <base-feather-icon icon="PlusIcon" size="16" class="mr-50" />
            {{ t('Add Client') }}
          </b-button>
    </div>

    <div class="client-search-row">
      <div class="client-search-wrap">
        <base-feather-icon icon="SearchIcon" size="15" class="client-search-icon" />
        <b-form-input
            v-model="searchQuery"
            class="client-search-input"
            :placeholder="t('Search client by name, email or ABN...')"
          />
      </div>
       <div class="client-toolbar-meta">
          <span class="client-toolbar-count">
            {{ filteredCustomers.length }} {{ filteredCustomers.length === 1 ? t('client') : t('clients') }}
          </span>
        </div>
    </div>

    <template v-if="loading">
      <b-card class="client-state-card">
        <b-card-body class="client-state-body">
          <b-spinner class="align-middle mb-1" variant="primary" />
          <h6 class="mb-1">{{ t('Loading') }}...</h6>
          <p class="mb-0 text-muted">{{ t('We are preparing your client list.') }}</p>
        </b-card-body>
      </b-card>
    </template>

    <template v-else-if="filteredCustomers.length">
      <b-row>
        <b-col
          v-for="customer in filteredCustomers"
          :key="customer.id"
          xl="6"
          class="mb-2"
        >
          <b-card class="client-list-card h-100">
            <b-card-body class="client-list-card-body">
              <div class="client-list-card-top">
                <div class="client-list-card-identity">
                  <div class="client-chip">
                    {{ customerInitials(customer) }}
                  </div>

                  <div>
                    <p class="client-list-card-label mb-1">{{ t('Client') }}</p>
                    <h5 class="client-list-card-name mb-1">{{ customer.name || t('Unnamed Client') }}</h5>
                    <p class="client-list-card-email mb-0">{{ customer.email || t('No email added') }}</p>
                  </div>
                </div>

                <span class="client-list-card-badge">
                  {{ customer.abn ? 'ABN' : t('Profile') }}
                </span>
              </div>

              <div class="client-list-card-details">
                <div class="client-detail-row">
                  <span>ABN</span>
                  {{ customer.abn || t('Not added') }}
                </div>
                <div class="client-detail-row">
                  <span>{{ t('Phone') }}</span>
                  {{ customer.phone || t('Not added') }}
                </div>
              </div>

              <div class="client-list-card-actions">
                <router-link
                  :to="{ name: 'client', params: { id: customer.id } }"
                  class="client-view-link"
                >
                  <base-feather-icon icon="EyeIcon" size="16" class="mr-50" />
                  {{ t('View Client') }}
                </router-link>

              </div>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </template>

    <template v-else>
      <b-card class="client-state-card">
        <b-card-body class="client-state-body">
          <div class="client-state-icon">
            <base-feather-icon icon="AlertCircleIcon" size="18" />
          </div>
          <h5 class="mb-1">
            {{ searchQuery.trim() ? t('No matching clients found') : t('No clients could be found') }}
          </h5>
          <p class="mb-2 text-muted">
            {{
              searchQuery.trim()
                ? t('Try a different name, email, or ABN search.')
                : t('Create your first client to start building your directory.')
            }}
          </p>
          <b-button
            variant="primary"
            v-b-toggle.sidebar-invoice-add-new-customer
          >
            {{ t('Create Client') }}
          </b-button>
        </b-card-body>
      </b-card>
    </template>

    <invoice-sidebar-add-new-customer :addCustomerToInvoice="addCustomerToInvoice" />
  </section>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import InvoiceSidebarAddNewCustomer from '@/components/uiComponents/InvoiceSidebarAddNewCustomer.vue'
import { VBToggle } from 'bootstrap-vue'

export default {
  components: {
    BaseFeatherIcon,
    InvoiceSidebarAddNewCustomer,
    VBToggle,
  },
  directives: {
    VBToggle,
  },
  data() {
    return {
      customers: [],
      loading: false,
      isDeleting: false,
      searchQuery: '',
      t: null,
    }
  },
  created() {
    const { t } = useI18nUtils()
    this.t = t
    this.loading = true
    this.fetchCustomers()
  },
  computed: {
    filteredCustomers() {
      if (!this.searchQuery.trim()) return this.customers
      const query = this.searchQuery.trim().toLowerCase()
      return this.customers.filter(customer =>
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.abn?.toLowerCase().includes(query),
      )
    },
  },
  methods: {
    async fetchCustomers() {
      try {
        await this.$store.dispatch('customers/list')
        this.customers = this.$store.getters['customers/list'] || []
      } catch (error) {
        this.$toast.error(this.t('Failed to load customers. Please try again.'), {
          position: 'top-right',
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      } finally {
        this.loading = false
      }
    },
    customerInitials(customer) {
      if (!customer?.name) return 'CL'
      return customer.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('')
    },
    async handleClientDelete(customer) {
      this.isDeleting = true
      try {
        await this.$store.dispatch('customers/destroy', customer.id)
        this.customers = this.customers.filter(c => c.id !== customer.id)
        this.$toast.success(`Client ${customer.name} deleted`, {
          position: 'top-right',
          icon: CheckCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 2000,
        })
      } catch (error) {
        this.$toast.error(this.t('Failed to delete client. Please try again.'), {
          position: 'top-right',
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      } finally {
        this.isDeleting = false
      }
    },
    showMsgBoxTwo(customer) {
      this.$bvModal.msgBoxConfirm(`Are you sure you want to delete ${customer.name} client? This action cannot be undone.`, {
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
          if (value) this.handleClientDelete(customer)
        })
    },
    addCustomerToInvoice(newCustomer) {
      if (!newCustomer?.id) return
      const exists = this.customers.some(customer => customer.id === newCustomer.id)
      if (exists) {
        this.customers = this.customers.map(customer => (customer.id === newCustomer.id ? { ...customer, ...newCustomer } : customer))
        return
      }
      this.customers = [newCustomer, ...this.customers]
    },
  },
}
</script>

<style scoped>
.client-list-page {
  padding-bottom: 1rem;
}

.client-list-card,
.client-state-card {
  border: 1px solid #e6edf7;
  border-radius: 0.428rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  gap:1rem;
}


.client-list-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  font-weight: 600;
  color: #0366d6;
}

.client-toolbar-card,
.client-list-card,
.client-state-card {
  background: #fff;
}

.client-toolbar-card .card-body,
.client-list-card .card-body,
.client-state-card .card-body {
  padding: 1.25rem;
}

.client-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.client-search-wrap {
  position: relative;
  flex: 1;
}

.client-search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #6b7a90;
  pointer-events: none;
}

.client-search-input {
  min-height: 3rem;
  padding-left: 2.65rem;
  border-radius: 999px;
  border: 1px solid #d9e3f0;
  background: #fbfdff;
}

.client-toolbar-count {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  background: #eef5ff;
  color: #0366d6;
  font-weight: 700;
  white-space: nowrap;
}

.client-list-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.client-list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.client-list-card-body {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  height: 100%;
}

.client-list-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.client-list-card-identity {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.client-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #0366d6;
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
}

.client-list-card-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(38, 43, 67, 0.9);
}

.client-list-card-name {
  color: #132238;
  font-weight: 700;
}

.client-list-card-email {
  word-break: break-word;
}

.client-list-card-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: #eef5ff;
  color: #0366d6;
  font-size: 0.74rem;
  font-weight: 700;
}

.client-list-card-details {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border-radius: 0.428rem;
  background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
  border: 1px solid #edf2f8;
}

.client-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.client-list-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
}

.client-view-link {
  display: inline-flex;
  align-items: center;
  color: #0366d6;
  font-weight: 600;
}

.client-delete-btn {
  border-radius: 999px;
}

.client-state-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 15rem;
  text-align: center;
}

.client-state-icon {
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

@media (max-width: 767.98px) {
  .client-toolbar,
  .client-list-card-top,
  .client-list-card-actions,
  .client-detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .client-list-title {
    font-size: 1.6rem;
  }

  .client-toolbar-count,
  .client-delete-btn {
    width: 100%;
    justify-content: center;
  }
}

/* ── Search ───────────────────────────────────────────── */
.client-search-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom:1rem;
}

.client-search-wrap {
  position: relative;
  width: 100%;
  max-width: 360px;
}

.client-search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: #b9b9c3;
  pointer-events: none;
}

.client-search-input {
  padding-left: 2.25rem !important;
  border-radius: 0.357rem !important;
  border-color: #d8d6de !important;
}

.client-search-input:focus {
  border-color: #0366d6 !important;
  box-shadow: 0 3px 10px 0 rgba(34, 41, 47, 0.1) !important;
}

.client-list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top:1rem;
}

.client-list-title {
  font-weight: 500;
  color:rgb(3, 102, 214);
}

.client-list-subtitle {
  margin-top: 0.25rem;
  color: #6e6b7b;
  font-size: 0.95rem;
}
</style>
