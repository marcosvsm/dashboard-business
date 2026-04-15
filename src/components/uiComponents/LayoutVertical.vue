<template>
  <div
    class="vertical-layout h-100"
    :class="[layoutClasses, mobileLayoutClasses]"
    :data-col="isNavMenuHidden ? '1-column' : null"
  >
    <!-- TopNavbar -->
    <b-navbar
      :toggleable="false"
      :variant="navbarBackgroundColor"
      class="header-navbar navbar navbar-shadow align-items-center"
      :class="[
        navbarTypeClass,
        {
          'mobile-header-compact': isCompactMobileHeader,
          'header--hidden': !isHeaderVisible,
        },
      ]"
    >
      <slot
        name="navbar"
        :toggleVerticalMenuActive="toggleVerticalMenuActive"
        :navbarBackgroundColor="navbarBackgroundColor"
        :navbarTypeClass="[...navbarTypeClass, 'header-navbar navbar navbar-shadow align-items-center']"
      >
        <top-navbar
          :toggle-vertical-menu-active="toggleVerticalMenuActive"
          :is-compact-mobile="isCompactMobileHeader"
        />
      </slot>
    </b-navbar>
    <!--/ TopNavbar -->

     <!-- Vertical Nav Menu -->
    <vertical-nav-menu
      v-if="!isNavMenuHidden"
      :is-vertical-menu-active="isVerticalMenuActive"
      :toggle-vertical-menu-active="toggleVerticalMenuActive"
      :nav-menu-items="navMenuItems"
    >
      <template #header="slotProps">
        <slot
          name="vertical-menu-header"
          v-bind="slotProps"
        />
      </template>
    </vertical-nav-menu>
    <!-- /Vertical Nav Menu -->

    <!-- Vertical Menu Overlay -->
    <div
      class="sidenav-overlay"
      :class="overlayClasses"
      @click="isVerticalMenuActive = false"
    />
    <!-- /Vertical Menu Overlay -->
    
    <!-- Content -->
    
     <!-- CONTENT TYPE: Left -->
    <transition
      :name="routerTransition"
      mode="out-in"
    >
      <component
        :is="layoutContentRenderer"
        :key="layoutContentRenderer === 'layout-content-renderer-left' ? $route.meta.navActiveLink || $route.name : null"
      >
        <template
          v-for="(index, name) in $scopedSlots"
          v-slot:[name]="data"
        >
          <slot
            :name="name"
            v-bind="data"
          />
        </template>
      </component>
    </transition>
    <!--/ Content -->

    <mobile-more-sheet
      v-model="isMobileMoreSheetOpen"
      :items="mobileMoreSheetItems"
      @navigate="handleMobileMoreNavigation"
      @logout="handleMobileMoreLogout"
    />

    <mobile-quick-nav
      :visible="isMobileDockVisible"
      :more-sheet-open="isMobileMoreSheetOpen"
      @toggle-more="toggleMobileMoreSheet"
    />

  </div>
