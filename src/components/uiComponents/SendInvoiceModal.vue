<template>
  <b-modal
    id="sendInvoiceModal"
    ref="sendInvoiceModal"
    size="lg"
    hide-footer
    no-close-on-backdrop
    :visible="visible"
    @hide="$emit('update:visible', false)"
  >
    <template #modal-header="{ close }">
      <h5 class="modal-title">{{ t('Send Email') }}</h5>
      <b-button variant="link" class="text-muted p-0" @click="close()" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </b-button>
    </template>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-4">
      <b-spinner label="Loading..." />
      <p class="mt-2 text-muted small">{{ t('Generating secure invoice link...') }}</p>
    </div>

    <!-- Error state -->
    <b-alert v-else-if="loadError" variant="danger" show class="mb-0">
      {{ loadError }}
    </b-alert>

    <!-- Compose form -->
    <div v-else class="px-1">

      <!-- To -->
      <b-form-group :label="t('To')" label-class="font-weight-bold small text-uppercase text-muted">
        <b-alert
          v-if="!invoice.customer || !invoice.customer.email"
          variant="warning"
          show
          class="py-2 px-3 mb-1 small"
        >
          {{ t('No email address found for this customer. Please enter one below.') }}
        </b-alert>
        <b-form-input v-model="recipientEmail" type="email" placeholder="customer@example.com" />
      </b-form-group>

      <!-- Subject -->
      <b-form-group :label="t('Subject')" label-class="font-weight-bold small text-uppercase text-muted">
        <b-form-input v-model="subject" type="text" />
      </b-form-group>

      <!-- Message -->
      <b-form-group :label="t('Message')" label-class="font-weight-bold small text-uppercase text-muted">
        <b-form-textarea
          v-model="body"
          rows="12"
          style="font-family: monospace; font-size: 13px; resize: vertical;"
        />
        <div class="d-flex justify-content-end mt-1">
          <span class="text-muted small">{{ body.length }} chars</span>
        </div>
      </b-form-group>

      <!-- Actions -->
      <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
        <span class="text-muted small">&#128274; {{ t('Link expires in 30 days') }}</span>
        <div class="d-flex" style="gap: 8px;">
          <b-button variant="outline-secondary" @click="copyMessage" :disabled="copying">
            <b-spinner v-if="copying" small class="mr-1" />
            {{ copying ? t('Copied!') : t('Copy Message') }}
          </b-button>
          <b-dropdown
            split
            variant="primary"
            :text="providerLabel"
            :disabled="!recipientEmail"
            right
            @click="openEmail"
          >
            <b-dropdown-item
              v-for="opt in providerOptions"
              :key="opt.value"
              :active="emailProvider === opt.value"
              @click="selectProvider(opt.value)"
            >
              {{ opt.label }}
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>

      <div v-if="manualCopyVisible" class="mt-3">
        <b-alert variant="warning" show class="mb-2">
          {{t('Press Ctrl+C (Windows) or Cmd+C (Mac) to copy the message.')}}
        </b-alert>

        <b-form-textarea
          ref="manualCopyRef"
          v-model="manualCopyText"
          rows="10"
          readonly
          style="font-family: monospace; font-size: 13px;"
        />
      </div>

    </div>
  </b-modal>
</template>

<script>
import { ref, computed, watch, getCurrentInstance, nextTick } from 'vue'
import store from '@/store'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons'

