<template>
  <div class="tax-settings">
    <div class="tax-section-header">
      <p class="tax-eyebrow mb-50">{{ t('Tax & GST Settings') }}</p>
      <h6 class="tax-title mb-50">{{ t('Configure how this business handles GST') }}</h6>
      <p class="tax-copy mb-1">
        {{ t('We use these settings to prepare your invoices. You can check your ABN to fill GST details from the Australian Business Register.') }}
      </p>
    </div>

    <!-- ABN + Check button -->
    <b-form-group :label="t('ABN')" label-for="tax-abn">
      <div class="tax-abn-row">
        <b-form-input
          id="tax-abn"
          :value="value.abn"
          trim
          maxlength="14"
          :placeholder="t('11-digit ABN')"
          @input="onAbnInput"
        />
        <b-button
          variant="outline-primary"
          class="tax-abn-button"
          :disabled="!canLookup"
          @click="onCheckAbnClicked"
        >
          <span v-if="lookupLoading">
            <b-spinner small class="mr-50" />
            {{ t('Checking...') }}
          </span>
          <span v-else>{{ t('Check ABN') }}</span>
        </b-button>
      </div>
      <small class="tax-hint">{{ t('Lookup uses the Australian Business Register. Nothing is saved until you confirm.') }}</small>
    </b-form-group>

    <!-- Lookup result card -->
    <b-alert
      :show="!!lookupError"
      variant="warning"
      class="tax-alert"
    >
      {{ lookupError }}
    </b-alert>

    <div v-if="lookupResult && !lookupError" class="tax-result-card">
      <div class="tax-result-row">
        <span class="tax-result-icon">✓</span>
        <span>{{ t('ABN status') }}: <strong>{{ lookupResult.abn_status || t('Unknown') }}</strong></span>
      </div>
      <div class="tax-result-row">
        <span class="tax-result-icon">✓</span>
        <span v-if="lookupResult.gst_registered">
          {{ t('GST registered since') }} <strong>{{ lookupResult.gst_registered_from || t('unknown date') }}</strong>
        </span>
        <span v-else>{{ t('Not GST registered') }}</span>
      </div>
      <div v-if="lookupResult.entity_type" class="tax-result-row">
        <span class="tax-result-icon">✓</span>
        <span>{{ t('Entity type') }}: <strong>{{ lookupResult.entity_type }}</strong></span>
      </div>
      <div v-if="lookupResult.entity_name" class="tax-result-name">
        {{ t('Business name') }}:
        <strong>{{ lookupResult.entity_name }}</strong>
      </div>
      <div class="tax-result-actions">
        <b-button
          variant="primary"
          size="sm"
          @click="useLookupDetails"
        >
          {{ t('Use these details') }}
        </b-button>
        <b-button
          variant="outline-secondary"
          size="sm"
          @click="dismissLookup"
        >
          {{ t('Discard') }}
        </b-button>
      </div>
    </div>

    <!-- GST registered toggle -->
    <b-form-group :label="t('GST registered')" class="mt-1">
      <b-form-radio-group
        :checked="value.gst_registered"
        :options="gstRegisteredOptions"
        buttons
        button-variant="outline-primary"
        size="sm"
        @input="onGstRegisteredChanged"
      />
    </b-form-group>

    <b-form-group
      v-if="value.gst_registered"
      :label="t('GST registered from')"
      label-for="gst-registered-from"
    >
      <flat-pickr
        id="gst-registered-from"
        class="form-control"
        :value="value.gst_registered_from || ''"
        :config="datePickerConfig"
        @input="onFieldChanged('gst_registered_from', $event)"
      />
    </b-form-group>

    <!-- GST price mode -->
    <b-form-group 
      v-if="value.gst_registered"
      :label="t('How do you enter your prices?')"
    >
      <b-form-radio-group
        :checked="selectedGstPriceMode"
        class="tax-price-mode-group"
        stacked
        @input="onFieldChanged('gst_price_mode', $event)"
      >
        <b-form-radio value="gst_exclusive" class="tax-price-mode-option">
          <span class="tax-price-mode-title">{{ t('GST exclusive') }}</span>
          <small class="d-block text-muted">{{ t('I enter prices before GST') }}</small>
        </b-form-radio>
        <b-form-radio value="gst_inclusive" class="tax-price-mode-option">
          <span class="tax-price-mode-title">{{ t('GST inclusive') }}</span>
          <small class="d-block text-muted">{{ t('I enter prices including GST') }}</small>
        </b-form-radio>
      </b-form-radio-group>
    </b-form-group>

    <!-- Override warning modal -->
    <b-modal
      v-model="showOverrideModal"
      :title="t('Replace your manual GST settings?')"
      ok-variant="primary"
      :ok-title="t('Replace with ABR data')"
      :cancel-title="t('Keep my settings')"
      @ok="performLookup(true)"
    >
      <p class="mb-0">
        {{ t('This business has manually edited GST settings. Do you want to replace them with the latest data from the Australian Business Register?') }}
      </p>
    </b-modal>
  </div>
