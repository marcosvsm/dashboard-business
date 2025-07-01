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
          {{ isEditing ? t('Edit Client') : t('Add Client') }}
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
        @submit.prevent="submitCustomer(hide)"
      >
        <!-- Customer Name -->
        <b-form-group
          :label="t('Client Name')"
          label-for="customer-name"
          :invalid-feedback="t('Client Name is required')"
          :state="customer.name ? null : false"
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
            :disabled="isLoading"
          >
            {{ isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? t('Update') : t('Add')) }}
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
import { ref, watch, getCurrentInstance } from 'vue'
import Ripple from 'vue-ripple-directive'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import store from '@/store'
import "vue-toastification/dist/index.css";

export default {
  components: {
    BaseFeatherIcon,
  },
  directives: {
    Ripple,
  },
  props: {
    addCustomerToInvoice: {
      type: Function,
      required: true
    },
    customerToEdit: {
      type: Object,
      default: null
    }
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const { t } = useI18nUtils();
    const isLoading = ref(false);
    const isEditing = ref(false);

    const customer = ref({
      name: '',
      email: '',
      abn: '',
      phone: '',
    });

    // Watch for changes in customerToEdit prop to populate form for editing
    watch(() => props.customerToEdit, (newCustomer) => {
      if (newCustomer) {
        isEditing.value = true;
        customer.value = {
          id: newCustomer.id,
          name: newCustomer.name || '',
          email: newCustomer.email || '',
          abn: newCustomer.abn || '',
          phone: newCustomer.phone || '',
        };
      } else {
        isEditing.value = false;
      }
    }, { immediate: true });

    const resetCustomer = () => {
      customer.value = {
        id: null,
        name: '',
        email: '',
        abn: '',
        phone: '',
      };
    };

    const submitCustomer = async (hide) => {
      isLoading.value = true;
      try {
        let customerResponse;
        if (isEditing.value) {
          // Add type to the customer object for updates
      const updatePayload = {
        ...customer.value,
        type: 'customers' // Ensure type matches what ModelsSerializer expects
      };
          await store.dispatch('customers/update', updatePayload);
          customerResponse = await store.getters['customers/customer'];
          // Call addCustomerToInvoice with normalized customer
          props.addCustomerToInvoice(customerResponse);
          proxy.$toast.success("Customer Updated", {
            position: "top-right",
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 3000
          });
        } else {
          const user = store.getters["profile/me"];
          const data = {
            data: {
              type: "customers",
              attributes: {
                name: customer.value.name,
                phone: customer.value.phone,
                abn: customer.value.abn,
                email: customer.value.email,
              },
              relationships: {
                user: {
                  data: {
                    type: "users",
                    id: user.id,
                  }
                }
              },
            }
          };
          // Add new customer
          await store.dispatch('customers/add', data);
          customerResponse = await store.getters['customers/customer'];
          props.addCustomerToInvoice(customerResponse);
          proxy.$toast.success("Customer Created", {
            position: "top-right",
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 3000
          });
        }
        resetCustomer();
        if (hide) hide();
        emit('close-dropdown');
      } catch (error) {
        proxy.$toast.error("Failed to update client. Please try again.", {
          position: "top-right",
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000
        });
      } finally {
        isLoading.value = false;
      }
    };

    return {
      customer,
      t,
      submitCustomer,
      isLoading,
      isEditing,
    };
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-select.scss';
</style>