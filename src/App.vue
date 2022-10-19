<template>
   <div
    id="app"
    class="h-100"
    :class="[skinClasses]"
  >
    <component :is="layout">
      <router-view/>
    </component>
  </div>
</template>

<script>
// This will be populated in `beforeCreate` hook
//import $themeConfig  from '@/themeConfig'
import { watch } from 'vue'
import useAppConfig from '@/appConfig/useAppConfig' 
import LayoutVertical from '@/components/views/layouts/TheLayoutVertical.vue'
import LayoutFull from '@/components/views/layouts/TheLayoutFull.vue'

import { useWindowSize } from '@vueuse/core'

import store from '@/store'


export default {
  components: {
    LayoutVertical,
    LayoutFull,
  },
  computed: {
    layout() {
      if (this.$route.meta.layout === 'full') return 'layout-full'
      return `layout-${this.contentLayoutType}`
    },
    contentLayoutType() {
      return this.$store.state.appConfig.layout.type
    },
  },
  beforeCreate() {
    
    // Set RTL
    const { isRTL } = false
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
  },
  setup() {
    const { skin, skinClasses } = useAppConfig()
    const { enableScrollToTop } = false

    // If skin is dark when initialized => Add class to body
    if (skin.value === 'dark') document.body.classList.add('dark-layout')

    // Set Window Width in store
    store.commit('app/UPDATE_WINDOW_WIDTH', window.innerWidth)
    const { width: windowWidth } = useWindowSize()
    watch(windowWidth, val => {
      store.commit('app/UPDATE_WINDOW_WIDTH', val)
    })
    

    return {
      skinClasses,
      enableScrollToTop,
    }
  },
}
</script>
