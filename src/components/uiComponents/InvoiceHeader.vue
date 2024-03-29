<template>
    <!-- Header -->
  <b-card-body class="invoice-padding pb-0">
   
    <div class="d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0">

    <!-- Header: Left Content -->
      <div>
        <div class="logo-wrapper">
          <!-- <logo /> -->
          <h3 class="text-primary invoice-logo">
            {{invoiceData.company.name}}
          </h3>
        </div>
      </div>

    <!-- Header: Right Content -->
      <div class="invoice-number-date mt-md-0 mt-2">
        <div class="d-flex align-items-center justify-content-md-end mb-1">
          <h4 class="invoice-title">
            Invoice
          </h4>
          <b-input-group class="input-group-merge invoice-edit-input-group disabled">
            <b-input-group-prepend is-text>
              <base-feather-icon icon="HashIcon" />
            </b-input-group-prepend>
            <b-form-input
            id="invoice-data-id"
            v-model="invoiceData.number"
            required
            />
          </b-input-group>
        </div>
        <div class="d-flex align-items-center mb-1">
          <span class="title">
            Date:
          </span>
          <flat-pickr
            v-model="invoiceData.date"
            class="form-control invoice-edit-input"
            required
          />
        </div>
        <div class="d-flex align-items-center">
          <span class="title">
            Due Date:
          </span>
          <flat-pickr
            v-model="invoiceData.dueDate"
            class="form-control invoice-edit-input"
            required
          />
        </div>
      </div>
    </div>
  </b-card-body>
</template>
<script>
import flatPickr from 'vue-flatpickr-component'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon'
export default {
    components:{
        flatPickr,
        BaseFeatherIcon,
    },
    props:{
        invoiceData: {
          type: Object,
        }
    },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-flatpicker.scss';

</style>

<style lang="scss" scoped>
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';

.form-item-section {
  background-color: $product-details-bg;
}

.form-item-action-col {
  width: 27px;
}

.repeater-form {
  // overflow: hidden;
  transition: 0.35s height;
}

.v-select {
  &.item-selector-title,
  &.payment-selector {
    background-color: #fff;

    .dark-layout & {
      background-color: unset;
    }
  }
}

.dark-layout {
  .form-item-section {
    background-color: $theme-dark-body-bg;

    .row .border {
      background-color: $theme-dark-card-bg;
    }
  }
}
</style>
