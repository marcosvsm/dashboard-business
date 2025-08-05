<template>
  <div>
    <chart-card
      chart-type="Bar"
      :chart-data="chartData"
      :chart-options="chartOptions"
      :chart-height="300"
      :color="color"
      :chart-title="chartTitle"
    >
      <template #header>
        <h5 class="card-title text-uppercase text-muted mb-0" style="color: #0366d6 !important">
          {{ t('Monthly Income Trend') }}
        </h5>
      </template>
      <template #subtitle>
        <p class="text-sm text-muted">Overview of received amounts over the last 6 months</p>
      </template>
      <template #footer-title>
        <span class="text-success mr-2" v-if="growthPercentage > 0">
          <base-feather-icon icon="ArrowUpIcon" size="16" /> {{ growthPercentage }}%
        </span>
        <span class="text-danger mr-2" v-else-if="growthPercentage < 0">
          <base-feather-icon icon="ArrowDownIcon" size="16" /> {{ Math.abs(growthPercentage) }}%
        </span>
        <span class="text-muted mr-2" v-else>
          No change
        </span>
      </template>
      <template #footer-right>
        Last 6 Months
      </template>
    </chart-card>
  </div>
</template>

<script>
import ChartCard from '@/components/uiComponents/ChartCard.vue';
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';
import { mapGetters } from 'vuex';
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n';
import dayjs from 'dayjs';

export default {
  name: 'Chart',
  components: {
    ChartCard,
    BaseFeatherIcon,
  },
  data() {
    return {
      t: null,
      color: '#2dce89', // Green for income, matching the gradient in dashboard
      chartTitle: 'Monthly Income',
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                callback: function(value) {
                  return new Intl.NumberFormat('en-AU', {
                    style: 'currency',
                    currency: 'AUD',
                    minimumFractionDigits: 0,
                  }).format(value);
                },
              },
              gridLines: {
                display: true,
                drawBorder: false,
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              const dataset = data.datasets[tooltipItem.datasetIndex];
              const value = dataset.data[tooltipItem.index];
              return `${dataset.label}: ${new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: 'AUD',
              }).format(value)}`;
            },
          },
        },
        legend: {
          display: false, // Hide legend if only one dataset
        },
      },
    };
  },
  computed: {
    ...mapGetters('invoices', ['list']),
    invoices() {
      return this.list || [];
    },
    chartData() {
      const months = this.getLast12Months();
      const monthlyIncome = months.map(month => this.calculateIncomeForMonth(month));

      return {
        labels: months.map(m => dayjs(m).format('MMM YYYY')),
        datasets: [
          {
            label: 'Income',
            backgroundColor: this.getGradientColors(),
            data: monthlyIncome,
            borderWidth: 0,
            barThickness: 40, // Makes bars attractive and not too thin
          },
        ],
      };
    },
    growthPercentage() {
      const monthlyIncome = this.chartData.datasets[0].data;
      if (monthlyIncome.length < 2) return 0;
      const current = monthlyIncome[monthlyIncome.length - 1];
      const previous = monthlyIncome[monthlyIncome.length - 2];
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(2);
    },
  },
  created() {
    const { t } = useI18nUtils();
    this.t = t;
  },
  methods: {
    getLast12Months() {
      const months = [];
      let current = dayjs().startOf('month');
      for (let i = 0; i < 6; i++) {
        months.unshift(current.format('YYYY-MM'));
        current = current.subtract(1, 'month');
      }
      return months;
    },
    calculateIncomeForMonth(month) {
      return this.invoices.reduce((total, invoice) => {
        if (invoice.status === 1 && dayjs(invoice.invoice_date).format('YYYY-MM') === month) {
          return total + parseFloat(invoice.amount || 0);
        }
        return total;
      }, 0);
    },
    getGradientColors() {
      // Create a gradient similar to dashboard cards
      const ctx = document.createElement('canvas').getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, '#2dce89'); // Start green
      gradient.addColorStop(1, '#2dcecc'); // End lighter green
      return gradient;
    },
  },
};
</script>

<style scoped>
.chart-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>