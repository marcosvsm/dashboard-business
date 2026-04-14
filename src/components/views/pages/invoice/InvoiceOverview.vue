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
              <div class="d-flex justify-content-end mt-1">
                <span class="text-muted small">
                  {{ invoiceData.note?.length || 0 }} / 1000
                </span>
              </div>
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
            :validateForm="validateForm"
          />
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-primary"
            block
            class="mb-75"
            :disabled="!invoiceData.id"
            @click="showSendModal = true"
          >
            {{ t('Send Email') }}
          </b-button>
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-primary"
            block
            class="mb-75"
            :disabled="!invoiceData.id || shareLinkState === 'loading'"
            @click="shareInvoice"
          >
            <b-spinner v-if="shareLinkState === 'loading'" small class="mr-50" />
            <span v-if="shareLinkState === 'loading'">{{ t('Generating…') }}</span>
            <span v-else-if="shareLinkState === 'copied'">&#10003; {{ t('Link Copied!') }}</span>
            <span v-else>{{ t('Copy Link') }}</span>
          </b-button>
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-primary"
            block
            :disabled="!hasInvoiceChanges"
            @click="saveInvoice()"
          >
            {{ t('Save Changes') }}
          </b-button>
        </b-card>
        <div
          v-if="manualShareCopyVisible"
          class="mt-2 p-2 border rounded bg-light"
        >
          <div class="small text-muted mb-1">
            {{ t('Copy this link manually if automatic copy is blocked.') }}
          </div>

          <div class="d-flex align-items-center">
            <b-form-input
              ref="manualShareCopyRef"
              :value="manualShareCopyText"
              readonly
              class="mr-1"
            />

            <b-button
              size="sm"
              variant="primary"
              @click="selectManualLink"
            >
              {{ t('Select') }}
            </b-button>
          </div>
        </div>
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
    <send-invoice-modal
      v-if="invoiceData.id"
      :invoice="invoiceData"
      :visible.sync="showSendModal"
    />
  </section>
</template>

<script>
import { ref, getCurrentInstance, watch, computed } from 'vue'
import store from '@/store'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import InvoiceHeader from '@/components/uiComponents/InvoiceHeader.vue'
import InvoiceBody from '@/components/uiComponents/InvoiceBody.vue'
import Pdf from '@/components/uiComponents/Pdf.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import PaymentMethodSidebar from '@/components/uiComponents/PaymentMethodSidebar.vue'
import SendInvoiceModal from '@/components/uiComponents/SendInvoiceModal.vue'
import { BSpinner, BAlert } from 'bootstrap-vue' // Add this import

