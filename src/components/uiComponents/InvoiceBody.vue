<template>
<div>
<!-- Invoice Client & Payment Details -->
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

            <!-- Select Client -->
            <v-select
            v-model="invoiceData.client"
            :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
            :options="clients"
            label="company"
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

            <!-- Selected Client -->
            <div
            v-if="invoiceData.client"
            class="mt-1"
            >
            <h6 class="mb-25">
                {{ invoiceData.client.name }}
            </h6>
            <b-card-text class="mb-25">
                {{ invoiceData.client.company }}
            </b-card-text>
            <b-card-text class="mb-25">
                {{ invoiceData.client.address }}, {{ invoiceData.client.country }}
            </b-card-text>
            <b-card-text class="mb-25">
                {{ invoiceData.client.contact }}
            </b-card-text>
            <b-card-text class="mb-0">
                {{ invoiceData.client.companyEmail }}
            </b-card-text>
            </div>
        </b-col>

        <!-- Col: Payment Details -->
        <b-col
            xl="6"
            cols="12"
            class="mt-xl-0 mt-2 justify-content-end d-xl-flex d-block"
        >
            <div>
            <h6 class="mb-2">
                Payment Details:
            </h6>
            <table>
                <tbody>
                <tr>
                    <td class="pr-1">
                    Total Due:
                    </td>
                    <td><span class="font-weight-bold">$12,110.55</span></td>
                </tr>
                <tr>
                    <td class="pr-1">
                    Bank name:
                    </td>
                    <td>American Bank</td>
                </tr>
                <tr>
                    <td class="pr-1">
                    Country:
                    </td>
                    <td>United States</td>
                </tr>
                <tr>
                    <td class="pr-1">
                    IBAN:
                    </td>
                    <td>ETD95476213874685</td>
                </tr>
                <tr>
                    <td class="pr-1">
                    SWIFT code:
                    </td>
                    <td>BR91905</td>
                </tr>
                </tbody>
            </table>
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
                    lg="3"
                >
                    Cost
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    Qty
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    Price
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
                    <b-input
                    v-model="item.itemTitle"
                    :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
                    :options="itemsOptions"
                    label="itemTitle"
                    :clearable="false"
                    class="mb-2 item-selector-title"
                    placeholder="Select Item"
                    @input="val => updateItemForm(index, val)"
                    />
                </b-col>
                <b-col
                    cols="12"
                    lg="3"
                >
                    <label class="d-inline d-lg-none">Cost</label>
                    <b-form-input
                    v-model="item.cost"
                    type="number"
                    class="mb-2"
                    />
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    <label class="d-inline d-lg-none">Qty</label>
                    <b-form-input
                    v-model="item.qty"
                    type="number"
                    class="mb-2"
                    />
                </b-col>
                <b-col
                    cols="12"
                    lg="2"
                >
                    <label class="d-inline d-lg-none">Price</label>
                    <p class="mb-1">
                    ${{ item.cost * item.qty }}
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
                <b-col>
                    <p class="mb-0">
                    Discount: 0% 0% 0%
                    </p>
                </b-col>
                </b-row>
                <div class="d-flex flex-column justify-content-between border-left py-50 px-25">
                <base-feather-icon
                    size="16"
                    icon="XIcon"
                    class="cursor-pointer"
                    @click="removeItem(index)"
                />
                <base-feather-icon
                    :id="`form-item-settings-icon-${index}`"
                    size="16"
                    icon="SettingsIcon"
                    class="cursor-pointer"
                />

                <!-- Setting Item Form -->
                <b-popover
                    :ref="`form-item-settings-popover-${index}`"
                    :target="`form-item-settings-icon-${index}`"
                    triggers="click"
                    placement="lefttop"
                >
                    <b-form @submit.prevent>
                    <b-row>

                        <!-- Field: Discount -->
                        <b-col cols="12">
                        <b-form-group
                            label="Discount(%)"
                            :label-for="`setting-item-${index}-discount`"
                        >
                            <b-form-input
                            :id="`setting-item-${index}-discount`"
                            :value="null"
                            type="number"
                            />
                        </b-form-group>
                        </b-col>

                        <!-- Field: Tax 1 -->
                        <b-col cols="6">
                        <b-form-group
                            label="Tax 1"
                            :label-for="`setting-item-${index}-tax-1`"
                        >
                            <v-select
                            :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
                            :value="'10%'"
                            :options="['0%', '1%', '10%', '14%', '18%']"
                            :input-id="`setting-item-${index}-tax-1`"
                            :clearable="false"
                            />
                        </b-form-group>
                        </b-col>

                        <!-- Field: Tax 2 -->
                        <b-col cols="6">
                        <b-form-group
                            label="Tax 2"
                            :label-for="`setting-item-${index}-tax-2`"
                        >
                            <v-select
                            :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
                            :value="'10%'"
                            :options="['0%', '1%', '10%', '14%', '18%']"
                            :input-id="`setting-item-${index}-tax-2`"
                            :clearable="false"
                            />
                        </b-form-group>
                        </b-col>

                        <b-col
                        cols="12"
                        class="d-flex justify-content-between mt-1"
                        >
                        <b-button
                            variant="outline-primary"
                            @click="() => {$refs[`form-item-settings-popover-${index}`][0].$emit('close')}"
                        >
                            Apply
                        </b-button>
                        <b-button
                            variant="outline-secondary"
                            @click="() => {$refs[`form-item-settings-popover-${index}`][0].$emit('close')}"
                        >
                            Cancel
                        </b-button>
                        </b-col>
                    </b-row>
                    </b-form>
                </b-popover>
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

        <!-- Col: Sales Persion -->
        <b-col
            cols="12"
            md="6"
            class="mt-md-0 mt-3 d-flex align-items-center"
            order="2"
            order-md="1"
        >
            <label
            for="invoice-data-sales-person"
            class="text-nowrap mr-50"
            >Sales Person:</label>
            <b-form-input
            id="invoice-data-sales-person"
            v-model="invoiceData.salesPerson"
            placeholder="Edward Crowley"
            />
        </b-col>

        <!-- Col: Total -->
        <b-col
            cols="12"
            md="6"
            class="mt-md-6 d-flex justify-content-end"
            order="1"
            order-md="2"
        >
            <div class="invoice-total-wrapper">
            <div class="invoice-total-item">
                <p class="invoice-total-title">
                Subtotal:
                </p>
                <p class="invoice-total-amount">
                $1800
                </p>
            </div>
            <div class="invoice-total-item">
                <p class="invoice-total-title">
                Discount:
                </p>
                <p class="invoice-total-amount">
                $28
                </p>
            </div>
            <div class="invoice-total-item">
                <p class="invoice-total-title">
                Tax:
                </p>
                <p class="invoice-total-amount">
                21%
                </p>
            </div>
            <hr class="my-50">
            <div class="invoice-total-item">
                <p class="invoice-total-title">
                Total:
                </p>
                <p class="invoice-total-amount">
                $1690
                </p>
            </div>
            </div>
        </b-col>
        </b-row>
    </b-card-body>
