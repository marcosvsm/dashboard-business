<template>
  <div
    class="vertical-layout h-100"
    :class="[layoutClasses]"
    :data-col="isNavMenuHidden ? '1-column' : null"
  >
    <!-- TopNavbar -->
    <b-navbar
      :toggleable="false"
      :variant="navbarBackgroundColor"
      class="header-navbar navbar navbar-shadow align-items-center"
      :class="[navbarTypeClass]"
    >
      <slot
        name="navbar"
        :toggleVerticalMenuActive="toggleVerticalMenuActive"
        :navbarBackgroundColor="navbarBackgroundColor"
        :navbarTypeClass="[...navbarTypeClass, 'header-navbar navbar navbar-shadow align-items-center']"
      >
        <top-navbar :toggle-vertical-menu-active="toggleVerticalMenuActive" />
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

  </div>
</template>
<script>
import { onUnmounted } from 'vue'
import TopNavbar from "./TopNavbar.vue"
import useAppConfig from '@/appConfig/useAppConfig'
import layoutContentRendererDefault from './LayoutContentRendererDefault.vue'
import layoutContentRendererLeft from './LayoutContentRendererLeft.vue'
import layoutContentRendererLeftDetached from './LayoutContentRendererLeftDetached.vue'
import VerticalNavMenu from './VerticalNavMenu.vue'
import useVerticalLayout from './js/useVerticalLayout'
import mixinVerticalLayout from './js/mixinVerticalLayout'
export default {
  components: {
    VerticalNavMenu,
    TopNavbar,
    layoutContentRendererDefault,
    layoutContentRendererLeft,
    layoutContentRendererLeftDetached
  },
  mixins: [mixinVerticalLayout],
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
  },
  setup() {
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
    }
  }
}
</script>
<style>
.sidenav-overlay{
  position: fixed;
  top: 0;
  height: 120vh;
  z-index: 997;
  display: block;
  visibility: hidden;
  opacity: 0;
  -webkit-transition: all .5s ease;
  transition: all .5s ease;
}
#body-row {
    margin-left:0;
    margin-right:0;
}
.show{
  opacity: 1;
  visibility: visible;
  -webkit-transition: all .5s ease;
  transition: all .5s ease;
}
</style>