export default {
  name: 'SendInvoiceModal',

  props: {
    invoice: {
      type: Object,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:visible'],

  setup(props, { emit }) {
    const { t } = useI18nUtils()
    const { proxy } = getCurrentInstance()
    const loading = ref(false)
    const loadError = ref(null)
    const copying = ref(false)
    const manualCopyVisible = ref(false)
    const manualCopyText = ref('')
    const manualCopyRef = ref(null)
    const recipientEmail = ref('')
    const subject = ref('')
    const body = ref('')

    const EMAIL_PROVIDER_STORAGE_KEY = 'send_invoice_email_provider'
    const providerOptions = [
      { value: 'default', label: t('Default Mail App') },
      { value: 'gmail', label: 'Gmail' },
      { value: 'outlook', label: 'Outlook' },
      { value: 'yahoo', label: 'Yahoo Mail' },
    ]

    function readStoredProvider() {
      try {
        const stored = localStorage.getItem(EMAIL_PROVIDER_STORAGE_KEY)
        if (stored && providerOptions.some(o => o.value === stored)) return stored
      } catch (e) { /* localStorage unavailable */ }
      return 'default'
    }

    const emailProvider = ref(readStoredProvider())

    const providerLabel = computed(() => {
      const opt = providerOptions.find(o => o.value === emailProvider.value)
      return opt ? `${t('Open in')} ${opt.label}` : t('Open Email')
    })

    function selectProvider(value) {
      emailProvider.value = value
      try {
        localStorage.setItem(EMAIL_PROVIDER_STORAGE_KEY, value)
      } catch (e) { /* localStorage unavailable */ }
    }

    // ----------------------------------------------------------------
    // Template helpers
    // ----------------------------------------------------------------

    function formatDate(value) {
      if (!value) return '—'
      try {
        return new Date(value).toLocaleDateString('en-AU', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      } catch {
        return value
      }
    }

    function formatAmount(value) {
      const num = parseFloat(value)
      if (isNaN(num)) return '0.00'
      return 'AUD $' + num.toFixed(2)
    }

    function buildPaymentDetails(inv) {
      const pd = inv.company && inv.company.paymentDetail
      if (!pd) {
        // Legacy invoices that embedded the bank account inside the note.
        if (inv.note && inv.note.includes('BSB')) return inv.note
        return ''
      }

      const ref = inv.number || inv.ref || ''
      const lines = []

      const showPayid = pd.show_payid !== false && pd.payid
      if (showPayid) {
        lines.push(`PayID: ${pd.payid}`)
        lines.push(`Reference: ${ref}`)
      }

      const showBank = pd.show_bank_details !== false
        && pd.account_name && pd.bsb && pd.account_number
      if (showBank) {
        if (lines.length) lines.push('')
        const digits = String(pd.bsb).replace(/\D/g, '')
        const formattedBsb = digits.length === 6 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : pd.bsb
        lines.push('Bank Account:')
        lines.push(pd.account_name)
        lines.push(`BSB: ${formattedBsb}`)
        lines.push(`Account: ${pd.account_number}`)
        lines.push(`Reference: ${ref}`)
      }

      if (lines.length) return lines.join('\n')

      // Final fallback for legacy notes
      if (inv.note && inv.note.includes('BSB')) return inv.note
      return ''
    }

    function hydrate(template, inv, invoiceUrl) {
      const paymentDetails = buildPaymentDetails(inv)
      return template
        .replace(/\{\{customer_name\}\}/g, (inv.customer && inv.customer.name) || '')
        .replace(/\{\{company_name\}\}/g, (inv.company && inv.company.name) || '')
        .replace(/\{\{invoice_number\}\}/g, inv.number || inv.ref || '')
        .replace(/\{\{invoice_date\}\}/g, formatDate(inv.date))
        .replace(/\{\{due_date\}\}/g, formatDate(inv.dueDate))
        .replace(/\{\{invoice_amount\}\}/g, formatAmount(inv.amount))
        .replace(/\{\{invoice_link\}\}/g, invoiceUrl || '')
        .replace(/\{\{payment_details\}\}/g, paymentDetails)
    }

    function defaultSubject(inv) {
      const company = (inv.company && inv.company.name) || ''
      const num = inv.number || inv.ref || ''
      return `Invoice ${num}${company ? ' from ' + company : ''}`
    }

    function defaultBody(inv, invoiceUrl) {
      const customerName = (inv.customer && inv.customer.name) || 'there'
      const company = (inv.company && inv.company.name) || ''
      const paymentDetails = buildPaymentDetails(inv)

      const lines = [
        `Hi ${customerName},`,
        '',
        'Please find your invoice here:',
        invoiceUrl || '',
        '',
        'You can also download the PDF from the same page.',
        '',
        `Invoice number: ${inv.number || inv.ref || ''}`,
        `Invoice date: ${formatDate(inv.date)}`,
        `Due date: ${formatDate(inv.dueDate)}`,
        `Amount: ${formatAmount(inv.amount)}`,
      ]

      if (paymentDetails) {
        lines.push('')
        lines.push('Payment Details:')
        lines.push(paymentDetails)
      }

      lines.push('')
      lines.push('Thanks,')
      lines.push(company || 'Us')

      return lines.join('\n')
    }

    // ----------------------------------------------------------------
    // Load signed link whenever modal opens
    // ----------------------------------------------------------------

    async function loadSignedLink(inv) {
      loading.value = true
      loadError.value = null

      try {
        const data = await store.dispatch('invoices/getSignedLink', inv.id)
        const invoiceUrl = data.invoice_url

        recipientEmail.value = (inv.customer && inv.customer.email) || ''
        subject.value = defaultSubject(inv)
        body.value = defaultBody(inv, invoiceUrl)
      } catch (err) {
        loadError.value = t('Failed to generate invoice link. Please try again.')
      } finally {
        loading.value = false
      }
    }

    watch(() => props.visible, (isVisible) => {
      if (isVisible && props.invoice && props.invoice.id) {
        loadSignedLink(props.invoice)
      }
    })

    // ----------------------------------------------------------------
    // Actions
    // ----------------------------------------------------------------

    function openEmail() {
      if (!recipientEmail.value) return

      const to = recipientEmail.value
      const encodedTo = encodeURIComponent(to)
      const encodedSubject = encodeURIComponent(subject.value)

      if (emailProvider.value === 'default') {
        // mailto: has practical body limits (~2000 chars in most clients)
        const encodedBody = encodeURIComponent(body.value.slice(0, 1900))
        window.location.href = `mailto:${encodedTo}?subject=${encodedSubject}&body=${encodedBody}`
        return
      }

      // Webmail clients accept longer bodies than mailto:
      const encodedBody = encodeURIComponent(body.value)
      let url = ''

      if (emailProvider.value === 'gmail') {
        url = `https://mail.google.com/mail/u/0/?view=cm&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`
      } else if (emailProvider.value === 'outlook') {
        url = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`
      } else if (emailProvider.value === 'yahoo') {
        url = `https://compose.mail.yahoo.com/?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`
      }

      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    }
    async function reliableCopyText(text) {
      if (!text || !String(text).trim()) return false

      if (
        !window.isSecureContext ||
        !navigator.clipboard ||
        typeof navigator.clipboard.writeText !== 'function'
      ) {
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (err) {
        return false
      }
    }

    async function openManualCopy(text) {
      manualCopyText.value = text
      manualCopyVisible.value = true

      await nextTick()

      const el = manualCopyRef.value
      if (el) {
        el.focus()
        el.select()
        el.setSelectionRange(0, text.length)
      }
    }

    async function copyMessage() {
      if (copying.value) return

      const fullText = String(body.value || '')

      if (!fullText.trim()) {
        proxy.$toast.error('Nothing to copy', {
          position: 'top-right',
          timeout: 2000,
          hideProgressBar: true,
        })
        return
      }

      copying.value = true

      const success = await reliableCopyText(fullText)

      if (success) {
        proxy.$toast.success('Message copied', {
          position: 'top-right',
          icon: CheckCircleIcon,
          timeout: 2000,
          hideProgressBar: true,
        })
      } else {
        await openManualCopy(fullText)

        proxy.$toast.error('Automatic copy blocked. Use Ctrl+C or Cmd+C.', {
          position: 'top-right',
          icon: AlertCircleIcon,
          timeout: 2500,
          hideProgressBar: true,
        })
      }

      copying.value = false
    }

    return {
      t,
      loading,
      loadError,
      copying,
      recipientEmail,
      subject,
      body,
      openEmail,
      copyMessage,
      manualCopyRef,
      manualCopyText,
      manualCopyVisible,
      emailProvider,
      providerOptions,
      providerLabel,
      selectProvider,
    }
  },
}
</script>
