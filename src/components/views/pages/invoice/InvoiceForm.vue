<template>
  <section class="invoice-add-wrapper">
    <b-row class="invoice-add">
      <!-- Col: Left (Invoice Container) -->
      <b-col cols="12" xl="9" md="8">
        <b-form @submit.prevent="saveInvoice">
          <b-card no-body class="invoice-preview-card">
            <invoice-header 
              :invoiceData="invoiceData"
              :isOverviewPage="!!invoiceData.id"
            />
            <hr class="invoice-spacing">
            
            <!-- Add Suggest Button Above Body for new invoices -->
            <b-card-body 
              class="invoice-padding pb-0" 
              v-if="hasRole('grow') && !invoiceData.id"
            >
              <b-button
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                variant="outline-primary"
                class="mb-1"
                :disabled="!invoiceData.customer.id || isSuggesting"
                @click="suggestInvoice"
              >
                {{ isSuggesting ? 'Thinking...' : 'AIra\'s Invoice Suggestions' }}
              </b-button>
            </b-card-body>

            <invoice-body 
              :invoiceData="invoiceData" 
              :companies="companies" 
              :customers="customers" 
              :addCustomerToInvoice="addCustomerToInvoice" 
              :formErrors="formErrors" 
            />
            <hr class="invoice-spacing">
            
            <!-- Note -->
            <b-card-body v-if="noteSwitch" class="invoice-padding pt-0">
              <span class="font-weight-bold">{{ t('Note') }}</span>
              <b-form-textarea 
                v-model="invoiceData.note" 
                placeholder="Additional Details:"
                maxlength="1000"
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

      <!-- Right Col: Card -->
      <b-col cols="12" md="4" xl="3" class="invoice-actions mt-md-0 mt-2">
        <!-- Action Buttons -->
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
            v-b-tooltip.hover
            :title="!invoiceData.id ? t('Save the invoice first to send it') : ''"
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
            v-b-tooltip.hover
            :title="!invoiceData.id ? t('Save the invoice first to copy the link') : ''"
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
            @click="saveInvoice()"
            :disabled="isSubmitting || (!isDirty && invoiceData.id)"
          >
            {{ getSaveButtonText() }}
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
          </div>
        </div>

        <!-- Settings -->
        <div class="mt-2">
          <div class="d-flex justify-content-between align-items-center my-1">
            <label for="noteDetails">{{ t('Note') }}</label>
            <b-form-checkbox id="noteDetails" v-model="noteSwitch" switch />
          </div>
          
          <div class="d-flex justify-content-between align-items-center my-1">
            <label for="paymentDetails">{{ t('Payment details') }}</label>
            <b-form-checkbox id="paymentDetails" v-model="paymentDetails" switch />
          </div>
          
          <div class="mb-1" v-if="paymentDetails">
            <v-select 
              v-model="selectedPaymentMethod" 
              id="payment-method"
              :options="Object.values(paymentMethods)"
              label="name"
              input-id="payment-id"
              :clearable="false"
            >
              <template #open-indicator>
                <base-feather-icon icon="ChevronDownIcon" />
              </template>
            </v-select>
          </div>
          
          <!-- PayID Section -->
          <div v-if="invoiceData.company && paymentDetails && selectedPaymentMethod === 'PAYID'" class="mb-2">
            <b-input 
              v-if="invoiceData.company.paymentDetail"
              id="payID" 
              v-model="invoiceData.company.paymentDetail.payid" 
              type="text" 
              v-b-tooltip.hover 
              :title="t('To update your PAYID, please visit My Business > Business page')"
              readonly
            />
            
            <div v-if="!invoiceData.company.paymentDetail && paymentDetails && invoiceData.company.id" class="payid-setup-section">
              <span class="btn btn-sm" v-b-toggle.sidebar-payment-method>
                <base-feather-icon icon="PlusCircleIcon" size="22" color="#4caf50" />
                {{ t('ADD new PayID') }}
              </span>
            </div>
          </div>
          
          <!-- Bank Account Section -->
          <div v-if="selectedPaymentMethod === 'Bank Account' && paymentDetails" class="mb-2">
            <label for="bankName">{{ t('Bank Name') }}</label>
            <b-input id="bankName" v-model="bankName" type="text" />
            
            <label for="bsb">BSB</label>
            <b-input id="bsb" type="text" placeholder="000-000" v-model="bsb" />
            
            <label for="account">{{ t('Account') }}</label>
            <b-input id="account" type="text" placeholder="0000 0000" v-model="account" />
            
            <label for="accountName">{{ t('Account Name') }}</label>
            <b-input id="accountName" type="text" v-model="accountName" />
          </div>
        </div>
      </b-col>
    </b-row>
    
    <!-- Confirmation Modal -->
    <b-modal
      id="save-confirmation-modal"
      v-model="showConfirmationModal"
      :title="t('Save Changes')"
      @ok="handleConfirmationChoice(true)"
      @cancel="handleConfirmationChoice(false)"
      :ok-title="t('Update Existing')"
      :cancel-title="t('Create New')"
    >
      <p>{{t('You have already saved this invoice. Would you like to')}}:</p>
      <ul>
        <li><strong>{{t('Update Existing')}}:</strong> {{t('Save changes to the current invoice')}}</li>
        <li><strong>{{t('Create New')}}:</strong> {{t('Create a new invoice with these changes')}}</li>
      </ul>
    </b-modal>
    
    <payment-method-sidebar
      v-if="invoiceData.company"
      :company="invoiceData.company"
      @payment-added="handlePaymentAdded"
    />
    <send-invoice-modal
      v-if="invoiceData.id"
      :invoice="invoiceData"
      :visible.sync="showSendModal"
    />
    <notifications></notifications>
  </section>
