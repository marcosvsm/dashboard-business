<template>
  <layout-vertical :nav-menu-items="navMenuItems">

    <router-view/>

  </layout-vertical>
</template>

<script>
//import $themeConfig from '@/themeConfig'
//import navMenuItems from '@/navigation/vertical'
import LayoutVertical from '@/components/uiComponents/LayoutVertical.vue'

export default {
  components: {
    LayoutVertical,
  },
  data() {
    return {
      navMenuItems: [
        {
          title: 'Dashboard',
          route: 'dashboard-overview',
          icon: 'HomeIcon',
        },
        {
          title: 'My Business',
          icon: 'BriefcaseIcon',
          children: [
            {
            title: 'Business',
            route: {
              name: 'companies'
            }
            },
            {
              title: 'Client',
              route: {
                name: 'client-list'
              },
            },
          ],
        },
        {
          title: 'Finance',
          icon: 'FileTextIcon',
          children: [
            {
              title: 'Invoice',
              route: {
                name: 'add-invoice'
              }
            },
            {
              title: 'Tax Calculator',
              route:{
                name: 'tax-calculator'
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
<style lang="scss">
@import '~@/scss/vue/libs/vue-flatpicker.scss';

</style>