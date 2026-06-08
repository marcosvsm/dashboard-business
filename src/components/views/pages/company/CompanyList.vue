<template>
  <section class="company-list-page">
    <template v-if="loading">
      <b-card class="company-state-card">
        <b-card-body class="company-state-body">
          <b-spinner variant="primary" class="mb-1" />
          <h6 class="mb-1">{{ t('Loading') }}...</h6>
          <p class="mb-0 text-muted">{{ t('We are preparing your business workspace.') }}</p>
        </b-card-body>
      </b-card>
    </template>

    <template v-else-if="hasCompany">
      <b-row>
        <b-col lg="8">
          <b-card no-body class="company-profile-card mb-2">
            <b-card-body class="company-profile-body">
              <div class="company-profile-top">
                <div class="company-profile-identity">
                  <div class="company-profile-avatar" :class="{ 'company-profile-avatar--logo': hasLogo }">
                    <img
                      v-if="hasLogo"
                      :src="companyLogoUrl"
                      :alt="primaryCompany.name || t('Business logo')"
                      class="company-profile-logo"
                    >
                    <span v-else>{{ companyInitials(primaryCompany) }}</span>
                  </div>

                  <div>
                    <p class="company-section-eyebrow mb-1">{{ t('Business Identity') }}</p>
                    <h2 class="company-profile-title mb-1">{{ primaryCompany.name || t('Business') }}</h2>
                  </div>
                </div>

                <div class="company-profile-actions">
                  <b-button
                    v-b-toggle.sidebar-company-edit
                    variant="primary"
                    class="company-profile-btn"
                    @click="editCompany(primaryCompany)"
                  >
                    <base-feather-icon icon="EditIcon" size="16" class="mr-50" />
                    {{ t('Edit') }}
                  </b-button>
                </div>
              </div>

              <div class="company-profile-grid">
                <div class="company-profile-item">
                  <span class="company-profile-label">{{ t('Business name') }}</span>
                  <span class="company-profile-value">{{ primaryCompany.name || t('Not added') }}</span>
                </div>
                <div class="company-profile-item">
                  <span class="company-profile-label">ABN</span>
                  <span class="company-profile-value">{{ primaryCompany.abn || t('Not added') }}</span>
                </div>
                <div class="company-profile-item">
                  <span class="company-profile-label">Email</span>
                  <span class="company-profile-value">{{ primaryCompany.email || t('Not added') }}</span>
                </div>
                <div class="company-profile-item">
                  <span class="company-profile-label">{{ t('Phone') }}</span>
                  <span class="company-profile-value">{{ primaryCompany.phone || t('Not added') }}</span>
                </div>
              </div>

              <div class="company-profile-note">
                <base-feather-icon icon="CheckCircleIcon" size="16" class="mr-50" />
                <span>{{ t('These are the core details customers use to recognise your business and reply to invoices.') }}</span>
              </div>
            </b-card-body>
          </b-card>

          <b-card class="company-info-card company-tax-card mb-2">
            <b-card-body>
              <div class="company-card-header">
                <div>
                  <p class="company-section-eyebrow mb-1">{{ t('Tax & GST') }}</p>
                  <h5 class="company-card-title mb-1">{{ t('Invoice tax settings') }}</h5>
                  <p class="company-card-subtitle mb-0">
                    {{ t('Control whether invoices use GST and how item prices are entered.') }}
                  </p>
                </div>

                <b-button
                  v-b-toggle.sidebar-company-edit
                  variant="outline-primary"
                  class="company-card-toggle"
                  @click="editCompany(primaryCompany)"
                >
                  <base-feather-icon icon="EditIcon" size="16" class="mr-50" />
                  {{ t('Edit Tax & GST') }}
                </b-button>
              </div>

              <div class="company-detail-panel">
                <div class="company-detail-row">
                  <span>{{ t('GST status') }}</span>
                  <strong>{{ gstStatusLabel }}</strong>
                </div>
                <div class="company-detail-row">
                  <span>{{ t('GST registered from') }}</span>
                  <strong>{{ gstRegisteredFromSummary }}</strong>
                </div>
                <div class="company-detail-row">
                  <span>{{ t('Price entry mode') }}</span>
                  <strong>{{ gstPriceModeLabel }}</strong>
                </div>
                <div class="company-detail-row mb-0">
                  <span>{{ t('ABN check') }}</span>
                  <strong>{{ abnCheckSummary }}</strong>
                </div>
              </div>

              <div class="company-secondary-summary mt-1">
                <span :class="['company-summary-pill', hasGstDecision ? 'company-summary-pill--ready' : 'company-summary-pill--optional']">
                  {{ hasGstDecision ? t('Tax settings reviewed') : t('Review recommended') }}
                </span>
                <p class="mb-0 text-muted">
                  {{ gstSettingsSummary }}
                </p>
              </div>
            </b-card-body>
          </b-card>


          <company-branding-card
            :business-name="primaryCompany.name"
            :logo-url="companyLogoUrl"
            :is-premium="hasBrandingAccess"
            :current-plan-label="currentPlanLabel"
          />

          <b-card class="company-info-card company-address-card mb-2">
            <b-card-body>
              <div class="company-card-header company-card-header-start">
                <div>
                  <p class="company-section-eyebrow mb-1">{{ t('More Business Details') }}</p>
                  <h5 class="company-card-title mb-1">{{ t('Business address') }}</h5>
                  <p class="company-card-subtitle mb-0">
                    {{ t('Add your business address when you want it shown on invoices.') }}
                  </p>
                </div>

                <b-button
                  variant="outline-primary"
                  class="company-card-toggle"
                  @click="detailsExpanded = !detailsExpanded"
                >
                  <base-feather-icon :icon="detailsExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="16" class="mr-50" />
                  {{ detailsExpanded ? t('Hide details') : detailsToggleLabel }}
                </b-button>
              </div>

              <div class="company-secondary-summary">
                <span :class="['company-summary-pill', hasBusinessDetails ? 'company-summary-pill--ready' : 'company-summary-pill--optional']">
                  {{ hasBusinessDetails ? t('Address details added') : t('Optional') }}
                </span>
                <p class="mb-0 text-muted">
                  {{ businessDetailsSummary }}
                </p>
              </div>

              <b-collapse v-model="detailsExpanded" class="mt-2">
                <template v-if="hasBusinessDetails">
                  <div class="company-detail-panel">
                    <div
                      v-for="detail in businessDetailsFields"
                      :key="detail.label"
                      class="company-detail-row"
                      :class="{ 'mb-0': detail.isLast }"
                    >
                      <span>{{ detail.label }}</span>
                      <strong>{{ detail.value }}</strong>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div class="company-empty-inline">
                    <div class="company-empty-icon">
                      <base-feather-icon icon="MapPinIcon" size="18" />
                    </div>
                    <div>
                      <h6 class="mb-1">{{ t('No business address added yet') }}</h6>
                      <p class="mb-0 text-muted">{{ t('This is optional, but it can make invoices feel more complete and professional.') }}</p>
                    </div>
                  </div>
                </template>

                <div class="company-inline-actions mt-2">
                  <b-button
                    v-b-toggle.sidebar-company-edit
                    variant="outline-primary"
                    @click="editCompany(primaryCompany)"
                  >
                    <base-feather-icon icon="EditIcon" size="16" class="mr-50" />
                    {{ hasBusinessDetails ? t('Edit') : t('Add Address') }}
                  </b-button>
                </div>
              </b-collapse>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col lg="4">
          <b-card class="company-info-card company-payment-card mb-2">
            <b-card-body>
              <div class="company-card-header">
                <div>
                  <p class="company-section-eyebrow mb-1">{{ t('Payment Settings') }}</p>
                  <h5 class="company-card-title mb-1">{{ t('Payment methods') }}</h5>
                  <p class="company-card-subtitle mb-0">
                    {{ t('Make it easy for customers to pay directly from your invoices.') }}
                  </p>
                </div>

                <b-button
                  v-b-toggle.sidebar-payment-method
                  variant="outline-primary"
                  class="company-card-toggle"
                  @click="hasAnyPaymentMethod ? editPayment(primaryCompany) : addPayment(primaryCompany)"
                >
                  <base-feather-icon :icon="hasAnyPaymentMethod ? 'EditIcon' : 'PlusCircleIcon'" size="16" class="mr-50" />
                  {{ hasAnyPaymentMethod ? t('Edit') : t('Add') }}
                </b-button>
              </div>

              <div class="payment-method-grid">
                <div class="payment-mini-card" :class="{ 'payment-mini-card--empty': !hasPayidMethod }">
                  <div class="payment-mini-header">
                    <img :src="payIdLogo" alt="PayID" class="payment-mini-logo" />
                    <span class="payment-mini-title">{{ t('PayID') }}</span>
                    <b-badge
                      v-if="hasPayidMethod && !primaryCompany.paymentDetail.show_payid"
                      variant="light-secondary"
                      class="payment-mini-badge"
                    >
                      {{ t('Hidden') }}
                    </b-badge>
                  </div>
                  <template v-if="hasPayidMethod">
                    <div class="payment-mini-value">{{ primaryCompany.paymentDetail.payid }}</div>
                    <div v-if="primaryCompany.paymentDetail.name" class="payment-mini-meta">
                      {{ primaryCompany.paymentDetail.name }}
                    </div>
                  </template>
                  <div v-else class="payment-mini-empty">{{ t('Not added') }}</div>
                </div>

                <div class="payment-mini-card" :class="{ 'payment-mini-card--empty': !hasBankMethod }">
                  <div class="payment-mini-header">
                    <span class="payment-mini-icon">
                      <base-feather-icon icon="CreditCardIcon" size="14" />
                    </span>
                    <span class="payment-mini-title">{{ t('Bank Account') }}</span>
                    <b-badge
                      v-if="hasBankMethod && !primaryCompany.paymentDetail.show_bank_details"
                      variant="light-secondary"
                      class="payment-mini-badge"
                    >
                      {{ t('Hidden') }}
                    </b-badge>
                  </div>
                  <template v-if="hasBankMethod">
                    <div class="payment-mini-value">{{ primaryCompany.paymentDetail.account_name }}</div>
                    <div class="payment-mini-meta">
                      BSB {{ formattedBsb }} · {{ primaryCompany.paymentDetail.account_number }}
                    </div>
                  </template>
                  <div v-else class="payment-mini-empty">{{ t('Not added') }}</div>
                </div>
              </div>
            </b-card-body>
          </b-card>

          <b-card class="company-side-card mb-2">
            <b-card-body>
              <p class="company-section-eyebrow mb-1">{{ t('Invoice Preview') }}</p>
              <h5 class="company-card-title mb-2">{{ t('What customers see') }}</h5>

              <div class="company-preview-card">
                <div class="company-preview-header">
                  <div class="company-preview-avatar" :class="{ 'company-preview-avatar--logo': hasLogo }">
                    <img
                      v-if="hasLogo"
                      :src="companyLogoUrl"
                      :alt="primaryCompany.name || t('Business logo')"
                      class="company-preview-logo"
                    >
                    <span v-else>{{ companyInitials(primaryCompany) }}</span>
                  </div>

                  <div class="company-preview-title-group">
                    <strong>{{ primaryCompany.name || t('Business name') }}</strong>
                    <span>ABN {{ primaryCompany.abn || t('Not added') }}</span>
                  </div>
                </div>

                <div class="company-preview-line">
                  <span>{{ t('Invoice type') }}</span>
                  <strong>{{ invoiceTypePreview }}</strong>
                </div>
                <div class="company-preview-line">
                  <span>{{ t('GST') }}</span>
                  <strong>{{ gstPreviewSummary }}</strong>
                </div>
                <div class="company-preview-line">
                  <span>{{ t('Reply contact') }}</span>
                  <strong>{{ contactSummary }}</strong>
                </div>
                <div class="company-preview-line">
                  <span>{{ t('Payment instruction') }}</span>
                  <strong>{{ paymentSummary }}</strong>
                </div>
                <div class="company-preview-line mb-0">
                  <span>{{ t('Business address') }}</span>
                  <strong>{{ addressPreviewSummary }}</strong>
                </div>
              </div>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </template>

    <template v-else>
      <b-card class="company-state-card">
        <b-card-body class="company-state-body">
          <div class="company-empty-icon">
            <base-feather-icon icon="BriefcaseIcon" size="20" />
          </div>
          <h5 class="mb-1">{{ t('No business could be found') }}</h5>
          <p class="mb-2 text-muted">{{ t('Add your business profile to personalise invoices and payment details.') }}</p>
          <b-button :to="{ name: 'addCompany' }" variant="primary">
            {{ t('Add My Business') }}
          </b-button>
        </b-card-body>
      </b-card>
    </template>

    <company-edit-sidebar
      :company="company"
      @company-updated="handleCompanyUpdated"
      @delete-requested="handleCompanyDelete"
    />
    <payment-method-sidebar
      :company="company"
      :mode="mode"
      @payment-added="handlePaymentAdded"
      @payment-updated="handlePaymentUpdated"
      @delete-requested="handlePaymentDelete"
    />
  </section>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons'
