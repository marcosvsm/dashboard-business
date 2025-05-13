<template>
  <section 
    class="invoice-add-wrapper"
  >
    <b-row 
      class="invoice-add"
    >

      <!-- Col: Left (Invoice Container) -->
      <b-col
        cols="12"
        xl="9"
        md="8"
      >
        <b-form 
          @submit.prevent="saveInvoice"
        >
          <b-card
            no-body
            class="invoice-preview-card"
          >
            <invoice-header :invoiceData="invoiceData"/>
            <!-- Spacer -->
            <hr 
              class="invoice-spacing"
            >
            <!-- Add Suggest Button Above Body 
            <b-card-body class="invoice-padding pb-0">
              <b-button
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                variant="outline-primary"
                class="mb-1"
                :disabled="!invoiceData.customer.id || isSuggesting"
                @click="suggestInvoice"
              >
                {{ isSuggesting ? 'Suggesting...' : 'Suggest Invoice' }}
              </b-button>
            </b-card-body>
-->
            <invoice-body :invoiceData="invoiceData" :companies="companies" :customers="customers" :addCustomerToInvoice="addCustomerToInvoice" :formErrors="formErrors"/>
            <!-- Spacer -->
            <hr 
              class="invoice-spacing"
            >
            <!-- Note -->
            <b-card-body 
              v-if="noteSwitch" 
              class="invoice-padding pt-0"
            >
              <span 
                class="font-weight-bold"
              >
                {{ t('Note') }}   
              </span>
              <b-form-textarea 
                v-model="invoiceData.note" 
                placeholder="Additional Details:"
              />
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
          <pdf :invoiceData="invoiceData" :paymentDetails="paymentDetails" :selectedPaymentMethod="selectedPaymentMethod" :validateForm="validateForm" />
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
            :disabled="isSubmitting"
          >
            {{ t('Save') }}
          </b-button>
        </b-card>

        <div 
          class="mt-2"
        >
          <div 
            class="d-flex justify-content-between align-items-center my-1"
          >
            <label 
              for="noteDetails"
            >
              {{ t('Note') }}   
            </label>
            <b-form-checkbox
              id="noteDetails"
              v-model="noteSwitch"
              switch
            />
          </div>
          <!-- Client Notes -->
          <div 
            class="d-flex justify-content-between align-items-center my-1"
          >
            <label 
              for="paymentDetails"
            >
              {{ t('Payment details') }}
            </label>
            <b-form-checkbox
              id="paymentDetails"
              v-model="paymentDetails"
              switch
            />
          </div>
           <div 
              class="mb-1"
              v-if="paymentDetails"
            >
              <v-select 
                v-model="selectedPaymentMethod" 
                id="payment-method"
                :options="Object.values(paymentMethods)"
                label="name"
                input-id="payment-id"
                :clearable="false"
              >
                <template  #open-indicator>
                  <base-feather-icon icon="ChevronDownIcon" />
                </template>
              </v-select>
            </div>
          <div 
            v-if="invoiceData.company && paymentDetails && selectedPaymentMethod === 'PAYID'" 
            class="mb-2"
          >
            <b-input 
              v-if="invoiceData.company.paymentDetail"
              id="payID" 
              v-model="invoiceData.company.paymentDetail.payid" 
              type="text" 
              v-b-tooltip.hover :title="t('To update your PAYID, please visit My Business > Business page')"
              readonly
            />
            <!-- PayID Input Section -->
            <div 
              v-if="!invoiceData.company.paymentDetail && paymentDetails && invoiceData.company.id" 
              class="payid-setup-section"
            >
              <span
                class="btn btn-sm"
                v-b-toggle.sidebar-payment-method>
                <base-feather-icon
                  icon="PlusCircleIcon"
                  size="22"
                  color="#4caf50"
                />
                {{ t('ADD new PayID') }}
              </span>
            </div>
          </div>
          <div v-if="selectedPaymentMethod === 'Bank Account' && paymentDetails" class="mb-2">
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
    <payment-method-sidebar :company="invoiceData.company" @payment-added="handlePaymentAdded" />
    <notifications></notifications>
  </section>
</template>

