<template>
  <b-card-body class="invoice-padding pb-0">
    <div class="d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0">
      <!-- Header: Left Content -->
      <div>
        <div class="logo-wrapper">
          <h3 class="invoice-header invoice-logo">
            TAX INVOICE
          </h3>
          <span
            v-if="isOverviewPage && status !== null"
            class="ml-2" 
            :class="{'status-paid': status === 1, 'status-overdue': status === 0}"
            >
            {{status == 1 ? t("Paid") : t("Unpaid") }}
          </span>
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
        <div class="d-flex align-items-center">
          <span class="title">
            {{ t("Due Date") }}
          </span>
          <flat-pickr
            v-model="displayDueDate"
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
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { formatDateForDisplay, formatDateForStorage } from '@/libs/dateUtils.js'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import { ref, watch, computed, onMounted } from 'vue'

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
    const displayDueDate = ref(formatDateForDisplay(props.invoiceData.dueDate))

    // Validation for invoice number
    const invoiceNumberState = computed(() => {
      return localInvoiceNumber.value ? true : false
    })

    // Update parent when invoice number changes
    const updateInvoiceNumber = (value) => {
      props.invoiceData.number = value
    }

    // Sync dates with parent
    watch(displayDate, (newVal) => {
      props.invoiceData.date = formatDateForStorage(newVal)
    })

    watch(displayDueDate, (newVal) => {
      props.invoiceData.dueDate = formatDateForStorage(newVal)
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
      if (newVal !== displayDueDate.value)
        displayDueDate.value = formatDateForDisplay(newVal)
    })

    // Trigger the update for the date on mounted if the date wasn't changed
    onMounted(() => {
      if (!props.invoiceData.date) {
        props.invoiceData.date = formatDateForStorage(displayDate.value)
      }
    })

    const status = props.invoiceData?.status

    return {
      t,
      localInvoiceNumber,
      displayDate,
      displayDueDate,
      datePickerConfig,
      invoiceNumberState,
      updateInvoiceNumber,
      status,
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
.status-paid{
  background-color: green;
  border-radius: 10%;
  color:#fff;
  padding: 10px;
  text-align: center;
  text-transform: uppercase;
}

.status-overdue{
  background-color: red;
  border-radius: 10%;
  color:#fff;
  padding: 10px;
  text-align: center;
  text-transform: uppercase;
}
</style>