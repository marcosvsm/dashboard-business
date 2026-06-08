<template>
  <div>
    <template v-if="!isPaid">
      <b-card class="tse-card mb-4 mb-xl-0">
        <b-card-body class="tse-body d-flex flex-column">
          <div class="tse-header mb-3">
            <div>
              <p class="tse-title">{{ t('Tax Savings') }}</p>
              <p class="tse-subtitle">{{ t('Track how much to set aside for tax.') }}</p>
            </div>
            <span class="tse-lock-badge">
              <base-feather-icon icon="LockIcon" size="11" class="mr-1" />
              {{ t('Boost') }}
            </span>
          </div>

          <div class="tse-hero mb-3" aria-hidden="true">
            <div class="tse-kicker">{{ t('Set aside now') }}</div>
            <div class="tse-hero-value">$6,420</div>
            <div class="tse-hero-meta">{{ t('remaining obligation for FY2025–26') }}</div>
          </div>

          <div class="tse-stat-grid mb-3" aria-hidden="true">
            <div class="tse-stat-card">
              <span class="tse-stat-label">{{ t('Saved') }}</span>
              <strong class="tse-locked-val">$3,180</strong>
            </div>
            <div class="tse-stat-card">
              <span class="tse-stat-label">{{ t('Gap') }}</span>
              <strong class="tse-locked-val">$3,240</strong>
            </div>
          </div>

          <div class="tse-panel mb-3" aria-hidden="true">
            <div class="tse-panel-header">
              <span class="tse-section-label">{{ t('Savings Tracker') }}</span>
              <span class="tse-chip">58%</span>
            </div>
            <div class="tse-row">
              <span class="tse-row-label">{{ t('Recommended savings') }}</span>
              <span class="tse-locked-val">$890/mo</span>
            </div>
            <div class="tse-progress-track mt-2">
              <div class="tse-progress-fill" style="width: 58%" />
            </div>
          </div>

          <div class="tse-blur-overlay" aria-hidden="true" />

          <b-button variant="primary" class="btn-tse-primary" @click="showUpgradeModal = true">
            <base-feather-icon icon="ZapIcon" size="14" class="mr-1" />
            {{ t('Upgrade to unlock Tax Savings') }}
          </b-button>
          <p class="tse-cta-note">{{ t('Available on Boost and Grow plans') }}</p>
        </b-card-body>
      </b-card>

      <tax-upgrade-modal v-model="showUpgradeModal" :t="t" />
    </template>

    <template v-else-if="!isSetupComplete">
      <b-card class="tse-card mb-4 mb-xl-0">
        <b-card-body class="tse-body d-flex flex-column">
          <div class="tse-header mb-3">
            <div>
              <p class="tse-title">{{ t('Tax Savings') }}</p>
              <p class="tse-subtitle">{{ t('Track how much to set aside for tax.') }}</p>
            </div>
          </div>

          <div class="tse-hero tse-hero--empty mb-3">
            <div class="tse-kicker">{{ t('Set aside now') }}</div>
            <div class="tse-placeholder-value">$—</div>
            <div class="tse-hero-meta">{{ t('Complete setup to calculate your target') }}</div>
          </div>

          <div class="tse-panel mb-4">
            <div class="tse-panel-header">
              <span class="tse-section-label">{{ t('What you will unlock') }}</span>
            </div>
            <div class="tse-row">
              <span class="tse-row-label">{{ t('Target to save') }}</span>
              <span class="tse-placeholder-val">$—</span>
            </div>
            <div class="tse-row">
              <span class="tse-row-label">{{ t('Progress tracker') }}</span>
              <span class="tse-placeholder-val">—</span>
            </div>
            <div class="tse-row">
              <span class="tse-row-label">{{ t('Recommended savings') }}</span>
              <span class="tse-placeholder-val">$—</span>
            </div>
          </div>

          <b-button variant="primary" class="btn-tse-primary" block @click="showWizard = true">
            {{ t('Set Up Tax Savings') }}
            <base-feather-icon icon="ArrowRightIcon" size="14" class="ml-1" />
          </b-button>
          <p class="tse-cta-note">{{ t('Takes about 2 minutes') }}</p>
        </b-card-body>
      </b-card>
    </template>

    <template v-else>
      <tax-savings-card
        :invoices="invoices"
        :t="t"
        :currency-formatter="currencyFormatter"
        :hide-amount="hideAmount"
        @edit-setup="showWizard = true"
        @retry="$store.dispatch('tax/fetchOverview')"
      />
    </template>

    <b-modal
      v-model="showWizard"
      size="lg"
      hide-footer
      hide-header
      body-class="p-0"
      dialog-class="tax-wizard-dialog"
      @hidden="showWizard = false"
    >
      <tax-setup-wizard
        :t="t"
        :initial-data="setupData || {}"
        @complete="onSetupComplete"
        @cancel="showWizard = false"
      />
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';
import TaxSetupWizard from './TaxSetupWizard.vue';
import TaxSavingsCard from './TaxSavingsCard.vue';
import TaxUpgradeModal from './TaxUpgradeModal.vue';

