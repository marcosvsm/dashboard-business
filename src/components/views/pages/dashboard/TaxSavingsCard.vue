<template>
  <b-card class="tsc-card mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column tsc-body">
      <div class="tsc-header mb-3">
        <div>
          <p class="tsc-title">{{ t('Tax Savings') }}</p>
          <p class="tsc-subtitle mb-0">{{ t('Track how much to set aside for tax.') }}</p>
        </div>
        <button class="tsc-icon-btn" :title="t('Edit setup')" @click="$emit('edit-setup')">
          <base-feather-icon icon="Edit3Icon" size="15" />
        </button>
      </div>

      <template v-if="isLoading">
        <div class="tsc-skeleton-wrap">
          <div class="tsc-skeleton tsc-skeleton--hero" />
          <div class="tsc-skeleton" />
          <div class="tsc-skeleton tsc-skeleton--sm" />
          <div class="tsc-skeleton tsc-skeleton--sm" />
        </div>
      </template>

      <template v-else-if="error">
        <div class="tsc-error">
          <base-feather-icon icon="AlertCircleIcon" size="20" class="mb-2" />
          <p class="tsc-error-msg">{{ t('Could not load your tax savings.') }}</p>
          <button class="tsc-retry-btn" @click="$emit('retry')">{{ t('Try again') }}</button>
        </div>
      </template>

      <template v-else>
        <section class="tsc-hero">
          <div class="tsc-hero-top">
            <span class="tsc-kicker">{{ t('Set aside now') }}</span>
            <span v-if="!hasBackendData" class="tsc-badge">{{ t('Local estimate') }}</span>
          </div>
          <div class="tsc-hero-value-wrap">
            <span v-if="!hideAmount" class="tsc-hero-value">{{ currencyFormatter.format(overviewShouldHaveSaved) }}</span>
            <span v-else class="tsc-hero-value tsc-hero-value--masked">••••••</span>
          </div>
          <p class="tsc-hero-meta mb-0">{{ t('remaining obligation for') }} {{ fiscalYearLabel }}</p>
        </section>

        <div class="tsc-stat-grid mt-3">
          <div class="tsc-stat-card">
            <span class="tsc-stat-label">{{ t('Saved') }}</span>
            <strong class="tsc-stat-value">
              <span v-if="hideAmount" class="tsc-muted">••••</span>
              <span v-else>{{ currencyFormatter.format(savedAmount) }}</span>
            </strong>
          </div>
          <div class="tsc-stat-card">
            <span class="tsc-stat-label">{{ t('Gap') }}</span>
            <strong class="tsc-stat-value" :class="{ 'tsc-stat-value--ok': gap <= 0 }">
              <span v-if="hideAmount" class="tsc-muted">••••</span>
              <span v-else>{{ currencyFormatter.format(gap) }}</span>
            </strong>
          </div>
        </div>

        <section class="tsc-panel mt-3">
          <div class="tsc-panel-header">
            <p class="tsc-section-label mb-0">{{ t('Savings Tracker') }}</p>
            <span class="tsc-chip">{{ savingsProgressPct }}%</span>
          </div>

          <div class="tsc-rows">
            <div class="tsc-row">
              <span class="tsc-row-label">{{ t('Saved so far') }}</span>
              <span class="tsc-row-value">
                <span v-if="!editingSaved">
                  <span v-if="!hideAmount">{{ currencyFormatter.format(savedAmount) }}</span>
                  <span v-else class="tsc-muted">••••</span>
                  <button class="tsc-inline-btn" :title="t('Update saved amount')" @click="beginEdit">
                    <base-feather-icon icon="Edit3Icon" size="12" />
                  </button>
                </span>
                <span v-else class="tsc-edit-row">
                  <span class="tsc-muted">$</span>
                  <input
                    ref="savedInput"
                    v-model.number="savedDraft"
                    type="number"
                    min="0"
                    class="tsc-edit-input"
                    @keyup.enter="commitEdit"
                    @keyup.escape="cancelEdit"
                  />
                  <button class="tsc-confirm-btn" :title="t('Save')" @click="commitEdit">
                    <base-feather-icon icon="CheckIcon" size="13" />
                  </button>
                  <button class="tsc-cancel-btn" :title="t('Cancel')" @click="cancelEdit">
                    <base-feather-icon icon="XIcon" size="13" />
                  </button>
                </span>
              </span>
            </div>

            <div class="tsc-row">
              <span class="tsc-row-label">{{ t('Target') }}</span>
              <span class="tsc-row-value">
                <span v-if="hideAmount" class="tsc-muted">••••</span>
                <span v-else>{{ currencyFormatter.format(heroAmount) }}</span>
              </span>
            </div>

            <div class="tsc-row" v-if="hasBackendData && overviewShouldHaveSaved !== null">
              <span class="tsc-row-label">{{ t('Should have saved by now') }}</span>
              <span class="tsc-row-value">
                <span v-if="hideAmount" class="tsc-muted">••••</span>
                <span v-else>{{ currencyFormatter.format(overviewShouldHaveSaved) }}</span>
              </span>
            </div>
          </div>

          <div class="tsc-progress-shell mt-3">
            <div class="tsc-progress-wrap">
              <div class="tsc-progress-track">
                <div
                  class="tsc-progress-fill"
                  :class="savingsBarClass"
                  :style="{ width: savingsProgressPct + '%' }"
                />
              </div>
              <span class="tsc-progress-pct" :class="savingsBarClass">{{ savingsProgressPct }}%</span>
            </div>
          </div>

          <div
            class="tsc-status mt-3"
            :class="{ 'tsc-status--warn': gap > 0, 'tsc-status--ok': gap <= 0 }"
          >
            <span v-if="gap <= 0" class="tsc-status-text tsc-status-text--ok">
              <base-feather-icon icon="CheckCircleIcon" size="13" class="mr-1" />
              {{ t('On track for this financial year') }}
            </span>
            <span v-else class="tsc-status-text tsc-status-text--warn">
              {{ t('Behind by') }} {{ currencyFormatter.format(gap) }}
              <span v-if="weeklyTarget > 0" class="tsc-weekly-hint">
                &middot; {{ t('save') }} {{ currencyFormatter.format(weeklyTarget) }}/{{ t('wk') }}
              </span>
            </span>
          </div>

          <div
            v-if="hasBackendData && overviewRecommendedMonthly !== null"
            class="tsc-recommended mt-3"
          >
            <base-feather-icon icon="TrendingUpIcon" size="13" class="mr-1 flex-shrink-0" />
            <span>
              {{ t('Recommended') }}:
              <strong>{{ currencyFormatter.format(overviewRecommendedMonthly) }}/{{ t('mo') }}</strong>
            </span>
          </div>
        </section>

        <!-- ════════════════════════════════════════════════════
             GST Collected — actual ledger from invoice snapshots
             Hidden when the company is not GST registered.
        ════════════════════════════════════════════════════ -->
        <section
          v-if="hasBackendData && overview && overview.gst && overview.gst.registered"
          class="tsc-panel mt-3"
        >
          <div class="tsc-panel-header">
            <p class="tsc-section-label mb-0">{{ t('GST Collected') }}</p>
            <span class="tsc-chip">{{ fiscalYearLabel }}</span>
          </div>

          <div class="tsc-hero-value-wrap mt-2">
            <span v-if="hideAmount" class="tsc-hero-value tsc-hero-value--masked">••••••</span>
            <span v-else class="tsc-hero-value">
              {{ currencyFormatter.format(overviewGstCollectedFromInvoices || 0) }}
            </span>
          </div>
          <p class="tsc-hero-meta mb-0">
            <template v-if="overviewGstInvoiceCount > 0">
              {{ t('from') }} {{ overviewGstInvoiceCount }}
              {{ overviewGstInvoiceCount === 1 ? t('invoice') : t('invoices') }}
            </template>
            <template v-else>
              {{ t('No invoices recorded this year yet') }}
            </template>
          </p>

          <div
            v-if="showGstEstimateDivergence && !hideAmount"
            class="tsc-rows mt-2"
          >
            <div class="tsc-row">
              <span class="tsc-row-label">{{ t('Estimate from income') }}</span>
              <span class="tsc-row-value">
                {{ currencyFormatter.format(overviewGstEstimate || 0) }}
              </span>
            </div>
          </div>

          <p
            v-if="nextBasInDays !== null && nextBasInDays >= 0 && nextBasDueLabel"
            class="tsc-hero-meta mt-2 mb-0"
          >
            {{ t('Next BAS due in') }} {{ nextBasInDays }}
            {{ nextBasInDays === 1 ? t('day') : t('days') }}
            · {{ nextBasDueLabel }}
          </p>
        </section>
      </template>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';
