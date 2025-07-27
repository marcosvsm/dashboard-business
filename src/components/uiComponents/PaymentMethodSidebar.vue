<template>
  <b-sidebar
    id="sidebar-payment-method"
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
        <h4 class="mb-0">
          {{ mode === 'create' ? t('Add Payment Method') : t('Edit Payment Method') }}
        </h4>
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
        @submit.prevent="submitForm"
      >
        <!-- PayID -->
        <b-form-group
          :label="t('PayID')"
          label-for="payid"
        >
          <b-form-input
            id="payid"
            v-model="formData.payid"
            type="text"
            trim
            required
          />
        </b-form-group>

        <!-- PayID Name -->
        <b-form-group
          :label="t('PayID Name')"
          label-for="payidName"
        >
          <b-form-input
            id="payidName"
            v-model="formData.name"
            trim
            type="text"
            required
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
            {{ t('Save') }}
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
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons';
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  components: {
    BaseFeatherIcon,
  },
  directives: {
    Ripple,
  },
  props: {
    company: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      default: 'create', // or 'update'
    },
  },
  setup(props,{ emit }) {
    const { t } = useI18nUtils()
    const { proxy } = getCurrentInstance()
    const formData = ref({
      payid: '',
      name: '',
    })

    watch(() => props.company, (newCompany) => {
      if (newCompany && newCompany.paymentDetail) {
        formData.value.payid = newCompany.paymentDetail.payid || ''
        formData.value.name = newCompany.paymentDetail.name || ''
      } else {
        formData.value.payid = ''
        formData.value.name = ''
      }
    }, { immediate: true })

    const submitForm = async () => {
      try {
        const companyId = props.company.id;
        const data = {
          data: {
            type: "paymentDetails",
            attributes: {
              name: formData.value.name ,
              payid: formData.value.payid ,
            },
            relationships: {
              company: {
                data: {
                  type: "companies",
                  id: companyId,
                }
              }
            },
          }
        }
        if (props.mode === 'create') {
         await proxy.$store.dispatch('paymentMethods/add', data)
         const response = await proxy.$store.getters["paymentMethods/paymentMethod"]
         await proxy.$toast.success("Payment method created.",
        {
            position: "top-right",
            icon: CheckCircleIcon,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000
        });
          // Emit event to notify parent about the new payment method
          emit('payment-added', response)
        } else {
          const dataUpdate = {
              data: {
                type: "paymentDetails",
                id: props.company.paymentDetail.id,
                attributes: {
                name: formData.value.name ,
                payid: formData.value.payid ,
                },
                relationships: {
                    company: {
                        data: {
                        type: "companies",
                        id: companyId,
                        }
                    }
                },
              }
          }
        await proxy.$store.dispatch('paymentMethods/update', dataUpdate)
        const response = await proxy.$store.getters["paymentMethods/paymentMethod"]
        await proxy.$toast.success("Payment method updated.",
        {
            position: "top-right",
            icon: CheckCircleIcon,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000
        });
        // Emit event to update the payment data in the parent
        emit('payment-updated', response)
        }
      } catch (e) {
        proxy.$toast.error('Something went wrong. Please try again.', {
          position: 'top-right',
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        });
      }
    }

    return {
      formData,
      t,
      submitForm,
    }
  },
}
</script>
