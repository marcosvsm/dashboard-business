<template>
<div>
<!-- Invoice customer & Payment Details -->
    <b-card-body
        class="invoice-padding pt-0"
    >
        <b-row class="invoice-spacing">

        <!-- Col: Invoice To -->
        <b-col
            cols="12"
            xl="6"
            class="mb-lg-1"
        >
            <h6 class="mb-2">
           {{t("Bill To")}} 
            </h6>

            <!-- Select customer -->
            <v-select
            v-model="invoiceData.customer"
            :options="Object.values(customers)"
            :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
            label="name"
            input-id="invoice-data-client"
            :clearable="false"
            ref="customerSelect"
            >
            <template #list-header>
                <li
                v-b-toggle.sidebar-invoice-add-new-customer
                class="add-new-client-header d-flex align-items-center my-50"
                >
                <base-feather-icon
                    icon="PlusIcon"
                    size="16"
                />
                <span class="align-middle ml-25">{{t("Add New Client")}}</span>
                </li>
            </template>
            <template #no-options>
              <li class="no-options-message d-flex align-items-center my-50">
                <base-feather-icon icon="AlertCircleIcon" size="16" />
                <span class="align-center ml-25">{{ t("No clients available.") }}</span>
              </li>
            </template>
            </v-select>

            <!-- Selected customer -->
            <div
            v-if="invoiceData.customer"
            class="mt-1"
            >
            <h6 class="mb-25">
                {{ invoiceData.customer.name }}
            </h6>
            <b-card-text class="mb-25">
                {{ invoiceData.customer.email }}
            </b-card-text>
            <b-card-text class="mb-25">
                {{ invoiceData.customer.abn }}
            </b-card-text>
            <b-card-text class="mb-25">
                {{ invoiceData.customer.phone }}
            </b-card-text>
            </div>
        </b-col>

        <!-- Col: Payment Details -->
       
        <b-col
            xl="6"
            cols="12"
            class="mt-xl-0 mt-2"
        >
            <div><!-- Select customer -->
             <!-- Select customer -->

            <h6 class="mb-2">
               {{t("Pay To")}} 
            </h6>
            <v-select
            v-model="invoiceData.company"
            :options="Object.values(companies)"
            :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
            label="name"
            input-id="companies-id"
            :clearable="false"
            >
            <template #no-options>
              <li class="no-options-message d-flex align-items-center my-50">
                <base-feather-icon icon="AlertCircleIcon" size="16" />
                <span class="align-center ml-25">{{ t("No Business available. ") }}
                  <router-link :to="{ name: 'addCompany'}">{{ t("Add My Business") }}</router-link>
                </span>
              </li>
            </template>
            
            </v-select>
            <div
            v-if="invoiceData.company"
            class="mt-1"
            >
              <table>
                  <tbody>
                  <tr>
                      <td><span class="font-weight-bold">{{invoiceData.company.name}}</span></td>
                  </tr>
                  <tr>
                      <td>{{invoiceData.company.phone}}</td>
                  </tr>
                  <tr>
                      <td>{{invoiceData.company.abn}}</td>
                  </tr>
                  </tbody>
              </table>
            </div>
            </div>
        </b-col>
        </b-row>
    </b-card-body>

    <!-- Items Section -->
    <b-card-body class="invoice-padding form-item-section">
        <div
        ref="form"
        class="repeater-form"
        :style="{height: trHeight}"
        >
        <b-row
            v-for="(item, index) in invoiceData.items"
            :key="index"
            ref="row"
            class="pb-2"
        >

            <!-- Item Form -->
            <!-- ? This will be in loop => So consider below markup for single item -->
            <b-col cols="12">

            <!-- ? Flex to keep separate width for XIcon and SettingsIcon -->
            <div class="d-none d-lg-flex">
                <b-row class="flex-grow-1 px-1">
                <!-- Single Item Form Headers -->
                <b-col
                    cols="12"
                    lg="5"
                >
                    #{{index+1}} Description
                    
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    {{t("Quantity")}}
                </b-col>
                <b-col
                    cols="12"
                    lg="3"
                >
                    {{t("Price")}}
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    {{t("Amount")}}
                </b-col>
                </b-row>
                <div class="form-item-action-col" />
            </div>

            <!-- Form Input Fields OR content inside bordered area  -->
            <!-- ? Flex to keep separate width for XIcon and SettingsIcon -->
            <div class="d-flex border rounded">
                <b-row class="flex-grow-1 p-2">
                <!-- Single Item Form Headers -->
                <b-col
                    cols="12"
                    lg="5"
                >
                    <label class="d-inline d-lg-none">#{{index+1}} Description</label>
                    <div class="d-flex align-items-baseline">
                      <b-form-input
                      v-model="item.name"
                      :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
                      label="name"
                      :clearable="false"
                      class="mb-2 item-selector-title"
                      maxlength="50"
                      />
                      <flat-pickr
                        v-model="selectedDates[index]"
                        class="form-control invoice-edit-input"
                        @change="handleDateChange(index)"
                        :config="datePickerConfig"
                        placeholder="DATE"
                        :data-index="index"
                        style="visibility:hidden; width:0px"
                      />
                       
                      <base-feather-icon
                        :id="`calendarIcon-${index}`"
                        size="20"
                        icon="CalendarIcon"
                        class="cursor-pointer"
                        @click="openDatePicker(index)"
                      />
                    </div>
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    <label class="d-inline d-lg-none">{{t("Qty")}}</label>
                    <b-form-input
                      v-model="item.quantity"
                      type="number"
                      class="mb-2"
                      placeholder="0"
                      @keyup="setAmount"
                    />
                </b-col>
                <b-col
                    cols="12"
                    lg="3"
                >
                    <label class="d-inline d-lg-none">{{t("Price")}}</label>
                    <b-form-input
                    v-model="item.price"
                    type="number"
                    class="mb-2"
                    placeholder="0.00"
                    @keyup="setAmount"
                    />
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    <label class="d-inline d-lg-none">{{t("Amount")}}</label>
                    <p class="mb-1">
                    ${{ item.amount }}
                    </p>
                </b-col>
                <b-col
                    cols="12"
                    lg="5"
                >
                    <label class="d-inline d-lg-none">{{t("Description")}}</label>
                    <b-form-textarea
                    v-model="item.description"
                    class="mb-2 mb-lg-0"
                    maxlength="90"
                    maxrows='3'
                    />
                </b-col>
                </b-row>
                <div class="d-flex flex-column justify-content-between border-left py-50 px-25">
                <base-feather-icon
                    size="16"
                    icon="XIcon"
                    class="cursor-pointer"
                    @click="removeItem(index)"
                />
                </div>
            </div>
            </b-col>
        </b-row>
        </div>
        <b-button
        v-ripple.400="'rgba(255, 255, 255, 0.15)'"
        size="sm"
        variant="primary"
        @click="addNewItemInItemForm"
        >
        Add Item
        </b-button>
    </b-card-body>

    <!-- Invoice Description: Total -->
    <b-card-body class="invoice-padding pb-0">
        <b-row>
        <!-- Col: Total -->
        <b-col
            cols="12"
            md="12"
            class="mt-md-6 d-flex justify-content-end"
            order="1"
            order-md="2"
        >
          <div class="invoice-total-wrapper">
            <div class="invoice-total-item">
              <p class="invoice-total-amount">
                Total:
              </p>
              <p class="invoice-total-amount">
                ${{invoiceData.amount}}
              </p>
            </div>
          </div>
        </b-col>
        </b-row>
    </b-card-body>
    <invoice-sidebar-add-new-customer 
        :invoiceData="invoiceData" 
        :addCustomerToInvoice="addCustomerToInvoice" 
        @close-dropdown="closeSelectDropdown"
    />
