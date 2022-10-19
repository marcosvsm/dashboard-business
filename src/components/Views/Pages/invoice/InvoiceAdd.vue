<template>
  <section class="invoice-add-wrapper">
    <b-row class="invoice-add">

      <!-- Col: Left (Invoice Container) -->
      <b-col
        cols="12"
        xl="9"
        md="8"
      >
        <b-form @submit.prevent>
          <b-card
            no-body
            class="invoice-preview-card"
          >
          
            <invoice-header :invoiceData="invoiceData"/>

            <!-- Spacer -->
            <hr class="invoice-spacing">

            <invoice-body :invoiceData="invoiceData" :itemsOptions="itemsOptions"/>

            <!-- Spacer -->
            <hr class="invoice-spacing">

            <!-- Note -->
            <b-card-body class="invoice-padding pt-0">
              <span class="font-weight-bold">Note: </span>
              <b-form-textarea v-model="invoiceData.note" />
            </b-card-body>
          </b-card>
        </b-form>
      </b-col>

      <!-- Right Col: Card -->
      <b-col
        cols="12"
        md="4"
        xl="3"
        class="invoice-actions mt-md-0 mt-2"
      >

        <!-- Action Buttons -->
        <b-card>

          <!-- Button: Send Invoice -->
          <b-button
            v-ripple.400="'rgba(255, 255, 255, 0.15)'"
            variant="primary"
            class="mb-75"
            block
            disabled
          >
            Send Invoice
          </b-button>

          <!-- Button: DOwnload -->
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-primary"
            class="mb-75"
            block
          >
            Preview
          </b-button>

          <!-- Button: Print -->
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-primary"
            block
          >
            Save
          </b-button>
        </b-card>

        <!-- Payment Method -->
        <div class="mt-2">
          <b-form-group
            label="Accept Payment Via"
            label-for="payment-method"
          >
            <v-select
              v-model="invoiceData.paymentMethod"
              :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
              :options="paymentMethods"
              input-id="payment-method"
              class="payment-selector"
              :clearable="false"
            />
          </b-form-group>

          <!-- ? Below values are not adding invoiceData to keep invoiceData more generic and less confusing  -->

          <!-- Payment Terms -->
          <div class="d-flex justify-content-between align-items-center">
            <label for="patymentTerms">Payment Terms</label>
            <b-form-checkbox
              id="patymentTerms"
              :checked="true"
              switch
            />
          </div>

          <!-- Client Notes -->
          <div class="d-flex justify-content-between align-items-center my-1">
            <label for="clientNotes">Client Notes</label>
            <b-form-checkbox
              id="clientNotes"
              :checked="true"
              switch
            />
          </div>

          <!-- Payment Stub -->
          <div class="d-flex justify-content-between align-items-center">
            <label for="paymentStub">Payment Stub</label>
            <b-form-checkbox
              id="paymentStub"
              switch
            />
          </div>
        </div>
      </b-col>
    </b-row>
   <!-- <invoice-sidebar-add-new-customer /> -->
  </section>
</template>

<script>
//import Logo from '@core/layouts/components/Logo.vue'
import { ref, onUnmounted } from 'vue'
import store from '@/store'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import invoiceStoreModule from './invoiceStoreModule'
import InvoiceHeader from '@/components/uiComponents/InvoiceHeader.vue'
import InvoiceBody from '@/components/uiComponents/InvoiceBody.vue'
//import InvoiceSidebarAddNewCustomer from '../InvoiceSidebarAddNewCustomer.vue'

export default {
  components: {
    BaseFeatherIcon,
    vSelect,
    InvoiceHeader,
    InvoiceBody,
   // Logo,
 //   InvoiceSidebarAddNewCustomer,
  },
  directives: {
    Ripple,
  },
  setup() {
    const INVOICE_APP_STORE_MODULE_NAME = 'app-invoice'

    // Register module
    if (!store.hasModule(INVOICE_APP_STORE_MODULE_NAME))
      store.registerModule(INVOICE_APP_STORE_MODULE_NAME, invoiceStoreModule)

    // UnRegister on leave
    onUnmounted(() => {
      if (store.hasModule(INVOICE_APP_STORE_MODULE_NAME)) store.unregisterModule(INVOICE_APP_STORE_MODULE_NAME)
    })

    const clients = ref([])
    store.dispatch('app-invoice/fetchClients').then(response => {
      clients.value = response.data
    })

    const itemFormBlankItem = {
      item: null,
      cost: 0,
      qty: 0,
      description: '',
    }

    const invoiceData = ref({
      id: 5037,
      client: null,

      // ? Set single Item in form for adding data
      items: [JSON.parse(JSON.stringify(itemFormBlankItem))],

      salesPerson: '',
      note: 'It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank You!',
      paymentMethod: null,
    })

    const itemsOptions = [
      {
        itemTitle: 'App Design',
        cost: 24,
        qty: 1,
        description: 'Designed UI kit & app pages.',
      },
      {
        itemTitle: 'App Customization',
        cost: 26,
        qty: 1,
        description: 'Customization & Bug Fixes.',
      },
      {
        itemTitle: 'ABC Template',
        cost: 28,
        qty: 1,
        description: 'Bootstrap 4 admin template.',
      },
      {
        itemTitle: 'App Development',
        cost: 32,
        qty: 1,
        description: 'Native App Development.',
      },
    ]


    const paymentMethods = ['Bank Account', 'PayPal', 'UPI Transfer']

    return {
      invoiceData,
      clients,
      itemsOptions,
      paymentMethods,
    }
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-select.scss';
.invoice-add-wrapper {
  .add-new-client-header {
    padding: $options-padding-y $options-padding-x;
    color: $success;

    &:hover {
      background-color: rgba($success, 0.12);
    }
  }
}
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
