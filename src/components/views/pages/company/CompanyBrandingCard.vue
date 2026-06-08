<template>
  <b-card class="company-branding-card">
    <b-card-body>
      <div class="company-branding-header">
        <div>
          <p class="company-section-eyebrow mb-1">{{ t('Branding') }}</p>
          <h5 class="company-card-title mb-1">{{ t('Logo on invoices') }}</h5>
          <p class="company-card-subtitle mb-0">
            {{ isPremium
              ? t('Upload a business logo so invoices look more polished and recognisable.')
              : t('Upgrade to add your logo to invoices and make your brand feel more established.') }}
          </p>
        </div>

        <div :class="['company-branding-pill', isPremium ? 'company-branding-pill--active' : 'company-branding-pill--locked']">
          <base-feather-icon :icon="isPremium ? 'StarIcon' : 'LockIcon'" size="14" class="mr-50" />
          {{ isPremium ? `${currentPlanLabel} ${t('Plan')}` : t('Premium feature') }}
        </div>
      </div>

      <div class="company-branding-layout" :class="{ 'company-branding-layout--locked': !isPremium }">
        <div class="company-brand-preview">
          <div class="company-brand-preview-frame">
            <div class="company-brand-preview-top">
              <div class="company-brand-preview-logo" :class="{ 'company-brand-preview-logo--image': hasLogo }">
                <img
                  v-if="hasLogo"
                  :src="activeLogoUrl"
                  :alt="businessName || t('Business logo')"
                  class="company-brand-preview-image"
                >
                <span v-else>{{ initials }}</span>
              </div>

              <div class="company-brand-preview-copy">
                <strong>{{ businessName || t('Your business') }}</strong>
                <span>{{ t('Invoice header preview') }}</span>
              </div>
            </div>

            <div class="company-brand-preview-line company-brand-preview-line--wide" />
            <div class="company-brand-preview-line" />
            <div class="company-brand-preview-line company-brand-preview-line--short" />
          </div>

          <p class="company-brand-preview-note mb-0">
            {{ hasLogo
              ? t('Your logo can sit beside your business identity and make invoices feel instantly recognisable.')
              : t('A clean logo adds a more polished, customer-facing finish to your invoices.') }}
          </p>
        </div>

        <div class="company-branding-panel">
          <template v-if="isPremium">
            <div class="company-branding-upload">
              <div class="company-branding-upload-copy">
                <h6 class="mb-1">{{ hasLogo ? t('Update your logo') : t('Upload a business logo') }}</h6>
                <p class="text-muted mb-2">
                  {{ t('Use PNG, JPG, or SVG. Transparent backgrounds usually look best on invoices.') }}
                </p>
              </div>

              <b-form-file
                v-model="selectedFile"
                :browse-text="t('Choose logo')"
                :placeholder="t('No file selected')"
                accept=".png,.jpg,.jpeg,.svg"
                @input="handleFileSelection"
              />

              <div class="company-branding-meta">
                <span>{{ selectedFile ? selectedFile.name : t('Recommended: square or wide logo under 2MB') }}</span>
                <b-button
                  v-if="selectedFile"
                  variant="link"
                  class="p-0 company-branding-reset"
                  @click="clearSelectedLogo"
                >
                  {{ t('Remove preview') }}
                </b-button>
              </div>

              <p v-if="selectedFile" class="company-branding-hint mb-0">
                {{ t('Preview ready. Persistent company logo storage is the next backend step.') }}
              </p>
            </div>
          </template>

          <template v-else>
            <div class="company-branding-lock">
              <h6 class="mb-1">{{ t('Upgrade to add your logo to invoices') }}</h6>
              <p class="text-muted mb-2">
                {{ t('Branding helps customers recognise your business faster and makes invoices feel more polished and professional.') }}
              </p>

              <div class="company-branding-benefit">
                <base-feather-icon icon="CheckCircleIcon" size="15" class="mr-50" />
                <span>{{ t('Display your logo on customer-facing invoices') }}</span>
              </div>
              <div class="company-branding-benefit">
                <base-feather-icon icon="CheckCircleIcon" size="15" class="mr-50" />
                <span>{{ t('Create a stronger, more memorable business identity') }}</span>
              </div>

              <b-button variant="primary" class="mt-2" @click="goToUpgrade">
                {{ t('See plans') }}
              </b-button>
            </div>
          </template>
        </div>
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  name: 'CompanyBrandingCard',
  components: {
    BaseFeatherIcon,
  },
  props: {
    businessName: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: null,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    currentPlanLabel: {
      type: String,
      default: 'Free',
    },
  },
  data() {
    const { t } = useI18nUtils()

    return {
      t,
      selectedFile: null,
      localPreviewUrl: '',
      objectUrl: null,
    }
  },
  computed: {
    initials() {
      if (!this.businessName) return 'SB'

      return this.businessName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('')
    },
    activeLogoUrl() {
      return this.localPreviewUrl || this.logoUrl || ''
    },
    hasLogo() {
      return Boolean(this.activeLogoUrl)
    },
  },
  beforeDestroy() {
    this.revokeObjectUrl()
  },
  methods: {
    handleFileSelection(file) {
      const selected = Array.isArray(file) ? file[0] : file

      if (!selected) {
        this.clearSelectedLogo()
        return
      }

      const isAcceptedType = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(selected.type)
      const looksLikeImage = /\.(png|jpe?g|svg)$/i.test(selected.name || '')

      if (!isAcceptedType && !looksLikeImage) {
        this.selectedFile = null
        this.$toast.error(this.t('Please choose a PNG, JPG, or SVG logo.'), {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
        return
      }

      if (selected.size > 2 * 1024 * 1024) {
        this.selectedFile = null
        this.$toast.error(this.t('Please choose a logo smaller than 2MB.'), {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        })
        return
      }

      this.revokeObjectUrl()
      this.objectUrl = URL.createObjectURL(selected)
      this.localPreviewUrl = this.objectUrl

      // TODO: Persist the selected logo through a company branding upload endpoint.
      // Reuse the existing users/upload FormData pattern when the company logo API is ready.
    },
    clearSelectedLogo() {
      this.selectedFile = null
      this.localPreviewUrl = ''
      this.revokeObjectUrl()
    },
    revokeObjectUrl() {
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl)
        this.objectUrl = null
      }
    },
    goToUpgrade() {
      this.$router.push({ name: 'pricing' })
    },
  },
}
</script>

