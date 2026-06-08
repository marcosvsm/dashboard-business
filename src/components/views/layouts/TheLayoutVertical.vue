<template>
  <div class="h-100">
    <layout-vertical :nav-menu-items="navMenuItems">

      <router-view/>

    </layout-vertical>

    <app-update-modal />
  </div>
</template>

<script>
//import $themeConfig from '@/themeConfig'
//import navMenuItems from '@/navigation/vertical'
import LayoutVertical from '@/components/uiComponents/LayoutVertical.vue'
import AppUpdateModal from '@/components/uiComponents/AppUpdateModal.vue'

export default {
  components: {
    LayoutVertical,
    AppUpdateModal,
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