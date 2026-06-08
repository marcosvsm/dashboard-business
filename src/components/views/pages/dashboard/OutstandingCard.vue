<template>
  <b-card class="card-stats mb-4 mb-xl-0">
    <b-card-body>
      <b-row class="flex-nowrap align-items-center">
        <b-col class="pr-0">
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
            {{ t('Outstanding') }}
          </h5>
          <span v-if="hideAmount" class="h2 font-weight-bold mb-0 tpc-hero-value--masked">••••••</span>
          <span v-else class="h2 font-weight-bold mb-0">{{ currencyFormatter.format(pendingAmount) }}</span>
        </b-col>
        <b-col cols="auto">
          <div class="icon icon-shape bg-gradient-orange text-white rounded-circle shadow">
            <base-feather-icon icon="RepeatIcon" size="30" />
          </div>
        </b-col>
      </b-row>
      <div class="d-flex justify-content-between mt-2">
        <span> {{ t('Overdue') }} ({{hideAmount ? '••••••' : overdueCount === 1 ? overdueCount +' '+t('Invoice') : overdueCount +' '+ t('Invoices')}})</span>
        <span v-if="hideAmount" class="tpc-hero-value--masked">••••••</span>
        <span v-else class="overdue-amount">{{ currencyFormatter.format(overdueAmount) }}</span>
      </div>
      <b-progress :value="overdueAmount" :max="pendingAmount || 1" variant="danger" class="mt-1" />
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

export default {
  components: { BaseFeatherIcon },
  props: {
    summary: { type: Object, required: true },
    t: { type: Function, required: true },
    currencyFormatter: { required: true },
    hideAmount: {type: Boolean, rerquired: true },
  },
  computed: {
    pendingAmount() {
      return this.summary?.pendingAmount || 0;
    },
    overdueCount() {
      return this.summary?.overdueCount || 0;
    },
    overdueAmount() {
      return this.summary?.overdueAmount || 0;
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

.bg-gradient-orange {
  background: linear-gradient(87deg, #fb6340 0, #fbb140 100%);
}

.tpc-hero-value--masked {
  color: #94a3b8;
  letter-spacing: 0.08em;
}
.h2{
  color:rgba(38, 43, 67, 0.9)!important;
}
.overdue-amount{
  font-weight:500;
  color:rgba(38, 43, 67, 0.9);
}
</style>
