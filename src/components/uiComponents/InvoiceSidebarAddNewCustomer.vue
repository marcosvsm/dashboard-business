<template>
  <b-sidebar
    id="sidebar-invoice-add-new-customer"
    sidebar-class="sidebar-lg"
    bg-variant="white"
    shadow
    backdrop
    no-header
    right
  >
    <template #default="{ hide }">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center content-sidebar-header px-2 py-1">
        <h5 class="mb-0">
          Add Client
        </h5>

        <base-feather-icon
          class="ml-1 cursor-pointer"
          icon="XIcon"
          size="16"
          @click="hide"
        />

      </div>

      <!-- Body -->
      <b-form
        class="p-2"
        @submit.prevent="addCustomer"
      >

        <!-- Customer Name -->
        <b-form-group
          label="Client Name"
          label-for="customer-name"
        >
          <b-form-input
            id="customer-name"
            v-model="customer.name"
            trim
            required
          />
        </b-form-group>

        <!-- Email -->
        <b-form-group
          label="Email"
          label-for="email"
        >
          <b-form-input
            id="email"
            v-model="customer.email"
            trim
            type="email"
          />
        </b-form-group>

        <!-- ABN -->
        <b-form-group
          label="Abn"
          label-for="abn"
        >
          <b-form-input
            id="abn"
            v-model="customer.abn"
            placeholder=""
            trim
            maxlength="11"
          />
        </b-form-group>

        <!-- Contact -->
        <b-form-group
          label="Phone Number"
          label-for="contact"
        >
          <b-form-input
            id="contact"
            v-model="customer.phone"
            type="number"
            trim
          />
        </b-form-group>

        <!-- Form Actions -->
        <div class="d-flex mt-2">
          <b-button
            v-ripple.400="'rgba(255, 255, 255, 0.15)'"
            variant="primary"
            class="mr-2"
            type="submit"
            @click="hide"
          >
            Add
          </b-button>
          <b-button
            v-ripple.400="'rgba(186, 191, 199, 0.15)'"
            variant="outline-secondary"
            @click="hide"
          >
            Cancel
          </b-button>
        </div>
      </b-form>
    </template>
  </b-sidebar>
</template>

<script>
import { ref } from 'vue'
import Ripple from 'vue-ripple-directive'
//import countries from '@/@fake-db/data/other/countries'
import vSelect from 'vue-select'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'

export default {
  components: {
    vSelect,
    BaseFeatherIcon,
  },
  directives: {
    Ripple,
  },
  props:{
    invoiceData:{
      type: Object,
    }
  },
  methods:{
    addCustomer(){
      this.invoiceData.customer = this.customer
    }
  },
  setup() {
    const customer = ref({
      name: '',
      email: '',
      abn: '',
      phone: '',
    })


    return {
      customer,
     // countries,
    }
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-select.scss';
</style>
