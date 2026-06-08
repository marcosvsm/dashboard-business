<template>
  <div>
    <template v-if="!isPaid">
      <b-card class="tpe-card mb-4 mb-xl-0">
        <b-card-body class="tpe-body d-flex flex-column">
          <div class="tpe-header mb-3">
            <div>
              <p class="tpe-title">{{ t('Tax Estimate') }}</p>
              <p class="tpe-subtitle">{{ t('See income tax, GST and PAYG at a glance.') }}</p>
            </div>
            <span class="tpe-lock-badge">
              <base-feather-icon icon="LockIcon" size="11" class="mr-1" />
              {{ t('Boost') }}
            </span>
          </div>

          <div class="tpe-hero mb-3" aria-hidden="true">
            <div class="tpe-kicker">{{ t('Estimated income tax') }}</div>
            <div class="tpe-hero-value">$4,200</div>
            <div class="tpe-hero-meta">{{ t('based on your synced tax profile') }}</div>
            <div class="tpe-pill-row mt-3">
              <span class="tpe-pill">{{ t('GST registered') }}</span>
              <span class="tpe-pill">{{ t('Medicare applies') }}</span>
            </div>
          </div>

          <div class="tpe-panel mb-3" aria-hidden="true">
            <div class="tpe-row">
              <span class="tpe-row-label">{{ t('GST position') }}</span>
              <span class="tpe-locked-val">$1,840</span>
            </div>
            <div class="tpe-row">
              <span class="tpe-row-label">{{ t('PAYG already paid') }}</span>
              <span class="tpe-locked-val">$900</span>
            </div>
            <div class="tpe-row">
              <span class="tpe-row-label">{{ t('Upcoming obligation') }}</span>
              <span class="tpe-locked-val">{{ t('Next BAS due') }}</span>
            </div>
          </div>

          <div class="tpe-blur-overlay" aria-hidden="true" />

          <b-button variant="primary" class="btn-tpe-primary" @click="showUpgradeModal = true">
            <base-feather-icon icon="ZapIcon" size="14" class="mr-1" />
            {{ t('Upgrade to unlock Tax Estimate') }}
          </b-button>
          <p class="tpe-cta-note">{{ t('Available on Boost and Grow plans') }}</p>
        </b-card-body>
      </b-card>

      <tax-upgrade-modal v-model="showUpgradeModal" :t="t" />
    </template>

    <template v-else-if="!isSetupComplete">
      <b-card class="tpe-card mb-4 mb-xl-0">
        <b-card-body class="tpe-body d-flex flex-column">
          <div class="tpe-header mb-3">
            <div>
              <p class="tpe-title">{{ t('Tax Estimate') }}</p>
              <p class="tpe-subtitle">{{ t('See income tax, GST and PAYG at a glance.') }}</p>
            </div>
          </div>

          <div class="tpe-hero tpe-hero--empty mb-3">
            <div class="tpe-kicker">{{ t('Estimated income tax') }}</div>
            <div class="tpe-placeholder-value">$—</div>
            <div class="tpe-hero-meta">{{ t('Complete setup to calculate your current position') }}</div>
          </div>

          <div class="tpe-panel mb-4">
            <div class="tpe-row">
              <span class="tpe-row-label">{{ t('GST position') }}</span>
              <span class="tpe-placeholder-val">$—</span>
            </div>
            <div class="tpe-row">
              <span class="tpe-row-label">{{ t('PAYG already paid') }}</span>
              <span class="tpe-placeholder-val">$—</span>
            </div>
            <div class="tpe-row">
              <span class="tpe-row-label">{{ t('Upcoming obligation') }}</span>
              <span class="tpe-placeholder-val">—</span>
            </div>
          </div>

          <b-button variant="primary" class="btn-tpe-primary" block @click="showWizard = true">
            {{ t('Set Up Tax Estimate') }}
            <base-feather-icon icon="ArrowRightIcon" size="14" class="ml-1" />
          </b-button>
          <p class="tpe-cta-note">{{ t('Takes about 2 minutes') }}</p>
        </b-card-body>
      </b-card>
    </template>

    <template v-else-if="isHistoricalRange">
      <b-card class="tpe-card mb-4 mb-xl-0">
        <b-card-body class="tpe-body d-flex flex-column">
          <div class="tpe-header mb-3">
            <div>
              <p class="tpe-title">{{ t('Tax Estimate') }}</p>
              <p class="tpe-subtitle">{{ t('Historical tax position is not available yet.') }}</p>
            </div>
            <span class="tpe-range-badge">{{ rangeLabel }}</span>
          </div>

          <div class="tpe-hero tpe-hero--empty mb-3">
            <div class="tpe-kicker">{{ t('Estimated income tax') }}</div>
            <div class="tpe-placeholder-value">N/A</div>
            <div class="tpe-hero-meta">{{ t('Switch to current FY to view your active tax position.') }}</div>
          </div>

          <div class="tpe-panel mb-4">
            <div class="tpe-row">
              <span class="tpe-row-label">{{ t('GST position') }}</span>
              <span class="tpe-placeholder-val">N/A</span>
            </div>
            <div class="tpe-row">
              <span class="tpe-row-label">{{ t('PAYG already paid') }}</span>
              <span class="tpe-placeholder-val">N/A</span>
            </div>
            <div class="tpe-row">
              <span class="tpe-row-label">{{ t('Upcoming obligation') }}</span>
              <span class="tpe-placeholder-val">N/A</span>
            </div>
          </div>
        </b-card-body>
      </b-card>
    </template>

    <template v-else>
      <tax-position-card
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
import TaxPositionCard from './TaxPositionCard.vue';
import TaxUpgradeModal from './TaxUpgradeModal.vue';

