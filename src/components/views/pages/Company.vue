<template>
  <section class="company-create-page">
    <template v-if="loading">
      <b-card class="company-state-card">
        <b-card-body class="company-state-body">
          <b-spinner variant="primary" class="mb-1" />
          <h6 class="mb-1">{{ t('Loading') }}...</h6>
          <p class="mb-0 text-muted">{{ t('Checking your business setup.') }}</p>
        </b-card-body>
      </b-card>
    </template>

    <template v-else-if="hasCompany">
      <b-card no-body class="company-limit-card">
        <b-card-body class="company-limit-body">
          <div class="company-limit-icon">
            <base-feather-icon icon="LockIcon" size="20" />
          </div>
          <p class="company-section-eyebrow mb-1">{{ t('Current Plan Limit') }}</p>
          <h2 class="company-limit-title mb-1">{{ t('You already have your business profile set up') }}</h2>
          <p class="company-limit-text mb-2">
            {{ t('Your current plan includes one company per user. When Grow arrives, you will be able to add and manage multiple businesses.') }}
          </p>

          <div class="company-limit-panels">
            <div class="company-limit-panel">
              <span class="company-limit-panel-label">{{ t('Active company') }}</span>
              <strong class="company-limit-panel-value">{{ primaryCompany.name || t('Business') }}</strong>
            </div>
            <div class="company-limit-panel">
              <span class="company-limit-panel-label">{{ t('Next unlock') }}</span>
              <strong class="company-limit-panel-value">{{ t('Multiple businesses with Grow') }}</strong>
            </div>
          </div>

          <div class="company-limit-actions">
            <b-button :to="{ name: 'companies' }" variant="primary" class="mr-1">
              {{ t('View My Business') }}
            </b-button>
            <b-button variant="outline-primary" disabled>
              {{ t('Grow Coming Soon') }}
            </b-button>
          </div>
        </b-card-body>
      </b-card>
    </template>

    <template v-else>
      <b-row>
        <b-col lg="8">
          <b-card no-body class="company-form-card">
            <b-card-body class="company-form-body">
              <div class="company-step-header">
                <div>
                  <p class="company-section-eyebrow mb-1">{{ t('Business Setup') }}</p>
                  <h2 class="company-form-title mb-1">{{ currentStepTitle }}</h2>
                  <p class="company-form-subtitle mb-0">{{ currentStepSubtitle }}</p>
                </div>

                <div class="company-step-badge">
                  {{ currentStep + 1 }}/2
                </div>
              </div>

              <div class="company-step-indicator mb-2">
                <div :class="['company-step-chip', { 'company-step-chip-active': currentStep === 0, 'company-step-chip-complete': companyCreated }]">
                  1. {{ t('Business & GST') }}
                </div>
                <div :class="['company-step-chip', { 'company-step-chip-active': currentStep === 1 }]">
                  2. {{ t('Payment Details') }}
                </div>
              </div>

              <b-form v-if="currentStep === 0" @submit.prevent="collectCompanyData">
                <b-row>
                  <b-col cols="12">
                    <b-form-group :label="t('Business Name')" label-for="company-name">
                      <b-form-input
                        id="company-name"
                        v-model="name"
                        :placeholder="t('Enter your business name')"
                        required
                      />
                    </b-form-group>
                  </b-col>
                  <b-col md="6">
                    <b-form-group :label="t('Phone')" label-for="company-phone">
                      <b-form-input
                        id="company-phone"
                        v-model="phone"
                        :placeholder="t('Enter phone number')"
                        maxlength="13"
                      />
                    </b-form-group>
                  </b-col>
                  <b-col cols="12">
                    <b-form-group label="Email" label-for="company-email">
                      <b-form-input
                        id="company-email"
                        v-model="email"
                        type="email"
                        :placeholder="t('Enter business email')"
                      />
                    </b-form-group>
                  </b-col>
                  <b-col cols="12">
                    <company-tax-settings v-model="companyDraft" />
                  </b-col>
                  <b-col cols="12">
                    <div class="company-optional-panel">
                      <div class="company-optional-header">
                        <div>
                          <p class="company-section-eyebrow mb-50">{{ t('Optional') }}</p>
                          <h6 class="company-optional-title mb-50">{{ t('Business details for invoices') }}</h6>
                          <p class="company-optional-copy mb-0">
                            {{ t('Add your business address for more professional invoices, or keep it hidden until later.') }}
                          </p>
                        </div>

                        <b-button
                          variant="outline-primary"
                          class="company-optional-toggle"
                          @click="showBusinessDetails = !showBusinessDetails"
                        >
                          {{ showBusinessDetails ? t('Hide details') : t('Add details') }}
                        </b-button>
                      </div>

                      <b-collapse v-model="showBusinessDetails" class="mt-1">
                        <b-row>
                          <b-col cols="12">
                            <b-form-group :label="t('Address')" label-for="company-address">
                              <b-form-input
                                id="company-address"
                                v-model="address"
                                :placeholder="t('Street address')"
                              />
                            </b-form-group>
                          </b-col>
                          <b-col md="6">
                            <b-form-group :label="t('Region / City')" label-for="company-region">
                              <b-form-input
                                id="company-region"
                                v-model="region"
                                :placeholder="t('City or region')"
                              />
                            </b-form-group>
                          </b-col>
                          <b-col md="6">
                            <b-form-group :label="t('Postcode')" label-for="company-postcode">
                              <b-form-input
                                id="company-postcode"
                                v-model="postcode"
                                trim
                                :placeholder="t('Postcode')"
                              />
                            </b-form-group>
                          </b-col>

                          <b-col md="6">
                            <b-form-group :label="t('Country')" label-for="company-country">
                              <b-form-input
                                id="company-country"
                                v-model="country"
                                :placeholder="t('Country')"
                              />
                            </b-form-group>
                          </b-col>
                          <b-col md="6">
                            <b-form-group :label="t('State')" label-for="company-state">
                              <b-form-input
                                id="company-state"
                                v-model="state"
                                :placeholder="t('State')"
                              />
                            </b-form-group>
                          </b-col>
                        </b-row>
                      </b-collapse>
                    </div>
                  </b-col>
                </b-row>

                <div class="company-form-actions">
                  <b-button type="submit" variant="primary">
                    {{ t('Continue to Payment Details') }}
                  </b-button>
                  <b-button type="button" :to="{ name: 'companies' }" variant="outline-primary">
                    {{ t('Cancel') }}
                  </b-button>
                </div>
              </b-form>

              <b-form v-else @submit.prevent="collectPaymentDetails">
                <b-row>
                  <b-col cols="12">
                    <b-form-group :label="t('PAYID')" label-for="payid">
                      <b-form-input
                        id="payid"
                        v-model="payment_details.payid"
                        type="text"
                        trim
                        :placeholder="t('Add a PayID for invoice payments')"
                      />
                    </b-form-group>
                  </b-col>
                  <b-col cols="12">
                    <b-form-group :label="t('PAYID Name')" label-for="payid-name">
                      <b-form-input
                        id="payid-name"
                        v-model="payment_details.name"
                        type="text"
                        trim
                        :placeholder="t('Name customers will see for payment')"
                      />
                    </b-form-group>
                  </b-col>
                </b-row>

                <div class="company-form-actions">
                  <b-button type="submit" variant="primary" :disabled="submit">
                    {{ submit ? t('Saving...') : t('Save Business') }}
                  </b-button>
                  <b-button type="button" variant="outline-primary" :disabled="submit" @click="goBackStep">
                    {{ t('Back') }}
                  </b-button>
                  <b-button type="button" variant="outline-secondary" :disabled="submit" @click="skipPaymentDetails">
                    {{ t('Skip for Now') }}
                  </b-button>
                </div>
              </b-form>
            </b-card-body>
          </b-card>
        </b-col>

        <b-col lg="4">
          <b-card class="company-side-card mb-2">
            <b-card-body>
              <p class="company-section-eyebrow mb-1">{{ t('Setup Summary') }}</p>
              <h5 class="company-side-title mb-2">{{ t('What this unlocks') }}</h5>

              <div class="company-summary-row">
                <span>{{ t('Business identity') }}</span>
                <strong>{{ name || t('Ready after setup') }}</strong>
              </div>
              <div class="company-summary-row">
                <span>{{ t('ABN visibility') }}</span>
                <strong>{{ abn || t('Add during setup') }}</strong>
              </div>
              <div class="company-summary-row">
                <span>{{ t('Tax & GST') }}</span>
                <strong>{{ gstSetupSummary }}</strong>
              </div>
              <div class="company-summary-row">
                <span>{{ t('Business address') }}</span>
                <strong>{{ businessDetailsSummary }}</strong>
              </div>
              <div class="company-summary-row mb-0">
                <span>{{ t('Payment collection') }}</span>
                <strong>{{ payment_details.payid || t('Optional PayID') }}</strong>
              </div>
            </b-card-body>
          </b-card>

          <b-card class="company-side-card company-side-card-accent">
            <b-card-body>
              <p class="company-section-eyebrow mb-1">{{ t('Plan Note') }}</p>
              <h5 class="company-side-title mb-1">{{ t('One company for now') }}</h5>
              <p class="text-muted mb-0">
                {{ t('Your current plan supports one business profile. Managing multiple businesses is planned for Grow.') }}
              </p>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </template>
  </section>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import CompanyTaxSettings from '@/components/uiComponents/CompanyTaxSettings.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  components: {
    BaseFeatherIcon,
    CompanyTaxSettings,
  },
  data() {
    return {
      currentStep: 0,
      name: '',
      abn: '',
      phone: '',
      email: '',
      address: '',
      region: '',
      postcode: '',
      state: '',
      country: '',
      gst_registered: false,
      gst_registered_from: null,
      gst_price_mode: 'gst_exclusive',
      gst_manual_override: false,
      abn_status: null,
      abn_entity_type: null,
      abn_legal_name: null,
      abr_last_checked_at: null,
      showBusinessDetails: false,
      payment_details: {
        payid: '',
        name: '',
      },
      companyCreated: false,
      companyData: null,
      t: null,
      submit: false,
      loading: false,
      companies: [],
    }
  },
  async created() {
    const { t } = useI18nUtils()
    this.t = t
    await this.fetchCompanies()
  },
  computed: {
    hasCompany() {
      return this.companies.length > 0
    },
    primaryCompany() {
      return this.companies[0] || {}
    },
    currentStepTitle() {
      return this.currentStep === 0 ? this.t('Create your business setup') : this.t('Add payment details')
    },
    currentStepSubtitle() {
      return this.currentStep === 0
        ? this.t('Start with the details customers see on invoices, including ABN and GST settings.')
        : this.t('Add a PayID now, or skip it and return later from your business page.')
    },
    companyDraft: {
      get() {
        return {
          name: this.name,
          phone: this.phone,
          abn: this.abn,
          email: this.email,
          address: this.address,
          region: this.region,
          postcode: this.postcode,
          state: this.state,
          country: this.country,
          gst_registered: this.gst_registered,
          gst_registered_from: this.gst_registered_from,
          gst_price_mode: this.gst_price_mode,
          gst_manual_override: this.gst_manual_override,
          abn_status: this.abn_status,
          abn_entity_type: this.abn_entity_type,
          abn_legal_name: this.abn_legal_name,
          abr_last_checked_at: this.abr_last_checked_at,
        }
      },
      set(company) {
        this.abn = company.abn || ''
        this.gst_registered = !!company.gst_registered
        this.gst_registered_from = company.gst_registered_from || null
        this.gst_price_mode = company.gst_price_mode || 'gst_exclusive'
        this.gst_manual_override = !!company.gst_manual_override
        this.abn_status = company.abn_status || null
        this.abn_entity_type = company.abn_entity_type || null
        this.abn_legal_name = company.abn_legal_name || null
        this.abr_last_checked_at = company.abr_last_checked_at || null
      },
    },
    gstSetupSummary() {
      if (this.gst_registered) return this.t('GST registered')
      if (this.gst_manual_override || this.abr_last_checked_at || this.abn_status) return this.t('Not GST registered')
      return this.t('Review during setup')
    },
    businessDetailsSummary() {
      if (this.address || this.region || this.postcode || this.state || this.country) {
        return [
          this.address,
          this.region,
          this.postcode,
          this.state,
          this.country,
        ]
          .filter(Boolean)
          .join(', ')
      }

      return this.t('Optional for later')
    },
  },
  methods: {
    async fetchCompanies() {
      this.loading = true
      try {
        await this.$store.dispatch('companies/list')
        this.companies = this.$store.getters['companies/list'] || []
      } finally {
        this.loading = false
      }
    },
    async collectCompanyData() {
      if (!this.abn) {
        this.$toast.error(this.t('Please add your ABN before continuing.'), {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
        return
      }

      this.companyData = {
        name: this.name,
        phone: this.phone,
        abn: this.abn,
        email: this.email,
        address: this.address,
        region: this.region,
        postcode: this.postcode,
        state: this.state,
        country: this.country,
        gst_registered: this.gst_registered,
        gst_registered_from: this.gst_registered_from,
        gst_price_mode: this.gst_price_mode,
        gst_manual_override: this.gst_manual_override,
        abn_status: this.abn_status,
        abn_entity_type: this.abn_entity_type,
        abn_legal_name: this.abn_legal_name,
        abr_last_checked_at: this.abr_last_checked_at,
      }
      this.companyCreated = true
      await this.$nextTick()
      this.currentStep = 1
    },
    goBackStep() {
      this.currentStep = 0
    },
    collectPaymentDetails() {
      this.submit = true
      this.payment_details = {
        payid: this.payment_details.payid,
        name: this.payment_details.name,
      }
      this.saveAllData()
    },
    async saveAllData() {
      try {
        const userId = await this.getId()
        const data = {
          data: {
            type: 'companies',
            attributes: {
              ...this.companyData,
              payment_details: this.payment_details,
            },
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: userId,
                },
              },
            },
          },
        }
        await this.$store.dispatch('companies/add', data)
        this.$router.push({ name: 'companies' })
      } catch (e) {
        this.submit = false
        let message = 'Something went wrong! Try again later or contact the support.'
        if (e.response?.data?.errors?.[0]?.detail === 'Your email address is not verified.') {
          message = 'Your email address is not verified. Please verify your email.'
        } else if (e.response?.data?.errors?.[0]?.detail === 'You have reached your limit for this feature.') {
          message = 'Your current plan includes one business. Multiple businesses will be available with Grow.'
        }
        this.$toast.error(message, {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      }
    },
    async saveCompany() {
      try {
        const userId = await this.getId()
        const data = {
          data: {
            type: 'companies',
            attributes: {
              ...this.companyData,
            },
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: userId,
                },
              },
            },
          },
        }
        await this.$store.dispatch('companies/add', data)
        this.$router.push({ name: 'companies' })
      } catch (e) {
        this.submit = false
        let message = 'Something went wrong! Try again later or contact the support.'
        if (e.response?.data?.errors?.[0]?.detail === 'Your email address is not verified.') {
          message = 'Your email address is not verified. Please verify your email.'
        } else if (e.response?.data?.errors?.[0]?.detail === 'You have reached your limit for this feature.') {
          message = 'Your current plan includes one business. Multiple businesses will be available with Grow.'
        }
        this.$toast.error(message, {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      }
    },
    async skipPaymentDetails() {
      this.submit = true
      this.saveCompany()
    },
    async getId() {
      const user = await this.$store.getters['users/user']
      return user.id
    },
  },
}
</script>

