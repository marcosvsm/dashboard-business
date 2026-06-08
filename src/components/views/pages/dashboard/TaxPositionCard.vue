<template>
  <b-card class="card-stats mb-xl-0">
    <b-card-body class="d-flex flex-column">
      <div class="tpc-header mb-3">
        <div>
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important"">{{ t('Tax Estimate') }}</h5>
          <p class="tpc-subtitle mb-0">{{ t('See income tax, GST and PAYG at a glance.') }}</p>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="tpc-skeleton-wrap">
          <div class="tpc-skeleton tpc-skeleton--hero" />
          <div class="tpc-skeleton" />
          <div class="tpc-skeleton tpc-skeleton--sm" />
          <div class="tpc-skeleton tpc-skeleton--sm" />
        </div>
      </template>

      <template v-else-if="error">
        <div class="tpc-error">
          <base-feather-icon icon="AlertCircleIcon" size="20" class="mb-2" />
          <p class="tpc-error-msg">{{ t('Could not load your tax position.') }}</p>
          <button class="tpc-retry-btn" @click="$emit('retry')">{{ t('Try again') }}</button>
        </div>
      </template>

      <template v-else>
        <section class="tpc-hero">
          <div class="tpc-hero-top">
            <span class="tpc-kicker">{{ t('Estimated income tax') }}</span>
            <span class="tpc-badge">{{ fiscalYearLabel }}</span>
          </div>
          <div class="tpc-hero-value-wrap">
            <span v-if="hideAmount" class="tpc-hero-value tpc-hero-value--masked">••••••</span>
            <span
              v-else-if="hasBackendData && overviewIncomeTax !== null"
              class="h2 font-weight-bold"
            >
              {{ currencyFormatter.format(overviewIncomeTax) }}
            </span>
            <span
              v-else-if="localEstimatedIncomeTax !== null"
              class="tpc-hero-value"
            >
              {{ currencyFormatter.format(localEstimatedIncomeTax) }}
            </span>
            <span v-else class="tpc-hero-value tpc-hero-value--pending">
              {{ t('Awaiting calculation') }}
            </span>
          </div>
          <p class="tpc-hero-meta mb-0 mt-0">
            <span v-if="hasBackendData">{{ t('based on your synced tax profile') }}</span>
            <span v-else-if="localEstimatedIncomeTax !== null">{{ t('estimated from current invoice activity') }}</span>
            <span v-else>{{ t('Complete setup to calculate your current position') }}</span>
          </p>

          <div class="tpc-pill-row mt-3">
            <span class="tpc-pill">{{ isGstRegistered ? t('GST registered') : t('No GST registered') }}</span>
            <span v-if="showMedicare" class="tpc-pill">
              {{ medicareIsExempt ? t('Medicare exempt') : t('Medicare applies') }}
            </span>
          </div>
        </section>

        <section class="tpc-panel mt-3">
          <p class="tpc-section-label">{{ t('Tax Breakdown') }}</p>

          <div class="tpc-rows">
            <div class="tpc-row" v-if="hasBackendData && overviewTaxableIncome !== null">
              <span class="tpc-row-label">{{ t('Estimated Taxable income') }}</span>
              <span class="tpc-row-value">
                <span v-if="hideAmount" class="tpc-muted">••••</span>
                <span v-else>{{ currencyFormatter.format(overviewTaxableIncome) }}</span>
              </span>
            </div>

            <div class="tpc-row">
              <span class="tpc-row-label">{{ t('GST position') }}</span>
              <span class="tpc-row-value">
                <template v-if="!isGstRegistered">
                  <span class="tpc-tag">{{ t('Not registered') }}</span>
                </template>
                <template v-else-if="hideAmount">
                  <span class="tpc-muted">••••</span>
                </template>
                <template v-else-if="hasBackendData">
                  {{ currencyFormatter.format(overviewGstPosition) }}
                </template>
                <template v-else>
                  {{ currencyFormatter.format(localGstCollected) }}
                </template>
              </span>
            </div>

            <div class="tpc-row" v-if="showMedicare">
              <span class="tpc-row-label">{{ t('Medicare levy') }}</span>
              <span class="tpc-row-value">
                <template v-if="hideAmount">
                  <span class="tpc-muted">••••</span>
                </template>
                <template v-else-if="medicareIsExempt">
                  <span class="tpc-tag">{{ t('Exempt') }}</span>
                </template>
                <template v-else-if="hasBackendData && overviewMedicareLevy !== null">
                  {{ currencyFormatter.format(overviewMedicareLevy) }}
                </template>
                <template v-else>
                  <span class="tpc-pending">—</span>
                </template>
              </span>
            </div>

            <div class="tpc-row" v-if="hasPayg">
              <span class="tpc-row-label">{{ t('PAYG already paid') }}</span>
              <span class="tpc-row-value">
                <template v-if="hideAmount">
                  <span class="tpc-muted">••••</span>
                </template>
                <template v-else-if="hasBackendData">
                  {{ currencyFormatter.format(overviewPaygPaid) }}
                </template>
                <template v-else>
                  {{ currencyFormatter.format(setupData.paygAmountPaid || 0) }}
                </template>
              </span>
            </div>
          </div>
        </section>

        <section v-if="nextObligation" class="tpc-next-up mt-3">
          <div class="tpc-next-up-icon">
            <base-feather-icon icon="CalendarIcon" size="13" />
          </div>
          <div>
            <p class="tpc-next-up-label mb-1">{{ t('Upcoming obligation') }}</p>
            <span>{{ nextObligation }}</span>
          </div>
        </section>

        <div class="tpc-divider my-3" />
        <tax-profile-summary
          :setup-data="setupData"
          :last-updated="formattedUpdatedAt"
          :t="t"
          @edit="$emit('edit-setup')"
        />
      </template>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';