<script>
import { ref, computed, getCurrentInstance, watch, reactive } from 'vue'
import store from '@/store'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import InvoiceHeader from '@/components/uiComponents/InvoiceHeader.vue'
import InvoiceBody from '@/components/uiComponents/InvoiceBody.vue'
import Pdf from '@/components/uiComponents/Pdf.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import PaymentMethodSidebar from '@/components/uiComponents/PaymentMethodSidebar.vue'
import axios from 'axios'
import "vue-toastification/dist/index.css";
export default {
  components: {
    BaseFeatherIcon,
    vSelect,
    InvoiceHeader,
    InvoiceBody,
    Pdf,
    PaymentMethodSidebar,
  },
  directives: {
    Ripple,
  },
  methods:{
    validateForm() {
      const errors = {}
      let isValid = true

      // Validate company
      if (!this.invoiceData.company || !this.invoiceData.company.id) {
        errors.company = 'Company is required'
        isValid = false
      }

      // Validate items
      let hasValidItem = false
      if (!this.invoiceData.items || !this.invoiceData.items.length) {
        errors.items = 'At least one item is required'
        isValid = false
      } else {
        this.invoiceData.items.forEach((item, index) => {
          const qty = parseFloat(item.quantity)
          const price = parseFloat(item.price)

          if (!qty || qty < 1) {
            errors[`quantity-${index}`] = 'Quantity must be at least 1'
            isValid = false
          }
          if (!price || price < 0.01) {
            errors[`price-${index}`] = 'Price must be greater than 0'
            isValid = false
          }
          if (qty >= 1 && price >= 0.01) {
            hasValidItem = true
          }
        })
      }

      // Update formErrors reactively
      this.formErrors = { ...errors }

      // Scroll to first error
      if (!isValid) {
        this.$nextTick(() => {
          const firstErrorKey = Object.keys(this.formErrors)[0]
          if (firstErrorKey) {
            if (firstErrorKey === 'company') {
              document.querySelector('#companies-id')?.scrollIntoView({ behavior: 'smooth' })
            } else if (firstErrorKey.startsWith('quantity-') || firstErrorKey.startsWith('price-')) {
              const index = firstErrorKey.split('-')[1]
              document.querySelector(`.repeater-form .row:nth-child(${parseInt(index) + 1})`)?.scrollIntoView({ behavior: 'smooth' })
            } else if (firstErrorKey === 'items') {
              document.querySelector('.form-item-section')?.scrollIntoView({ behavior: 'smooth' })
            }
          }
        })
      }

      return isValid
    },
    async saveInvoice(){
      this.isSubmitting = true
      // Run validation synchronously first
      const isValid = this.validateForm()
      if(isValid){
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
              items: this.invoiceData.items
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
        this.$toast.success("Invoice saved",
            {
            position: "top-right",
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000
            })
      } catch(e){
        console.log('Response data:', e.response.data);
        await this.$store.dispatch('alerts/showNotification', {
          message: "Something went wrong! Try again later or contact the support.",
          type: "error"
        })
      }
      } else {
        console.log('Validation failed:', this.formErrors)
        this.$nextTick(() => {
          this.$toast.error('Please correct the errors in the form before saving the invoice.',
          {
            position: "top-right",
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 3000
          })
        })
      }
      this.isSubmitting = false
    },
    formatPrice(value) {
      // Ensure the value is a number and format it to two decimal places
      return Number(value).toFixed(2);
    },
    async suggestInvoice() {
      this.isSuggesting = true;
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/invoices/suggest/${this.invoiceData.customer.id}`, {
          headers: {
            'Accept': 'application/vnd.api+json',
            'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiZWFlMGFmNTI0NmFiNWY1ODQ3YTRhNzEzZTcxMTdiNzg3Njg5YTg1NDFhYTI4ODY4ZDdhMWUzNGM3NGZkMTgxYTM1M2VkNjRmYTU2ZjNmMjQiLCJpYXQiOjE3NDI4MDQzOTUsIm5iZiI6MTc0MjgwNDM5NSwiZXhwIjoxNzc0MzQwMzk1LCJzdWIiOiIyIiwic2NvcGVzIjpbXX0.RahyvrrSy8azlQY6eVzRHmnavzdywbObwgU7-20L50r7Iv3mKoHDv5y-110OqOT9ozWAbijkmZS7zREawmrFr8ILw6Hwtg5WzXD2iuZ7ip6p-69epzPaBgLAQ9KTF08mA3Y6RrODFm3i5upQoCUdUkwo91C7Fg4GxgyTPVpY8LH7ITs7UjXdD3A3JQgiNvwZtKH3mu4yU2RxdqPaTpyBM24MQIrQCggA78iXnwSBGw_VHRNyv2GfjeoOP1QYbqhvK5HvHHNzIpPOTG5cErYeu0nTmi0eDjm9uoUPcX6kh1f4cpUuVUWbWPkI76gC1giNBMSV_gwFZ_P0O00Ua358NDMDMYQ_-pY7HkMXgnfPATNHGQLKUhEYxGUssjkfuQ3Ai8_xI0L3mVQbHbPLqrXjIubMltLbf-vIPpcplXoIAxSkQAmYf2w305hGi0Nhsyfr2HuOb_5CS0yL17KHoCPjRjZ7ycRWQNB4Cbp12jGCUty5FhW1ftj9s67X5GCvP35C69ReJjwwdlUQdGDTOJJb5mfl02_Er2nps-Q3MtNEAi_CvrmUloak8UGR0nnNxMxiYKDzRn50F06HTXGSOQNKbPRa4K22HBKnU59KEP5m73z19Kd1jgfMvQSiAJl6jFRN1KpFjzyjynRuJLsqh7UORUJC4sjus5rrgoB1yKDwhPc`, // Adjust based on your auth setup
          },
        });console.log('Requesting:', response.included); // Debug URL
        const { data } = response.data;

        // Populate invoiceData with suggestion
        this.invoiceData.number = data.attributes.number;
        this.invoiceData.date = data.attributes.invoice_date;
        this.invoiceData.dueDate = data.attributes.due_date;
        this.invoiceData.amount = data.attributes.amount;
        this.invoiceData.status = data.attributes.status;
        // Replace items with API data
        this.invoiceData.items = data.included.map(item => {
           if (!item.attributes) {
                console.warn('Item missing attributes:', item);
                return { ...JSON.parse(JSON.stringify(itemFormBlankItem)) }; // Fallback
            }
            return {
                description: item.attributes.description,
                quantity: String(item.attributes.quantity),
                price: String(item.attributes.price),
                amount: String(item.attributes.amount),
                name: item.attributes.name || '',
            };
        });
        
        await this.$store.dispatch('alerts/showNotification', {
          message: 'Invoice suggestion loaded!',
          type: 'success',
        });
      } catch (error) {
        console.log(this.invoiceData.response)
        console.error('Suggestion failed:', error.response?.data.errors);
        await this.$store.dispatch('alerts/showNotification', {
          message: 'Couldn’t load suggestion. Try again later.',
          type: 'error',
        });
      }
      this.isSuggesting = false;
    },
  },
  setup() { 
    const { proxy } = getCurrentInstance()
    const customers = ref([]);
    const isSubmitting = ref(false);
    const isSuggesting = ref(false); // New flag for suggestion loading
    const formErrors = ref({})
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
      name: '',
      price: '',
      quantity: '',
      description: '',
      amount: '0.00'
    }

    const invoiceData = ref({
      number: "",
      customer: {},
      company: {},
      date: null,
      dueDate: null,
      abn: null,
      // ? Set single Item in form for adding data
      items: [JSON.parse(JSON.stringify(itemFormBlankItem))],
      note: '',
      paymentMethod: null,
      amount:'0.00',
    })     

    const paymentMethods = ['PAYID','Bank Account']
    const paymentDetails = ref(true);
    const noteSwitch = ref(false);
    const { t } = useI18nUtils()
    const bankName = ref('');
    const bsb = ref('');
    const account = ref('');
    const accountName = ref('');
    const selectedPaymentMethod = ref('PAYID')
    watch([bankName, bsb, account, accountName], ([newBankName, newBsb, newAccount, newAccountName]) => {
        invoiceData.value.note = `Account Details:\n\n${newBankName}\nBSB: ${newBsb}\nAccount: ${newAccount}\n${newAccountName}`;
        if(!newBankName && !newBsb && !newAccount && !newAccountName)
          invoiceData.value.note = ''
    });
    const newPayID = ref('');

    const handlePaymentAdded = (payment) =>{
        proxy.$set(invoiceData.value.company, 'paymentDetail', payment);
    }

    
    return {
      invoiceData,
      customers,
      paymentMethods,
      companies,
      paymentDetails,
      bankName,
      bsb,
      account,
      accountName,
      t,
      addCustomerToInvoice,
      noteSwitch,
      newPayID,
      handlePaymentAdded,
      selectedPaymentMethod,
      isSubmitting,
      isSuggesting, // Expose to template
      formErrors,
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
.tooltip-inner {
  background-color: #007bff !important;
  color: white !important;
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

.is-invalid { border-color: #dc3545; }
.error { color: #dc3545; font-size: 0.875rem; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
