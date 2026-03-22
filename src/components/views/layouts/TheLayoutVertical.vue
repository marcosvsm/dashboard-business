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
          tourId: 'nav-dashboard',
        },
        {
          title: 'My Business',
          icon: 'BriefcaseIcon',
          tourId: 'nav-my-business',
          children: [
            {
            title: 'Business',
            tourId: 'nav-business',
            route: {
              name: 'companies'
            }
            },
            {
              title: 'Client',
              tourId: 'nav-clients',
              route: {
                name: 'client-list'
              },
            },
          ],
        },
        {
          title: 'Finance',
          icon: 'FileTextIcon',
          tourId: 'nav-finance',
          children: [
            {
              title: 'Invoice',
              tourId: 'nav-invoice',
              route: {
                name: 'add-invoice'
              }
            },
            {
              title: 'Tax Calculator',
              tourId: 'nav-tax',
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