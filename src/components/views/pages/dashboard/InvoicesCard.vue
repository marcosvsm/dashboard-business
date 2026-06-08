<template>
  <b-card class="card-stats mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column">
      <b-row class="flex-nowrap align-items-center">
        <b-col>
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">{{ t('Invoices') }}</h5>
          <span v-if="hideAmount" class="h2 font-weight-bold mb-0 tpc-hero-value--masked">••••••</span>
          <span v-else class="h2 font-weight-bold mb-0">{{ totalCount }}</span>
        </b-col>
        <b-col cols="auto">
          <router-link :to="{ name: 'invoices'}">
            <div class="icon icon-shape bg-gradient-blue text-white rounded-circle shadow">
              <base-feather-icon icon="FileTextIcon" size="30" />
            </div>
          </router-link>
        </b-col>
      </b-row>
      <b-row class="flex-nowrap align-items-center mt-1">
        <b-col cols="6">
          <div class="d-flex justify-content-between">
            <span class="font-weight-bold">{{ t('Paid') }}</span>
            <span v-if="hideAmount" class="tpc-hero-value--masked">••••••</span>
            <span v-else class="invoice-value">{{ paidCount }}</span>
          </div>
          <b-progress :value="paidCount" :max="totalCount || 1" variant="primary" class="mt-1" />
        </b-col>
        <b-col cols="6">
          <div class="d-flex justify-content-between">
            <span class="font-weight-bold">{{ t('Unpaid') }}</span>
            <span v-if="hideAmount" class="tpc-hero-value--masked">••••••</span>
            <span v-else class="invoice-value">{{ unpaidCount }}</span>
          </div>
          <b-progress :value="unpaidCount" :max="totalCount || 1" variant="warning" class="mt-1" />
        </b-col>
      </b-row>

      <div class="last-invoice mt-auto">
        <span class="text-muted">{{ t('Last Invoice') }}:</span><p>{{ lastInvoice }}</p>
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
    t: { type: Function, required: true },
    currencyFormatter: { required: true },
    formatDateForDisplay: { type: Function, required: true },
    formatDateForInvoiceDisplay: { type: Function, required: true },
    hideAmount: {type: Boolean, required: true },
  },
  computed: {
    totalCount() {
      return this.summary?.totalCount || 0;
    },
    paidCount() {
      return this.summary?.paidCount || 0;
    },
    unpaidCount() {
      return this.summary?.unpaidCount || 0;
    },
    lastInvoice() {
      if (!this.summary?.lastInvoiceDate) return 'N/A';
      return this.formatDateForInvoiceDisplay(this.summary.lastInvoiceDate);
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
  height: 100%;
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

.bg-gradient-blue {
  background: linear-gradient(87deg, #0366d6 0, #1a91ff 100%);
}

.tpc-hero-value--masked {
  color: #94a3b8;
  letter-spacing: 0.08em;
}
.stat-footer {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 1rem;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  border-top: 1px solid #f0f3f8;
}
.h2{
  color:rgba(38, 43, 67, 0.9)!important;
}
.invoice-value{
  font-weight:500;
  color:rgba(38, 43, 67, 0.9);
}
</style>
