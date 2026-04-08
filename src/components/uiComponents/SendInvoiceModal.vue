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
          <b-button variant="primary" @click="openEmail" :disabled="!recipientEmail">
            {{ t('Open Email') }}
          </b-button>
        </div>
      </div>

    </div>
  </b-modal>
</template>

<script>
import { ref, watch } from 'vue'
import store from '@/store'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

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

    const loading = ref(false)
    const loadError = ref(null)
    const copying = ref(false)

    const recipientEmail = ref('')
    const subject = ref('')
    const body = ref('')

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
      if (pd && pd.payid) {
        return `PayID: ${pd.payid}\nReference: ${inv.number || inv.ref || ''}`
      }
      // Bank account details live in invoice.note when that method is selected
      if (inv.note && inv.note.includes('BSB')) {
        return inv.note
      }
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

      // mailto: has practical body limits (~2000 chars in most clients)
      // We truncate gracefully rather than silently break
      const encodedSubject = encodeURIComponent(subject.value)
      const encodedBody = encodeURIComponent(body.value.slice(0, 1900))

      window.location.href = `mailto:${encodeURIComponent(recipientEmail.value)}?subject=${encodedSubject}&body=${encodedBody}`
    }

    function copyMessage() {
      const fullText = `Subject: ${subject.value}\n\n${body.value}`

      // execCommand fallback works on HTTP/localhost and all Vue 2 target browsers
      const ta = document.createElement('textarea')
      ta.value = fullText
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()

      let success = false
      try {
        success = document.execCommand('copy')
      } catch (e) {
        success = false
      }
      document.body.removeChild(ta)

      // Try modern API as well if available (HTTPS / secure context)
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(fullText).catch(() => {})
      }

      if (success || (navigator.clipboard && window.isSecureContext)) {
        copying.value = true
        setTimeout(() => { copying.value = false }, 2000)
      }
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
    }
  },
}
</script>