</template>

<script>
import flatPickr from 'vue-flatpickr-component'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

// Strip non-digits and cap at 11. Mirrors the backend `clean()`.
const cleanAbn = (abn) => (abn || '').replace(/\D+/g, '').slice(0, 11)

// Map backend AbnLookupException error codes to user-friendly copy.
// Keeping this in one place makes localisation easier later.
const errorMessage = (errorCode, t) => {
  switch (errorCode) {
    case 'invalid_abn_format':
      return t('That doesn\'t look like a valid 11-digit ABN.')
    case 'invalid_abn_checksum':
      return t('That ABN failed the official ATO checksum. Please double-check it.')
    case 'abn_not_found':
      return t('We couldn\'t find that ABN in the Australian Business Register.')
    case 'abr_not_configured':
      return t('ABN lookup isn\'t available right now. Please try again later.')
    case 'abr_unavailable':
      return t('The Australian Business Register is unreachable. Please try again in a moment.')
    case 'unexpected_response':
      return t('We got an unexpected response from the ABN service. Please try again.')
    default:
      return t('Something went wrong checking that ABN. Please try again.')
  }
}

export default {
  name: 'CompanyTaxSettings',
  components: {
    flatPickr,
  },

  /**
   * Two-way bound to the parent's localCompany via v-model.
   * The parent owns the data; this component emits a merged object on every
   * field change so the parent can persist it (or not) on form submit.
   */
  props: {
    value: {
      type: Object,
      required: true,
    },
  },

  data() {
    const { t } = useI18nUtils()

    return {
      t,
      lookupLoading: false,
      lookupResult: null,
      lookupError: null,
      showOverrideModal: false,
      datePickerConfig: {
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd/m/Y',
        allowInput: true,
      },
    }
  },

  computed: {
    selectedGstPriceMode() {
      return this.value.gst_price_mode || 'gst_exclusive'
    },
    canLookup() {
      return !this.lookupLoading && cleanAbn(this.value.abn).length === 11
    },
    gstRegisteredOptions() {
      return [
        { text: this.t('Yes'), value: true },
        { text: this.t('No'), value: false },
      ]
    },
  },

  methods: {
    // Emit a shallow merge to parent. We never mutate the prop directly.
    emit(patch) {
      this.$emit('input', { ...this.value, ...patch })
    },

    // ABN typing — do NOT trigger a lookup. The button is the only entry point.
    // We still strip non-digits as the user types for a clean UX.
    onAbnInput(raw) {
      const cleaned = (raw || '').replace(/\D+/g, '').slice(0, 11)
      this.emit({ abn: cleaned })
    },

    onCheckAbnClicked() {
      // If the user has manually edited GST settings, warn before overwriting.
      if (this.value.gst_manual_override) {
        this.showOverrideModal = true
        return
      }
      this.performLookup(false)
    },

    async performLookup(replaceManualOverride) {
      if (this.lookupLoading) return // belt-and-braces: button is also disabled

      this.lookupLoading = true
      this.lookupError = null
      this.lookupResult = null

      try {
        const result = await this.$store.dispatch('companies/lookupAbn', this.value.abn)
        this.lookupResult = result

        // If we came here via the override warning AND the user confirmed,
        // we wipe the override flag so the next manual edit re-arms it.
        if (replaceManualOverride) {
          this.emit({ gst_manual_override: false })
        }
      } catch (err) {
        const code = err?.response?.data?.error
        this.lookupError = errorMessage(code, this.t)
      } finally {
        this.lookupLoading = false
      }
    },

    // User accepted the ABR result — copy snapshot fields into the company.
    // We intentionally do NOT overwrite `name` (trading name) — the user may
    // trade under a different name than the registered legal entity.
    useLookupDetails() {
      const r = this.lookupResult
      if (!r) return

      this.emit({
        abn: r.abn || this.value.abn,
        abn_status: r.abn_status,
        abn_entity_type: r.entity_type,
        abn_legal_name: r.entity_name,
        gst_registered: !!r.gst_registered,
        gst_registered_from: r.gst_registered_from || null,
        abr_last_checked_at: r.abr_last_checked_at,
        // User just accepted ABR data → no longer overridden.
        gst_manual_override: false,
      })

      this.lookupResult = null
    },

    dismissLookup() {
      this.lookupResult = null
      this.lookupError = null
    },

    // Any manual edit of a GST field after ABR data has been loaded sets the
    // override flag. We only flip it from false → true; user-confirmed
    // re-lookups handle the reverse.
    onFieldChanged(field, value) {
      const patch = { [field]: value }
      if (this.shouldFlagOverride(field, value)) {
        patch.gst_manual_override = true
      }
      this.emit(patch)
    },

    onGstRegisteredChanged(value) {
      const patch = { gst_registered: value }
      if (!value) {
        // Toggling OFF clears the registration date so we don't carry a stale value.
        patch.gst_registered_from = null
      }
      if (this.shouldFlagOverride('gst_registered', value)) {
        patch.gst_manual_override = true
      }
      this.emit(patch)
    },

    // Only flag override when the value actually differs from what's currently
    // stored — keeps the flag clean if the user re-clicks the same option.
    shouldFlagOverride(field, value) {
      return this.value[field] !== value
    },
  },
}
</script>

