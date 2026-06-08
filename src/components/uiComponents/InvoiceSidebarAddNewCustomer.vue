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

        <!-- Address (optional, collapsible) -->
        <div class="customer-sidebar-toggle-section mt-1">
          <div>
            <h6 class="customer-sidebar-title mb-50">{{ t('Address') }}</h6>
            <p class="customer-sidebar-copy mb-0">
              {{ t('Optional. Add the client address when you want invoices to feel more complete and professional.') }}
            </p>
          </div>

          <b-button
            variant="outline-primary"
            size="sm"
            class="customer-sidebar-toggle"
            @click="addressExpanded = !addressExpanded"
          >
            <base-feather-icon :icon="addressExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="15" class="mr-50" />
            {{ addressExpanded ? t('Hide details') : addressToggleLabel }}
          </b-button>
        </div>

        <b-collapse v-model="addressExpanded" class="mt-1">
          <b-form-group :label="t('Address')" label-for="customer-address">
            <b-form-input
              id="customer-address"
              v-model="customer.address"
              trim
              :placeholder="t('Street address')"
            />
          </b-form-group>

          <b-row>
            <b-col md="6">
              <b-form-group :label="t('Region / City')" label-for="customer-region">
                <b-form-input
                  id="customer-region"
                  v-model="customer.region"
                  trim
                  :placeholder="t('City or region')"
                />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group :label="t('Postcode')" label-for="customer-postcode">
                <b-form-input
                  id="customer-postcode"
                  v-model="customer.postcode"
                  trim
                  :placeholder="t('Postcode')"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col md="6">
              <b-form-group :label="t('State')" label-for="customer-state">
                <b-form-input
                  id="customer-state"
                  v-model="customer.state"
                  trim
                  :placeholder="t('State')"
                />
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group :label="t('Country')" label-for="customer-country">
                <b-form-input
                  id="customer-country"
                  v-model="customer.country"
                  trim
                  :placeholder="t('Country')"
                />
              </b-form-group>
            </b-col>
          </b-row>
        </b-collapse>

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
        <div v-if="customer.id" class="customer-sidebar-danger mt-3">
          <div class="customer-sidebar-danger-copy">
            <h6 class="mb-50">{{ t('Delete this client') }}</h6>
            <p class="mb-0">
              <template v-if="hasInvoices">
                {{ t('This client cannot be deleted because invoices reference it. Remove the related invoices first.') }}
              </template>
              <template v-else>
                {{ t('Removes the client and its details. This action cannot be undone.') }}
              </template>
            </p>
          </div>
          <b-button
            variant="outline-danger"
            size="sm"
            :title="hasInvoices ? t('This client has invoices and cannot be deleted.') : ''"
            @click="requestDelete(hide)"
          >
            <base-feather-icon icon="Trash2Icon" size="15" class="mr-50" />
            {{ t('Delete') }}
          </b-button>
        </div>
      </b-form>
    </template>
  </b-sidebar>
</template>

<script>
import { ref, watch, computed, getCurrentInstance } from 'vue'
import Ripple from 'vue-ripple-directive'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import store from '@/store'
import "vue-toastification/dist/index.css";

const createEmptyCustomer = () => ({
  id: null,
  name: '',
  email: '',
  abn: '',
  phone: '',
  address: '',
  region: '',
  postcode: '',
  state: '',
  country: '',
})

const hasAddressDetails = customer => Boolean(
  customer.address ||
  customer.region ||
  customer.postcode ||
  customer.state ||
  customer.country
)

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
    },
    // How many invoices already reference this customer. The backend
    // refuses to delete a customer with invoices, so we disable the delete
    // button up-front instead of waiting for a 403.
    invoiceCount: {
      type: Number,
      default: 0
    }
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const { t } = useI18nUtils();
    const isLoading = ref(false);
    const isEditing = ref(false);
    const addressExpanded = ref(false);

    const customer = ref(createEmptyCustomer());

    // Watch for changes in customerToEdit prop to populate form for editing
    watch(() => props.customerToEdit, (newCustomer) => {
      if (newCustomer) {
        isEditing.value = true;
        customer.value = {
          ...createEmptyCustomer(),
          id: newCustomer.id,
          name: newCustomer.name || '',
          email: newCustomer.email || '',
          abn: newCustomer.abn || '',
          phone: newCustomer.phone || '',
          address: newCustomer.address || '',
          region: newCustomer.region || '',
          postcode: newCustomer.postcode || '',
          state: newCustomer.state || '',
          country: newCustomer.country || '',
        };
        addressExpanded.value = hasAddressDetails(customer.value);
      } else {
        isEditing.value = false;
        addressExpanded.value = false;
      }
    }, { immediate: true });

    const resetCustomer = () => {
      customer.value = createEmptyCustomer();
      addressExpanded.value = false;
    };

    const addressToggleLabel = computed(
      () => (hasAddressDetails(customer.value) ? t('Review details') : t('Add details'))
    );

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
          const user = store.getters["users/user"];
          const data = {
            data: {
              type: "customers",
              attributes: {
                name: customer.value.name,
                phone: customer.value.phone,
                abn: customer.value.abn,
                email: customer.value.email,
                address: customer.value.address,
                region: customer.value.region,
                postcode: customer.value.postcode,
                state: customer.value.state,
                country: customer.value.country,
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

    // Delete in this sidebar is a two-step UX: the sidebar emits the intent,
    // the parent page owns the confirm modal + the actual destroy call. Keeps
    // the modal in one place (Client.vue:showMsgBoxTwo) and avoids re-implementing
    // it here. We close the sidebar first so the confirm dialog is the only
    // surface the user sees.
    const requestDelete = (hide) => {
      if (!customer.value.id) return;
      if (hide) hide();
      emit('delete-requested', customer.value.id);
    };

    const hasInvoices = computed(() => Number(props.invoiceCount) > 0);

    return {
      customer,
      t,
      submitCustomer,
      isLoading,
      isEditing,
      hasInvoices,
      requestDelete,
      addressExpanded,
      addressToggleLabel,
    };
  },
}
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-select.scss';

.customer-sidebar-toggle-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
  border: 1px solid #edf2f8;
}

.customer-sidebar-toggle {
  flex-shrink: 0;
  border-radius: 999px;
}

.customer-sidebar-title {
  color: #132238;
  font-weight: 700;
}

.customer-sidebar-copy {
  color: #6b7a90;
  font-size: 0.9rem;
}

@media (max-width: 575.98px) {
  .customer-sidebar-toggle-section {
    flex-direction: column;
  }

  .customer-sidebar-toggle {
    width: 100%;
  }
}

.customer-sidebar-danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid #f1d4d4;
  background: #fdf6f6;
}

.customer-sidebar-danger-copy {
  min-width: 0;
}

.customer-sidebar-danger-copy h6 {
  color: #b42318;
  font-weight: 600;
}

.customer-sidebar-danger-copy p {
  color: #8a4a47;
  font-size: 0.85rem;
}

button{
  border-radius: 999px;
}
</style>