import CompanyEditSidebar from '@/components/uiComponents/CompanyEditSidebar.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import PaymentMethodSidebar from '@/components/uiComponents/PaymentMethodSidebar.vue'
import CompanyBrandingCard from '@/components/views/pages/company/CompanyBrandingCard.vue'
import payIdLogo from '@/assets/img/PayID_logo.svg'
import { companyGstAppliesByDefault, PRICE_MODE_INCLUSIVE } from '@/utils/gstCalculator'

const createEmptyCompany = () => ({
  name: '',
  email: '',
  abn: '',
  phone: '',
  address: '',
  region: '',
  postcode: '',
  state: '',
  country: '',
  logo_url: '',
  gst_registered: false,
  gst_registered_from: null,
  gst_price_mode: 'gst_exclusive',
  gst_manual_override: false,
  abn_status: null,
  abn_entity_type: null,
  abn_legal_name: null,
  abr_last_checked_at: null,
  paymentDetail: {
    payid: '',
    name: '',
  },
})

export default {
  components: {
    BaseFeatherIcon,
    CompanyEditSidebar,
    PaymentMethodSidebar,
    CompanyBrandingCard,
  },
  data() {
    return {
      companies: [],
      company: createEmptyCompany(),
      loading: false,
      t: null,
      mode: '',
      payIdLogo,
      detailsExpanded: false,
    }
  },
  computed: {
    hasCompany() {
      return this.companies.length > 0
    },
    primaryCompany() {
      return this.companies[0] || createEmptyCompany()
    },
    hasContactDetails() {
      return Boolean(this.primaryCompany.email || this.primaryCompany.phone)
    },
    hasPaymentDetails() {
      return this.hasPayidMethod || this.hasBankMethod
    },
    hasPayidMethod() {
      const pd = this.primaryCompany.paymentDetail
      return Boolean(pd && pd.payid)
    },
    hasBankMethod() {
      const pd = this.primaryCompany.paymentDetail
      return Boolean(pd && pd.account_name && pd.bsb && pd.account_number)
    },
    hasAnyPaymentMethod() {
      return Boolean(this.primaryCompany.paymentDetail && (this.hasPayidMethod || this.hasBankMethod))
    },
    formattedBsb() {
      const raw = (this.primaryCompany.paymentDetail && this.primaryCompany.paymentDetail.bsb) || ''
      const digits = String(raw).replace(/\D/g, '')
      return digits.length === 6 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : raw
    },
    hasBusinessDetails() {
      return Boolean(
        this.primaryCompany.address ||
        this.primaryCompany.region ||
        this.primaryCompany.postcode ||
        this.primaryCompany.state ||
        this.primaryCompany.country
      )
    },
    hasGstDecision() {
      return Boolean(
        this.primaryCompany.gst_registered ||
        this.primaryCompany.gst_manual_override ||
        this.primaryCompany.abr_last_checked_at ||
        this.primaryCompany.abn_status
      )
    },
    gstAppliesByDefault() {
      return companyGstAppliesByDefault(this.primaryCompany)
    },
    companyLogoUrl() {
      return (
        this.primaryCompany.logo_url ||
        this.primaryCompany.logoUrl ||
        this.primaryCompany.logo?.url ||
        null
      )
    },
    hasLogo() {
      return Boolean(this.companyLogoUrl)
    },
    currentPlanSlug() {
      const slug = this.$store.getters['users/user']?.role?.slug
      if (slug) return slug

      const roles = this.$store.getters['users/roles'] || []
      if (roles.includes('grow')) return 'grow'
      if (roles.includes('boost')) return 'boost'
      if (roles.includes('pro')) return 'pro'
      if (roles.includes('business')) return 'business'
      if (roles.includes('enterprise')) return 'enterprise'

      return 'free'
    },
    currentPlanLabel() {
      const labels = {
        free: 'Free',
        boost: 'Boost',
        grow: 'Grow',
        pro: 'Pro',
        business: 'Business',
        enterprise: 'Enterprise',
      }

      return labels[this.currentPlanSlug] || 'Free'
    },
    hasBrandingAccess() {
      return ['boost', 'grow', 'pro', 'business', 'enterprise'].includes(this.currentPlanSlug)
    },
    businessDetailsFields() {
      const items = [
        { label: this.t('Address'), value: this.primaryCompany.address || this.t('Not added') },
        { label: this.t('Region / City'), value: this.primaryCompany.region || this.t('Not added') },
        { label: this.t('Postcode'), value: this.primaryCompany.postcode || this.t('Not added') },
        { label: this.t('State'), value: this.primaryCompany.state || this.t('Not added') },
        { label: this.t('Country'), value: this.primaryCompany.country || this.t('Not added') },
      ]

      return items.map((item, index) => ({
        ...item,
        isLast: index === items.length - 1,
      }))
    },
    businessDetailsSummary() {
      if (!this.hasBusinessDetails) {
        return this.t('Add your address only when you want invoices to feel more complete and professional.')
      }

      return this.t('These details stay secondary here, but they can add more professionalism to your invoice header.')
    },
    detailsToggleLabel() {
      return this.hasBusinessDetails ? this.t('Review details') : this.t('Add details')
    },
    gstStatusLabel() {
      if (this.primaryCompany.gst_registered) return this.t('GST registered')
      if (this.hasGstDecision) return this.t('Not GST registered')
      return this.t('Not reviewed')
    },
    gstRegisteredFromSummary() {
      if (!this.primaryCompany.gst_registered) return this.t('Not applicable')
      return this.primaryCompany.gst_registered_from || this.t('Not added')
    },
    gstPriceModeLabel() {
      return this.primaryCompany.gst_price_mode === PRICE_MODE_INCLUSIVE
        ? this.t('GST inclusive')
        : this.t('GST exclusive')
    },
    abnCheckSummary() {
      if (this.primaryCompany.abn_status) return this.primaryCompany.abn_status
      if (this.primaryCompany.abr_last_checked_at) return this.t('Checked')
      return this.t('Not checked')
    },
    gstSettingsSummary() {
      if (this.primaryCompany.gst_registered) {
        return this.t('New invoices can apply GST automatically using this business setup.')
      }
      if (this.hasGstDecision) {
        return this.t('Invoices will not apply GST by default for this business.')
      }
      return this.t('Review GST before sending invoices so totals and tax labels are correct.')
    },
    invoiceTypePreview() {
      return this.gstAppliesByDefault ? this.t('Tax invoice') : this.t('Invoice')
    },
    gstPreviewSummary() {
      if (!this.gstAppliesByDefault) return this.t('Not applied by default')
      return this.gstPriceModeLabel
    },
    paymentSummary() {
      const pd = this.primaryCompany.paymentDetail
      if (!pd) return this.t('Not added')
      const parts = []
      if (this.hasPayidMethod) parts.push(this.t('PayID'))
      if (this.hasBankMethod)  parts.push(this.t('Bank account'))
      if (!parts.length) return this.t('Not added')
      return parts.join(' + ')
    },
    contactSummary() {
      return this.primaryCompany.email || this.primaryCompany.phone || this.t('Missing')
    },
    addressPreviewSummary() {
      if (!this.hasBusinessDetails) return this.t('Optional')

      return [
        this.primaryCompany.address,
        this.primaryCompany.region,
        this.primaryCompany.postcode,
        this.primaryCompany.state,
        this.primaryCompany.country,
      ]
        .filter(Boolean)
        .join(', ')
    },
  },
  async created() {
    this.loading = true
    const { t } = useI18nUtils()
    this.t = t
    await this.fetchCompanies()
  },
  methods: {
    async fetchCompanies() {
      try {
        await this.$store.dispatch('companies/list')
        this.companies = this.$store.getters['companies/list'] || []
        if (this.companies.length) {
          this.company = { ...createEmptyCompany(), ...this.companies[0] }
        }
      } catch (error) {
        this.$toast.error(this.t('Failed to load business. Please try again.'), {
          position: 'top-right',
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      } finally {
        this.loading = false
      }
    },
    companyInitials(company) {
      const name = typeof company === 'string' ? company : company?.name
      if (!name) return 'MB'

      return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('')
    },
    async handleCompanyDelete(companyId) {
      try {
        await this.$store.dispatch('companies/destroy', companyId)
        this.companies = this.companies.filter(company => company.id !== companyId)
        this.company = createEmptyCompany()
        this.$toast.success('Business deleted', {
          position: 'top-right',
          icon: CheckCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 2000,
        })
      } catch (e) {
        this.$toast.error('Failed to delete business. Please try again.', {
          position: 'top-right',
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      }
    },
    async handlePaymentDelete(paymentId) {
      try {
        await this.$store.dispatch('paymentMethods/destroy', paymentId)
        const companyIndex = this.companies.findIndex(company => company.paymentDetail && company.paymentDetail.id === paymentId)
        if (companyIndex > -1) {
          this.$set(this.companies[companyIndex], 'paymentDetail', null)
          if (this.company.id === this.companies[companyIndex].id) {
            this.company = { ...createEmptyCompany(), ...this.companies[companyIndex] }
          }
        }
        this.$toast.success('Payment method deleted.', {
          position: 'top-right',
          icon: CheckCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 2000,
        })
      } catch (e) {
        this.$toast.error(this.t('Failed to delete the payment method. Please try again.'), {
          position: 'top-right',
          icon: AlertCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
      }
    },
    editCompany(company) {
      this.company = { ...createEmptyCompany(), ...company }
    },
    editPayment(company) {
      this.company = { ...createEmptyCompany(), ...company }
      this.mode = 'update'
    },
    addPayment(company) {
      this.company = { ...createEmptyCompany(), ...company }
      this.mode = 'create'
    },
    handleCompanyUpdated(updatedCompany) {
      if (!updatedCompany) return

      const index = this.companies.findIndex(c => c.id === updatedCompany.id)
      if (index > -1) {
        const mergedCompany = {
          ...this.companies[index],
          ...updatedCompany,
          paymentDetail: this.companies[index].paymentDetail || updatedCompany.paymentDetail || null,
        }

        this.$set(this.companies, index, mergedCompany)
        this.company = { ...createEmptyCompany(), ...mergedCompany }
      }
    },
    handlePaymentAdded(payment) {
      const index = this.companies.findIndex(c => c.id === this.company.id)
      if (index > -1) {
        this.$set(this.companies[index], 'paymentDetail', payment)
        this.company = { ...createEmptyCompany(), ...this.companies[index] }
      }
    },
    handlePaymentUpdated(payment) {
      const index = this.companies.findIndex(c => c.id === this.company.id)
      if (index > -1) {
        this.$set(this.companies[index], 'paymentDetail', payment)
        this.company = { ...createEmptyCompany(), ...this.companies[index] }
      }
    },
  },
}
</script>

<style scoped>
.company-list-page {
  padding-bottom: 1rem;
}

.company-profile-card,
.company-info-card,
.company-side-card,
.company-state-card {
  border: 1px solid #e6edf7;
  border-radius: 0.428rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  background: #fff;
}

.company-profile-card {
  background:
    radial-gradient(circle at top right, rgba(45, 206, 204, 0.18), transparent 28%),
    linear-gradient(135deg, #0f4c81 0%, #0366d6 55%, #2d8cff 100%);
  border: none;
}

.company-secondary-card {
  background: #fff;
}

.company-profile-body,
.company-info-card .card-body,
.company-side-card .card-body,
.company-state-card .card-body {
  padding: 1.25rem;
}

.company-profile-body {
  padding: 1.75rem;
  color: #fff;
}

.company-profile-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.company-profile-identity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-profile-avatar,
.company-preview-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(3, 102, 214, 0.08);
  border: 1px solid #e6edf7;
  color: #0366d6;
}

.company-profile-avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  box-shadow: 0 12px 32px rgba(7, 35, 74, 0.22);
}

.company-profile-avatar--logo {
  background: rgba(255, 255, 255, 0.96);
}

.company-profile-logo,
.company-preview-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-section-eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0366d6;
}

.company-profile-body .company-section-eyebrow {
  color: rgba(255, 255, 255, 0.72);
}

.company-profile-title,
.company-card-title {
  color: #5e5873;
  font-weight: 600;
}

.company-profile-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
}

.company-profile-subtitle {
  max-width: 42rem;
  color: rgba(255, 255, 255, 0.82);
}

.company-card-subtitle {
  color: #6e6b7b;
}

.company-profile-actions,
.company-inline-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.company-profile-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  min-width: 9rem;
  padding: 0.72rem 1rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
}

.company-profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.company-profile-item {
  padding: 1rem 1.1rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.company-profile-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 0.35rem;
}

.company-profile-value {
  display: block;
  color: #fff;
  font-weight: 600;
  word-break: break-word;
}

.company-profile-note {
  display: inline-flex;
  align-items: center;
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
}

.company-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.company-card-header-start {
  align-items: flex-start;
}

.company-card-toggle {
  border-radius: 999px;
  font-weight: 500;
  white-space: nowrap;
}

.company-secondary-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.95rem;
  background: #fff;
  border: 1px solid #edf2f8;
}

.company-summary-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.company-summary-pill--ready {
  color: #15803d;
  background: rgba(34, 197, 94, 0.12);
}

.company-summary-pill--optional {
  color: #9a6700;
  background: rgba(245, 158, 11, 0.12);
}

.company-detail-panel,
.company-preview-card {
  padding: 1rem;
  border-radius: 0.95rem;
  background: #fff;
  border: 1px solid #edf2f8;
}

.company-detail-row,
.company-preview-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid #edf2f8;
  color: #6e6b7b;
}

