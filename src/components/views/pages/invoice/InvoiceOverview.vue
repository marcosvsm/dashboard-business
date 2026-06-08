<template>
    <!-- Main Content -->
    <!-- Error Message -->
  <section class="invoice-edit-wrapper">
    <!-- Loading Spinner -->
    <div v-if="loading" class="text-center my-5">
      <b-spinner label="Loading..." />
      <p>{{ t('Loading invoice data...') }}</p>
    </div>
    <div v-else-if="errors"  class="invoice-empty-state">
        <div class="invoice-empty-icon">
          <base-feather-icon icon="FileTextIcon" size="20" />
        </div>
        <p class="invoice-empty-title mb-1">{{ t('No invoices found') }}</p>
        <b-button :to="{ name: 'add-invoice' }" variant="primary">
          <base-feather-icon icon="PlusIcon" size="14" />
          {{ t('Create Invoice') }}
        </b-button>
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
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="primary"
            block
            :disabled="!hasInvoiceChanges"
            @click="saveInvoice()"
          >
            {{ t('Save Changes') }}
          </b-button>
          <pdf
            :invoiceData="invoiceData"
            :paymentDetails="paymentDetails"
            :selectedPaymentMethods="effectivePaymentMethods"
            :validateForm="validateForm"
          />
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
            class="mb-75"
            :disabled="!invoiceData.id"
            @click="showSendModal = true"
          >
            {{ t('Send Email') }}
          </b-button>
          <b-button
            v-if="invoiceData.id && Number(invoiceData.status) !== 1"
            v-ripple.400="'rgba(34, 197, 94, 0.15)'"
            variant="success"
            block
            class="mb-75"
            @click="openMarkPaidModal"
          >
            {{ t('Mark Paid') }}
          </b-button>
          <b-button
            v-if="invoiceData.id && Number(invoiceData.status) === 1"
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-secondary"
            block
            class="mb-75"
            @click="handleMarkUnpaid"
          >
            {{ t('Mark Unpaid') }}
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
          <!-- GST -->
          <div class="d-flex justify-content-between align-items-center my-1">
            <label for="gstSwitch">{{ t('GST') }}</label>
            <b-form-checkbox
              id="gstSwitch"
              v-model="invoiceData.gst_applied"
              switch
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
            >
              <template #open-indicator>
                <base-feather-icon icon="ChevronDownIcon" />
              </template>
            </v-select>
          </div>
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

          <div
            v-if="invoiceData.company && paymentDetails && payidSelected"
            class="mb-2"
          >
            <b-input
              v-if="displayPayid"
              id="payID"
              :value="displayPayid"
              type="text"
              v-b-tooltip.hover :title="t('To update your PAYID, please visit My Business > Business page')"
              readonly
            />
            <!-- PayID Input Section -->
            <div
              v-else-if="invoiceData.company.id"
              class="payid-setup-section"
            >
              <span
                class="btn btn-sm payid-setup-action"
                v-b-toggle.sidebar-payment-method>
                <base-feather-icon
                  icon="PlusCircleIcon"
                  size="16"
                />
                {{ t('ADD new PayID') }}
              </span>
            </div>
          </div>
          <div v-if="bankSelected && paymentDetails" class="mb-2">
            <template v-if="hasDisplayableBankAccount">
              <label for="bankName">{{ t('Bank name') }}</label>
              <b-input
                id="bankName"
                :value="displayBankName"
                type="text"
                readonly
                v-b-tooltip.hover
                :title="t('To update bank account details, please visit My Business > Business page')"
              />
              <label for="accountName">{{ t('Account Name') }}</label>
              <b-input
                id="accountName"
                :value="displayBankAccountName"
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
                :value="displayBankAccountNumber"
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

    <payment-method-sidebar v-if="invoiceData.company" :company="invoiceData.company" @payment-added="handlePaymentAdded" />
    <send-invoice-modal
      v-if="invoiceData.id"
      :invoice="invoiceData"
      :visible.sync="showSendModal"
    />
    <mark-paid-modal
      :visible.sync="showMarkPaidModal"
      :invoice-date="invoiceData.date"
      :initial-paid-date="invoiceData.paidDate"
      @confirm="handleMarkPaidConfirm"
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
import MarkPaidModal from '@/components/uiComponents/MarkPaidModal.vue'
import { BSpinner, BAlert } from 'bootstrap-vue' // Add this import
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
    MarkPaidModal,
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

      // GST override gate — user toggled GST on against company defaults.
      if (this.shouldShowGstOverrideModal()) {
        this.gstOverrideDontShowAgain = false
        this.showGstOverrideModal = true
        return
      }

      await this.persistInvoice()
    },

    async persistInvoice() {
      try {
        const data = this.buildRequestData()
        const saved = await this.$store.dispatch('invoices/update', data)
        // Refresh totals from server — backend is authoritative.
        this.refreshTotalsFromStore(saved)
        this.originalInvoiceSnapshot = this.normalizeInvoiceForComparison(this.invoiceData, this.effectivePaymentMethods)
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

    async handleGstOverrideConfirm() {
      if (this.gstOverrideDontShowAgain) {
        try { window.localStorage.setItem('gst_override_warning_hidden', '1') } catch (_) { /* ignore */ }
      }
      this.showGstOverrideModal = false
      await this.persistInvoice()
    },

    handleGstOverrideCancel() {
      this.showGstOverrideModal = false
    },

    buildRequestData() {
      // `amount` is intentionally omitted — InvoiceGstCalculatorService recomputes it.
      const attributes = {
        name: this.invoiceData.number,
        invoice_date: this.invoiceData.date,
        due_date: this.invoiceData.dueDate,
        ref: this.invoiceData.number,
        note: this.invoiceData.note,
        // Only send paid_date when the invoice is paid; backend clears it on unpaid.
        paid_date: Number(this.invoiceData.status) === 1 ? (this.invoiceData.paidDate || null) : null,
        // Explicit invoice-level toggle wins over company defaults on the backend.
        gst_applied: !!this.invoiceData.gst_applied,
        // Per-invoice payment selection — (re)snapshots the company's
        // PaymentDetail into this invoice's *_snapshot columns server-side.
        paymentMethods: this.effectivePaymentMethods,
        items: this.invoiceData.items.map(item => ({
          id: item.id || undefined,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          amount: item.amount,
          product_id: item.productId || null,
        }))
      }

      if (this.invoiceData.gst_applied) {
        attributes.gst_price_mode = this.invoiceData.gst_price_mode || 'gst_exclusive'
      }

      return {
        data: {
          type: "invoices",
          id: this.invoiceData.id,
          attributes,
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
    },

    refreshTotalsFromStore(savedInvoice = null) {
      const saved = savedInvoice || this.$store.getters["invoices/invoice"]
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
      // Server is authoritative — methods not configured anymore are
      // dropped server-side. Re-hydrate so the next dirty-check baseline
      // matches what was actually persisted.
      if (Array.isArray(saved.payment_methods_snapshot)) {
        this.selectedPaymentMethods = saved.payment_methods_snapshot.filter(
          m => m === 'payid' || m === 'bank'
        )
      }
      // Mirror the persisted snapshot back into invoiceData so the
      // overview's readonly preview reflects what's actually on the
      // invoice (not the company's live PaymentDetail).
      const snapshotKeys = [
        'payid_snapshot',
        'payid_name_snapshot',
        'bank_name_snapshot',
        'bank_account_name_snapshot',
        'bank_bsb_snapshot',
        'bank_account_number_snapshot',
      ]
      snapshotKeys.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(saved, key)) {
          this.$set(this.invoiceData, key, saved[key])
        }
      })
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
    
    openMarkPaidModal() {
      this.showMarkPaidModal = true
    },
    async handleMarkPaidConfirm(paidDate) {
      await this.applyPaidStatus(1, paidDate)
    },
    async handleMarkUnpaid() {
      await this.applyPaidStatus(0, null)
    },
    async applyPaidStatus(status, paidDate) {
      if (!this.invoiceData.id) return
      try {
        const attributes = { status }
        if (status === 1 && paidDate) attributes.paid_date = paidDate
        const payload = {
          data: {
            type: 'invoices',
            id: this.invoiceData.id,
            attributes,
          },
        }
        await this.$store.dispatch('invoices/update', payload)
        this.invoiceData.status = status
        this.invoiceData.paidDate = status === 1 ? paidDate : null
        this.originalInvoiceSnapshot = this.normalizeInvoiceForComparison(this.invoiceData, this.effectivePaymentMethods)
        this.$toast.success(
          status === 1 ? this.t('Invoice marked as paid.') : this.t('Invoice marked as unpaid.'),
          {
            position: 'top-right',
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000,
          }
        )
      } catch (e) {
        console.error('applyPaidStatus error:', e)
        this.$toast.error('Something went wrong! Try again later.', {
          position: 'top-right',
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      }
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
    // Payment related — multi-select. Either, both, or neither of
    // 'payid' / 'bank'. Matches what the backend persists into
    // invoices.payment_methods_snapshot.
    //
    // We start empty so the user always makes an intentional choice. The
    // auto-pick watcher below selects the single available method for them
    // when there's only one option.
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

    // The list actually sent to the backend (and to Pdf.vue): empty when
    // the master "Payment details" switch is off, regardless of checkboxes.
    const effectivePaymentMethods = computed(() =>
      paymentDetails.value ? selectedPaymentMethods.value : []
    )
    const loading = ref(true) // Add loading state
    const errors = ref(null) // Add error state
    const showSendModal = ref(false)
    const showMarkPaidModal = ref(false)
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
          paidDate: rawInvoice.paid_date || null,
          status: rawInvoice.status,
          amount: rawInvoice.amount,
          subtotal: rawInvoice.subtotal ?? rawInvoice.amount,
          gst_amount: rawInvoice.gst_amount ?? '0.00',
          // Snapshot wins — even if the company later toggled GST off,
          // this invoice still loads with its historical GST behaviour.
          gst_applied:    !!rawInvoice.gst_registered_snapshot,
          gst_price_mode: rawInvoice.gst_price_mode_snapshot || PRICE_MODE_EXCLUSIVE,
          note: rawInvoice.note || '',
          company: rawInvoice.company
            ? rawInvoice.company
            : null,
          customer: rawInvoice.customer || null,
          items: rawInvoice.items || [], // Adjust if items come from elsewhere
          // Payment snapshot — frozen at the last explicit save, so the
          // overview keeps showing what the customer was billed even after
          // the company later changes its PaymentDetail.
          payid_snapshot:                rawInvoice.payid_snapshot                ?? null,
          payid_name_snapshot:           rawInvoice.payid_name_snapshot           ?? null,
          bank_name_snapshot:            rawInvoice.bank_name_snapshot            ?? null,
          bank_account_name_snapshot:    rawInvoice.bank_account_name_snapshot    ?? null,
          bank_bsb_snapshot:             rawInvoice.bank_bsb_snapshot             ?? null,
          bank_account_number_snapshot: rawInvoice.bank_account_number_snapshot   ?? null,
        }

        // Hydrate the multi-select from the invoice's snapshot. Legacy
        // invoices (no snapshot) are left empty; the auto-pick watcher
        // pre-selects the company's only available method when there's
        // exactly one.
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
        noteSwitch.value = !!invoiceData.value.note
        originalInvoiceSnapshot.value = normalizeInvoiceForComparison(
          invoiceData.value,
          effectivePaymentMethods.value
        )

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

    // Bank details now flow from invoiceData.company.paymentDetail
    // (encrypted on the backend, read-only in this form).
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

    // Display values: snapshot wins, live PaymentDetail is the fallback.
    // This is what makes the overview's payment block reflect what's
    // actually on the invoice rather than the company's current state.
    const displayPayid = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      return invoiceData.value.payid_snapshot || (pd && pd.payid) || ''
    })
    const displayBankName = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      return invoiceData.value.bank_name_snapshot || (pd && pd.bank_name) || ''
    })
    const displayBankAccountName = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      return invoiceData.value.bank_account_name_snapshot || (pd && pd.account_name) || ''
    })
    const displayBankAccountNumber = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      return invoiceData.value.bank_account_number_snapshot || (pd && pd.account_number) || ''
    })

    const formattedBsb = computed(() => {
      const pd = invoiceData.value.company && invoiceData.value.company.paymentDetail
      const raw = invoiceData.value.bank_bsb_snapshot || (pd && pd.bsb) || ''
      const digits = String(raw).replace(/\D/g, '')
      return digits.length === 6 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : raw
    })

    // Does the invoice (snapshot OR live company) have enough data to
    // render the bank block? When false the template shows the "Add bank
    // account details" CTA instead.
    const hasDisplayableBankAccount = computed(() =>
      Boolean(displayBankAccountName.value && formattedBsb.value && displayBankAccountNumber.value)
    )

    const gstPriceModeOptions = [
      { value: PRICE_MODE_EXCLUSIVE, label: t('GST Exclusive (price before GST)') },
      { value: PRICE_MODE_INCLUSIVE, label: t('GST Inclusive (price includes GST)') },
    ]

    // This screen is always tied to an existing invoice. isEditMode locks the
    // GST state to whatever was saved — neither company defaults nor anything
    // else may silently flip it.
    const isEditMode = computed(() => !!(invoiceData.value && invoiceData.value.id))

    const GST_OVERRIDE_LS_KEY = 'gst_override_warning_hidden'
    const showGstOverrideModal = ref(false)
    const gstOverrideDontShowAgain = ref(false)

    const gstOverrideActive = computed(() => {
      if (!invoiceData.value || !invoiceData.value.gst_applied) return false
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

    // Preview-only — backend recalculates on save.
    const recalcPreview = () => {
      if (!invoiceData.value || !invoiceData.value.items) return
      const preview = calculateInvoicePreview(
        invoiceData.value.items,
        !!invoiceData.value.gst_applied,
        invoiceData.value.gst_price_mode || PRICE_MODE_EXCLUSIVE
      )
      invoiceData.value.items.forEach((item, i) => {
        invoiceData.value.items[i].amount = preview.items[i]?.amount ?? '0.00'
      })
      invoiceData.value.subtotal   = preview.subtotal
      invoiceData.value.gst_amount = preview.gst_amount
      invoiceData.value.amount     = preview.amount
    }

    watch(
      () => [invoiceData.value && invoiceData.value.gst_applied, invoiceData.value && invoiceData.value.gst_price_mode],
      () => recalcPreview()
    )

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

    // Payment selection participates in the dirty check — toggling PayID
    // / Bank or the master switch enables Save Changes (same UX as GST).
    const normalizeInvoiceForComparison = (invoice, paymentMethods = []) => {
      if (!invoice) return null

      const methods = (Array.isArray(paymentMethods) ? paymentMethods : [])
        .filter(m => m === 'payid' || m === 'bank')
        .slice()
        .sort()

      return {
        number: invoice.number || '',
        date: invoice.date || '',
        dueDate: invoice.dueDate || '',
        paidDate: invoice.paidDate || '',
        status: invoice.status ?? null,
        amount: String(invoice.amount ?? ''),
        gst_applied: !!invoice.gst_applied,
        gst_price_mode: invoice.gst_price_mode || '',
        note: invoice.note || '',
        companyId: invoice.company?.id || null,
        customerId: invoice.customer?.id || null,
        paymentMethods: methods,
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

      const current = normalizeInvoiceForComparison(invoiceData.value, effectivePaymentMethods.value)
      const original = originalInvoiceSnapshot.value

      return JSON.stringify(current) !== JSON.stringify(original)
    })

    return {
      invoiceData,
      customers,
      companies,
      paymentDetails,
      noteSwitch,
      selectedPaymentMethods,
      payidSelected,
      bankSelected,
      effectivePaymentMethods,
      hasSavedBankAccount,
      hasSavedPayid,
      hasDisplayableBankAccount,
      canSelectPayid,
      canSelectBank,
      displayPayid,
      displayBankName,
      displayBankAccountName,
      displayBankAccountNumber,
      formattedBsb,
      t,
      addCustomerToInvoice,
      handlePaymentAdded,
      loading, // Expose loading state
      errors, // Expose error state
      formErrors,
      showSendModal,
      showMarkPaidModal,
      shareLinkState,
      shareInvoice,
      originalInvoiceSnapshot,
      normalizeInvoiceForComparison,
      hasInvoiceChanges,
      manualShareCopyText,
      manualShareCopyVisible,
      gstPriceModeOptions,
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
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';

.gst-override-warning {
  font-size: 0.8rem;
  line-height: 1.35;
  color: #8a6d3b;
  background: #fcf8e3;
  border: 1px solid #faebcc;
  border-radius: 4px;
  padding: 6px 10px;
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

input{
  cursor: pointer;
}
</style>