</div>
</template>
<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import VBToggle from 'bootstrap-vue'
import { heightTransition } from '@/mixins/ui/transition'
import { toRefs, ref, onMounted, nextTick, getCurrentInstance } from 'vue'
import InvoiceSidebarAddNewCustomer from '@/components/uiComponents/InvoiceSidebarAddNewCustomer.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import FlatPickr from 'vue-flatpickr-component'
import {formatDateForDisplay} from '@/libs/dateUtils'

export default {
  components:{
    BaseFeatherIcon,
    vSelect,
    InvoiceSidebarAddNewCustomer,
    FlatPickr,
  },
  props:{
    invoiceData:{
      type: Object,
    },
    customers:{
      type: Array,  
    },
    companies:{
      type: Array,
    },
    addCustomerToInvoice: {
      type: Function,
      required: true,
    },
  },
  directives: {
    Ripple,
    VBToggle,
  },
  mixins: [heightTransition],
  mounted() {
    this.initTrHeight()
  },
  created() {
    window.addEventListener('resize', this.initTrHeight);
  },
  destroyed() {
    window.removeEventListener('resize', this.initTrHeight)
  },
  methods: {
    addNewItemInItemForm() {
      this.$refs.form.style.overflow = 'hidden'
      this.invoiceData.items.push(JSON.parse(JSON.stringify(this.itemFormBlankItem)))

      this.$nextTick(() => {
        this.trAddHeight(this.$refs.row[0].offsetHeight)
        setTimeout(() => {
          this.$refs.form.style.overflow = null
        }, 350)
      })
    },
    removeItem(index) {
      this.invoiceData.items.splice(index, 1)
      this.trTrimHeight(this.$refs.row[0].offsetHeight)
      this.setAmount()
    },
    initTrHeight() {
      this.trSetHeight(null)
      this.$nextTick(() => {
        this.trSetHeight(this.$refs.form.scrollHeight)
      })
    },
    setAmount(){
        var amount = 0.00
        var amountCal = 0
        this.invoiceData.items.forEach((item, index) => {
          amountCal = item.quantity * item.price
          this.invoiceData.items[index].amount = this.formatPrice(amountCal)
          amount += parseFloat(this.invoiceData.items[index].amount)
        });
        this.invoiceData.amount = this.formatPrice(amount)
    },
    formatPrice(value) {
      // Ensure the value is a number and format it to two decimal places
      return Number(value).toFixed(2);
    },
  },
   watch: {
    companies: {
      handler(newCompanies) {
        const companyArray = Object.values(newCompanies);
        if (companyArray.length === 1) {
          this.invoiceData.company = companyArray[0];
        }
      },
      immediate: true, // This will run the watcher when the component is mounted
      deep: true // In case you want to watch for nested changes in companies
    }
  },
  setup(props){
    const customerSelect = ref(null)
    const itemFormBlankItem = {
      name: '',
      price: '',
      quantity: '',
      description: '',
      amount: '0.00'
    }
    const {invoiceData} = toRefs(props)
    const updateItemForm = (index, val) => {
      const { name, price, quantity, description } = val
      invoiceData.value.items[index].name = name
      invoiceData.value.items[index].price = this.formatPrice(price)
      invoiceData.value.items[index].quantity = 5
      invoiceData.value.items[index].description = description
    }
    const selectedCompany = ref([])
    const { t } = useI18nUtils()

    const closeSelectDropdown = () => {
      // Optionally handle closing logic here if needed
      customerSelect.value.$refs.search.blur()
    }

    const flatpickrRef = ref({}); // Initialize as an array for multiple instances
    const selectedDates = ref([]); // Initialize as an array to hold dates for each item
    const datePickerConfig  = {
      dateFormat: 'd/m/Y',
      onReady(dates, dateStr, instance) {
        const index = instance.element.dataset.index;
        flatpickrRef.value[index] = instance; // Store instance by item index
        //flatpickrRef.value.push(instance);
      },
      onChange(dates, dateStr, instance) {
        //const index = flatpickrRef.value.indexOf(instance);
        const index = instance.element.dataset.index;
     //   if (index !== -1 && dates.length > 0){
         // selectedDates.value.splice(index, 1, dates[0]);
          handleDateChange(index,dates);
    //    }
      },
    };

    const openDatePicker = (index) => {
        // Ensure the flatpickr instance is available before trying to open it
      nextTick(() => {
        if (flatpickrRef.value[index]) {
          flatpickrRef.value[index].open();
        }
      });
    }

    const handleDateChange = (index,dates) => {
        if(invoiceData.value.items[index].name){
          const itemName = invoiceData.value.items[index].name;
          const lastLetter = itemName.charAt(itemName.length - 1); 
          if(lastLetter === ' ')
            invoiceData.value.items[index].name += formatDateForDisplay(dates);
          else
            invoiceData.value.items[index].name += ' '+formatDateForDisplay(dates);
        }else{
          invoiceData.value.items[index].name += formatDateForDisplay(dates)
        }
    }
  
    return {
        itemFormBlankItem,
        updateItemForm,
        invoiceData,
        selectedCompany,
        t,
        closeSelectDropdown,
        customerSelect,
        datePickerConfig,
        openDatePicker,
        handleDateChange,
        selectedDates,
    }
  },
}
</script>
<style lang="scss" scoped>
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';
@import '~@/scss/vue/libs/vue-select.scss';
@import '~@/scss/vue/libs/vue-flatpicker.scss';
.no-options-message {
  font-weight: bold;
  padding: 10px;
  text-align: center;
}
</style>