import TaxProfileSummary from './TaxProfileSummary.vue';
import taxOverviewMixin from './taxOverviewMixin';

export default {
  name: 'TaxPositionCard',

  components: { BaseFeatherIcon, TaxProfileSummary },

  mixins: [taxOverviewMixin],
};
</script>

<style scoped>
.tpc-card {
  height: 100%;
  border: 1px solid #e4ebf3;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
  background: #ffffff;
}

.tpc-body {
  height: 100%;
  padding: 0.9rem !important;
}

.tpc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.tpc-title {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: #0366d6;
  margin-bottom: 0.18rem;
}

.tpc-subtitle {
  font-size: 0.8rem;
  line-height: 1.45;
  color: #6b7280;
  max-width: 16rem;
}

.tpc-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #dde6f0;
  border-radius: 999px;
  background: #ffffff;
  color: #6b7280;
  transition: color 0.12s, border-color 0.12s, box-shadow 0.12s;
}

.tpc-icon-btn:hover {
  color: #0366d6;
  border-color: #bfd5ef;
  box-shadow: 0 4px 12px rgba(3, 102, 214, 0.12);
}

.tpc-hero,
.tpc-panel {
  border: 1px solid #e6edf5;
  border-radius: 14px;
  background: #ffffff;
}

.tpc-hero {
  padding: 1rem;
}

.tpc-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.tpc-kicker,
.tpc-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

.tpc-kicker {
  color: #0f6cbd;
}

.tpc-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #dde6f0;
  color: #64748b;
  font-size: 0.69rem;
  font-weight: 700;
}

.tpc-hero-value-wrap {
  line-height: 1;
  margin: 0.45rem 0 0.35rem;
}

.tpc-hero-value {
  font-size: 1.95rem;
  font-weight: 800;
  color: rgba(38, 43, 67, 0.9);
  letter-spacing: -0.03em;
}

.tpc-hero-value--masked {
  color: #94a3b8;
  letter-spacing: 0.08em;
}

.tpc-hero-value--pending {
  display: inline-block;
  font-size: 1rem;
  line-height: 1.4;
  letter-spacing: 0;
  color: #64748b;
}

.tpc-hero-meta {
  font-size: 0.76rem;
  color: #64748b;
}

.tpc-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tpc-pill,
.tpc-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  background: #0366d6;
  border: 1px solid #dde6f0;
  font-size: 0.72rem;
  font-weight: 600;
  color: #fff;
}

.tpc-panel {
  padding: 0.95rem;
}

.tpc-section-label {
  color: #64748b;
  margin: 0 0 0.4rem;
}

.tpc-rows {
  display: flex;
  flex-direction: column;
}

.tpc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.42rem 0;
}

.tpc-row:not(:last-child) {
  border-bottom: 1px solid #eef3f8;
}


.tpc-row-value {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 1rem;
  text-align: right;
}

.tpc-muted {
  font-size: 0.75rem;
  color: #94a3b8;
}

.tpc-pending {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
}

.tpc-next-up {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem 0.95rem;
  border: 1px solid #f4e0af;
  border-radius: 14px;
  background: linear-gradient(180deg, #fffaf0 0%, #fff7e6 100%);
  font-size: 0.77rem;
  color: #7c5a10;
  line-height: 1.4;
}

.tpc-next-up-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
  flex-shrink: 0;
}

.tpc-next-up-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #b45309;
}

.tpc-divider {
  border: none;
  border-top: 1px solid #e7edf5;
}

.tpc-skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.tpc-skeleton {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: tpc-shimmer 1.4s infinite;
}

.tpc-skeleton--hero {
  height: 116px;
}

.tpc-skeleton--sm {
  height: 11px;
}

@keyframes tpc-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.tpc-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  color: #94a3b8;
  padding: 2rem 1rem;
}

.tpc-error-msg {
  font-size: 0.84rem;
  margin-bottom: 0.75rem;
}

.tpc-retry-btn {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: none;
  font-size: 0.78rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.3rem 0.75rem;
}

.tpc-retry-btn:hover {
  border-color: #9ca3af;
  color: #374151;
}

@media (max-width: 575.98px) {
  .tpc-header {
    flex-direction: column;
  }

  .tpc-subtitle {
    max-width: none;
  }

  .tpc-hero-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .tpc-hero-value {
    font-size: 1.75rem;
  }

  .tpc-row {
    align-items: flex-start;
  }

  .tpc-row-label {
    max-width: 56%;
  }
}

.card-stats{
  height: 100%;
}
.card-stats .card-body{
  height: 100%;
  padding:0.75rem !important;
}
.h2{
  color:rgba(38, 43, 67, 0.9)!important;
}
</style>