</div>
</template>
<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import vSelect from 'vue-select'
import Ripple from 'vue-ripple-directive'
import VBToggle from 'bootstrap-vue'
import { heightTransition } from '@/mixins/ui/transition'
import { toRefs } from 'vue'
export default {
  components:{
    BaseFeatherIcon,
    vSelect,
    VBToggle,
  },
  props:{
    invoiceData:{
      type: Object,
    },
    itemsOptions:{
      type: Array,
    },
    clients:{
      type: Object,  
    },
  },
  mixins: [heightTransition],
  directives: {
    Ripple,
    'b-toggle': VBToggle,
  },
  mounted() {
    this.initTrHeight()
  },
  created() {
    window.addEventListener('resize', this.initTrHeight)
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
    },
    initTrHeight() {
      this.trSetHeight(null)
      this.$nextTick(() => {
        this.trSetHeight(this.$refs.form.scrollHeight)
      })
    },
  },
  setup(props){
    const itemFormBlankItem = {
      item: null,
      cost: 0,
      qty: 0,
      description: '',
    }
    const {invoiceData} = toRefs(props)
    
    const updateItemForm = (index, val) => {
      const { cost, qty, description } = val
      invoiceData.value.items[index].cost = cost
      invoiceData.value.items[index].qty = qty
      invoiceData.value.items[index].description = description
    }

    return {
        itemFormBlankItem,
        updateItemForm,
    }
  },
}
</script>
<style lang="scss" scoped>
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';
@import '~@/scss/vue/libs/vue-select.scss';
</style>