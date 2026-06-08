<template>
  <chart-card
    :key="chartRenderKey"
    :chart-id="chartRenderKey"
    chart-type="Bar"
    :chart-data="revenueChartData"
    :chart-options="revenueChartOptions"
    :chart-height="350"
    :color="'#2dce89'"
    :chart-title="t('CashFlow')"
  >
    <template #header>
      <div class="chart-card-header">
        <b-row>
          <b-col cols="9" class="d-flex align-items-center">
            <h5 class="card-title text-uppercase text-muted mb-0" style="color: #0366d6 !important">
              {{ t(timePeriod+' CashFlow') }}
            <span class="income-range-badge">{{ chartSubtitle }} </span>
            </h5>
          </b-col>
          <b-col cols="3" class="d-flex justify-content-end">
            <b-dropdown variant="link" no-caret>
              <template #button-content>
                <base-feather-icon icon="FilterIcon" size="16" />
                {{t('Filter')}}
              </template>
              <b-dropdown-item @click="$emit('set-time-period', 'monthly')">{{ t('Monthly') }}</b-dropdown-item>
              <b-dropdown-item @click="$emit('set-time-period', 'quarterly')">{{ t('Quarterly') }}</b-dropdown-item>
              <b-dropdown-item @click="$emit('set-time-period', 'annual')">{{ t('Annual') }}</b-dropdown-item>
            </b-dropdown>
          </b-col>
        </b-row>
      </div>
    </template>
    <template #footer-title>
      <div class="chart-card-footer">
        <span :class="revenueGrowth > 0 ? 'text-success' : 'text-danger' ">
          <base-feather-icon :icon="revenueGrowth > 0 ? 'ArrowUpIcon' : 'ArrowDownIcon'" size="16" />
          {{ Math.abs(revenueGrowth).toFixed(2) }}% {{ revenueGrowth > 0 ? t('increase') : t('decrease') }}
        </span>
        <span style="margin-left:5px;">
          vs {{t('last '+period)}}
        </span>
      </div>
    </template>
    <template #footer-right>
      <span>
        Q = {{t('Quarter')}}
      </span>
      |
      <span>
        FY = {{t('Financial Year')}}
      </span>
    </template>
  </chart-card>
</template>

<script>
import ChartCard from '@/components/uiComponents/ChartCard.vue';
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

export default {
  components: { ChartCard, BaseFeatherIcon },
  props: {
    revenue: { type: Object, required: true },
    rangeLabel: { type: String, required: true },
    isAllTime: { type: Boolean, required: true },
    t: { type: Function, required: true },
    timePeriod: { type: String, required: true },
    currencyFormatter: { required: true },
    hideAmount: {type: Boolean, required: true },
  },
  computed: {
    chartSubtitle() {
      if (!this.isAllTime) {
        return this.rangeLabel;
      }

      return this.timePeriod === 'monthly'
        ? this.t('Paid invoices over the last 12 months')
        : this.timePeriod === 'quarterly'
          ? this.t('Invoices paid by quarter')
          : this.timePeriod === 'annual'
            ? this.t('Invoices paid in the last 3 financial years')
            : '';
    },
    currentSeries() {
      return this.revenue?.[this.timePeriod] || [];
    },
    period() {
      return this.timePeriod === 'quarterly'
        ? 'quarter'
        : this.timePeriod === 'annual'
          ? 'financial year'
          : 'month';
    },
    revenueChartData() {
      return {
        labels: this.currentSeries.map(period => period.label),
        datasets: [
          {
            label: this.t('CashFlow'),
            backgroundColor: 'rgb(3, 102, 214)',
            data: this.currentSeries.map(period => period.amount),
          }
        ]
      };
    },
    revenueChartOptions() {
      const hideAmount = this.hideAmount;
      const currencyFormatter = this.currencyFormatter;

      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                callback: (value) => hideAmount ? '••••••' : currencyFormatter.format(value),
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              const dataset = data.datasets[tooltipItem.datasetIndex];
              const value = dataset.data[tooltipItem.index];
              return `${dataset.label}: ${currencyFormatter.format(value)}`;
            },
          },
        },
      };
    },
    chartRenderKey() {
      return `revenue-trend-${this.timePeriod}-${this.rangeLabel}-${this.hideAmount ? 'hidden' : 'visible'}`;
    },
    revenueGrowth() {
      const data = this.revenueChartData.datasets[0].data;
      if (data.length < 2) return 0;
      const current = data[data.length - 1];
      const previous = data[data.length - 2];
      return previous ? ((current - previous) / previous * 100) : 0;
    },
  },
}
</script>

<style scoped>
.card{
  height:100%;
}
.card-stats{
  height: 100%;
}
.card-stats .card-body{
  height: 100%;
  padding:0.75rem !important;
}
.card-body{
  padding:0.75rem !important;
  border:none !important;
}
.card-footer{
  border-top: none !important;
  padding-top: 0px !important;
}
.chart-card-header {
  width:100%
}

.chart-card-header .card-title {
  flex: 1;
  margin-right: 1rem;
  max-width: 100%;
  word-wrap: break-word;
}

.chart-card-header .chart-card-filter {
  flex-shrink: 0;
}

.chart-card-footer {
  display: flex;
  width:100%;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  flex-grow: 1;
  border-top: none !important;
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
</style>
