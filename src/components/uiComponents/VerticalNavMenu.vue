<template>
  <div
    class="main-menu menu-fixed menu-accordion menu-shadow"
    :class="[
      { 'expanded': !isVerticalMenuCollapsed || (isVerticalMenuCollapsed && isMouseHovered) },
      skin === 'light'|| skin === 'bordered' ? 'menu-light' : 'menu-dark'
    ]"
    @mouseenter="updateMouseHovered(true)"
    @mouseleave="updateMouseHovered(false)"
  >
    <!-- main menu header-->
    <div class="navbar-header expanded">
      <slot
        name="header"
        :toggleVerticalMenuActive="toggleVerticalMenuActive"
        :toggleCollapsed="toggleCollapsed"
        :collapseTogglerIcon="collapseTogglerIcon"
      >
        <ul class="nav navbar-nav flex-row">

          <!-- Logo & Text -->
          <li class="nav-item mr-auto">
            <b-link
              class="navbar-brand"
              to="/"
            >
              <span class="brand-logo">
                <b-img
                  :src="appLogoImage"
                  alt="logo"
                />
              </span>
              <h2 class="brand-text">
                {{ appName }}
              </h2>
            </b-link>
          </li>

          <!-- Toggler Button -->
          <li class="nav-item nav-toggle">
            <b-link class="nav-link modern-nav-toggle">
              <base-feather-icon
                icon="XIcon"
                size="20"
                class="d-block d-xl-none"
                @click.prevent="toggleVerticalMenuActive"
              />
              <base-feather-icon
                :icon="collapseTogglerIconFeather"
                size="20"
                class="d-none d-xl-block collapse-toggle-icon"
                @click.prevent="toggleCollapsed"
              />
            </b-link>
          </li>
        </ul>
      </slot>
    </div>
    <!-- / main menu header-->

    <!-- Shadow -->
    <div
      :class="{'d-block': shallShadowBottom}"
      class="shadow-bottom"
    />

    <!-- main menu content-->
    <vue-perfect-scrollbar
      :settings="perfectScrollbarSettings"
      class="main-menu-content scroll-area"
      tagname="ul"
      @ps-scroll-y="evt => { shallShadowBottom = evt.srcElement.scrollTop > 0 }"
    >
      <vertical-nav-menu-items
        :items="navMenuItems"
        class="navigation navigation-main"
      />
    </vue-perfect-scrollbar>
    <!-- /main menu content-->
  </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { provide, computed, ref } from 'vue'
import useAppConfig from '@/appConfig/useAppConfig'
import { $themeConfig } from '@/themeConfig'
import VerticalNavMenuItems from './VerticalNavMenuItems.vue'
import useVerticalNavMenu from './js/useVerticalNavMenu'
import BaseFeatherIcon from './BaseFeatherIcon.vue'

export default {
  components: {
    VuePerfectScrollbar,
    VerticalNavMenuItems,
    BaseFeatherIcon,
  },
  props: {
    isVerticalMenuActive: {
      type: Boolean,
      required: true,
    },
    toggleVerticalMenuActive: {
      type: Function,
      required: true,
    },
    navMenuItems: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const {
      isMouseHovered,
      isVerticalMenuCollapsed,
      collapseTogglerIcon,
      toggleCollapsed,
      updateMouseHovered,
    } = useVerticalNavMenu(props)

    const { skin } = useAppConfig()

    // Shadow bottom is UI specific and can be removed by user => It's not in `useVerticalNavMenu`
    const shallShadowBottom = ref(false)

    provide('isMouseHovered', isMouseHovered)

    const perfectScrollbarSettings = {
      maxScrollbarLength:60,
      wheelPropagation: false,
    }
    // Option to close the Vertical
    const collapseTogglerIconFeather = computed(() => (collapseTogglerIcon.value === 'unpinned' ? 'CircleIcon' : 'MinusCircleIcon'))

    // App Name
    const { appName, appLogoImage } = $themeConfig.app
    
    return {
      perfectScrollbarSettings,
      isVerticalMenuCollapsed,
      collapseTogglerIcon,
      toggleCollapsed,
      isMouseHovered,
      updateMouseHovered,
      collapseTogglerIconFeather,
      shallShadowBottom,
      skin,
      appName,
      appLogoImage,
    }
  },
}
</script>

<style lang="scss">
@import "@/scss/base/core/menu/menu-types/vertical-menu.scss";
</style>