export default {
  name: 'TaxSavingsEntry',

  components: { BaseFeatherIcon, TaxSetupWizard, TaxSavingsCard, TaxUpgradeModal },

  props: {
    invoices:          { type: Array,    default: () => [] },
    t:                 { type: Function, required: true },
    currencyFormatter: { required: true },
    hideAmount:        { type: Boolean,  default: false },
  },

  data() {
    return {
      showWizard: false,
      showUpgradeModal: false,
    };
  },

  computed: {
    ...mapGetters('tax', ['isSetupComplete', 'setupData', 'profileId', 'isLoading']),

    isPaid() {
      const slug = this.$store.getters['users/user']?.role?.slug;
      return !!slug && slug !== 'free';
    },
  },

  mounted() {
    if (!this.profileId && !this.isLoading) {
      this.$store.dispatch('tax/fetchProfile');
    }
  },

  methods: {
    async onSetupComplete(data) {
      await this.$store.dispatch('tax/completeSetup', data);
      this.showWizard = false;
      await this.$store.dispatch('tax/fetchOverview');
    },
  },
};
</script>

<style scoped>
.tse-card {
  height: 100%;
  border: 1px solid #e4ebf3;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
  background: #ffffff;
}

.tse-body {
  height: 100%;
  padding: 0.9rem !important;
  position: relative;
  overflow: hidden;
}

.tse-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.tse-title {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: #0366d6;
  margin-bottom: 0.18rem;
}

.tse-subtitle {
  font-size: 0.8rem;
  line-height: 1.45;
  color: #6b7280;
  margin-bottom: 0;
}

.tse-lock-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-radius: 999px;
  padding: 2px 8px;
}

.tse-hero,
.tse-panel,
.tse-stat-card {
  border: 1px solid #e6edf5;
  border-radius: 14px;
  background: #ffffff;
}

.tse-hero {
  padding: 1rem;
  background: linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%);
}

.tse-hero--empty {
  background: linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%);
}

.tse-kicker,
.tse-section-label,
.tse-stat-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

.tse-kicker {
  color: #0f6cbd;
}

.tse-hero-value,
.tse-placeholder-value {
  font-size: 1.95rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0.35rem 0 0.2rem;
}

.tse-hero-value {
  color: #c4c9d4;
  filter: blur(4px);
  user-select: none;
}

.tse-placeholder-value {
  color: #94a3b8;
}

.tse-hero-meta {
  font-size: 0.76rem;
  color: #64748b;
}

.tse-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.tse-stat-card {
  padding: 0.8rem 0.85rem;
}

.tse-stat-label {
  display: block;
  color: #94a3b8;
  margin-bottom: 0.22rem;
}

.tse-locked-val {
  color: #c4c9d4;
  filter: blur(4px);
  user-select: none;
}

.tse-panel {
  padding: 0.95rem;
}

.tse-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.tse-section-label {
  color: #64748b;
}

.tse-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: #e8f2ff;
  color: #0366d6;
  font-size: 0.69rem;
  font-weight: 700;
}

.tse-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.42rem 0;
}

.tse-row:not(:last-child) {
  border-bottom: 1px solid #eef3f8;
}

.tse-row-label {
  font-size: 0.82rem;
  color: #475569;
}

.tse-placeholder-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: #c4c9d4;
}

.tse-progress-track {
  height: 8px;
  background: #dbe7f2;
  border-radius: 999px;
  overflow: hidden;
}

.tse-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: #cbd5e1;
}

.tse-blur-overlay {
  position: absolute;
  left: 0;
  right: 0;
  top: 7rem;
  bottom: 5.25rem;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.7) 68%, rgba(255, 255, 255, 0.97) 100%);
  pointer-events: none;
}

.btn-tse-primary {
  background-color: #0366d6 !important;
  border-color: #0366d6 !important;
  border-radius: 8px !important;
  font-weight: 600;
  font-size: 0.84rem;
  padding: 0.55rem 1rem !important;
  box-shadow: 0 2px 8px rgba(3, 102, 214, 0.2);
  position: relative;
  z-index: 1;
}

.tse-cta-note {
  font-size: 0.72rem;
  color: #9ca3af;
  text-align: center;
  margin: 0.4rem 0 0;
  position: relative;
  z-index: 1;
}

:deep(.tax-wizard-dialog .modal-content) {
  border-radius: 12px;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

:deep(.tax-wizard-dialog .modal-body) {
  flex: 1;
  overflow-y: auto;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

@media (max-width: 575.98px) {
  .tse-header {
    flex-direction: column;
  }

  .tse-stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
