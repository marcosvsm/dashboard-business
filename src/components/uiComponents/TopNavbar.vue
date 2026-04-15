<template>
  <div
    class="navbar-container d-flex content align-items-center"
    :class="{ 'mobile-navbar-compact': isCompactMobile }"
  >
    <div class="d-flex align-items-center flex-grow-1">
      <!-- Nav Menu Toggler -->
      <ul class="nav navbar-nav d-xl-none">
        <li class="nav-item">
          <b-link
            class="nav-link"
            @click="toggleVerticalMenuActive"
          >
            <base-feather-icon
              icon="MenuIcon"
              size="21"
            />
          </b-link>
        </li>
      </ul>

      <div
        v-if="isCompactMobile"
        class="mobile-navbar__context d-xl-none"
      >
        <p class="mobile-navbar__eyebrow mb-0">
          {{ t('Simplify Business') }}
        </p>
        <span class="mobile-navbar__title">{{ mobileRouteTitle }}</span>
      </div>

      <!-- Left Col -->
      <div
        class="bookmark-wrapper align-items-center flex-grow-1 d-none d-lg-flex"
        :class="{ 'd-lg-none': isCompactMobile }"
      >

        <!-- Bookmarks Container -->
      
      </div>
    </div>

    <b-navbar-nav
      v-if="!isCompactMobile"
      class="nav align-items-center ml-auto"
    >
      <locale />
      <user-dropdown />
    </b-navbar-nav>
  </div>
</template>
<script>
import UserDropdown from './TopNavbarUserDropdown.vue'
import Locale from './Locale.vue'
import BaseFeatherIcon from './BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  components:{
    UserDropdown,
    Locale,
    BaseFeatherIcon,
  },
  data() {
    const { t } = useI18nUtils()

    return {
      t,
    }
  },
  props: {
    toggleVerticalMenuActive: {
      type: Function,
      default: () => {},
    },
    isCompactMobile: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    mobileRouteTitle() {
      const routeTitles = {
        'dashboard-overview': 'Home',
        invoices: 'Invoices',
        invoice: 'Invoices',
        'add-invoice': 'New Invoice',
        'client-list': 'Clients',
        client: 'Clients',
        companies: 'Company',
        profile: 'Profile',
        'tax-calculator': 'Tax Calculator',
        help: 'Help',
        faq: 'FAQ',
      }

      return this.t(routeTitles[this.$route.name] || 'Overview')
    },
  }
}
</script>
<style scoped lang="scss">
.mobile-navbar-compact {
  min-height: 3.75rem;
  padding-top: 0.55rem;
  padding-bottom: 0.55rem;
}

.mobile-navbar__context {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
}

.mobile-navbar__eyebrow {
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.mobile-navbar__title {
  color: #0f172a;
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.2;
}
</style>