export default {
  name: 'TaxPositionEntry',

  components: { BaseFeatherIcon, TaxSetupWizard, TaxPositionCard, TaxUpgradeModal },

  props: {
    invoices:          { type: Array,    default: () => [] },
    t:                 { type: Function, required: true },
    currencyFormatter: { required: true },
    hideAmount:        { type: Boolean,  default: false },
    dashboardRange:    { type: String,   default: 'current_fy' },
    rangeLabel:        { type: String,   default: '' },
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

    isHistoricalRange() {
      return this.dashboardRange === 'last_fy';
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
.tpe-card {
  height: 100%;
  border: 1px solid #e4ebf3;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
  background: #ffffff;
}

.tpe-body {
  height: 100%;
  padding: 0.9rem !important;
  position: relative;
  overflow: hidden;
}

.tpe-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.tpe-title {
  font-weight: 500;
  text-transform: uppercase;
  color: #0366d6;
  font-size: 1.285rem;
}

.tpe-subtitle {
  line-height: 1.5;
  margin-bottom: 0;
}

.tpe-lock-badge {
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

.tpe-range-badge {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  white-space: nowrap;
}

.tpe-hero,
.tpe-panel {
  border: 1px solid #e6edf5;
  border-radius: 14px;
  background: #ffffff;
}

.tpe-hero {
  padding: 1rem;
  background: linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%);
}

.tpe-hero--empty {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.tpe-kicker {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: #0f6cbd;
}

.tpe-hero-value,
.tpe-placeholder-value {
  font-size: 1.95rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0.35rem 0 0.2rem;
}

.tpe-hero-value {
  color: #c4c9d4;
  filter: blur(4px);
  user-select: none;
}

.tpe-placeholder-value {
  color: #94a3b8;
}

.tpe-hero-meta {
  font-size: 0.76rem;
  color: #64748b;
}

.tpe-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tpe-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #dde6f0;
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
}

.tpe-panel {
  padding: 0.95rem;
}

.tpe-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.42rem 0;
}

.tpe-row:not(:last-child) {
  border-bottom: 1px solid #eef3f8;
}

.tpe-row-label {
  font-size: 0.82rem;
  color: #475569;
}

.tpe-locked-val {
  color: #c4c9d4;
  filter: blur(4px);
  user-select: none;
}

.tpe-placeholder-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: #c4c9d4;
}

.tpe-blur-overlay {
  position: absolute;
  left: 0;
  right: 0;
  top: 7rem;
  bottom: 5.25rem;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.7) 68%, rgba(255, 255, 255, 0.97) 100%);
  pointer-events: none;
}

.btn-tpe-primary {
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

.tpe-cta-note {
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
  .tpe-header {
    flex-direction: column;
  }
}
</style>