.company-detail-row strong,
.company-preview-line strong {
  color: #5e5873;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.company-detail-row.mb-0,
.company-preview-line.mb-0 {
  border-bottom: none;
  padding-bottom: 0;
}

.company-empty-inline {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.95rem;
  background: #fff;
  border: 1px dashed #d9e6f7;
}

.company-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.9rem;
  background: rgba(3, 102, 214, 0.08);
  color: #0366d6;
  flex-shrink: 0;
}

.payment-method-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.payment-mini-card {
  padding: 0.95rem 1rem;
  border-radius: 0.85rem;
  background: #fff;
  border: 1px solid #edf2f8;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.payment-mini-card:hover {
  border-color: #d9e6f7;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
}

.payment-mini-card--empty {
  background: #fafbfd;
  border-style: dashed;
}

.payment-mini-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.55rem;
}

.payment-mini-logo {
  width: 34px;
  height: auto;
}

.payment-mini-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 0.5rem;
  background: #f1f5f9;
  color: #475569;
}

.payment-mini-title {
  font-weight: 600;
  color: #5e5873;
  font-size: 0.95rem;
}

.payment-mini-badge {
  margin-left: auto;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.payment-mini-value {
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
  margin-bottom: 0.15rem;
}

.payment-mini-meta {
  color: #6e6b7b;
  font-size: 0.85rem;
}

.payment-mini-empty {
  color: #94a3b8;
  font-size: 0.9rem;
}

.company-preview-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-bottom: 1rem;
  margin-bottom: 0.2rem;
  border-bottom: 1px solid #edf2f8;
}

