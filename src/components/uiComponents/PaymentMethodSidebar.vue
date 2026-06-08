<template>
  <b-sidebar
    id="sidebar-payment-method"
    sidebar-class="sidebar-lg"
    bg-variant="white"
    shadow
    backdrop
    no-header
    right
  >
    <template #default="{ hide }">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center content-sidebar-header px-2 py-1">
        <h4 class="mb-0">
          {{ mode === 'create' ? t('Add Payment Details') : t('Edit Payment Details') }}
        </h4>
        <base-feather-icon
          class="ml-1 cursor-pointer"
          icon="XIcon"
          size="16"
          @click="hide"
        />
      </div>

      <!-- Body -->
      <b-form class="p-2" @submit.prevent="submitForm">
        <p class="small mb-2">
          {{ t('Add either a PayID, a bank account, or both. Toggle the “Show on invoice” switches to control which one appears on the invoices you send.') }}
        </p>

        <!-- ============================================================ -->
        <!-- PayID section                                                 -->
        <!-- ============================================================ -->
        <div class="payment-section mb-2">
          <div class="payment-section-header">
            <div>
              <strong>{{ t('PayID') }}</strong>
              <p class="mb-0 text-muted small">{{ t('Phone, email or ABN that your customers can pay.') }}</p>
            </div>

            <div class="d-flex align-items-center">
              <span class="small text-muted mr-1">{{ t('Show on invoice') }}</span>
              <b-form-checkbox
                v-model="formData.show_payid"
                switch
              />
            </div>
          </div>

          <b-form-group :label="t('PayID')" label-for="payid">
            <b-form-input
              id="payid"
              v-model="formData.payid"
              type="text"
              trim
              :placeholder="t('e.g. you@business.com')"
            />
          </b-form-group>

          <b-form-group :label="t('Name')" label-for="payidName">
            <b-form-input
              id="payidName"
              v-model="formData.name"
              type="text"
              trim
              :placeholder="t('Used for your reference')"
            />
          </b-form-group>
        </div>

        <!-- ============================================================ -->
        <!-- Bank account section                                          -->
        <!-- ============================================================ -->
        <div class="payment-section mb-2">
          <div class="payment-section-header">
            <div>
              <strong>{{ t('Bank Account') }}</strong>
              <p class="mb-0 text-muted small">{{ t('BSB + account number for direct bank transfers.') }}</p>
            </div>

            <div class="d-flex align-items-center">
              <span class="small text-muted mr-1">{{ t('Show on invoice') }}</span>
              <b-form-checkbox
                v-model="formData.show_bank_details"
                switch
              />
            </div>
          </div>

          <b-form-group :label="t('Bank name')" label-for="bankName">
            <b-form-input
              id="bankName"
              v-model="formData.bank_name"
              type="text"
              trim
              :placeholder="t('e.g. Commonwealth Bank')"
            />
          </b-form-group>

          <b-form-group :label="t('Account name')" label-for="accountName">
            <b-form-input
              id="accountName"
              v-model="formData.account_name"
              type="text"
              trim
              :placeholder="t('Name on the bank account')"
            />
          </b-form-group>

          <b-form-group :label="t('BSB')" label-for="bsb">
            <b-form-input
              id="bsb"
              v-model="formData.bsb"
              type="text"
              trim
              placeholder="000-000"
              maxlength="7"
              @input="onBsbInput"
            />
            <small v-if="bsbInvalid" class="text-danger">
              {{ t('BSB must be 6 digits.') }}
            </small>
          </b-form-group>

          <b-form-group :label="t('Account number')" label-for="accountNumber">
            <b-form-input
              id="accountNumber"
              v-model="formData.account_number"
              type="text"
              maxlength="20"
              trim
              :placeholder="t('Up to 20 digits')"
            />
          </b-form-group>
        </div>

        <!-- Validation summary -->
        <b-alert :show="formErrors.length > 0" variant="danger" class="mb-2">
          <ul class="mb-0 pl-3">
            <li v-for="(err, i) in formErrors" :key="i">{{ err }}</li>
          </ul>
        </b-alert>

        <!-- Form Actions -->
        <div class="d-flex mt-2">
          <b-button
            v-ripple.400="'rgba(255, 255, 255, 0.15)'"
            variant="primary"
            class="mr-2"
            type="submit"
            :disabled="submitting"
          >
            {{ submitting ? t('Saving…') : t('Save') }}
          </b-button>
          <b-button
            v-ripple.400="'rgba(186, 191, 199, 0.15)'"
            variant="outline-secondary"
            @click="hide"
          >
            {{ t('Cancel') }}
          </b-button>
        </div>

        <div v-if="hasExistingPayment" class="payment-sidebar-danger mt-3">
          <div class="payment-sidebar-danger-copy">
            <h6 class="mb-50">{{ t('Delete payment details') }}</h6>
            <p class="mb-0">
              {{ t('Removes both the PayID and the bank account from invoices.') }}
            </p>
          </div>
          <b-button
            variant="outline-danger"
            size="sm"
            :disabled="submitting"
            @click="confirmDelete(hide)"
          >
            <base-feather-icon icon="Trash2Icon" size="15" class="mr-50" />
            {{ t('Delete') }}
          </b-button>
        </div>
      </b-form>
    </template>
  </b-sidebar>
