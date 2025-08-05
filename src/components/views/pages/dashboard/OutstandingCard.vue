<template>
  <b-card class="card-stats mb-4 mb-xl-0">
    <b-card-body>
      <b-row class="flex-nowrap align-items-center">
        <b-col class="pr-0">
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
            {{ t('Outstanding') }}
          </h5>
          <span class="h2 font-weight-bold mb-0">{{ currencyFormatter.format(getPendingAmount) }}</span>
        </b-col>
        <b-col cols="auto">
          <div class="icon icon-shape bg-gradient-orange text-white rounded-circle shadow">
            <base-feather-icon icon="RepeatIcon" size="30" />
          </div>
        </b-col>
      </b-row>
      <div class="d-flex justify-content-between mt-2">
          <span class="font-weight-bold"> {{ t('Overdue') }} ({{ getOverdueCount}} {{t('Invoices')}})</span>
          <span>{{ currencyFormatter.format(getOverdueAmount) }}</span>
        </div>
        <b-progress :value="getOverdueAmount" :max="getPendingAmount" variant="danger" class="mt-1" />
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

export default {
  components: { BaseFeatherIcon },
  props: {
    invoices: { type: Array, required: true },
    t: { type: Function, required: true },
    currencyFormatter: { required: true },
  },
  computed: {
    getPendingAmount() {
      const total = this.invoices.reduce((sum, inv) => inv.status === 0 ? sum + parseFloat(inv.amount) : sum, 0);
      return total;
    },
    getOverdueCount() {
      const today = new Date();
      return this.invoices.filter(inv => inv.status === 0 && new Date(inv.due_date) < today).length;
    },
    getOverdueAmount() {
      const today = new Date();
      return this.invoices.reduce((sum, inv) => {
        if (inv.status === 0 && new Date(inv.due_date) < today) {
          return sum + parseFloat(inv.amount);
        }
        return sum;
      }, 0);
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

.bg-gradient-orange {
  background: linear-gradient(87deg, #fb6340 0, #fbb140 100%);
}
</style>