.company-preview-avatar {
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 1rem;
  background: rgba(3, 102, 214, 0.08);
  color: #0366d6;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.company-preview-avatar--logo {
  background: #fff;
  border-color: #d9e6f7;
}

.company-preview-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.company-preview-title-group strong {
  color: #5e5873;
  font-weight: 600;
}

.company-preview-title-group span {
  color: #6e6b7b;
  font-size: 0.9rem;
}

.company-preview-footnote {
  margin-top: 1rem;
  color: #6e6b7b;
  font-size: 0.88rem;
}

.company-state-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 15rem;
  text-align: center;
}

@media (max-width: 991.98px) {
  .company-card-header,
  .company-secondary-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .company-list-page .row {
    flex-direction: column;
  }

  .company-list-page .row > [class*="col-"] {
    display: contents;
  }

  .company-list-page .company-profile-card { order: 1; }
  .company-list-page .company-tax-card { order: 3; }
  .company-list-page .company-payment-card { order: 2; }
  .company-list-page .company-branding-card { order: 4; }
  .company-list-page .company-address-card { order: 5; }
  .company-list-page .company-side-card { order: 6; }
}

@media (max-width: 767.98px) {
  .company-profile-body {
    padding: 1.25rem;
  }

  .company-profile-top {
    flex-direction: column;
  }

  .company-profile-grid {
    grid-template-columns: 1fr;
  }

  .company-detail-row,
  .company-preview-line {
    flex-direction: column;
    align-items: flex-start;
  }

  .company-detail-row strong,
  .company-preview-line strong {
    text-align: left;
  }
}

@media (max-width: 575.98px) {
  .company-profile-identity {
    align-items: flex-start;
  }

  .company-profile-note {
    border-radius: 1rem;
    align-items: flex-start;
  }

  .company-profile-title {
    font-size: 1.6rem;
  }
}
</style>
