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
            <!-- Add Suggest Button Above Body -->
            <b-card-body class="invoice-padding pb-0" v-if="hasRole('grow')">
              <b-button
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                variant="outline-primary"
                class="mb-1"
                :disabled="!invoiceData.customer.id || isSuggesting"
                @click="suggestInvoice"
              >
                {{ isSuggesting ? 'Thinking...' : 'AIra’s Invoice Suggestions' }}
              </b-button>
            </b-card-body>

            <invoice-body :invoiceData="invoiceData" :companies="companies" :customers="customers" :addCustomerToInvoice="addCustomerToInvoice" :formErrors="formErrors" />
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
import { ref, getCurrentInstance, watch } from 'vue'
import store from '@/store'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons';
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import InvoiceHeader from '@/components/uiComponents/InvoiceHeader.vue'
import InvoiceBody from '@/components/uiComponents/InvoiceBody.vue'
import Pdf from '@/components/uiComponents/Pdf.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import PaymentMethodSidebar from '@/components/uiComponents/PaymentMethodSidebar.vue'
import { mapGetters } from 'vuex';
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

      // Validate customer
      if (!this.invoiceData.customer || !this.invoiceData.customer.id) {
        errors.customer = 'Customer is required'
        isValid = false
      }

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
              item: this.invoiceData.items
            },
            relationships:{
              company: {
                data: {
                  type: "companies",
                  id: this.invoiceData.company.id,
                }
              },
              customer: {
                data: {
                  type: "customers",
                  id: this.invoiceData.customer.id,
                }
              },
            },
            included: this.invoiceData.items.map((item, index) => ({
              type: "invoiceItems",
              attributes: {
                description: item.description,
                quantity: item.quantity,
                price: item.price,
                amount: item.amount,
                // Other item fields
              },
            }))
          }
        }
      try{
        await this.$store.dispatch('invoices/add',data);
        this.$toast.success(`Invoice saved: ${this.invoiceData.number}`,
            {
            position: "top-right",
            icon: CheckCircleIcon,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000
            })
      } catch(e){
        this.$toast.error('Something went wrong! Try again later or contact the support.',
          {
            position: "top-right",
            icon: AlertCircleIcon,
            closeButton: false,
            hideProgressBar: true,
            timeout: 3000
          })
        
      }
      } else {
        console.log('Validation failed:', this.formErrors)
        this.$nextTick(() => {
          this.$toast.error('Please correct the errors in the form before saving the invoice.',
          {
            position: "top-right",
            icon: AlertCircleIcon,
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
        await this.$store.dispatch('invoices/suggest', this.invoiceData.customer.id);
        const data = this.$store.getters["invoices/invoice"]
        // Populate invoiceData with suggestion
        this.invoiceData.number = data.number;
        this.invoiceData.date = data.invoice_date;
        this.invoiceData.dueDate = data.due_date;
        this.invoiceData.amount = data.amount;
        this.invoiceData.status = data.status;
        // Replace items with API data
        this.invoiceData.items = data.items.map(item => {
           if (!item) {
                console.warn('Item missing attributes:', item);
                return { ...JSON.parse(JSON.stringify(itemFormBlankItem)) }; // Fallback
            }
            return {
                name: item.name,
                quantity: String(item.quantity),
                price: String(item.price),
                amount: String(item.amount),
                description: item.description,
            };
        });
        this.$toast.success(`Invoice suggestion loaded!`,
            {
            position: "top-right",
            icon: CheckCircleIcon,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000
            })
      } catch (error) {
        this.$toast.error('Couldn’t load suggestion. Try again later.',
        {
          position: "top-right",
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000
        })
      }
      this.isSuggesting = false;
    },
  },
  computed: {
    ...mapGetters('users', ['roles','hasRole']),
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
