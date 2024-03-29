<template>
  <b-sidebar
    id="sidebar-company-edit"
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
          Edit Business
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

        <!-- Company Name -->
        <b-form-group
          label="Business Name"
          label-for="company-name"
        >
          <b-form-input
            id="company-name"
            v-model="company.name"
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
            v-model="company.email"
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
            v-model="company.abn"
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
            v-model="company.phone"
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
            @click="updateCompany()"
          >
            Save
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
    company:{
      type: Object,
    }
  },
  methods:{
    addCustomer(){
      this.companyData = this.customer
    },
    updateCompany(){
      this.$store.dispatch('companies/update', this.company);
    },
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