import taxOverviewMixin from './taxOverviewMixin';

export default {
  name: 'TaxSavingsCard',

  components: { BaseFeatherIcon },

  mixins: [taxOverviewMixin],
};
</script>

<style scoped>
.tsc-card {
  height: 100%;
  border: 1px solid #e4ebf3;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
  background: #ffffff;
}

.tsc-body {
  height: 100%;
  padding: 0.9rem !important;
}

.tsc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.tsc-title {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: #0366d6;
  margin-bottom: 0.18rem;
}

.tsc-subtitle {
  font-size: 0.8rem;
  line-height: 1.45;
  color: #6b7280;
  max-width: 16rem;
}

.tsc-icon-btn {
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

.tsc-icon-btn:hover {
  color: #0366d6;
  border-color: #bfd5ef;
  box-shadow: 0 4px 12px rgba(3, 102, 214, 0.12);
}

.tsc-hero {
  padding: 1rem;
  border: 1px solid #e2ebf6;
  border-radius: 14px;
  background: linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%);
}

.tsc-hero-top,
.tsc-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.tsc-kicker,
.tsc-section-label,
.tsc-stat-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

.tsc-kicker {
  color: #0f6cbd;
}

.tsc-badge,
.tsc-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.69rem;
  font-weight: 700;
}

.tsc-badge {
  background: #ffffff;
  border: 1px solid #d8e6f7;
  color: #0f6cbd;
}

