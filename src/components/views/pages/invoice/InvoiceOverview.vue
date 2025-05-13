<template>
    <!-- Main Content -->
    <!-- Error Message -->
  <section class="invoice-edit-wrapper">
    <!-- Loading Spinner -->
    <div v-if="loading" class="text-center my-5">
      <b-spinner label="Loading..." />
      <p>{{ t('Loading invoice data...') }}</p>
    </div>
    <div v-else-if="errors" class="text-center my-5">
      <b-alert variant="danger" show>
        <h4 class="alert-heading">{{ t('Error') }}</h4>
        <p>{{ t(errors) }}</p>
      </b-alert>
    </div>
    <b-row v-else class="invoice-edit">
      <b-col cols="12" xl="9" md="8">
        <b-form @submit.prevent="saveInvoice">
          <b-card no-body class="invoice-preview-card">
            <invoice-header :invoiceData="invoiceData" :isOverviewPage="true" />
            <hr class="invoice-spacing">
            <invoice-body 
              :invoiceData="invoiceData" 
              :companies="companies" 
              :customers="customers" 
              :addCustomerToInvoice="addCustomerToInvoice"
              :formErrors="formErrors"
            />
            <hr class="invoice-spacing">
            <b-card-body v-if="noteSwitch" class="invoice-padding pt-0">
              <span class="font-weight-bold">{{ t('Note') }}</span>
              <b-form-textarea 
                v-model="invoiceData.note" 
                placeholder="Additional Details:"
              />
            </b-card-body>
          </b-card>
        </b-form>
      </b-col>
      <b-col cols="12" md="4" xl="3" class="invoice-actions mt-md-0 mt-2">
        <b-card>
          <pdf 
            :invoiceData="invoiceData" 
            :paymentDetails="paymentDetails" 
            :selectedPaymentMethod="selectedPaymentMethod" 
          />
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-primary"
            block
            @click="saveInvoice()"
            disabled
          >
            {{ t('Save Changes') }}
          </b-button>
        </b-card>
        <!-- ... rest of the sidebar ... -->
         <div 
          class="mt-2"
        >
          <div 
            class="d-flex justify-content-between align-items-center my-1"
          >
            <label 
              for="noteDetails"
            >
              {{ t('Note') }}   
            </label>
            <b-form-checkbox
              id="noteDetails"
              v-model="noteSwitch"
              switch
            />
          </div>
          <!-- Client Notes -->
          <div 
            class="d-flex justify-content-between align-items-center my-1"
          >
            <label 
              for="paymentDetails"
            >
              {{ t('Payment details') }}
            </label>
            <b-form-checkbox
              id="paymentDetails"
              v-model="paymentDetails"
              switch
            />
          </div>
           <div 
              class="mb-1"
              v-if="paymentDetails"
            >
              <v-select 
                v-model="selectedPaymentMethod" 
                id="payment-method"
                :options="Object.values(paymentMethods)"
                label="name"
                input-id="payment-id"
                :clearable="false"
              >
                <template  #open-indicator>
                  <base-feather-icon icon="ChevronDownIcon" />
                </template>
              </v-select>
            </div>
          <div 
            v-if="invoiceData.company && paymentDetails && selectedPaymentMethod === 'PAYID'" 
            class="mb-2"
          >
            <b-input 
              v-if="invoiceData.company.paymentDetail"
              id="payID" 
              v-model="invoiceData.company.paymentDetail.payid" 
              type="text" 
              v-b-tooltip.hover :title="t('To update your PAYID, please visit My Business > Business page')"
              readonly
            />
            <!-- PayID Input Section -->
            <div 
              v-if="!invoiceData.company.paymentDetail && paymentDetails && invoiceData.company.id" 
              class="payid-setup-section"
            >
              <span
                class="btn btn-sm"
                v-b-toggle.sidebar-payment-method>
                <base-feather-icon
                  icon="PlusCircleIcon"
                  size="22"
                  color="#4caf50"
                />
                {{ t('ADD new PayID') }}
              </span>
            </div>
          </div>
          <div v-if="selectedPaymentMethod === 'Bank Account' && paymentDetails" class="mb-2">
            <label for="bankName">{{ t('Bank Name') }}</label>
            <b-input 
              id="bankName" 
              v-model="bankName" 
              type="text" 
            />
            <label for="bsb">BSB</label>
            <b-input
              id="bsb" 
              type="text" 
              placeholder="000-000"
              v-model="bsb" 
            />
            <label for="account">{{ t('Account') }}</label>
            <b-input
              id="account" 
              type="text" 
              placeholder="0000 0000"
              v-model="account"
            />
            <label for="accountName">{{ t('Account Name') }}</label>
            <b-input
              id="accountName" 
              type="text"
              v-model="accountName"
            />
          </div>
        </div>
      </b-col>
    </b-row>
    <payment-method-sidebar v-if="invoiceData.company" :company="invoiceData.company" @payment-added="handlePaymentAdded" />
  </section>
</template>

<script>
import { ref, getCurrentInstance, watch } from 'vue'
import store from '@/store'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import InvoiceHeader from '@/components/uiComponents/InvoiceHeader.vue'
import InvoiceBody from '@/components/uiComponents/InvoiceBody.vue'
import Pdf from '@/components/uiComponents/Pdf.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import PaymentMethodSidebar from '@/components/uiComponents/PaymentMethodSidebar.vue'
import { BSpinner, BAlert } from 'bootstrap-vue' // Add this import

