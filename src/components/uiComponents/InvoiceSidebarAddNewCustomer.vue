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
          {{ t('Add Client') }}
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
        @submit.prevent="addCustomer(hide)"
      >

        <!-- Customer Name -->
        <b-form-group
          :label="t('Client Name')"
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
          :label="t('Phone Number')"
          label-for="contact"
        >
          <b-form-input
            id="contact"
            v-model="customer.phone"
            maxlength="13"
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
          >
          {{ t('Add') }}
          </b-button>
          <b-button
            v-ripple.400="'rgba(186, 191, 199, 0.15)'"
            variant="outline-secondary"
            @click="hide"
          >
          {{ t('Cancel') }}
          </b-button>
        </div>
      </b-form>
    </template>
  </b-sidebar>
</template>

<script>
import { ref } from 'vue'
import Ripple from 'vue-ripple-directive'
import vSelect from 'vue-select'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import store from '@/store'

export default {
  components: {
    vSelect,
    BaseFeatherIcon,
  },
  directives: {
    Ripple,
  },
  props:{
    addCustomerToInvoice: {
      type: Function,
      required: true
    }
  },
  setup(props, { emit }) {
    const customer = ref({
      name: '',
      email: '',
      abn: '',
      phone: '',
    })

     // Async function to fetch invoices
    const addCustomer = async (hide) => {
      try {
        const user = store.getters["profile/me"];
        const data = {
         data:{
            type: "customers",
            attributes:{
              name: customer.value.name,
              phone: customer.value.phone,
              abn: customer.value.abn,
              email: customer.value.email,
            },
            relationships:{
              user: {
                data: {
                  type: "users",
                  id: user.id,
                }
              }
            },
         }
        };
        await store.dispatch('customers/add', data);

        props.addCustomerToInvoice(customer.value);
        resetCustomer();
        if (hide) hide();
        emit('close-dropdown');
      } catch (error) {
        console.error('Error create client:', error);
        this.message = "Something went wrong! Try again later or contact the support.";
        await this.$store.dispatch('alerts/showNotification', {
          message: this.message,
          type: 'error'
        });
      }
    }

    const resetCustomer = () => {
      customer.value = {
        name: '',
        email: '',
        abn: '',
        phone: '',
      }
    }

    const {t} = useI18nUtils()


    return {
      customer,
      t,
      addCustomer,
     // countries,
    }
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-select.scss';
</style>