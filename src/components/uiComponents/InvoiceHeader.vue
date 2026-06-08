<template>
  <b-card-body class="invoice-padding pb-0">
    <div class="d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0">
      <!-- Header: Left Content -->
      <div>
        <div class="logo-wrapper">
          <h3 class="invoice-header invoice-logo">
            {{ invoiceHeaderTitle }}
          </h3>
        </div>
      </div>

      <!-- Header: Right Content -->
      <div class="invoice-number-date mt-md-0 mt-2">
        <div class="d-flex align-items-center justify-content-md-end mb-1">
          <h4 class="invoice-title">
            {{ t("Invoice") }}
          </h4>
          <b-input-group class="input-group-merge invoice-edit-input-group">
            <b-input-group-prepend is-text>
              <base-feather-icon icon="HashIcon" />
            </b-input-group-prepend>
            <b-form-input
              id="invoice-data-id"
              v-model="localInvoiceNumber"
              required
              :state="invoiceNumberState"
              @input="updateInvoiceNumber"
            />
            <b-form-invalid-feedback>
              Invoice number is required
            </b-form-invalid-feedback>
          </b-input-group>
        </div>
        <div
          v-if="isOverviewPage && status !== null"
          class="d-flex align-items-center mb-1"
        >
          <span class="title">
            {{ t("Status") }}
          </span>
          <span
            class="invoice-status-badge"
            :class="statusBadgeClass"
          >
            {{ statusLabel }}
          </span>
        </div>
        <div class="d-flex align-items-center mb-1">
          <span class="title">
            {{ t("Date") }}
          </span>
          <flat-pickr
            v-model="displayDate"
            class="form-control invoice-edit-input"
            :config="datePickerConfig"
            required
          />
        </div>
        <div class="d-flex flex-column">
          <div class="d-flex align-items-center">
            <span class="title">
              {{ t("Due Date") }}
            </span>
            <flat-pickr
              v-model="displayDueDate"
              class="form-control invoice-edit-input"
              :class="{ 'is-invalid': !dueDateState }"
              :config="datePickerConfig"
              required
            />
          </div>
          <div class="d-flex due-date-presets">
            <span class="due-date-title" aria-hidden="true" />
            <div class="d-flex due-date-presets-actions">
              <b-badge
                v-for="days in dueDatePresets"
                :key="days"
                variant="light-primary"
                class="due-date-preset-badge"
                @click="applyDueDatePreset(days)"
              >
                {{ t("Due") }} {{ days }}
              </b-badge>
            </div>
          </div>
        </div>
        <div
          v-if="isOverviewPage && status === 1"
          class="d-flex align-items-center mt-1"
        >
          <span class="title">
            {{ t("Paid Date") }}
          </span>
          <flat-pickr
            v-model="displayPaidDate"
            class="form-control invoice-edit-input"
            :config="datePickerConfig"
          />
        </div>
      </div>
    </div>
  </b-card-body>
</template>

<script>
import flatPickr from 'vue-flatpickr-component'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { dateNow, formatDateForDisplay, formatDateForStorage } from '@/libs/dateUtils.js'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import { ref, watch, computed, onMounted } from 'vue'

dayjs.extend(customParseFormat)

