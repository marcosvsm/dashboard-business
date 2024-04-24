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
            Invoice To:
            </h6>

            <!-- Select customer -->
            <v-select
            v-model="invoiceData.customer"
            :options="customers"
            :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
            label="name"
            input-id="invoice-data-client"
            :clearable="false"
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
                <span class="align-middle ml-25">Add New Customer</span>
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
            class="mt-xl-0 mt-2 justify-content-end d-xl-flex d-block"
        >
            <div><!-- Select customer -->
             <!-- Select customer -->

            <h6 class="mb-2">
                Company
            </h6>
            <v-select
            v-model="invoiceData.company"
            :options="Object.values(companies)"
            :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
            label="name"
            input-id="companies-id"
            :clearable="false"
            size="20"
            >
            
            </v-select>
            <div
            v-if="invoiceData.company"
            class="mt-1"
            >
              <table>
                  <tbody>
                  <tr>
                      <td class="pr-1">
                      Name:
                      </td>
                      <td><span class="font-weight-bold">{{invoiceData.company.name}}</span></td>
                  </tr>
                  <tr>
                      <td class="pr-1">
                      Phone:
                      </td>
                      <td>{{invoiceData.company.phone}}</td>
                  </tr>
                  <tr>
                      <td class="pr-1">
                      ABN:
                      </td>
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
                    Item
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    Qty
                </b-col>
                <b-col
                    cols="12"
                    lg="3"
                >
                    Price
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    Amount
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
                    <label class="d-inline d-lg-none">Item</label>
                    <b-form-input
                    v-model="item.itemName"
                    :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
                    :options="itemsOptions"
                    label="itemName"
                    :clearable="false"
                    class="mb-2 item-selector-title"
                    placeholder="Select Item"
                    />
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    <label class="d-inline d-lg-none">Qty</label>
                    <b-form-input
                    v-model="item.quantity"
                    type="number"
                    class="mb-2"
                    @keyup="setAmount"
                    />
                </b-col>
                <b-col
                    cols="12"
                    lg="3"
                >
                    <label class="d-inline d-lg-none">Price</label>
                    <b-form-input
                    v-model="item.price"
                    type="number"
                    class="mb-2"
                    @keyup="setAmount"
                    />
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    <label class="d-inline d-lg-none">Amount</label>
                    <p class="mb-1">
                    ${{ item.price * item.quantity }}
                    </p>
                </b-col>
                <b-col
                    cols="12"
                    lg="5"
                >
                    <label class="d-inline d-lg-none">Description</label>
                    <b-form-textarea
                    v-model="item.description"
                    class="mb-2 mb-lg-0"
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
    <invoice-sidebar-add-new-customer :invoiceData="invoiceData" />
</div>
</template>
<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import VBToggle from 'bootstrap-vue'
import { heightTransition } from '@/mixins/ui/transition'
import { toRefs } from 'vue'
import { ref, onUnmounted } from 'vue'
import InvoiceSidebarAddNewCustomer from '@/components/uiComponents/InvoiceSidebarAddNewCustomer.vue'

export default {
  components:{
    BaseFeatherIcon,
    vSelect,
    InvoiceSidebarAddNewCustomer,
  },
  props:{
    invoiceData:{
      type: Object,
    },
    itemsOptions:{
      type: Array,
    },
    customers:{
      type: Object,  
    },
    companies:{
      type: Array,
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
        var amount = 0
        this.invoiceData.items.forEach(item => {
            amount += item.quantity * item.price
            this.invoiceData.amount = amount
        });
    },
  },
  setup(props){
    const itemFormBlankItem = {
      itemName: '',
      price: 0,
      quantity: 0,
      description: '',
    }
    const {invoiceData} = toRefs(props)
    const updateItemForm = (index, val) => {
      const { itemName, price, quantity, description } = val
      invoiceData.value.items[index].itemName = itemName
      invoiceData.value.items[index].price = price
      invoiceData.value.items[index].quantity = 5
      invoiceData.value.items[index].description = description
    }
    const selectedCompany = ref([])
    return {
        itemFormBlankItem,
        updateItemForm,
        invoiceData,
        selectedCompany,
    }
  },
}
</script>
<style lang="scss" scoped>
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';
@import '~@/scss/vue/libs/vue-select.scss';
</style>