export default {
  components: {
    BaseFeatherIcon,
    vSelect,
    InvoiceHeader,
    InvoiceBody,
    Pdf,
    PaymentMethodSidebar,
    BSpinner, // Register the spinner component
    BAlert, // Register BAlert
  },
  directives: {
    Ripple,
  },
  data(){
    return{
      formErrors: Object
    }
  },
  methods: {
    async saveInvoice() {
      const data = { 
        data: {
          type: "invoices",
          id: this.invoiceData.id,
          attributes: {
            name: this.invoiceData.number,
            invoice_date: this.invoiceData.date,
            due_date: this.invoiceData.dueDate,
            amount: this.invoiceData.amount,
            ref: this.invoiceData.number,
            company_id: this.invoiceData.company?.id,
            customer_id: this.invoiceData.customer?.id,
            items: this.invoiceData.items,
            note: this.invoiceData.note
          },
          relationships: {
            company: {
              data: this.invoiceData.company ? { type: "companies", id: this.invoiceData.company.id } : null
            },
          },
        }
      }
      try {
        await this.$store.dispatch('invoices/update', data)
        await this.$store.dispatch('alerts/showNotification', {
          message: "Invoice updated successfully",
          type: "success"
        })
      } catch (e) {
        console.log('Response data:', e.response?.data)
        await this.$store.dispatch('alerts/showNotification', {
          message: "Something went wrong! Try again later or contact support.",
          type: "error"
        })
      }
    },
    formatPrice(value) {
      return Number(value).toFixed(2)
    },
  },
  setup() {
    const { proxy } = getCurrentInstance()
    const { t } = useI18nUtils()

    const invoiceData = ref({})
    const customers = ref([])
    const companies = ref([])
    const paymentMethods = ['PAYID', 'Bank Account']
    const paymentDetails = ref(true)
    const noteSwitch = ref(false)
    const selectedPaymentMethod = ref('PAYID')
    const bankName = ref('')
    const bsb = ref('')
    const account = ref('')
    const accountName = ref('')
    const loading = ref(true) // Add loading state
    const errors = ref(null) // Add error state

    const getInvoice = async () => {
      try {
        const id = proxy.$route.params.id
        await store.dispatch('invoices/get', { id: id, include: ['company','company.paymentDetail','customer','items'] })
        const rawInvoice = store.getters["invoices/invoice"]
        if (!rawInvoice) {
          throw new Error('Invoice not found')
        }
        // Map the raw API response to the expected structure
        invoiceData.value = {
          id: rawInvoice.id,
          number: rawInvoice.name || rawInvoice.ref,
          date: rawInvoice.invoice_date,
          dueDate: rawInvoice.due_date,
          status: rawInvoice.status,
          amount: rawInvoice.amount,
          note: rawInvoice.note || '',
          company: rawInvoice.company
            ? rawInvoice.company 
            : null,
          customer: rawInvoice.customer || null,
          items: rawInvoice.items || [], // Adjust if items come from elsewhere
        }      

        // Initialize payment details
        if (invoiceData.value.note?.includes('BSB')) {
          selectedPaymentMethod.value = 'Bank Account'
          const noteLines = invoiceData.value.note.split('\n')
          bankName.value = noteLines[2] || ''
          bsb.value = noteLines[3]?.replace('BSB: ', '') || ''
          account.value = noteLines[4] || ''
          accountName.value = noteLines[5] || ''
        }
        noteSwitch.value = !!invoiceData.value.note

      } catch (error) {
        if (error.response?.data?.errors[0]?.status === '403') {
          errors.value = 'Invoice not found'
        } else if (error.response?.data?.errors[0]?.status === '404') {
          errors.value = 'Invoice not found'
        } else {
          errors.value = 'Failed to load invoice data. Please try again later'
        }
      }
    }

    const getCustomers = async () => {
      try {
        await store.dispatch('customers/list')
        customers.value = store.getters["customers/list"]
      } catch (error) {
        console.error('Error fetching customers:', error)
      }
    }

    const getCompanies = async () => {
      try {
        await store.dispatch('companies/list')
        companies.value = store.getters["companies/list"]
      } catch (error) {
        console.error('Error fetching companies:', error)
      }
    }

    const addCustomerToInvoice = (newCustomer) => {
      customers.value.push(newCustomer)
      invoiceData.value.customer = newCustomer
    }

    watch([bankName, bsb, account, accountName], ([newBankName, newBsb, newAccount, newAccountName]) => {
      if (selectedPaymentMethod.value === 'Bank Account') {
        invoiceData.value.note = `Account Details:\n\n${newBankName}\nBSB: ${newBsb}\nAccount: ${newAccount}\n${newAccountName}`
        if (!newBankName && !newBsb && !newAccount && !newAccountName) {
          invoiceData.value.note = ''
        }
      }
    })

    const handlePaymentAdded = (payment) => {
      invoiceData.value.company.paymentDetail = payment
    }

      // Load initial data with loading state
    const loadInitialData = async () => {
      try {
        loading.value = true // Start loading
        await Promise.all([
          getInvoice(),
          getCustomers(),
          getCompanies()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        loading.value = false // Stop loading regardless of success or failure
      }
    }

    loadInitialData()

    return {
      invoiceData,
      customers,
      companies,
      paymentMethods,
      paymentDetails,
      noteSwitch,
      selectedPaymentMethod,
      bankName,
      bsb,
      account,
      accountName,
      t,
      addCustomerToInvoice,
      handlePaymentAdded,
      loading, // Expose loading state
      errors, // Expose error state
    }
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-select.scss';
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';

</style>