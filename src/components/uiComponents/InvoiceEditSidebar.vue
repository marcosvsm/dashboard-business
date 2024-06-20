<template>
  <b-sidebar
    id="sidebar-invoice-edit"
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
          Edit Invoice
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
        @submit.prevent="updateInvoice"
      >

        <!-- Invoice Name -->
        <b-form-group
          label="Invoice"
          label-for="invoice-name"
        >
          <b-form-input
            id="invoice-name"
            v-model="invoice.name"
            trim
            required
          />
        </b-form-group>

        <b-form-group
          label="Status"
          label-for="status"
        >
          <b-form-select
            id="status"
            v-model="invoice.status"
            :options="statusOptions"
            placeholder=""
            trim
            maxlength="11"
          />
        </b-form-group>

        <!-- Contact -->
        <b-form-group
          label="Date Due"
          label-for="dateDue"
        >
          <b-form-input
            id="dateDue"
            v-model="invoice.due_date"
            type="date"
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
    invoice:{
      type: Object,
    }
  },
  methods:{
    async updateInvoice(){
      try{
        await this.$store.dispatch('invoices/update', this.invoice);
        await this.$store.dispatch('alerts/showNotification', {
                  message: 'Invoice updated successfully.',
                  type: 'success'
          });
      } catch (e){
        console.log('Response data:', e.response.data);
         await this.$store.dispatch('alerts/showNotification', {
                message: 'Something went wrong! Try again later or contact the support.',
                type: 'error'
        }); // Log the response data for debugging
      }   
    },
  },
  setup() {
    const customer = ref({
      name: '',
      email: '',
      abn: '',
      phone: '',
    })
    const statusOptions = ref([
            {value: '0', text: 'Pending'},
            {value: '1', text: 'Paid'},
    ]);

    return {
      customer,
      statusOptions,
    }
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-select.scss';
</style>