export default {
  components: {
    BaseFeatherIcon,
    vSelect,
    InvoiceHeader,
    InvoiceBody,
    Pdf,
    PaymentMethodSidebar,
    SendInvoiceModal,
    BSpinner, // Register the spinner component
    BAlert, // Register BAlert
  },
  directives: {
    Ripple,
  },
  methods: {
    validateForm() {
      const errors = {}
      let isValid = true

            // Validate customer
      if (!this.invoiceData.customer || !this.invoiceData.customer.id) {
        errors.customer = 'Customer is required'
        isValid = false
      }

      // Validate company
      if (!this.invoiceData.company || !this.invoiceData.company.id) {
        errors.company = 'Company is required'
        isValid = false
      }

      // Validate items
      let hasValidItem = false
      if (!this.invoiceData.items || !this.invoiceData.items.length) {
        errors.items = 'At least one item is required'
        isValid = false
      } else {
        this.invoiceData.items.forEach((item, index) => {
          const qty = parseFloat(item.quantity)
          const price = parseFloat(item.price)

          if (!qty || qty < 1) {
            errors[`quantity-${index}`] = 'Quantity must be at least 1'
            isValid = false
          }
          if (!price || price < 0.01) {
            errors[`price-${index}`] = 'Price must be greater than 0'
            isValid = false
          }
          if (qty >= 1 && price >= 0.01) {
            hasValidItem = true
          }
        })
      }

      // Update formErrors reactively
      this.formErrors = { ...errors }

      // Scroll to first error
      if (!isValid) {
        this.$nextTick(() => {
          const firstErrorKey = Object.keys(this.formErrors)[0]
          if (firstErrorKey) {
            if (firstErrorKey === 'company') {
              document.querySelector('#companies-id')?.scrollIntoView({ behavior: 'smooth' })
            } else if (firstErrorKey.startsWith('quantity-') || firstErrorKey.startsWith('price-')) {
              const index = firstErrorKey.split('-')[1]
              document.querySelector(`.repeater-form .row:nth-child(${parseInt(index) + 1})`)?.scrollIntoView({ behavior: 'smooth' })
            } else if (firstErrorKey === 'items') {
              document.querySelector('.form-item-section')?.scrollIntoView({ behavior: 'smooth' })
            }
          }
        })
      }

      return isValid
    },
        async saveInvoice() {
      if(!this.hasInvoiceChanges){
        return
      }
      
      const isValid = this.validateForm()
      if (!isValid) {
        this.showValidationError()
        return
      }

      try {
        const data = this.buildRequestData()
        await this.$store.dispatch('invoices/update', data)
        this.originalInvoiceSnapshot = this.normalizeInvoiceForComparison(this.invoiceData)
        this.$toast.success(`Invoice updated: ${this.invoiceData.number}`, {
          position: "top-right",
          closeButton: false,
          hideProgressBar: true,
          timeout: 2000
        })
      } catch (e) {
        console.error('Update error:', e)
        this.$toast.error('Something went wrong! Try again later.', {
          position: "top-right",
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000
        })
      }
    },
    
    buildRequestData() {
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
            note: this.invoiceData.note,
            items: this.invoiceData.items.map(item => ({
              id: item.id || undefined,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              amount: item.amount,
              product_id: item.productId || null,
            }))
          },
          relationships: {
            company: {
              data: this.invoiceData.company ? { 
                type: "companies", 
                id: this.invoiceData.company.id 
              } : null
            },
            customer: {
              data: this.invoiceData.customer ? { 
                type: "customers", 
                id: this.invoiceData.customer.id 
              } : null
            },
          },
        }
      }
      
      return data
    },
    
    showValidationError() {
      this.$nextTick(() => {
        this.$toast.error('Please correct the errors in the form before saving the invoice.', {
          position: "top-right",
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000
        })
      })
    },
    formatPrice(value) {
      return Number(value).toFixed(2)
    },
  },
  setup() {
    const { proxy } = getCurrentInstance()
    const { t } = useI18nUtils()
    const formErrors = ref({})
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
    const showSendModal = ref(false)
    const originalInvoiceSnapshot = ref(null)
    const manualShareCopyVisible = ref(false)
    const manualShareCopyText = ref('')
    const manualShareCopyRef = ref(null)

    // Share Invoice: 'idle' | 'loading' | 'copied'
    const shareLinkState = ref('idle')
    let shareLinkResetTimeout = null

    const setShareLinkState = (state) => {
      shareLinkState.value = state

      if (shareLinkResetTimeout) {
        clearTimeout(shareLinkResetTimeout)
        shareLinkResetTimeout = null
      }

      if (state === 'copied') {
        shareLinkResetTimeout = setTimeout(() => {
          shareLinkState.value = 'idle'
          shareLinkResetTimeout = null
        }, 3000)
      }
    }

    const copyTextToClipboard = async (text) => {
      if (
        window.isSecureContext &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        try {
          await navigator.clipboard.writeText(text)
          return true
        } catch (error) {
          console.warn('navigator.clipboard.writeText failed:', error)
        }
      }

      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.top = '0'
      textarea.style.left = '0'
      textarea.style.opacity = '0'
      textarea.style.pointerEvents = 'none'

      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()

      if (typeof textarea.setSelectionRange === 'function') {
        textarea.setSelectionRange(0, textarea.value.length)
      }

      let copied = false

      try {
        copied = document.execCommand('copy')
      } catch (error) {
        console.warn('document.execCommand("copy") failed:', error)
      }

      document.body.removeChild(textarea)

      return copied
    }

    const shareInvoice = async () => {
      if (!invoiceData.value.id || shareLinkState.value === 'loading') return

      setShareLinkState('loading')

      try {
        const data = await store.dispatch('invoices/getSignedLink', invoiceData.value.id)
        const invoiceUrl = data?.invoice_url || ''
        
        if (!invoiceUrl){
          throw new Error('Missing invoice URL')
        }

        const copied = await copyTextToClipboard(invoiceUrl)

        if (copied) {
          setShareLinkState('copied')

          proxy.$toast.success('Link Copied!',{
            position: 'top-right',
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000,
          })
          manualShareCopyVisible.value = false
          manualShareCopyText.value = ''

          return
        }

        // Fallback UI for browsers that block programmatic copy after async work.
        manualShareCopyText.value = invoiceUrl
        manualShareCopyVisible.value = true
        setShareLinkState('idle')
        const message = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
          ? t('Automatic copy blocked. Tap Select, then tap and hold to copy.')
          : t('Automatic copy blocked. Use the Select button below.')

        proxy.$toast.info(message, {
          position: 'top-right',
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      }catch (e){
        setShareLinkState('idle')

        proxy.$toast.error('Could not copy link. Try again.', {
          position: 'top-right',
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })

        console.error('shareInvoice failed:', e)
      } 
    }

    const selectManualLink = () => {
      const el = manualShareCopyRef.value
      if (!el) return

      const input = el.$el ? el.$el.querySelector('input') : el

      if (input) {
        input.focus()

        if (typeof input.select === 'function') {
          input.select()
        }

        if (typeof input.setSelectionRange === 'function') {
          input.setSelectionRange(0, input.value.length)
        }
      }

      const message = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        ? t('Link selected. Tap and hold to copy.')
        : t('Link selected. Use Ctrl+C or Cmd+C.')

      proxy.$toast.info(message, {
        position: 'top-right',
        closeButton: false,
        hideProgressBar: true,
        timeout: 2500,
      })
    }

    const getInvoice = async () => {
      try {
        const id = proxy.$route.params.id
        console.log(id)
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
        originalInvoiceSnapshot.value = normalizeInvoiceForComparison(invoiceData.value)

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

    const normalizeInvoiceForComparison = invoice => {
      if (!invoice) return null

      return {
        number: invoice.number || '',
        date: invoice.date || '',
        dueDate: invoice.dueDate || '',
        amount: String(invoice.amount ?? ''),
        note: invoice.note || '',
        companyId: invoice.company?.id || null,
        customerId: invoice.customer?.id || null,
        items: (invoice.items || []).map(item => ({
          id: item.id || null,
          name: item.name || '',
          description: item.description || '',
          quantity: String(item.quantity ?? ''),
          price: String(item.price ?? ''),
          amount: String(item.amount ?? ''),
          productId: item.productId || null,
        })),
      }
    }

    const hasInvoiceChanges = computed(() => {
      if (!invoiceData.value?.id || !originalInvoiceSnapshot.value) return false

      const current = normalizeInvoiceForComparison(invoiceData.value)
      const original = originalInvoiceSnapshot.value

      return JSON.stringify(current) !== JSON.stringify(original)
    })

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
      formErrors,
      showSendModal,
      shareLinkState,
      shareInvoice,
      originalInvoiceSnapshot,
      normalizeInvoiceForComparison,
      hasInvoiceChanges,
      selectManualLink,
      manualShareCopyText,
      manualShareCopyVisible
    }
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-select.scss';
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';

</style>