.tsc-chip {
  background: #e8f2ff;
  color: #0366d6;
}

.tsc-hero-value-wrap {
  line-height: 1;
  margin: 0.45rem 0 0.35rem;
}

.tsc-hero-value {
  font-size: 1.95rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
}

.tsc-hero-value--masked {
  color: #94a3b8;
  letter-spacing: 0.08em;
}

.tsc-hero-meta {
  font-size: 0.76rem;
  color: #64748b;
}

.tsc-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.tsc-stat-card,
.tsc-panel {
  border: 1px solid #e6edf5;
  border-radius: 14px;
  background: #ffffff;
}

.tsc-stat-card {
  padding: 0.8rem 0.85rem;
}

.tsc-stat-label {
  display: block;
  color: #94a3b8;
  margin-bottom: 0.22rem;
}

.tsc-stat-value {
  font-size: 0.92rem;
  color: #111827;
}

.tsc-stat-value--ok {
  color: #059669;
}

.tsc-panel {
  padding: 0.95rem;
}

.tsc-section-label {
  color: #64748b;
}

.tsc-rows {
  display: flex;
  flex-direction: column;
  margin-top: 0.4rem;
}

.tsc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.42rem 0;
}

.tsc-row:not(:last-child) {
  border-bottom: 1px solid #eef3f8;
}

.tsc-row-label {
  font-size: 0.82rem;
  color: #475569;
}

.tsc-row-value {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #111827;
  text-align: right;
}

.tsc-muted {
  font-size: 0.75rem;
  color: #94a3b8;
}

.tsc-progress-shell {
  padding: 0.7rem 0.75rem;
  border: 1px solid #e6edf5;
  border-radius: 12px;
  background: #fafcff;
}

.tsc-progress-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tsc-progress-track {
  flex: 1;
  height: 8px;
  background: #dbe7f2;
  border-radius: 999px;
  overflow: hidden;
}

.tsc-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.fill-green { background: #10b981; }
.fill-amber { background: #f59e0b; }
.fill-red { background: #ef4444; }

.tsc-progress-pct {
  min-width: 2.8ch;
  font-size: 0.74rem;
  font-weight: 800;
  text-align: right;
}

.tsc-progress-pct.fill-green { color: #10b981; }
.tsc-progress-pct.fill-amber { color: #f59e0b; }
.tsc-progress-pct.fill-red { color: #ef4444; }

.tsc-status {
  padding: 0.7rem 0.8rem;
  border-radius: 12px;
  font-size: 0.78rem;
}

.tsc-status--ok {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.16);
}

.tsc-status--warn {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.16);
}

.tsc-status-text {
  font-weight: 600;
}

.tsc-status-text--ok {
  display: flex;
  align-items: center;
  color: #059669;
}

.tsc-status-text--warn {
  color: #b45309;
}

.tsc-weekly-hint {
  color: #78716c;
  font-weight: 500;
}

.tsc-recommended {
  display: flex;
  align-items: center;
  padding: 0.55rem 0.7rem;
  border: 1px solid #d5eee0;
  border-radius: 10px;
  background: #ecfdf5;
  font-size: 0.78rem;
  color: #475569;
}

.tsc-recommended strong {
  color: #059669;
}

.tsc-inline-btn,
.tsc-confirm-btn,
.tsc-cancel-btn {
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
}

.tsc-inline-btn {
  padding: 0 2px;
  color: #94a3b8;
}

.tsc-inline-btn:hover {
  color: #0366d6;
}

.tsc-edit-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tsc-edit-input {
  width: 82px;
  border: 1.5px solid #0366d6;
  border-radius: 8px;
  background: #ffffff;
  font-size: 0.8rem;
  padding: 0.2rem 0.45rem;
  color: #111827;
  outline: none;
}

.tsc-confirm-btn { color: #10b981; }
.tsc-confirm-btn:hover { color: #059669; }
.tsc-cancel-btn { color: #94a3b8; }
.tsc-cancel-btn:hover { color: #374151; }

.tsc-skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.tsc-skeleton {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: tsc-shimmer 1.4s infinite;
}

.tsc-skeleton--hero {
  height: 96px;
}

.tsc-skeleton--sm {
  height: 11px;
}

@keyframes tsc-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.tsc-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  color: #94a3b8;
  padding: 2rem 1rem;
}

.tsc-error-msg {
  font-size: 0.84rem;
  margin-bottom: 0.75rem;
}

.tsc-retry-btn {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: none;
  font-size: 0.78rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.3rem 0.75rem;
}

.tsc-retry-btn:hover {
  border-color: #9ca3af;
  color: #374151;
}

@media (max-width: 575.98px) {
  .tsc-header {
    flex-direction: column;
  }

  .tsc-subtitle {
    max-width: none;
  }

  .tsc-hero-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .tsc-hero-value {
    font-size: 1.75rem;
  }

  .tsc-stat-grid {
    grid-template-columns: 1fr;
  }

  .tsc-row {
    align-items: flex-start;
  }

  .tsc-row-label {
    max-width: 56%;
  }
}
</style>