<style scoped>
.tax-settings {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 0.95rem;
  background: #fff;
  border: 1px solid #edf2f8;
}

.tax-section-header {
  margin-bottom: 1rem;
}

.tax-eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0366d6;
}

.tax-title {
  color: #5e5873;
  font-weight: 600;
}

.tax-copy {
  color: #6e6b7b;
  font-size: 0.9rem;
}

.tax-abn-row {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.tax-abn-button {
  white-space: nowrap;
  font-weight: 600;
}

.tax-hint {
  display: block;
  margin-top: 0.4rem;
  color: #6e6b7b;
}

.tax-alert {
  margin-top: 0.75rem;
}

.tax-result-card {
  margin-top: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  background: #fff;
  border: 1px solid #d9ecff;
}

.tax-result-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  color: #5e5873;
  margin-bottom: 0.35rem;
}

.tax-result-icon {
  color: #15803d;
  font-weight: 600;
}

.tax-result-name {
  margin-top: 0.5rem;
  color: #6e6b7b;
}

.tax-result-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.85rem;
}

.tax-price-mode-group {
  width: 100%;
}

.tax-price-mode-option {
  padding: 0.65rem 0;
}

.tax-price-mode-title {
  color: #5e5873;
  font-weight: 500;
}

@media (max-width: 575.98px) {
  .tax-abn-row {
    flex-direction: column;
  }
  .tax-abn-button {
    width: 100%;
  }
}
</style>