<style scoped>
.company-branding-card {
  border: 1px solid #e6edf7;
  border-radius: 1rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  background: #fff;
}

.company-branding-header {
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

.company-card-title {
  color: #5e5873;
  font-weight: 600;
}

.company-card-subtitle {
  color: #6e6b7b;
}

.company-branding-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

.company-branding-pill--active {
  color: #0366d6;
  background: rgba(3, 102, 214, 0.12);
}

.company-branding-pill--locked {
  color: #6b7280;
  background: rgba(148, 163, 184, 0.12);
}

.company-branding-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  gap: 1rem;
}

.company-brand-preview,
.company-branding-panel {
  min-width: 0;
}

.company-brand-preview-frame,
.company-branding-upload,
.company-branding-lock {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #e6edf7;
  background: #fff;
}

.company-brand-preview-frame {
  background: #fff;
}

.company-brand-preview-top {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1.25rem;
}

.company-brand-preview-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  flex-shrink: 0;
  background: rgba(3, 102, 214, 0.08);
  color: #0366d6;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  overflow: hidden;
}

.company-brand-preview-logo--image {
  background: #fff;
  border: 1px solid #d9e6f7;
}

.company-brand-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-brand-preview-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.company-brand-preview-copy strong {
  color: #5e5873;
  font-weight: 600;
}

.company-brand-preview-copy span {
  color: #6e6b7b;
  font-size: 0.9rem;
}

.company-brand-preview-line {
  height: 0.7rem;
  border-radius: 999px;
  background: #edf2f8;
  margin-bottom: 0.75rem;
}

.company-brand-preview-line--wide {
  width: 100%;
}

.company-brand-preview-line--short {
  width: 62%;
  margin-bottom: 0;
}

.company-brand-preview-note {
  margin-top: 0.85rem;
  color: #6e6b7b;
}

.company-branding-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.75rem;
  color: #6e6b7b;
  font-size: 0.88rem;
}

.company-branding-reset {
  font-size: 0.88rem;
  color: #0366d6;
}

.company-branding-hint {
  margin-top: 0.75rem;
  color: #6e6b7b;
  font-size: 0.88rem;
}

.company-branding-benefit {
  display: flex;
  align-items: center;
  color: #6e6b7b;
  margin-bottom: 0.75rem;
}

@media (max-width: 991.98px) {
  .company-branding-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .company-branding-header,
  .company-branding-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
