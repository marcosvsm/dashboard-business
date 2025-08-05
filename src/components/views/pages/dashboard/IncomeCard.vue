<template>
  <b-card class="card-stats mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column">
      <b-row class="flex-nowrap">
        <b-col class="pr-0">
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
            {{ t('Amount Received') }} 
            <span class="cursor-pointer" @click="$emit('toggle-hide-amount')">
              <base-feather-icon :icon="hideAmount ? 'EyeOffIcon' : 'EyeIcon'" size="22" />
            </span>
          </h5>
          <span class="h2 font-weight-bold mb-0">{{ hideAmount ? '******' : getTotalAmount }}</span>
        </b-col>
        <b-col cols="auto">
          <div class="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
            <base-feather-icon icon="TrendingUpIcon" size="30" />
          </div>  
        </b-col>
      </b-row>
      <div class="mt-2 text-sm">
        <span class="text-muted"> {{ t('This Month') }}: </span>
        <span class="font-weight-bold"> {{ hideAmount ? '******' : getIncomeForThisMonth }} </span>
      </div>
      <div class="text-sm">
        <span class="text-muted"> {{ t('Last Month') }}: </span>
        <span class="font-weight-bold"> {{ hideAmount ? '******' : getIncomeForLastMonth }} </span>
      </div>
      
      <p class="mt-1 mb-0 text-sm">
        <span class="text-nowrap">
         <span class="text-muted"> {{t('Avg. Invoice')}}:</span> {{ hideAmount ? '******' : currencyFormatter.format(getAverageInvoiceValue) }}
        </span>
      </p>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';
import dayjs from 'dayjs';

export default {
  components: { BaseFeatherIcon },
  props: {
    invoices: { type: Array, required: true },
    t: { type: Function, required: true },
    hideAmount: { type: Boolean, required: true },
    currencyFormatter: {required: true },
  },
  computed: {
    getTotalAmount() {
      const total = this.invoices.reduce((sum, inv) => inv.status === 1 ? sum + parseFloat(inv.amount) : sum, 0);
      return this.currencyFormatter.format(total);
    },
    getIncomeForThisMonth() {
      const thisMonth = dayjs().format('YYYY-MM');
      const income = this.invoices.reduce((sum, inv) => {
        if (inv.status === 1 && dayjs(inv.invoice_date).format('YYYY-MM') === thisMonth) {
          return sum + parseFloat(inv.amount);
        }
        return sum;
      }, 0);
      return this.currencyFormatter.format(income);
    },
    getIncomeForLastMonth() {
      const lastMonth = dayjs().subtract(1, 'month').format('YYYY-MM');
      const income = this.invoices.reduce((sum, inv) => {
        if (inv.status === 1 && dayjs(inv.invoice_date).format('YYYY-MM') === lastMonth) {
          return sum + parseFloat(inv.amount);
        }
        return sum;
      }, 0);
      return this.currencyFormatter.format(income);
    },
    getYTDRevenue() {
      const currentYear = dayjs().year();
      const income = this.invoices.reduce((sum, inv) => {
        if (inv.status === 1 && dayjs(inv.invoice_date).year() === currentYear) {
          return sum + parseFloat(inv.amount);
        }
        return sum;
      }, 0);
      return this.currencyFormatter.format(income);
    },
    getAverageInvoiceValue() {
      const total = this.invoices.reduce((sum, inv) => inv.status === 1 ? sum + parseFloat(inv.amount) : sum, 0);
      return this.invoices.length ? total / this.invoices.length : 0;
    },
  },
}
</script>

<style scoped>
/* Styles specific to this card */
/* Add global dashboard styles here if needed */
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
}
.icon-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  transition: width 0.2s ease, height 0.2s ease; /* Smooth resizing */
}
/* Reduce icon size and adjust layout on smaller screens */
@media (max-width: 820px) {
  .icon-shape {
    width: 40px;
    height: 40px;
  }
  .icon-shape .feather {
    width: 24px; /* Reduce icon size */
    height: 24px;
  }
}

.bg-gradient-green {
  background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%);
}
.bg-gradient-blue {
  background: linear-gradient(87deg, #0366d6 0, #1a91ff 100%);
}
.bg-gradient-orange {
  background: linear-gradient(87deg, #fb6340 0, #fbb140 100%);
}
</style>