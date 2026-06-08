<template>
  <b-modal
    :visible="visible"
    :title="t('When was this invoice paid?')"
    centered
    no-fade
    hide-footer
    @hidden="onHidden"
    @shown="onShown"
  >
    <div class="mark-paid-modal">
      <div class="mark-paid-chips" role="tablist">
        <button
          type="button"
          :class="['mark-paid-chip', { 'mark-paid-chip--active': mode === 'today' }]"
          @click="selectMode('today')"
        >
          {{ t('Today') }}
        </button>
        <button
          type="button"
          :class="['mark-paid-chip', { 'mark-paid-chip--active': mode === 'yesterday' }]"
          @click="selectMode('yesterday')"
        >
          {{ t('Yesterday') }}
        </button>
        <button
          type="button"
          :class="['mark-paid-chip', { 'mark-paid-chip--active': mode === 'custom' }]"
          @click="selectMode('custom')"
        >
          {{ t('Custom') }}
        </button>
      </div>

      <div v-if="mode === 'custom'" class="mark-paid-picker">
        <flat-pickr
          v-model="customDisplayDate"
          :config="datePickerConfig"
          class="form-control"
        />
      </div>

      <p v-if="invoiceDate" class="mark-paid-helper mb-0">
        {{ t('Invoice issued') }} {{ formatDateForDisplay(invoiceDate) }} ·
        {{ t('cannot be before that date.') }}
      </p>

      <p v-if="errorMessage" class="mark-paid-error mb-0">
        {{ errorMessage }}
      </p>

      <div class="mark-paid-actions">
        <b-button variant="outline-secondary" @click="onCancel">
          {{ t('Cancel') }}
        </b-button>
        <b-button
          ref="confirmBtn"
          variant="primary"
          :disabled="!!errorMessage || !resolvedDate"
          @click="onConfirm"
        >
          {{ t('Confirm payment') }}
        </b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import flatPickr from 'vue-flatpickr-component'
import { ref, computed, watch, nextTick } from 'vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import {
  dateNow,
  formatDateForDisplay,
  formatDateForStorage,
} from '@/libs/dateUtils.js'
import dayjs from 'dayjs'

export default {
  components: { flatPickr },
  props: {
    visible: { type: Boolean, default: false },
    invoiceDate: { type: String, default: null },
    initialPaidDate: { type: String, default: null },
  },
  setup(props, { emit }) {
    const { t } = useI18nUtils()
    const confirmBtn = ref(null)

    const today = computed(() => dateNow())
    const yesterday = computed(() => dayjs().subtract(1, 'day').format('YYYY-MM-DD'))

    const mode = ref('today')
    const customDisplayDate = ref(formatDateForDisplay(today.value))

    // Non-reactive config: vue-flatpickr-component re-initialises the picker
    // whenever this object identity changes, which would snap navigation
    // back to today on every keystroke. Build it once per modal open and
    // pass minDate as a Date so format mismatches can't disable past months.
    const datePickerConfig = ref({
      dateFormat: 'd/m/Y',
      maxDate: 'today',
      minDate: null,
      allowInput: true,
      disableMobile: true,
    })

    const buildPickerConfig = () => {
      datePickerConfig.value = {
        dateFormat: 'd/m/Y',
        maxDate: 'today',
        minDate: props.invoiceDate ? dayjs(props.invoiceDate).toDate() : null,
        allowInput: true,
        disableMobile: true,
      }
    }

    const resolvedDate = computed(() => {
      if (mode.value === 'today') return today.value
      if (mode.value === 'yesterday') return yesterday.value
      if (!customDisplayDate.value) return null
      return formatDateForStorage(customDisplayDate.value)
    })

    const errorMessage = computed(() => {
      const d = resolvedDate.value
      if (!d) return t('Please pick a date.')
      if (d > today.value) return t('Paid date cannot be in the future.')
      if (props.invoiceDate && d < props.invoiceDate) {
        return t('Paid date cannot be before the invoice date.')
      }
      return ''
    })

    const initFromProps = () => {
      const initial = props.initialPaidDate
      if (initial && initial !== today.value && initial !== yesterday.value) {
        mode.value = 'custom'
        customDisplayDate.value = formatDateForDisplay(initial)
      } else if (initial === yesterday.value) {
        mode.value = 'yesterday'
      } else {
        mode.value = 'today'
        customDisplayDate.value = formatDateForDisplay(today.value)
      }
    }

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          buildPickerConfig()
          initFromProps()
        }
      },
      { immediate: true }
    )

    const selectMode = (next) => {
      mode.value = next
      if (next === 'custom' && !customDisplayDate.value) {
        customDisplayDate.value = formatDateForDisplay(today.value)
      }
    }

    const onShown = async () => {
      await nextTick()
      if (confirmBtn.value && confirmBtn.value.$el && typeof confirmBtn.value.$el.focus === 'function') {
        confirmBtn.value.$el.focus()
      }
    }

    const onHidden = () => {
      emit('update:visible', false)
    }

    const onCancel = () => {
      emit('update:visible', false)
      emit('cancel')
    }

    const onConfirm = () => {
      if (errorMessage.value || !resolvedDate.value) return
      emit('confirm', resolvedDate.value)
      emit('update:visible', false)
    }

    return {
      t,
      mode,
      customDisplayDate,
      datePickerConfig,
      resolvedDate,
      errorMessage,
      confirmBtn,
      selectMode,
      onShown,
      onHidden,
      onCancel,
      onConfirm,
      formatDateForDisplay,
    }
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-flatpicker.scss';
</style>

<style lang="scss" scoped>
.mark-paid-modal {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.mark-paid-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mark-paid-chip {
  flex: 1 1 auto;
  min-width: 90px;
  padding: 0.45rem 0.85rem;
  border: 1px solid #e3e7ee;
  border-radius: 999px;
  background: #fff;
  color: #262b43;
  font-weight: 600;
  font-size: 0.9rem;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
  cursor: pointer;
}

.mark-paid-chip:hover {
  border-color: rgba(3, 102, 214, 0.4);
}

.mark-paid-chip--active {
  background: #0366d6;
  border-color: #0366d6;
  color: #fff;
}

.mark-paid-picker .form-control {
  font-weight: 500;
}

.mark-paid-helper {
  font-size: 0.8rem;
  color: #6b7280;
}

.mark-paid-error {
  font-size: 0.8rem;
  color: #c1121f;
}

.mark-paid-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
