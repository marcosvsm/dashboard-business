<template>
  <b-modal
    v-model="localShow"
    centered
    hide-footer
    hide-header
    size="md"
    body-class="p-0"
    dialog-class="aum-dialog"
  >
    <div class="aum-root">
      <div class="aum-header">
        <div class="aum-icon-wrap">
          <base-feather-icon icon="ZapIcon" size="22" />
        </div>
        <button
          type="button"
          class="aum-close"
          :aria-label="t('Close')"
          @click="markAsSeen"
        >
          <base-feather-icon icon="XIcon" size="16" />
        </button>
      </div>

      <div class="aum-body">
        <p class="aum-eyebrow">{{ t('appUpdate.eyebrow') }}</p>
        <h4 class="aum-title">{{ t('appUpdate.title') }}</h4>
        <p class="aum-desc">{{ t('appUpdate.description') }}</p>

        <p class="aum-section-title">{{ t('appUpdate.whatsNew') }}</p>

        <ul class="aum-benefits">
          <li v-for="benefit in benefits" :key="benefit.icon">
            <span class="aum-benefit-icon">
              <base-feather-icon :icon="benefit.icon" size="14" />
            </span>
            <div>
              <strong>{{ t(benefit.title) }}</strong>
              <span class="aum-benefit-desc">{{ t(benefit.desc) }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="aum-footer">
        <b-button variant="primary" class="aum-cta" block @click="markAsSeen">
          {{ t('appUpdate.gotIt') }}
        </b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import profileService from '@/store/services/profile-service'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

const RELEASE_VERSION = '2026-06-major-update-v1'
const LOCAL_CACHE_KEY = `seen_release_${RELEASE_VERSION}`

export default {
  name: 'AppUpdateModal',

  components: { BaseFeatherIcon },

  data() {
    return {
      t: null,
      localShow: false,
      releaseVersion: RELEASE_VERSION,
      benefits: [
        {
          icon: 'FileTextIcon',
          title: 'appUpdate.benefits.invoice.title',
          desc:  'appUpdate.benefits.invoice.desc',
        },
        {
          icon: 'BarChart2Icon',
          title: 'appUpdate.benefits.dashboard.title',
          desc:  'appUpdate.benefits.dashboard.desc',
        },
        {
          icon: 'PercentIcon',
          title: 'appUpdate.benefits.tax.title',
          desc:  'appUpdate.benefits.tax.desc',
        },
        {
          icon: 'UsersIcon',
          title: 'appUpdate.benefits.customers.title',
          desc:  'appUpdate.benefits.customers.desc',
        },
        {
          icon: 'SmartphoneIcon',
          title: 'appUpdate.benefits.mobile.title',
          desc:  'appUpdate.benefits.mobile.desc',
        },
      ],
    }
  },

  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'authUser']),

    preferences() {
      return this.authUser?.preferences || null
    },

    tutorialResolved() {
      if (!this.preferences) return false
      return this.preferences.tutorialCompleted === true
        || this.preferences.tutorialOptedOut === true
    },

    serverLastSeenRelease() {
      return this.preferences?.lastSeenRelease ?? null
    },

    shouldShow() {
      if (!this.isAuthenticated) return false
      if (!this.preferences) return false
      if (!this.tutorialResolved) return false
      if (this.serverLastSeenRelease === this.releaseVersion) return false
      if (this.localCacheSeen()) return false
      return true
    },
  },

  watch: {
    shouldShow(val) {
      if (val) this.scheduleShow()
    },
  },

  created() {
    const { t } = useI18nUtils()
    this.t = t
  },

  mounted() {
    // b-modal can drop an initial v-model=true if it fires before its
    // own mounted lifecycle resolves. Flip after $nextTick so the show
    // signal is queued reliably whether we arrive via reload or HMR.
    this.$nextTick(() => {
      if (this.shouldShow) this.scheduleShow()
    })
  },

  methods: {
    localCacheSeen() {
      try {
        return window.localStorage.getItem(LOCAL_CACHE_KEY) === 'true'
      } catch (e) {
        return false
      }
    },

    scheduleShow() {
      setTimeout(() => {
        if (this.shouldShow) this.localShow = true
      }, 700)
    },

    markAsSeen() {
      this.localShow = false
      try { window.localStorage.setItem(LOCAL_CACHE_KEY, 'true') } catch (e) { /* ignore */ }
      profileService.updatePreferences({ lastSeenRelease: this.releaseVersion })
    },
  },
}
</script>

<style scoped>
.aum-root { display: flex; flex-direction: column; }

.aum-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
}
.aum-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(3, 102, 214, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0366d6;
  flex-shrink: 0;
}
.aum-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px;
  transition: color 0.12s;
  line-height: 1;
}
.aum-close:hover { color: #374151; }

.aum-body { padding: 1.25rem 1.5rem 0.5rem; }

.aum-eyebrow {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0366d6;
  margin-bottom: 0.4rem;
}
.aum-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  margin-bottom: 0.6rem;
}
.aum-desc {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.aum-section-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.aum-benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
}
.aum-benefits li {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f9fafb;
}
.aum-benefits li:last-child { border-bottom: none; }
.aum-benefit-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0366d6;
  flex-shrink: 0;
  margin-top: 1px;
}
.aum-benefits strong {
  display: block;
  font-size: 0.84rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}
.aum-benefit-desc {
  display: block;
  font-size: 0.78rem;
  color: #6b7280;
  line-height: 1.45;
}

.aum-footer {
  padding: 0.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.aum-cta {
  background-color: #0366d6 !important;
  border-color: #0366d6 !important;
  border-radius: 8px !important;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.65rem 1.5rem !important;
  box-shadow: 0 2px 10px rgba(3, 102, 214, 0.25);
  transition: opacity 0.15s, transform 0.12s;
}
.aum-cta:hover { opacity: 0.92; transform: translateY(-1px); }

:deep(.aum-dialog .modal-content) { border-radius: 14px; overflow: hidden; }
</style>