</template>

<script>
import { ref, getCurrentInstance, watch, computed } from 'vue'
import { mapGetters } from 'vuex'
import store from '@/store'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons'
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import InvoiceHeader from '@/components/uiComponents/InvoiceHeader.vue'
import InvoiceBody from '@/components/uiComponents/InvoiceBody.vue'
import Pdf from '@/components/uiComponents/Pdf.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import PaymentMethodSidebar from '@/components/uiComponents/PaymentMethodSidebar.vue'
import SendInvoiceModal from '@/components/uiComponents/SendInvoiceModal.vue'

export default {
  components: {
    BaseFeatherIcon,
    vSelect,
    InvoiceHeader,
    InvoiceBody,
    Pdf,
    PaymentMethodSidebar,
    SendInvoiceModal,
  },
  directives: {
    Ripple,
  },
  props: {
    invoiceId: {
      type: String,
      default: null,
    },
  },
  computed: {
    ...mapGetters('users', ['roles', 'hasRole']),
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
        })
      }

      this.formErrors = { ...errors }

      if (!isValid) {
        this.scrollToFirstError()
      }

      return isValid
    },

    scrollToFirstError() {
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
    },

    async saveInvoice() {
      this.isSubmitting = true
      
      const isValid = this.validateForm()
      if (!isValid) {
        this.showValidationError()
        this.isSubmitting = false
        return
      }

      // Check if this is an update after initial save
      if (this.invoiceData.id && this.hasUnsavedChanges) {
        this.showConfirmationModal = true
        this.isSubmitting = false
        return
      }

      await this.performSave(this.invoiceData.id ? 'update' : 'create')
    },

    async handleConfirmationChoice(updateExisting) {
      this.showConfirmationModal = false
      this.isSubmitting = true
      
      if (updateExisting) {
        await this.performSave('update')
      } else {
        await this.performSave('create')
      }
    },

    async performSave(action) {
      try {
        const data = this.buildRequestData()
        
        if (action === 'update') {
          data.data.id = this.invoiceData.id
          await this.$store.dispatch('invoices/update', data)
        } else {
          await this.$store.dispatch('invoices/add', data)
          // Get the saved invoice from store to get the ID
          const savedInvoice = this.$store.getters["invoices/invoice"]
          if (savedInvoice && savedInvoice.id) {
            this.invoiceData.id = savedInvoice.id
          }
        }
        
        this.takeSnapshot()
        this.hasUnsavedChanges = false
        
        this.$toast.success(
          action === 'update' 
            ? `Invoice updated: ${this.invoiceData.number}`
            : `Invoice saved: ${this.invoiceData.number}`,
          {
            position: "top-right",
            icon: CheckCircleIcon,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000
          }
        )
      } catch (e) {
        console.error('Save error:', e)
        this.$toast.error('Something went wrong! Try again later or contact support.', {
          position: "top-right",
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000
        })
      } finally {
        this.isSubmitting = false
      }
    },

    buildRequestData() {
      const data = {
        data: {
          type: "invoices",
          attributes: {
            name: this.invoiceData.number,
            invoice_date: this.invoiceData.date,
            due_date: this.invoiceData.dueDate,
            amount: this.invoiceData.amount,
            ref: this.invoiceData.number,
            note: this.invoiceData.note
          },
          relationships: {
            company: {
              data: {
                type: "companies",
                id: this.invoiceData.company.id,
              }
            },
            customer: {
              data: {
                type: "customers",
                id: this.invoiceData.customer.id,
              }
            },
          },
        }
      }

      // Add items as included resources
      if (this.invoiceData.items && this.invoiceData.items.length > 0) {
        data.included = this.invoiceData.items.map((item) => ({
          type: "invoiceItems",
          id: item.id || null,
          attributes: {
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
            product_id: item.productId || null,
          },
        }))
      }

      return data
    },

    showValidationError() {
      this.$nextTick(() => {
        this.$toast.error('Please correct the errors in the form before saving the invoice.', {
          position: "top-right",
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000
        })
      })
    },

    getSaveButtonText() {
      if (this.isSubmitting) return this.t('Saving...')
      if (this.invoiceData.id) return this.t('Update Invoice')
      return this.t('Save Invoice')
    },

    async suggestInvoice() {
      this.isSuggesting = true
      try {
        await this.$store.dispatch('invoices/suggest', this.invoiceData.customer.id)
        const data = this.$store.getters["invoices/invoice"]
        
        // Populate invoiceData with suggestion
        this.invoiceData.number = data.number
        this.invoiceData.date = data.invoice_date
        this.invoiceData.dueDate = data.due_date
        this.invoiceData.amount = data.amount.toFixed(2)
        this.invoiceData.status = data.status
        
        this.invoiceData.items = data.items.map(item => ({
          name: item.name,
          quantity: String(item.quantity),
          price: item.price.toFixed(2),
          amount: item.amount.toFixed(2),
          description: item.description,
        }))
        
        this.$toast.success('Invoice suggestion loaded!', {
          position: "top-right",
          icon: CheckCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 2000
        })
      } catch (error) {
        this.$toast.error('Couldn\'t load suggestion. Try again later.', {
          position: "top-right",
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000
        })
      }
      this.isSuggesting = false
    },
  },

  setup(props) {
    const { proxy } = getCurrentInstance()
    const { t } = useI18nUtils()
    
    // Data
    const customers = ref([])
    const companies = ref([])
    const isSubmitting = ref(false)
    const isSuggesting = ref(false)
    const formErrors = ref({})
    const showConfirmationModal = ref(false)
    const hasUnsavedChanges = ref(false)
    
    // Payment related
    const paymentMethods = ['PAYID', 'Bank Account']
    const paymentDetails = ref(true)
    const noteSwitch = ref(false)
    const selectedPaymentMethod = ref('PAYID')
    const bankName = ref('')
    const bsb = ref('')
    const account = ref('')
    const accountName = ref('')

    const manualShareCopyVisible = ref(false)
    const manualShareCopyText = ref('')
    const manualShareCopyRef = ref(null)
    
    // Invoice data
    const itemFormBlankItem = {
      name: '',
      price: '',
      quantity: '',
      description: '',
      amount: '0.00'
    }
    
    const invoiceData = ref({
      id: null,
      number: "",
      customer: {},
      company: {},
      date: null,
      dueDate: null,
      abn: null,
      items: [JSON.parse(JSON.stringify(itemFormBlankItem))],
      note: '',
      paymentMethod: null,
      amount: '0.00',
    })
    
    // Load data functions
    const getCustomers = async () => {
      try {
        await store.dispatch('customers/list')
        customers.value = store.getters["customers/list"]
      } catch (error) {
        console.error('Error fetching clients:', error)
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
    
    const loadInvoice = async (id) => {
      if (!id) return
      
      try {
        await store.dispatch('invoices/get', { 
          id: id, 
          include: ['company', 'company.paymentDetail', 'customer', 'items'] 
        })
        const rawInvoice = store.getters["invoices/invoice"]
        
        if (rawInvoice) {
          invoiceData.value = {
            id: rawInvoice.id,
            number: rawInvoice.name || rawInvoice.ref,
            date: rawInvoice.invoice_date,
            dueDate: rawInvoice.due_date,
            status: rawInvoice.status,
            amount: rawInvoice.amount,
            note: rawInvoice.note || '',
            company: rawInvoice.company || null,
            customer: rawInvoice.customer || null,
            items: rawInvoice.items || [],
          }
          
          // Set switches based on data
          noteSwitch.value = !!invoiceData.value.note
          
          if (invoiceData.value.note?.includes('BSB')) {
            selectedPaymentMethod.value = 'Bank Account'
            const noteLines = invoiceData.value.note.split('\n')
            bankName.value = noteLines[2] || ''
            bsb.value = noteLines[3]?.replace('BSB: ', '') || ''
            account.value = noteLines[4] || ''
            accountName.value = noteLines[5] || ''
          }
        }
      } catch (error) {
        console.error('Error loading invoice:', error)
      }
    }
    
    const addCustomerToInvoice = (newCustomer) => {
      customers.value.push(newCustomer)
      invoiceData.value.customer = newCustomer
    }
    
    const handlePaymentAdded = (payment) => {
      proxy.$set(invoiceData.value.company, 'paymentDetail', payment)
    }
    
    // Dirty state tracking
    const isDirty = ref(false)
    const lastSavedSnapshotStr = ref(null)
    
    const stringify = (obj) => JSON.stringify(obj)
    
    const takeSnapshot = () => {
      lastSavedSnapshotStr.value = stringify(invoiceData.value)
      isDirty.value = false
    }
    
    // Watchers
    watch([bankName, bsb, account, accountName], ([newBankName, newBsb, newAccount, newAccountName]) => {
      if (selectedPaymentMethod.value === 'Bank Account') {
        invoiceData.value.note = `Account Details:\n\n${newBankName}\nBSB: ${newBsb}\nAccount: ${newAccount}\n${newAccountName}`
        if (!newBankName && !newBsb && !newAccount && !newAccountName) {
          invoiceData.value.note = ''
        }
      }
    })
    
    watch(
      invoiceData,
      (val) => {
        if (lastSavedSnapshotStr.value === null) {
          isDirty.value = true
        } else {
          const currentStr = stringify(val)
          isDirty.value = currentStr !== lastSavedSnapshotStr.value
          hasUnsavedChanges.value = isDirty.value && !!val.id
        }
      },
      { deep: true, immediate: true }
    )
    
    // Initialize data
    Promise.all([
      getCustomers(),
      getCompanies(),
      loadInvoice(props.invoiceId)
    ]).catch(error => {
      console.error('Error loading initial data:', error)
    })
    
    const showSendModal = ref(false)

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
          ? t('Automatic copy blocked. Tap and hold to copy.')
          : t('Automatic copy blocked. Copy this link manually.')

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

    return {
      invoiceData,
      customers,
      companies,
      paymentMethods,
      paymentDetails,
      bankName,
      bsb,
      account,
      accountName,
      t,
      addCustomerToInvoice,
      noteSwitch,
      handlePaymentAdded,
      selectedPaymentMethod,
      isSubmitting,
      isSuggesting,
      formErrors,
      isDirty,
      takeSnapshot,
      showConfirmationModal,
      hasUnsavedChanges,
      showSendModal,
      shareLinkState,
      shareInvoice,
      manualShareCopyText,
      manualShareCopyVisible
    }
  },
}
</script>

<style lang="scss">

@import '~@/scss/vue/libs/vue-select.scss';
.invoice-add-wrapper {
  .add-new-client-header {
    padding: $options-padding-y $options-padding-x;
    color: $success;

    &:hover {
      background-color: rgba($success, 0.12);
    }
  }
}
@media (max-width: 767.98px) {
  .invoice-actions {
    display: flex;
    flex-direction: column-reverse;
  }
}
.tooltip-inner {
  background-color: #007bff !important;
  color: white !important;
}
</style>

<style lang="scss" scoped>
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';

.form-item-section {
  background-color: $product-details-bg;
}

.form-item-action-col {
  width: 27px;
}

.repeater-form {
  // overflow: hidden;
  transition: 0.35s height;
}

.v-select {
  &.item-selector-title,
  &.payment-selector {
    background-color: #fff;

    .dark-layout & {
      background-color: unset;
    }
  }
}

.dark-layout {
  .form-item-section {
    background-color: $theme-dark-body-bg;

    .row .border {
      background-color: $theme-dark-card-bg;
    }
  }
}

.invoice-add{ 
  textarea{
    min-height: 200px;
  }
}

.is-invalid { border-color: #dc3545; }
.error { color: #dc3545; font-size: 0.875rem; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
