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
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="primary"
            block
            @click="saveInvoice()"
            :disabled="isSubmitting || (!isDirty && invoiceData.id)"
          >
            {{ getSaveButtonText() }}
          </b-button>
          <pdf
            :invoiceData="invoiceData"
            :paymentDetails="paymentDetails"
            :selectedPaymentMethods="effectivePaymentMethods"
            :validateForm="validateForm"
            :hasUnsavedChanges="hasUnsavedChanges"
          />
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-primary"
            block
            class="mb-75"
            :disabled="!invoiceData.id || hasUnsavedChanges || shareLinkState === 'loading'"
            v-b-tooltip.hover
            :title="!invoiceData.id ? t('Save the invoice first to copy the link') : (hasUnsavedChanges ? t('Save changes before copying the link') : '')"
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
            class="mb-75"
            :disabled="!invoiceData.id || hasUnsavedChanges"
            v-b-tooltip.hover
            :title="!invoiceData.id ? t('Save the invoice first to send it') : (hasUnsavedChanges ? t('Save changes before sending') : '')"
            @click="showSendModal = true"
          >
            {{ t('Send Email') }}
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

          <!-- GST -->
          <div class="d-flex justify-content-between align-items-center my-1">
            <label for="gstSwitch">{{ t('GST') }}</label>
            <b-form-checkbox
              id="gstSwitch"
              v-model="invoiceData.gst_applied"
              switch
              @change="markGstTouched"
            />
          </div>

          <div v-if="gstOverrideActive" class="gst-override-warning mb-1">
            {{ t('GST may not apply for this company or invoice date. Continue only if this is intentional.') }}
          </div>
          <div v-if="invoiceData.gst_applied" class="mb-1">
            <v-select
              v-model="invoiceData.gst_price_mode"
              :options="gstPriceModeOptions"
              :reduce="opt => opt.value"
              label="label"
              :clearable="false"
              input-id="gst-price-mode"
              @input="markGstTouched"
            >
              <template #open-indicator>
                <base-feather-icon icon="ChevronDownIcon" />
              </template>
            </v-select>
          </div>
          
          <div class="d-flex justify-content-between align-items-center my-1">
            <label for="paymentDetails">{{ t('Payment details') }}</label>
            <b-form-checkbox id="paymentDetails" v-model="paymentDetails" switch />
          </div>

          <!-- Multi-select payment methods. User can pick 1 or 2 (PayID
               and/or Bank). Each checkbox auto-disables when its underlying
               source isn't configured on the company. -->
          <div class="mb-1" v-if="paymentDetails">
            <b-form-checkbox
              v-model="payidSelected"
              :disabled="!canSelectPayid"
              class="my-50"
            >
              {{ t('PayID') }}
            </b-form-checkbox>
            <b-form-checkbox
              v-model="bankSelected"
              :disabled="!canSelectBank"
              class="my-50"
            >
              {{ t('Bank Account') }}
            </b-form-checkbox>
          </div>

          <!-- PayID Section -->
          <div v-if="invoiceData.company && paymentDetails && payidSelected" class="mb-2">
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
              <span class="btn btn-sm payid-setup-action" v-b-toggle.sidebar-payment-method>
                <base-feather-icon icon="PlusCircleIcon" size="16" />
                {{ t('ADD new PayID') }}
              </span>
            </div>
          </div>

          <!-- Bank Account Section -->
          <div v-if="bankSelected && paymentDetails" class="mb-2">
            <template v-if="hasSavedBankAccount">
              <label for="bankName">{{ t('Bank name') }}</label>
              <b-input
                id="bankName"
                :value="invoiceData.company.paymentDetail.bank_name"
                type="text"
                readonly
                v-b-tooltip.hover
                :title="t('To update bank account details, please visit My Business > Business page')"
              />
              <label for="accountName">{{ t('Account Name') }}</label>
              <b-input
                id="accountName"
                :value="invoiceData.company.paymentDetail.account_name"
                type="text"
                readonly
                v-b-tooltip.hover
                :title="t('To update bank account details, please visit My Business > Business page')"
              />
              <label for="bsb">BSB</label>
              <b-input
                id="bsb"
                :value="formattedBsb"
                type="text"
                readonly
                v-b-tooltip.hover
                :title="t('To update bank account details, please visit My Business > Business page')"
              />
              <label for="account">{{ t('Account number') }}</label>
              <b-input
                id="account"
                :value="invoiceData.company.paymentDetail.account_number"
                type="text"
                readonly
                v-b-tooltip.hover
                :title="t('To update bank account details, please visit My Business > Business page')"
              />
            </template>

            <div v-else-if="invoiceData.company && invoiceData.company.id" class="payid-setup-section">
              <span class="btn btn-sm payid-setup-action" v-b-toggle.sidebar-payment-method>
                <base-feather-icon icon="PlusCircleIcon" size="16" />
                {{ t('Add bank account details') }}
              </span>
            </div>
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

    <!-- GST Override Confirmation Modal -->
    <b-modal
      id="gst-override-modal"
      v-model="showGstOverrideModal"
      :title="t('GST warning')"
      :ok-title="t('Continue & Save')"
      :cancel-title="t('Cancel')"
      ok-variant="primary"
      @ok="handleGstOverrideConfirm"
      @cancel="handleGstOverrideCancel"
    >
      <p>
        {{ t('This invoice is using GST even though the company settings indicate GST may not apply for this invoice date.') }}
      </p>
      <p class="text-muted">
        {{ t('Continue only if this is intentional.') }}
      </p>
      <b-form-checkbox v-model="gstOverrideDontShowAgain">
        {{ t("Don't show this warning again on this device") }}
      </b-form-checkbox>
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
import {
  calculateInvoicePreview,
  companyGstAppliesByDefault,
  PRICE_MODE_EXCLUSIVE,
  PRICE_MODE_INCLUSIVE,
} from '@/utils/gstCalculator'

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

      // Validate due date
      if (!this.invoiceData.dueDate) {
        errors.dueDate = 'Due date is required'
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
          } else if (firstErrorKey === 'dueDate') {
            document.querySelector('.invoice-number-date')?.scrollIntoView({ behavior: 'smooth' })
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

      // GST override — user turned GST on against company defaults. Ask them
      // to confirm unless they've previously suppressed the warning.
      if (this.shouldShowGstOverrideModal()) {
        this.gstOverrideDontShowAgain = false
        this.showGstOverrideModal = true
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

    async handleGstOverrideConfirm() {
      // Persist the suppression preference if checked.
      if (this.gstOverrideDontShowAgain) {
        try { window.localStorage.setItem('gst_override_warning_hidden', '1') } catch (_) { /* ignore */ }
      }
      this.showGstOverrideModal = false
      this.isSubmitting = true

      if (this.invoiceData.id && this.hasUnsavedChanges) {
        this.showConfirmationModal = true
        this.isSubmitting = false
        return
      }

      await this.performSave(this.invoiceData.id ? 'update' : 'create')
    },

    handleGstOverrideCancel() {
      this.showGstOverrideModal = false
      this.isSubmitting = false
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

        // Backend is the source of truth — refresh totals + snapshot from the
        // server response so any cent-level recalculation the user sees in the
        // sidebar matches what was actually persisted.
        this.refreshTotalsFromStore()

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
      // `amount` is intentionally omitted — the backend recalculates it from
      // items + company GST state via InvoiceGstCalculatorService.
      // `gstPriceMode` is sent ONLY when GST is applied; otherwise the backend
      // ignores price mode entirely and snapshots null.
      const attributes = {
        name: this.invoiceData.number,
        invoice_date: this.invoiceData.date,
        due_date: this.invoiceData.dueDate,
        ref: this.invoiceData.number,
        note: this.invoiceData.note,
        status: '0',
        // Explicit invoice-level toggle — wins over company defaults on the
        // backend. Send unconditionally so an explicit "off" is also respected.
        gstApplied: !!this.invoiceData.gst_applied,
        // Per-invoice payment selection. Sending an array (possibly empty)
        // tells the backend to (re)snapshot the company's PaymentDetail into
        // this invoice's *_snapshot columns.
        paymentMethods: this.effectivePaymentMethods,
      }

      if (this.invoiceData.gst_applied) {
        attributes.gstPriceMode = this.invoiceData.gst_price_mode || PRICE_MODE_EXCLUSIVE
      }

      const data = {
        data: {
          type: "invoices",
          attributes,
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
            // amount is overwritten by the backend; sending the preview is fine
            // and keeps existing item-update paths working.
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

    refreshTotalsFromStore() {
      const saved = this.$store.getters["invoices/invoice"]
      if (!saved || typeof saved !== 'object') return

      if (saved.amount     !== undefined) this.invoiceData.amount     = saved.amount
      if (saved.subtotal   !== undefined) this.invoiceData.subtotal   = saved.subtotal
      if (saved.gst_amount !== undefined) this.invoiceData.gst_amount = saved.gst_amount
      if (saved.gst_registered_snapshot !== undefined) {
        this.invoiceData.gst_applied = !!saved.gst_registered_snapshot
      }
      if (saved.gst_price_mode_snapshot) {
        this.invoiceData.gst_price_mode = saved.gst_price_mode_snapshot
      }

      // Server is authoritative — it may have dropped methods that aren't
      // configured anymore. Re-hydrate selection so the next "is dirty?"
      // comparison starts from what was actually persisted.
      if (Array.isArray(saved.payment_methods_snapshot)) {
        this.selectedPaymentMethods = saved.payment_methods_snapshot.filter(
          m => m === 'payid' || m === 'bank'
        )
      }

      // Per-item totals may have been re-rounded server-side; mirror them back
      // so the line column matches the persisted line.amount.
      if (Array.isArray(saved.items) && Array.isArray(this.invoiceData.items)) {
        saved.items.forEach((srvItem, i) => {
          if (this.invoiceData.items[i] && srvItem.amount !== undefined) {
            this.invoiceData.items[i].amount = srvItem.amount
            if (srvItem.id && !this.invoiceData.items[i].id) {
              this.invoiceData.items[i].id = srvItem.id
            }
          }
        })
      }
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
    
    // Payment related — multi-select. Either, both, or neither of
    // 'payid' / 'bank'. The snake_case + lowercase values match what the
    // backend persists into invoices.payment_methods_snapshot.
    //
    // We start empty so the user always makes an intentional choice. The
    // auto-pick watcher below selects the single available method for them
    // when there's only one option, so the common case still feels
    // zero-friction.
    const paymentDetails = ref(true)
    const noteSwitch = ref(false)
    const selectedPaymentMethods = ref([])

    const payidSelected = computed({
      get: () => selectedPaymentMethods.value.includes('payid'),
      set: (on) => {
        const has = selectedPaymentMethods.value.includes('payid')
        if (on && !has) selectedPaymentMethods.value = [...selectedPaymentMethods.value, 'payid']
        if (!on && has) selectedPaymentMethods.value = selectedPaymentMethods.value.filter(m => m !== 'payid')
      },
    })
    const bankSelected = computed({
      get: () => selectedPaymentMethods.value.includes('bank'),
      set: (on) => {
        const has = selectedPaymentMethods.value.includes('bank')
        if (on && !has) selectedPaymentMethods.value = [...selectedPaymentMethods.value, 'bank']
        if (!on && has) selectedPaymentMethods.value = selectedPaymentMethods.value.filter(m => m !== 'bank')
      },
    })

    // The effective list we send to the backend (and to Pdf.vue): empty when
    // the master "Payment details" switch is off, regardless of checkbox state.
    const effectivePaymentMethods = computed(() =>
      paymentDetails.value ? selectedPaymentMethods.value : []
    )

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
      subtotal: '0.00',
      gst_amount: '0.00',
      // GST defaults are derived from the selected company once it loads.
      // Until then we keep these falsy/null so the summary hides GST rows.
      gst_applied: false,
      gst_price_mode: PRICE_MODE_EXCLUSIVE,
    })

    const gstPriceModeOptions = [
      { value: PRICE_MODE_EXCLUSIVE, label: t('GST Exclusive (price before GST)') },
      { value: PRICE_MODE_INCLUSIVE, label: t('GST Inclusive (price includes GST)') },
    ]

    // Override state — GST is ON but the company settings disagree for this
    // invoice date. Used to show the inline warning + save-confirmation modal.
    const GST_OVERRIDE_LS_KEY = 'gst_override_warning_hidden'
    const showGstOverrideModal = ref(false)
    const gstOverrideDontShowAgain = ref(false)

    const gstOverrideActive = computed(() => {
      if (!invoiceData.value.gst_applied) return false
      const company = invoiceData.value.company
      if (!company || !company.id) return false
      return !companyGstAppliesByDefault(company, invoiceData.value.date)
    })

    const shouldShowGstOverrideModal = () => {
      if (!gstOverrideActive.value) return false
      try {
        return window.localStorage.getItem(GST_OVERRIDE_LS_KEY) !== '1'
      } catch (_) {
        return true
      }
    }
    
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
            subtotal: rawInvoice.subtotal ?? rawInvoice.amount,
            gst_amount: rawInvoice.gst_amount ?? '0.00',
            // Snapshot fields are the source of truth for existing invoices —
            // company GST settings may have changed since the invoice was issued.
            gst_applied:    !!rawInvoice.gst_registered_snapshot,
            gst_price_mode: rawInvoice.gst_price_mode_snapshot || PRICE_MODE_EXCLUSIVE,
            note: rawInvoice.note || '',
            company: rawInvoice.company || null,
            customer: rawInvoice.customer || null,
            items: rawInvoice.items || [],
          }

          // Existing invoice loaded — isEditMode (derived from id) now masks
          // any company/date watchers, so the snapshot wins unconditionally.

          // Set switches based on data
          noteSwitch.value = !!invoiceData.value.note

          // Hydrate the multi-select from the saved snapshot. Legacy invoices
          // with no snapshot are left empty and the auto-pick watcher will
          // pre-select the company's only available method (if exactly one).
          const snapshotMethods = Array.isArray(rawInvoice.payment_methods_snapshot)
            ? rawInvoice.payment_methods_snapshot.filter(m => m === 'payid' || m === 'bank')
            : null

          if (snapshotMethods && snapshotMethods.length) {
            selectedPaymentMethods.value = snapshotMethods
            paymentDetails.value = true
          } else if (snapshotMethods && snapshotMethods.length === 0) {
            // Explicit empty snapshot = invoice was saved with payment block off.
            selectedPaymentMethods.value = []
            paymentDetails.value = false
          } else {
            // Legacy / no snapshot — defer to the auto-pick watcher.
            selectedPaymentMethods.value = []
          }

          takeSnapshot()
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

    // The dirty source includes the effective payment selection so that
    // toggling PayID/Bank or the master switch counts as an unsaved change
    // and re-enables the Save button — same UX as the GST toggle.
    const buildDirtySnapshot = () => stringify({
      invoice: invoiceData.value,
      paymentMethods: [...effectivePaymentMethods.value].sort(),
    })

    const takeSnapshot = () => {
      lastSavedSnapshotStr.value = buildDirtySnapshot()
      isDirty.value = false
    }
    
    // GST init priority (top wins):
    //   1. existing invoice snapshot (edit mode)
    //   2. user manual toggle (mark touched)
    //   3. company default (create mode + untouched)
    //
    // Once an invoice has an id OR the user has toggled the switch, company
    // defaults must never silently re-apply. isEditMode is true the moment we
    // know we're attached to a saved invoice — set immediately by loadInvoice
    // AND latched by performSave so post-save edits behave the same way.
    const isEditMode = computed(() => !!invoiceData.value.id)
    const userTouchedGst = ref(false)

    const applyCompanyGstDefaults = () => {
      // Snapshot wins. User selection wins. Company defaults are a last resort
      // and only ever for brand-new, untouched invoices.
      if (isEditMode.value) return
      if (userTouchedGst.value) return

      const company = invoiceData.value.company
      if (!company || !company.id) return

      invoiceData.value.gst_applied = companyGstAppliesByDefault(
        company,
        invoiceData.value.date
      )
      invoiceData.value.gst_price_mode = company.gst_price_mode || PRICE_MODE_EXCLUSIVE
    }

    watch(
      () => invoiceData.value.company && invoiceData.value.company.id,
      () => applyCompanyGstDefaults()
    )

    watch(
      () => invoiceData.value.date,
      () => applyCompanyGstDefaults()
    )

    // Live preview totals — pure local math, no API calls. Items/qty/price
    // changes already drive setAmount() inside InvoiceBody; these watchers
    // cover toggle + mode changes that happen in the sidebar.
    const recalcPreview = () => {
      const preview = calculateInvoicePreview(
        invoiceData.value.items,
        !!invoiceData.value.gst_applied,
        invoiceData.value.gst_price_mode || PRICE_MODE_EXCLUSIVE
      )
      ;(invoiceData.value.items || []).forEach((item, i) => {
        invoiceData.value.items[i].amount = preview.items[i]?.amount ?? '0.00'
      })
      invoiceData.value.subtotal   = preview.subtotal
      invoiceData.value.gst_amount = preview.gst_amount
      invoiceData.value.amount     = preview.amount
    }

    watch(
      () => [invoiceData.value.gst_applied, invoiceData.value.gst_price_mode],
      () => recalcPreview()
    )

    const markGstTouched = () => { userTouchedGst.value = true }

    // Bank account details now come from invoiceData.company.paymentDetail
    // (encrypted on the backend, displayed read-only). No more synthesising
    // a payment-data block into invoiceData.note.
    const hasSavedBankAccount = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      return Boolean(pd && pd.account_name && pd.bsb && pd.account_number)
    })

    const hasSavedPayid = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      return Boolean(pd && pd.payid)
    })

    // "Can be picked for this invoice" — gated ONLY by the per-company
    // "Show on invoice" toggle. We deliberately allow selecting a method
    // that has no data yet, so the user can check the box and then use the
    // inline "Add" button to configure it.
    const canSelectPayid = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      return !(pd && pd.show_payid === false)
    })
    const canSelectBank = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      return !(pd && pd.show_bank_details === false)
    })

    // Auto-pick the only available method (if exactly one configured AND
    // not hidden), so the common single-method setup stays zero-friction.
    // Never picks an empty method — that would visually check a box without
    // any data behind it.
    watch(
      [hasSavedPayid, hasSavedBankAccount, canSelectPayid, canSelectBank, paymentDetails],
      () => {
        if (!paymentDetails.value) return
        if (selectedPaymentMethods.value.length > 0) return
        const payidReady = hasSavedPayid.value && canSelectPayid.value
        const bankReady  = hasSavedBankAccount.value && canSelectBank.value
        if (payidReady && bankReady) return
        if (payidReady) selectedPaymentMethods.value = ['payid']
        else if (bankReady) selectedPaymentMethods.value = ['bank']
      },
      { immediate: true }
    )

    const formattedBsb = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      const raw = (pd && pd.bsb) || ''
      const digits = String(raw).replace(/\D/g, '')
      return digits.length === 6 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : raw
    })
    
    watch(
      [invoiceData, effectivePaymentMethods],
      () => {
        if (lastSavedSnapshotStr.value === null) {
          isDirty.value = true
        } else {
          const currentStr = buildDirtySnapshot()
          isDirty.value = currentStr !== lastSavedSnapshotStr.value
          hasUnsavedChanges.value = isDirty.value && !!invoiceData.value.id
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
      paymentDetails,
      hasSavedBankAccount,
      hasSavedPayid,
      canSelectPayid,
      canSelectBank,
      formattedBsb,
      t,
      addCustomerToInvoice,
      noteSwitch,
      handlePaymentAdded,
      selectedPaymentMethods,
      payidSelected,
      bankSelected,
      effectivePaymentMethods,
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
      manualShareCopyVisible,
      gstPriceModeOptions,
      markGstTouched,
      gstOverrideActive,
      showGstOverrideModal,
      gstOverrideDontShowAgain,
      shouldShowGstOverrideModal,
      isEditMode,
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

.gst-override-warning {
  font-size: 0.8rem;
  line-height: 1.35;
  color: #8a6d3b;
  background: #fcf8e3;
  border: 1px solid #faebcc;
  border-radius: 4px;
  padding: 6px 10px;
}

.payid-setup-section {
  display: flex;
  justify-content: center;
  padding: 0.85rem;
  border: 1px dashed #d8d6de;
  border-radius: 0.5rem;
  background: #fbfbfc;
}

.payid-setup-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid rgba(3, 102, 214, 0.22);
  border-radius: 0.375rem;
  background: #fff;
  color: #0366d6;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.2;
  box-shadow: none;
}

.payid-setup-action:hover,
.payid-setup-action:focus {
  border-color: rgba(3, 102, 214, 0.38);
  background: rgba(3, 102, 214, 0.06);
  color: #0366d6;
  box-shadow: none;
}

/* Compact inline-input look for the sidebar v-selects (GST mode, payment).
   Matches the price/qty input heights so the sidebar reads as a clean list
   of equal-height controls instead of a stack of bulky textarea-style fields. */
::v-deep .v-select.vs--single .vs__selected-options {
  padding: 0 6px;
  flex-wrap: nowrap;
  overflow: hidden;
}
::v-deep .v-select.vs--single .vs__selected {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
::v-deep .v-select.vs--single .vs__search,
::v-deep .v-select.vs--single .vs__search:focus {
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.2;
}
::v-deep .v-select.vs--single .vs__dropdown-toggle {
  min-height: 38px;
  padding: 4px 0;
}
::v-deep .v-select.vs--single .vs__actions {
  padding: 0 6px;
}
input{
  cursor: pointer;
}
</style>
