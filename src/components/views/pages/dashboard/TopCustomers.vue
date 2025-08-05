<template>
  <b-card class="card-stats">
    <b-card-body>
      <h5 class="card-title text-uppercase text-muted mb-3" style="color:#0366d6 !important">
        Top {{ t('Customers') }}
      </h5>
      <div v-for="(customer, index) in topCustomers" :key="index" class="mb-2">
        <div class="d-flex justify-content-between">
          <span class="font-weight-bold">{{ customer.name.substring(0,25) }}</span>
          <span>{{ currencyFormatter.format(customer.total) }}</span>
        </div>
        <b-progress :value="customer.total" :max="maxCustomerTotal" variant="primary" class="mt-1" />
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  props: {
    topCustomers: { type: Array, required: true },
    maxCustomerTotal: { type: Number, required: true },
    t: { type: Function, required: true },
    currencyFormatter: { required: true },
  },
}
</script>

<style scoped>
/* Styles for top customers */
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
</style>