<style scoped>
.company-form-card,
.company-side-card,
.company-state-card,
.company-limit-card {
  border: 1px solid #e6edf7;
  border-radius: 1rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  background: #fff;
}

.company-form-body,
.company-side-card .card-body,
.company-state-card .card-body,
.company-limit-body {
  padding: 1.25rem;
}

.company-step-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.company-section-eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0366d6;
}

.company-form-title,
.company-side-title,
.company-limit-title {
  color: #5e5873;
  font-weight: 600;
}

.company-form-subtitle,
.company-limit-text {
  color: #6e6b7b;
}

.company-step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3rem;
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  background: #eef5ff;
  color: #0366d6;
  font-weight: 600;
}

.company-step-indicator {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.company-step-chip {
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: #f4f7fb;
  color: #6e6b7b;
  font-weight: 500;
}

.company-step-chip-active {
  background: #eef5ff;
  color: #0366d6;
}

.company-step-chip-complete {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.company-form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.company-optional-panel {
  padding: 1rem;
  border-radius: 0.95rem;
  background: #fff;
  border: 1px solid #edf2f8;
}

.company-optional-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.company-optional-title {
  color: #5e5873;
  font-weight: 600;
}

.company-optional-copy {
  color: #6e6b7b;
}

.company-optional-toggle {
  border-radius: 999px;
  font-weight: 500;
  white-space: nowrap;
}

.company-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid #edf2f8;
  color: #6e6b7b;
}

.company-summary-row strong {
  color: #5e5873;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.company-summary-row.mb-0 {
  border-bottom: none;
  padding-bottom: 0;
}

.company-side-card-accent {
  background: #fff;
}

.company-state-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 15rem;
  text-align: center;
}

.company-limit-card {
  background: #fff;
}

.company-limit-body {
  text-align: center;
}

.company-limit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  background: rgba(3, 102, 214, 0.1);
  color: #0366d6;
}

.company-limit-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.company-limit-panel {
  padding: 1rem;
  border-radius: 0.95rem;
  background: #fff;
  border: 1px solid #edf2f8;
}

.company-limit-panel-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6e6b7b;
  margin-bottom: 0.35rem;
}

.company-limit-panel-value {
  color: #5e5873;
  font-weight: 600;
}

.company-limit-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

@media (max-width: 767.98px) {
  .company-step-header,
  .company-summary-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .company-optional-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .company-limit-panels {
    grid-template-columns: 1fr;
  }
}
</style>
