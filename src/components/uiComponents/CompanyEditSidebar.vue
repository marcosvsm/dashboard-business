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
      <div class="d-flex justify-content-between align-items-center content-sidebar-header px-2 py-1">
        <h4 class="mb-0">
          {{ t('Edit Business') }}
        </h4>

        <base-feather-icon
          class="ml-1 cursor-pointer"
          icon="XIcon"
          size="16"
          @click="hide"
        />
      </div>

      <b-form class="p-2" @submit.prevent="updateCompany(hide)">

        <b-form-group :label="t('Business Name')" label-for="company-name">
          <b-form-input
            id="company-name"
            v-model="localCompany.name"
            trim
            required
          />
        </b-form-group>

        <b-form-group label="Email" label-for="email">
          <b-form-input
            id="email"
            v-model="localCompany.email"
            trim
            type="email"
          />
        </b-form-group>

        <b-form-group :label="t('Phone Number')" label-for="contact">
          <b-form-input
            id="contact"
            v-model="localCompany.phone"
            type="text"
            trim
          />
        </b-form-group>

        <div class="company-sidebar-section company-sidebar-toggle-section mt-2">
          <div>
            <p class="company-sidebar-eyebrow mb-50">{{ t('Business Details') }}</p>
            <h6 class="company-sidebar-title mb-50">{{ t('Optional invoice details') }}</h6>
            <p class="company-sidebar-copy mb-0">
              {{ t('Add your address when you want invoices to feel more complete and professional.') }}
            </p>
          </div>

          <b-button
            variant="outline-primary"
            size="sm"
            class="company-sidebar-toggle"
            @click="businessDetailsExpanded = !businessDetailsExpanded"
          >
            <base-feather-icon :icon="businessDetailsExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="15" class="mr-50" />
            {{ businessDetailsExpanded ? t('Hide details') : businessDetailsToggleLabel }}
          </b-button>
        </div>

        <b-collapse v-model="businessDetailsExpanded" class="mt-1">
          <b-form-group :label="t('Address')" label-for="company-address">
            <b-form-input
              id="company-address"
              v-model="localCompany.address"
              trim
              :placeholder="t('Street address')"
            />
          </b-form-group>

          <b-row>
            <b-col md="6">
              <b-form-group :label="t('Region / City')" label-for="company-region">
                <b-form-input
                  id="company-region"
                  v-model="localCompany.region"
                  trim
                  :placeholder="t('City or region')"
                />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group :label="t('Postcode')" label-for="company-postcode">
                <b-form-input
                  id="company-postcode"
                  v-model="localCompany.postcode"
                  trim
                  :placeholder="t('Postcode')"
                />
              </b-form-group>
            </b-col>

          </b-row>
          <b-row>
            <b-col md="6">
              <b-form-group :label="t('State')" label-for="company-state">
                <b-form-input
                  id="company-state"
                  v-model="localCompany.state"
                  trim
                  :placeholder="t('State')"
                />
              </b-form-group>
            </b-col>
            <b-form-group :label="t('Country')" label-for="company-country">
            <b-form-input
              id="company-country"
              v-model="localCompany.country"
              trim
              :placeholder="t('Country')"
            />
          </b-form-group>
        </b-row>
        </b-collapse>

        <company-tax-settings v-model="localCompany" />

        <div class="d-flex flex-wrap mt-2 company-sidebar-actions">
          <b-button
            v-ripple.400="'rgba(255, 255, 255, 0.15)'"
            variant="primary"
            class="mr-2"
            type="submit"
            :disabled="submit"
          >
            {{ submit ? t('Saving...') : t('Save') }}
          </b-button>
          <b-button
            v-ripple.400="'rgba(186, 191, 199, 0.15)'"
            variant="outline-secondary"
            :disabled="submit"
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
import Ripple from 'vue-ripple-directive'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import CompanyTaxSettings from '@/components/uiComponents/CompanyTaxSettings.vue'
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

const createEmptyCompany = () => ({
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

  // Phase 3 GST/ABR fields. Defaults match the Phase 1 DB defaults so a
  // freshly-loaded record without these fields populated still renders cleanly.
  gst_registered: false,
  gst_registered_from: null,
  gst_price_mode: 'gst_exclusive',
  gst_manual_override: false,
  abn_status: null,
  abn_entity_type: null,
  abn_legal_name: null,
  abr_last_checked_at: null,
})

const hasBusinessDetails = company => Boolean(
  company.address ||
  company.region ||
  company.postcode ||
  company.state ||
  company.country
)

export default {
  components: {
    BaseFeatherIcon,
    CompanyTaxSettings,
  },
  directives: {
    Ripple,
  },
  props: {
    company: {
      type: Object,
      default: () => createEmptyCompany(),
    },
  },
  data() {
    const { t } = useI18nUtils()

    return {
      t,
      submit: false,
      localCompany: createEmptyCompany(),
      businessDetailsExpanded: false,
    }
  },
  computed: {
    hasBusinessDetails() {
      return hasBusinessDetails(this.localCompany)
    },
    businessDetailsToggleLabel() {
      return this.hasBusinessDetails ? this.t('Review details') : this.t('Add details')
    },
  },
  watch: {
    company: {
      immediate: true,
      deep: true,
      handler(company) {
        this.localCompany = {
          ...createEmptyCompany(),
          ...company,
        }
        this.businessDetailsExpanded = hasBusinessDetails(this.localCompany)
      },
    },
  },
  methods: {
    async updateCompany(hide) {
      if (this.submit) return

      this.submit = true

      try {
        const updatedCompany = await this.$store.dispatch('companies/update', this.localCompany)

        this.$emit('company-updated', updatedCompany)
        this.$toast.success(this.t('Business updated successfully.'), {
          position: 'top-right',
          icon: CheckCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 2000,
        })

        hide()
      } catch (e) {
        this.$toast.error(this.t('Failed to update business. Please try again.'), {
          position: 'top-right',
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      } finally {
        this.submit = false
      }
    },
  },
}
</script>

<style scoped>
.company-sidebar-section {
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
  border: 1px solid #edf2f8;
}

.company-sidebar-toggle-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.company-sidebar-toggle {
  flex-shrink: 0;
  border-radius: 999px;
}

.company-sidebar-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0366d6;
}

.company-sidebar-title {
  color: #132238;
  font-weight: 700;
}

.company-sidebar-copy {
  color: #6b7a90;
  font-size: 0.9rem;
}

.company-sidebar-actions {
  gap: 0.75rem;
}

.company-sidebar-danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid #f1d4d4;
  background: #fdf6f6;
}

.company-sidebar-danger-copy {
  min-width: 0;
}

.company-sidebar-danger-copy h6 {
  color: #b42318;
  font-weight: 600;
}

.company-sidebar-danger-copy p {
  color: #8a4a47;
  font-size: 0.85rem;
}

@media (max-width: 575.98px) {
  .company-sidebar-toggle-section {
    flex-direction: column;
  }

  .company-sidebar-toggle {
    width: 100%;
  }

  .company-sidebar-danger {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
