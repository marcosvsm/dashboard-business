<template>
  <transition name="mobile-quick-nav">
    <nav
      v-if="visible"
      class="mobile-quick-nav"
      :aria-label="t('Mobile quick navigation')"
    >
      <div class="mobile-quick-nav__shell">
        <b-link
          v-for="item in leadingItems"
          :key="item.label"
          class="mobile-quick-nav__item"
          :class="{ 'is-active': isRouteActive(item) }"
          :to="item.to"
        >
          <span class="mobile-quick-nav__icon">
            <base-feather-icon
              :icon="item.icon"
              size="18"
            />
          </span>
          <span class="mobile-quick-nav__label">{{ item.label }}</span>
        </b-link>

        <b-link
          class="mobile-quick-nav__item mobile-quick-nav__item--cta"
          :class="{ 'is-active': isRouteActive(primaryAction) }"
          :to="primaryAction.to"
        >
          <span class="mobile-quick-nav__cta-icon">
            <base-feather-icon
              :icon="primaryAction.icon"
              size="20"
            />
          </span>
          <span class="mobile-quick-nav__label">{{ primaryAction.label }}</span>
        </b-link>

        <b-link
          v-for="item in trailingItems"
          :key="item.label"
          class="mobile-quick-nav__item"
          :class="{ 'is-active': isRouteActive(item) }"
          :to="item.to"
        >
          <span class="mobile-quick-nav__icon">
            <base-feather-icon
              :icon="item.icon"
              size="18"
            />
          </span>
          <span class="mobile-quick-nav__label">{{ item.label }}</span>
        </b-link>

        <button
          type="button"
          class="mobile-quick-nav__item"
          :class="{ 'is-active': moreSheetOpen }"
          @click="$emit('toggle-more')"
        >
          <span class="mobile-quick-nav__icon">
            <base-feather-icon
              icon="MoreHorizontalIcon"
              size="18"
            />
          </span>
          <span class="mobile-quick-nav__label">{{ t('More') }}</span>
        </button>
      </div>
    </nav>
  </transition>
</template>

<script>
import BaseFeatherIcon from './BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  components: {
    BaseFeatherIcon,
  },
  data() {
    const { t } = useI18nUtils()

    return {
      t,
    }
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    moreSheetOpen: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    leadingItems() {
      return [
        {
          label: this.t('Home'),
          icon: 'HomeIcon',
          to: { name: 'dashboard-overview' },
          activeRoutes: ['dashboard-overview'],
        },
        {
          label: this.t('Invoices'),
          icon: 'FileTextIcon',
          to: { name: 'invoices' },
          activeRoutes: ['invoices', 'invoice'],
        },
      ]
    },
    primaryAction() {
      return {
        label: this.t('New Invoice'),
        icon: 'PlusIcon',
        to: { name: 'add-invoice' },
        activeRoutes: ['add-invoice'],
      }
    },
    trailingItems() {
      return [
        {
          label: this.t('Clients'),
          icon: 'UsersIcon',
          to: { name: 'client-list' },
          activeRoutes: ['client-list', 'client'],
        },
      ]
    },
  },
  methods: {
    isRouteActive(item) {
      return item.activeRoutes.includes(this.$route.name)
    },
  },
}
</script>

<style scoped lang="scss">
.mobile-quick-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1015;
  padding: 0 0.95rem calc(0.95rem + constant(safe-area-inset-bottom));
  padding: 0 0.95rem calc(0.95rem + env(safe-area-inset-bottom));
  pointer-events: none;
}

.mobile-quick-nav__shell {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: end;
  gap: 0.35rem;
  max-width: 33rem;
  margin: 0 auto;
  padding: 0.75rem 0.7rem 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 1.65rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 38px rgba(31, 41, 55, 0.16);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  pointer-events: auto;
}

.mobile-quick-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.32rem;
  min-height: 3.6rem;
  padding: 0.35rem 0.2rem;
  border: 0;
  border-radius: 1.15rem;
  background: transparent;
  color: #5b6477;
  text-align: center;
  text-decoration: none;
  transition: transform 0.24s ease, background-color 0.24s ease, color 0.24s ease, box-shadow 0.24s ease;
}

.mobile-quick-nav__item:hover,
.mobile-quick-nav__item:focus {
  color: #1f2937;
  text-decoration: none;
}

.mobile-quick-nav__item:focus {
  outline: none;
}

.mobile-quick-nav__icon,
.mobile-quick-nav__cta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mobile-quick-nav__label {
  display: block;
  max-width: 100%;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: 0.01em;
  white-space: normal;
  word-break: keep-all;
}

.mobile-quick-nav__item.is-active {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.08);
}

.mobile-quick-nav__item--cta {
  position: relative;
  min-height: 4.9rem;
  margin-top: -1.75rem;
  color: #fff;
  border-radius: 1.35rem;
  background: linear-gradient(145deg, #2563eb, #1d4ed8);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.34);
}

.mobile-quick-nav__item--cta .mobile-quick-nav__cta-icon {
  width: 2.65rem;
  height: 2.65rem;
  margin-bottom: 0.05rem;
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.16);
}

.mobile-quick-nav__item--cta .mobile-quick-nav__label {
  max-width: 4.35rem;
  min-height: 1.45rem;
}

.mobile-quick-nav__item--cta.is-active {
  background: linear-gradient(145deg, #1d4ed8, #1e40af);
  color: #fff;
}

.mobile-quick-nav__item--cta:hover,
.mobile-quick-nav__item--cta:focus {
  color: #fff;
}

.mobile-quick-nav-enter-active,
.mobile-quick-nav-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.mobile-quick-nav-enter,
.mobile-quick-nav-leave-to {
  opacity: 0;
  transform: translateY(1.4rem);
}

@media (max-width: 420px) {
  .mobile-quick-nav__shell {
    gap: 0.2rem;
    padding-right: 0.55rem;
    padding-left: 0.55rem;
  }

  .mobile-quick-nav__item {
    min-height: 3.5rem;
  }

  .mobile-quick-nav__item--cta {
    min-height: 4.75rem;
  }

  .mobile-quick-nav__label {
    font-size: 0.64rem;
  }

  .mobile-quick-nav__item--cta .mobile-quick-nav__label {
    max-width: 4rem;
  }
}
</style>