</template>
<script>
import { onUnmounted } from 'vue'
import TopNavbar from "./TopNavbar.vue"
import MobileMoreSheet from './MobileMoreSheet.vue'
import MobileQuickNav from './MobileQuickNav.vue'
import useAppConfig from '@/appConfig/useAppConfig'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import layoutContentRendererDefault from './LayoutContentRendererDefault.vue'
import layoutContentRendererLeft from './LayoutContentRendererLeft.vue'
import layoutContentRendererLeftDetached from './LayoutContentRendererLeftDetached.vue'
import VerticalNavMenu from './VerticalNavMenu.vue'
import useVerticalLayout from './js/useVerticalLayout'
import mixinVerticalLayout from './js/mixinVerticalLayout'
import mobileDockLayout from '@/mixins/mobileDockLayout'
export default {
  components: {
    VerticalNavMenu,
    TopNavbar,
    MobileMoreSheet,
    MobileQuickNav,
    layoutContentRendererDefault,
    layoutContentRendererLeft,
    layoutContentRendererLeftDetached
  },
  mixins: [mixinVerticalLayout, mobileDockLayout],
  props: {
    navMenuItems: {
      type: Array,
      required: true,
    },
  },
  computed: {
    layoutContentRenderer() {
      const rendererType = this.$route.meta.contentRenderer
      if (rendererType === 'sidebar-left') return 'layout-content-renderer-left'
      if (rendererType === 'sidebar-left-detached') return 'layout-content-renderer-left-detached'
      return 'layout-content-renderer-default'
    },
    mobileLayoutClasses() {
      return {
        'mobile-quick-nav-enabled': this.canRenderMobileDock,
        'mobile-quick-nav-visible': this.isMobileDockVisible,
        'mobile-header-hidden': !this.isHeaderVisible,
        'mobile-more-sheet-open': this.isMobileMoreSheetOpen,
      }
    },
    mobileMoreSheetItems() {
      return [
        {
          label: this.t('Tax Calculator'),
          description: this.t('Review GST and tax estimate tools'),
          icon: 'TabletIcon',
          route: 'tax-calculator',
        },
        {
          label: this.t('Company'),
          description: this.t('Manage your business details'),
          icon: 'BriefcaseIcon',
          route: 'companies',
        },
        {
          label: this.t('Profile'),
          description: this.t('Update your account and preferences'),
          icon: 'UserIcon',
          route: 'profile',
        },
        {
          label: this.t('Help'),
          description: this.t('Find guides and support resources'),
          icon: 'InfoIcon',
          route: 'help',
        },
        {
          label: this.t('FAQ'),
          description: this.t('See common answers and product tips'),
          icon: 'HelpCircleIcon',
          route: 'faq',
        },
        {
          label: this.t('Logout'),
          description: this.t('End your current session securely'),
          icon: 'LogOutIcon',
          isLogout: true,
        },
      ]
    },
  },
  methods: {
    async handleMobileMoreLogout() {
      this.closeMobileMoreSheet()
      await this.$store.dispatch('auth/logout')
      this.$router.push({ name: 'login' }).catch(() => {})
    },
    handleMobileMoreNavigation(item) {
      if (!item || !item.route) return

      this.closeMobileMoreSheet()
      this.$router.push({ name: item.route }).catch(() => {})
    },
  },
  setup() {
    const { t } = useI18nUtils()

    //Option to change the website theme
    const {
      routerTransition, navbarBackgroundColor, navbarType, footerType, isNavMenuHidden,
    } = useAppConfig()

    const {
      isVerticalMenuActive,
      toggleVerticalMenuActive,
      isVerticalMenuCollapsed,
      layoutClasses,
      overlayClasses,
      resizeHandler,
      navbarTypeClass,
      footerTypeClass,
    } = useVerticalLayout(navbarType, footerType)

    // Resize handler
    resizeHandler()
    window.addEventListener('resize', resizeHandler)
    onUnmounted(() => {
      window.removeEventListener('resize', resizeHandler)
    })

    return {
      isVerticalMenuActive,
      toggleVerticalMenuActive,
      isVerticalMenuCollapsed,
      overlayClasses,
      layoutClasses,
      navbarTypeClass,
      footerTypeClass,

      // App Config
      routerTransition,
      navbarBackgroundColor,
      isNavMenuHidden,
      t,
    }
  }
}
</script>
<style lang="scss">
@import "~@/scss/base/themes/bordered-layout.scss";

body.mobile-more-sheet-open {
  overflow: hidden;
}

@media (max-width: 991.98px) {
  .vertical-layout.mobile-quick-nav-enabled {
    .app-content {
      padding-bottom: calc(6.75rem + constant(safe-area-inset-bottom));
      padding-bottom: calc(6.75rem + env(safe-area-inset-bottom));
    }
  }

  .vertical-layout.mobile-quick-nav-enabled .header-navbar {
    will-change: transform, opacity;
    transition: transform 0.28s ease, box-shadow 0.28s ease, background-color 0.28s ease;
  }

  .vertical-layout.mobile-quick-nav-enabled .header-navbar.mobile-header-compact {
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .vertical-layout.mobile-quick-nav-enabled .header-navbar.header--hidden {
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
  }

  .vertical-layout.mobile-quick-nav-enabled.mobile-header-hidden .header-navbar-shadow {
    opacity: 0;
    transform: translateY(-100%);
    pointer-events: none;
    transition: transform 0.28s ease, opacity 0.2s ease;
  }
}
</style>
