<template>
  <section class="invoice-add-wrapper">
    <div class="mb-1">
    <sub-menu v-bind="subMenu"></sub-menu>
    </div>
    <b-row class="invoice-add">

      <!-- Col: Left (Invoice Container) -->
      <b-col
        cols="12"
        xl="9"
        md="8"
      >
        <b-form @submit.prevent="saveInvoice">
          <b-card
            no-body
            class="invoice-preview-card"
          >
          
            <invoice-header :invoiceData="invoiceData"/>

            <!-- Spacer -->
            <hr class="invoice-spacing">

            <invoice-body :invoiceData="invoiceData" :itemsOptions="itemsOptions" :companies="companies" :customers="customers" :addCustomerToInvoice="addCustomerToInvoice"/>

            <!-- Spacer -->
            <hr class="invoice-spacing">

            <!-- Note -->
            <b-card-body class="invoice-padding pt-0">
              <span class="font-weight-bold">{{ t('Note') }}: </span>
              <b-form-textarea v-model="invoiceData.note" placeholder="Account Details:

              Bank Name
              BSB: 000-000
              Account: 0000 0000
              Account name"/>
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

          <!-- Button: DOwnload -->
          <pdf :invoiceData="invoiceData" />

        <!--  
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-primary"
            class="mb-75"
            block
          >
            Preview
          </b-button>
          -->

          <!-- Button: Print -->
          <b-button
            v-ripple.400="'rgba(113, 102, 240, 0.15)'"
            variant="outline-primary"
            block
            @click="saveInvoice()"
          >
            {{ t('Save') }}
          </b-button>
        </b-card>

        <div class="mt-2">
          <!-- Client Notes -->
          <div class="d-flex justify-content-between align-items-center my-1">
            <label for="paymentDetails">{{ t('Payment details') }}</label>
            <b-form-checkbox
              id="paymentDetails"
              v-model="paymentDetails"
              switch
            />
          </div>
          <div v-if="paymentDetails" class="mb-2">
            <label for="bankName">{{ t('Bank Name') }}</label>
            <b-input 
              id="bankName" 
              v-model="bankName" 
              type="text" 
            />
            <label for="bsb">BSB</label>
            <b-input
              id="bsb" 
              type="text" 
              placeholder="000-000"
              v-model="bsb" 
            />
            <label for="account">{{ t('Account') }}</label>
            <b-input
              id="account" 
              type="text" 
              placeholder="0000 0000"
              v-model="account"
            />
            <label for="accountName">{{ t('Account Name') }}</label>
            <b-input
              id="accountName" 
              type="text"
              v-model="accountName"
            />
          </div>
        </div>

      </b-col>
    </b-row>
  </section>
</template>

<script>
//import Logo from '@core/layouts/components/Logo.vue'
import { ref, onUnmounted, watch } from 'vue'
import store from '@/store'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import InvoiceHeader from '@/components/uiComponents/InvoiceHeader.vue'
import InvoiceBody from '@/components/uiComponents/InvoiceBody.vue'
import Pdf from '@/components/uiComponents/Pdf.vue'
import SubMenu from '@/components/uiComponents/SubMenu.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'


export default {
  components: {
    BaseFeatherIcon,
    vSelect,
    InvoiceHeader,
    InvoiceBody,
    Pdf,
    SubMenu,
   // Logo,
  //  InvoiceSidebarAddNewCustomer,
  },
  directives: {
    Ripple,
  },
  methods:{
    async saveInvoice(){
      const data = { 
        data: {
          type: "invoices",
          attributes: {
            name: this.invoiceData.number,
            invoice_date: this.invoiceData.date,
            due_date: this.invoiceData.dueDate,
            amount: this.invoiceData.amount,
            ref: this.invoiceData.number,
            company_id : this.invoiceData.company.id,
            customer_id: this.invoiceData.customer.id,
          },
            relationships:{
              company: {
                data: {
                  type: "companies",
                  id: this.invoiceData.company.id,
                }
              },
            },
        }
      }
      try{
        await this.$store.dispatch('invoices/add',data);
        await this.$store.dispatch('alerts/showNotification', {
          message:"Invoice saved successfully",
          type:"success"
        })
      } catch(e){
        console.log('Response data:', e.response.data);
        await this.$store.dispatch('alerts/showNotification', {
          message: "Something went wrong! Try again later or contact the support.",
          type: "error"
        })
      }
    },
    formatPrice(value) {
      // Ensure the value is a number and format it to two decimal places
      return Number(value).toFixed(2);
    },
  },
  setup() { 
    const customers = ref([]);
    const getCustomers = async () => {
      try{
        await store.dispatch('customers/list');
        customers.value = store.getters["customers/list"]
      } catch (error){
        console.error('Error fetching clients:', error);
      }
    }

    const companies = ref([]); // Use ref to store the list of companies

    // Async function to fetch companies
    const getCompanies = async () => {
      try {
        await store.dispatch('companies/list');
        companies.value = store.getters["companies/list"] 
        console.log('Companies data:', companies.value);// Assuming 'list' contains the list of companies
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

     const addCustomerToInvoice = (newCustomer) => {
      customers.value.push(newCustomer)
      invoiceData.value.customer = newCustomer
    }

    
    getCustomers()
    getCompanies()
    

    const itemFormBlankItem = {
      itemName: '',
      price: '',
      quantity: '',
      description: '',
      amount: '0.00'
    }

    const invoiceData = ref({
      number: "",
      customer: {},
      company: {"name": null},
      date: null,
      dueDate: null,
      abn: null,
      // ? Set single Item in form for adding data
      items: [JSON.parse(JSON.stringify(itemFormBlankItem))],
      note: '',
      paymentMethod: null,
      amount:'0.00',
    })

    const itemsOptions = [
      {
        itemName: '',
        cost: 0,
        qty: 0,
        description: '',
      },
      {
        itemName: 'App Customization',
        cost: 26,
        qty: 1,
        description: 'Customization & Bug Fixes.',
      },
      {
        itemName: 'ABC Template',
        cost: 28,
        qty: 1,
        description: 'Bootstrap 4 admin template.',
      },
      {
        itemName: 'App Development',
        cost: 32,
        qty: 1,
        description: 'Native App Development.',
      },
    ]
     

    const paymentMethods = ['Bank Account', 'PayPal', 'UPI Transfer']
    const paymentDetails = ref(true);
    const bankName = ref('');
    const bsb = ref('');
    const account = ref('');
    const accountName = ref('');

    watch([bankName, bsb, account, accountName], ([newBankName, newBsb, newAccount, newAccountName]) => {
      invoiceData.value.note = `Account Details:\n\n${newBankName}\nBSB: ${newBsb}\nAccount: ${newAccount}\n${newAccountName}`;
    });

    const subMenu = [{
            name: 'My Invoices',
            route: 'invoices',
          }]
    const { t } = useI18nUtils()

    return {
      invoiceData,
      customers,
      itemsOptions,
      paymentMethods,
      companies,
      paymentDetails,
      bankName,
      bsb,
      account,
      accountName,
      subMenu,
      t,
      addCustomerToInvoice
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
@media (max-width: 767.98px) {
  .invoice-actions {
    display: flex;
    flex-direction: column-reverse;
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

.invoice-add{ 
  textarea{
    min-height: 200px;
  }
}
</style>