export default {
  components: {
    flatPickr,
    BaseFeatherIcon,
  },
  props: {
    invoiceData: {
      type: Object,
      required: true,
    },
    // Add the prop to determine if it`s the overview page
    isOverviewPage: {
      type: Boolean,
      default: false, // default to false if not provided
    },
  },
  setup(props) {
    const { t } = useI18nUtils()
    
    const datePickerConfig = {
      dateFormat: 'd/m/Y',
    }

    // Local state synced with props
    const localInvoiceNumber = ref(props.invoiceData.number || '')
    const displayDate = ref(formatDateForDisplay(props.invoiceData.date || new Date())) // Default to today if no date
    const displayDueDate = ref(
      props.invoiceData.dueDate ? formatDateForDisplay(props.invoiceData.dueDate) : ''
    )
    const displayPaidDate = ref(
      props.invoiceData.paidDate ? formatDateForDisplay(props.invoiceData.paidDate) : ''
    )
    const paidDatePickerConfig = computed(() => ({
      dateFormat: 'd/m/Y',
    }))

    // Validation for invoice number
    const invoiceNumberState = computed(() => {
      return localInvoiceNumber.value ? true : false
    })

    const dueDateState = computed(() => !!displayDueDate.value)

    const dueDatePresets = [3, 7, 14]

    const applyDueDatePreset = (days) => {
      const base = displayDate.value
        ? dayjs(displayDate.value, 'DD/MM/YYYY')
        : dayjs()
      displayDueDate.value = base.add(days, 'day').format('DD/MM/YYYY')
    }

    // Update parent when invoice number changes
    const updateInvoiceNumber = (value) => {
      props.invoiceData.number = value
    }

    // Sync dates with parent
    watch(displayDate, (newVal) => {
      props.invoiceData.date = formatDateForStorage(newVal)
    })

    watch(displayDueDate, (newVal) => {
      props.invoiceData.dueDate = newVal ? formatDateForStorage(newVal) : null
    })

    watch(displayPaidDate, (newVal) => {
      props.invoiceData.paidDate = newVal ? formatDateForStorage(newVal) : null
    })

    // Sync with parent when props change (e.g., on load)
    watch(() => props.invoiceData.number, (newVal) => {
      if (newVal !== localInvoiceNumber.value) {
        localInvoiceNumber.value = newVal || ''
      }
    })

    watch(() => props.invoiceData.date, (newVal) => {
      if (newVal !== displayDate.value)
        displayDate.value = formatDateForDisplay(newVal || new Date()) // Default to today if null
    })

    watch(() => props.invoiceData.dueDate, (newVal) => {
      const next = newVal ? formatDateForDisplay(newVal) : ''
      if (next !== displayDueDate.value) displayDueDate.value = next
    })

    watch(() => props.invoiceData.paidDate, (newVal) => {
      const next = newVal ? formatDateForDisplay(newVal) : ''
      if (next !== displayPaidDate.value) displayPaidDate.value = next
    })

    // Trigger the update for the date on mounted if the date wasn't changed
    onMounted(() => {
      if (!props.invoiceData.date) {
        props.invoiceData.date = formatDateForStorage(displayDate.value)
      }
    })

    const status = computed(() => {
      const invoiceStatus = props.invoiceData?.status
      return invoiceStatus === null || invoiceStatus === undefined ? null : Number(invoiceStatus)
    })
    const isOverdue = computed(() => {
      if (status.value !== 0 || !displayDueDate.value) return false
      return formatDateForStorage(displayDueDate.value) < dateNow()
    })
    const statusLabel = computed(() => {
      if (status.value === 1) return t('Paid')
      return isOverdue.value ? t('Overdue') : t('Open')
    })
    const statusBadgeClass = computed(() => {
      if (status.value === 1) return 'invoice-status-badge--paid'
      return isOverdue.value ? 'invoice-status-badge--overdue' : 'invoice-status-badge--unpaid'
    })
    const invoiceHeaderTitle = computed(() => (
      props.invoiceData?.gst_applied ? 'TAX INVOICE' : 'INVOICE'
    ))

    return {
      t,
      localInvoiceNumber,
      displayDate,
      displayDueDate,
      displayPaidDate,
      datePickerConfig,
      paidDatePickerConfig,
      invoiceNumberState,
      dueDateState,
      dueDatePresets,
      applyDueDatePreset,
      updateInvoiceNumber,
      status,
      statusLabel,
      statusBadgeClass,
      invoiceHeaderTitle,
    }
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-flatpicker.scss';
</style>

<style lang="scss" scoped>
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';

.invoice-header {
  color: #007eca !important;
  border-color: #007eca;
}

.invoice-edit-input-group {
  max-width: 200px;
}

.title {
  min-width: 80px;
}
.logo-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.invoice-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.75rem;
  padding: 0.32rem 0.68rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  white-space: nowrap;
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

.due-date-presets {
  margin-top: 0.35rem;
}

.due-date-presets-actions {
  gap: 0.35rem;
  flex-wrap: wrap;
}

.due-date-preset-badge {
  cursor: pointer;
  user-select: none;
  font-size: 0.7rem;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
}
.due-date-title {
  min-width: 80px;
}
@media (min-width: 540px) {
  .due-date-title {
  min-width: 115px;
 }
}

</style>
