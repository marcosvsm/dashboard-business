<template>
  <b-card class="card-stats top-customers-card mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column top-customers-body">
      <div class="top-customers-header">
        <div class="top-customers-heading">
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
            {{ t('Top Customers') }}
          </h5>
          <p class="top-customers-subtitle mb-0">
            {{ t('Highest cashflow clients this period.') }}
          </p>
        </div>
      </div>

      <div class="top-customers-summary-band">
        <div class="summary-metric">
          <span class="summary-label">{{ t('Clients') }}</span>
          <span class="summary-value">{{ topCustomers.length }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-metric">
          <span class="summary-label">{{ t('Top earner') }}</span>
          <span v-if="hideAmount" class="summary-value summary-value--small tpc-hero-value--masked">••••••</span>
          <span v-else class="summary-value summary-value--small">
            {{ topCustomers.length ? currencyFormatter.format(topCustomers[0].total) : '—' }}
          </span>
        </div>
      </div>

      <div class="customer-list">
        <div
          v-for="(customer, index) in topCustomers"
          :key="index"
          class="customer-item"
        >
          <div class="customer-rank">{{ index + 1 }}</div>
          <div class="customer-content">
            <div class="customer-topline">
              <span class="customer-name">{{ customer.name.substring(0, 25) }}</span>
              <span v-if="hideAmount" class="customer-amount tpc-hero-value--masked">••••••</span>
              <span v-else class="customer-amount">{{ currencyFormatter.format(customer.total) }}</span>
            </div>
            <b-progress
              :value="customer.total"
              :max="maxCustomerTotal"
              class="customer-progress mt-1"
            />
          </div>
        </div>

        <div v-if="!topCustomers.length" class="customer-empty-state">
          <div class="customer-empty-icon">
            <base-feather-icon icon="UsersIcon" size="18" />
          </div>
          <p class="customer-empty-title mb-1">{{ t('No clients found') }}</p>
          <router-link :to="{ name: 'add-invoice' }" class="customer-empty-link">
            {{ t('Create Invoice') }}
          </router-link>
        </div>
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

export default {
  components: { BaseFeatherIcon },
  props: {
    topCustomers: { type: Array, required: true },
    maxCustomerTotal: { type: Number, required: true },
    t: { type: Function, required: true },
    currencyFormatter: { required: true },
    hideAmount: { type: Boolean, required: true },
  },
}
</script>

<style scoped>
.card {
  height: 100%;
}
.card-stats {
  height: 100%;
}
.card-stats .card-body {
  height: 100%;
  padding: 0.75rem !important;
}
.card-body {
  padding: 0.75rem !important;
}

.top-customers-card {
  border: 1px solid #e9ecef;
  border-radius: 0.428rem;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
}

.top-customers-body {
  gap: 0.85rem;
}

.top-customers-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.top-customers-heading {
  min-width: 0;
}

.top-customers-subtitle {
  margin-top: 0.35rem;
}

.top-customers-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #0366d6 !important;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.top-customers-summary-band {
  display: flex;
  align-items: stretch;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(3, 102, 214, 0.12);
  border-radius: 0.75rem;
}

.summary-metric {
  flex: 1 1 0;
  min-width: 0;
}

.summary-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.summary-value {
  display: block;
  line-height: 1.2;
  color:rgba(38, 43, 67, 0.9);
  font-weight:500;
}

.summary-value--small {
  font-size: 1rem;
}

.summary-divider {
  width: 1px;
  background: rgba(3, 102, 214, 0.12);
}

.customer-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-height: 320px;
  overflow-y: auto;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.customer-item:hover {
  transform: translateY(-1px);
  border-color: rgba(3, 102, 214, 0.2);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.customer-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 1.75rem;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  background: rgba(3, 102, 214, 0.08);
  border: 1px solid rgba(3, 102, 214, 0.12);
  color: #0366d6;
  font-size: 0.75rem;
  font-weight: 700;
}

.customer-content {
  flex: 1 1 auto;
  min-width: 0;
}

.customer-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.customer-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight:600;
  color:rgba(38, 43, 67, 0.9);
}

.customer-amount {
  color: rgba(38, 43, 67, 0.9);
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
}

.customer-progress {
  height: 5px;
  border-radius: 999px;
  background-color: rgba(3, 102, 214, 0.08);
}

.customer-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  border: 1px dashed #dbe3ec;
  border-radius: 0.428rem;
  background: #fbfcfe;
  text-align: center;
}

.customer-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.75rem;
  border-radius: 999px;
  color: #64748b;
  background: #eef2f7;
}

.customer-empty-title {
  font-weight: 500;
}

.customer-empty-link {
  color: #0366d6 !important;
  font-size: 0.85rem;
  font-weight: 600;
}

.tpc-hero-value--masked {
  color: #94a3b8;
  letter-spacing: 0.08em;
}

@media (max-width: 575px) {
  .top-customers-summary-band {
    flex-direction: column;
    gap: 0.6rem;
  }

  .summary-divider {
    width: 100%;
    height: 1px;
  }

  .customer-topline {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 430px) {
  .top-customers-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
