<template>
  <b-card class="stat-card mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column">
      <b-row class="flex-nowrap">
        <b-col class="pr-0">
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.4rem;">
            <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
              {{ t('Amount Received') }}
            </h5>
          </div>
          <span v-if="hideAmount" class="h2 font-weight-bold mb-0 tpc-hero-value--masked">••••••</span>
          <span v-else class="h2 font-weight-bold mb-0">{{ currencyFormatter.format(totalAmountReceived) }}</span>
        </b-col>
        <b-col cols="auto">
          <div class="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
            <base-feather-icon icon="TrendingUpIcon" size="30" />
          </div>
        </b-col>
      </b-row>

      <div class="income-month-comparison mt-2">
        <div class="income-month-item">
          <span class="income-month-label">{{ t('This Month') }}</span>
          <span v-if="thisMonthAmount === null" class="income-month-item-amount income-month-item-amount--muted">N/A</span>
          <span v-else-if="hideAmount" class="font-weight-bold tpc-hero-value--masked">••••</span>
          <span v-else class="income-month-item-amount">{{ currencyFormatter.format(thisMonthAmount) }}</span>
        </div>
        <div class="income-month-divider"></div>
        <div class="income-month-item">
          <span class="income-month-label">{{ t('Last Month') }}</span>
          <span v-if="lastMonthAmount === null" class="income-month-item-amount income-month-item-amount--muted">N/A</span>
          <span v-else-if="hideAmount" class="font-weight-bold tpc-hero-value--masked">••••</span>
          <span v-else class="income-month-item-amount">{{ currencyFormatter.format(lastMonthAmount) }}</span>
        </div>
      </div>

      <div class="stat-footer mt-auto">
        <span class="text-muted">{{ t('Avg. Invoice') }}:</span>
        <span v-if="hideAmount" class="stat-footer-value tpc-hero-value--masked">••••••</span>
        <span v-else class="stat-footer-value">{{ currencyFormatter.format(averagePaidInvoiceValue) }}</span>
        <span class="income-range-badge ml-auto">{{ rangeLabel }}</span>
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

export default {
  components: { BaseFeatherIcon },
  props: {
    summary: { type: Object, required: true },
    rangeLabel: { type: String, required: true },
    t: { type: Function, required: true },
    hideAmount: { type: Boolean, required: true },
    currencyFormatter: {required: true },
  },
  computed: {
    totalAmountReceived() {
      return this.summary?.amountReceived || 0;
    },
    thisMonthAmount() {
      return this.summary?.thisMonthAmount ?? null;
    },
    lastMonthAmount() {
      return this.summary?.lastMonthAmount ?? null;
    },
    averagePaidInvoiceValue() {
      return this.summary?.averageInvoiceValue || 0;
    },
  },
}
</script>

<style scoped>
.stat-card {
  height: 100%;
  border-top: 3px solid transparent;
  transition: box-shadow 0.2s ease;
}
.stat-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.09) !important;
}
.stat-card--green {
  border-top-color: #2dce89;
}
.card-stats {
  height: 100%;
}
.card-stats .card-body,
.card-body {
  height: 100%;
  padding: 0.75rem !important;
}
.icon-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  transition: width 0.2s ease, height 0.2s ease;
}
@media (max-width: 820px) {
  .icon-shape {
    width: 40px;
    height: 40px;
  }
  .icon-shape .feather {
    width: 24px;
    height: 24px;
  }
}
.bg-gradient-green {
  background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%);
}
.tpc-hero-value--masked {
  color: #94a3b8;
  letter-spacing: 0.08em;
}
.income-range-badge {
  font-size: 0.9rem;
  font-weight: 500;
  color: #8898aa;
  background: #f4f5f7;
  border: 1px solid #e9ecef;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  white-space: nowrap;
  line-height: 1.6;
}
.income-month-comparison {
  display: flex;
  align-items: stretch;
  overflow: hidden;
}
.income-month-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0.65rem;
}
.income-month-divider {
  width: 1px;
  background: #edf0f5;
  flex-shrink: 0;
}
.income-month-label {
  font-size: 1rem;
  margin-bottom: 0.1rem;
}
.stat-footer {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 1rem;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}
.h2{
  color:rgba(38, 43, 67, 0.9)!important;
}
.income-month-item-amount, .stat-footer-value {
  color:rgba(38, 43, 67, 0.9);
  font-weight:500;
}
.income-month-item-amount--muted {
  color: #94a3b8;
}
</style>