</template>

<script>
import { ref, computed, watch, getCurrentInstance } from 'vue'
import Ripple from 'vue-ripple-directive'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

const emptyForm = () => ({
  name: '',
  payid: '',
  account_name: '',
  bsb: '',
  account_number: '',
  bank_name: '',
  show_payid: true,
  show_bank_details: true,
})

const filled = v => v !== null && v !== undefined && String(v).trim() !== ''

export default {
  components: {
    BaseFeatherIcon,
  },
  directives: {
    Ripple,
  },
  props: {
    company: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      default: 'create', // or 'update'
    },
  },
  setup(props, { emit }) {
    const { t } = useI18nUtils()
    const { proxy } = getCurrentInstance()

    const formData = ref(emptyForm())
    const submitting = ref(false)
    const formErrors = ref([])

    // Hydrate from the company's saved paymentDetail whenever the prop changes.
    // Empty state defaults to both toggles ON — but they auto-disable below
    // until the section has values, so the user can never save an "on but empty"
    // record that the backend would reject.
    watch(() => props.company, (newCompany) => {
      formErrors.value = []
      const pd = newCompany && newCompany.paymentDetail
      if (pd && pd.id) {
        formData.value = {
          name:              pd.name || '',
          payid:             pd.payid || '',
          account_name:      pd.account_name || '',
          bsb:               pd.bsb || '',
          account_number:    pd.account_number || '',
          bank_name:         pd.bank_name || '',
          show_payid:        pd.show_payid !== false,
          show_bank_details: pd.show_bank_details !== false,
        }
      } else {
        formData.value = emptyForm()
      }
    }, { immediate: true, deep: true })

    const payidConfigured = computed(() => filled(formData.value.payid))
    const bankConfigured = computed(() =>
      filled(formData.value.account_name)
      && filled(formData.value.bsb)
      && filled(formData.value.account_number)
    )
    const hasExistingPayment = computed(() => Boolean(
      props.mode === 'update'
      && props.company
      && props.company.paymentDetail
      && props.company.paymentDetail.id,
    ))

    // The "Show on invoice" toggles reflect the user's preference, not the
    // current data state — leaving a section empty no longer flips the
    // toggle off. The invoice-rendering pipeline already skips empty
    // sections, so an "on but empty" preference is harmless and stays
    // ready for when the user adds data later.

    const bsbInvalid = computed(() => {
      const v = (formData.value.bsb || '').replace(/\D/g, '')
      return v !== '' && v.length !== 6
    })

    function onBsbInput(value) {
      // Light formatting: keep digits + a single dash after position 3,
      // matching the placeholder. The backend strips dashes anyway.
      const digits = (value || '').replace(/\D/g, '').slice(0, 6)
      formData.value.bsb = digits.length > 3
        ? `${digits.slice(0, 3)}-${digits.slice(3)}`
        : digits
    }

    function buildPayload(existingId) {
      const attrs = {
        name:              formData.value.name || null,
        payid:             formData.value.payid || null,
        account_name:      formData.value.account_name || null,
        bsb:               (formData.value.bsb || '').replace(/\D/g, '') || null,
        account_number:    formData.value.account_number || null,
        bank_name:         formData.value.bank_name || null,
        // Persist the user's display preference as-is, even when its
        // section is empty. The render pipeline already hides empty
        // sections, so an "on but empty" toggle is a no-op visually but
        // preserves intent for when data is added later.
        show_payid:        Boolean(formData.value.show_payid),
        show_bank_details: Boolean(formData.value.show_bank_details),
      }
      const payload = {
        data: {
          type: 'paymentDetails',
          attributes: attrs,
          relationships: {
            company: { data: { type: 'companies', id: props.company.id } },
          },
        },
      }
      if (existingId) payload.data.id = existingId
      return payload
    }

    function validate() {
      const errors = []
      if (!payidConfigured.value && !bankConfigured.value) {
        errors.push(t('Please add either a PayID or the full bank account details.'))
      }
      if (filled(formData.value.bsb) && bsbInvalid.value) {
        errors.push(t('BSB must be 6 digits.'))
      }
      // Partial bank: any one of the three set without the others
      const bankParts = [formData.value.account_name, formData.value.bsb, formData.value.account_number].map(filled)
      const someBank = bankParts.some(Boolean)
      const allBank = bankParts.every(Boolean)
      if (someBank && !allBank) {
        errors.push(t('To show a bank account, fill in account name, BSB and account number.'))
      }
      formErrors.value = errors
      return errors.length === 0
    }

    async function submitForm() {
      if (!validate()) return
      submitting.value = true

      try {
        const existingId = (props.company && props.company.paymentDetail && props.company.paymentDetail.id) || null
        const payload = buildPayload(existingId)

        if (props.mode === 'create' || !existingId) {
          await proxy.$store.dispatch('paymentMethods/add', payload)
        } else {
          await proxy.$store.dispatch('paymentMethods/update', payload)
        }

        const response = proxy.$store.getters['paymentMethods/paymentMethod']

        proxy.$toast.success(
          props.mode === 'create' ? t('Payment details saved.') : t('Payment details updated.'),
          { position: 'top-right', icon: CheckCircleIcon, closeButton: false, hideProgressBar: true, timeout: 2000 }
        )

        emit(existingId ? 'payment-updated' : 'payment-added', response)
        proxy.$root.$emit('bv::toggle::collapse', 'sidebar-payment-method')
      } catch (e) {
        proxy.$toast.error(t('Something went wrong. Please try again.'), {
          position: 'top-right', icon: AlertCircleIcon, closeButton: false, hideProgressBar: true, timeout: 3000,
        })
      } finally {
        submitting.value = false
      }
    }

    function confirmDelete(hide) {
      const existingId = props.company && props.company.paymentDetail && props.company.paymentDetail.id
      if (!existingId) return

      proxy.$bvModal.msgBoxConfirm(
        t('Reset your saved payment details? This removes both the PayID and the bank account from invoices.'),
        {
          title: t('Please confirm'),
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: t('YES'),
          cancelTitle: t('NO'),
          cancelVariant: 'primary',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true,
        },
      )
        .then(value => {
          if (!value) return
          hide()
          emit('delete-requested', existingId)
        })
        .catch(() => {})
    }

    return {
      t,
      formData,
      formErrors,
      submitting,
      payidConfigured,
      bankConfigured,
      bsbInvalid,
      onBsbInput,
      submitForm,
      hasExistingPayment,
      confirmDelete,
    }
  },
}
</script>

<style scoped>
.payment-section {
  border: 1px solid #e6edf7;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #fafbfd;
}

.payment-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.payment-sidebar-danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid #f1d4d4;
  background: #fdf6f6;
}

.payment-sidebar-danger-copy {
  min-width: 0;
}

.payment-sidebar-danger-copy h6 {
  color: #b42318;
  font-weight: 600;
}

.payment-sidebar-danger-copy p {
  color: #8a4a47;
  font-size: 0.85rem;
}

@media (max-width: 575.98px) {
  .payment-sidebar-danger {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
