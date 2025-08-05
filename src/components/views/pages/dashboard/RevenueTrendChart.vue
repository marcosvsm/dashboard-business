<template>
  <chart-card
    chart-type="Bar"
    :chart-data="revenueChartData"
    :chart-options="revenueChartOptions"
    :chart-height="350"
    :color="'#2dce89'"
    :chart-title="t('Revenue Trend')"
  >
    <template #header>
      <div class="chart-card-header">
         <b-row>
        <b-col cols="9" class="d-flex align-items-center">
          <h5 class="card-title text-uppercase text-muted mb-0" style="color: #0366d6 !important">
            {{ t(timePeriod+' Revenue Trend') }}
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
            <b-dropdown-item @click="$emit('set-time-period', 'yearly')">{{ t('Yearly') }}</b-dropdown-item>
          </b-dropdown>
        </b-col>
      </b-row>
      </div>
    </template>
    <template #subtitle>
      <p class="text-sm text-muted">{{timePeriod === 'monthly' ? t('Paid invoices over the last 12 months') : timePeriod === 'quarterly' ? t('Invoices paid by quarter') : timePeriod === 'yearly' ? t('Invoices paid in the last 3 years') : '' }}</p>
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
    </template>
  </chart-card>
</template>

<script>
import ChartCard from '@/components/uiComponents/ChartCard.vue';
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear'; // Import the quarterOfYear plugin

// Extend dayjs with the quarterOfYear plugin
dayjs.extend(quarterOfYear);

export default {
  components: { ChartCard, BaseFeatherIcon },
  props: {
    invoices: { type: Array, required: true },
    t: { type: Function, required: true },
    timePeriod: { type: String, required: true },
    currencyFormatter: { required: true },
  },
  data(){
      return {
          period: '',
      }
  },
  computed: {
    revenueChartData() {
      const periods = this.getPeriods();
      const data = periods.map(period => this.calculateRevenueForPeriod(period));
      return {
        labels: periods.map(p => this.formatPeriodLabel(p)),
        datasets: [
          {
            label: this.t('Revenue'),
            backgroundColor: '#2dce89',
            data: data,
          }
        ]
      };
    },
    revenueChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            { 
              ticks: { 
                beginAtZero: true,
                callback: (value) => this.currencyFormatter.format(value), // Use currencyFormatter 
              }, 
            },
          ],
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              const dataset = data.datasets[tooltipItem.datasetIndex];
              const value = dataset.data[tooltipItem.index];
              return `${dataset.label}: ${this.currencyFormatter.format(value)}`; // Use currencyFormatter
            },
          },
        },
      };
    },
    revenueGrowth() {
      const data = this.revenueChartData.datasets[0].data;
      if (data.length < 2) return 0;
      const current = data[data.length - 1];
      const previous = data[data.length - 2];
      return previous ? ((current - previous) / previous * 100) : 0;
    },
  },
  methods: {
    getPeriods() {
      let periods = [];
      let current = dayjs();
      switch (this.timePeriod) {
        case 'quarterly':
          for (let i = 0; i < 4; i++) {
            periods.unshift(current.startOf('quarter'));
            current = current.subtract(1, 'quarter');
          }
          this.period = 'quarter'
          break;
        case 'yearly':
          for (let i = 0; i < 3; i++) {
            periods.unshift(current.startOf('year'));
            current = current.subtract(1, 'year');
          }
          this.period = 'year'
          break;
        default: // monthly
          for (let i = 0; i < 12; i++) {
            periods.unshift(current.startOf('month'));
            current = current.subtract(1, 'month');
          }
          this.period = 'month'
      }
      return periods;
    },
    formatPeriodLabel(period) {
      switch (this.timePeriod) {
        case 'quarterly':
          return `Q${period.quarter()} ${period.year()}`;
        case 'yearly':
          return period.year().toString();
        default:
          return period.format('MMM YYYY');
      }
    },
    calculateRevenueForPeriod(period) {
      const start = period;
      let end;
      let unit;
      if (this.timePeriod === 'quarterly') {
        end = period.endOf('quarter');
        unit = 'quarter';
      } else if (this.timePeriod === 'yearly') {
        end = period.endOf('year');
        unit = 'year';
      } else {
        end = period.endOf('month');
        unit = 'month';
      }
      const nextStart = period.add(1, unit).startOf(unit);
      return this.invoices.reduce((sum, inv) => {
        const invDate = dayjs(inv.invoice_date);
        if (inv.status === 1 && (invDate.isAfter(start) || invDate.isSame(start)) && invDate.isBefore(nextStart)) {
          return sum + parseFloat(inv.amount);
        }
        return sum;
      }, 0);
    },
  },
}
</script>

<style scoped>
/* Styles specific to this chart */
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
/* Header styling */
.chart-card-header {
  width:100%
}

/* Ensure H5 can wrap text if needed */
.chart-card-header .card-title {
  flex: 1; /* Allow H5 to take available space */
  margin-right: 1rem; /* Space between title and filter */
  max-width: 100%; /* Prevent H5 from taking too much space */
  word-wrap: break-word; /* Allow text to wrap */
}

/* Filter dropdown styling */
.chart-card-header .chart-card-filter {
  flex-shrink: 0; /* Prevent filter from shrinking */
}

/* Footer styling */
.chart-card-footer {
  display: flex;
  width:100%;
  justify-content: center; /* Align content to the right */
  align-items: center; /* Align content to the bottom */
  padding: 1rem;
  flex-grow: 1; /* Push footer to the bottom if card has extra space */
  border-top: none !important;
}
</style>