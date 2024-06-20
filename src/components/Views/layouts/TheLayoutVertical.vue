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
          header: 'Apps & Pages',
        },
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
            title: 'Overview',
            route: {
              name: 'companies'
            }
            },
            {
            title: 'Create Business',
            route: {
              name: 'company'
            }
            },
          ],
        },
        {
          title: 'Invoice',
          icon: 'FileTextIcon',
          children: [
            {
              title: 'Overview',
              route: {
                name: 'invoices'
              }
            },
            {
              title: 'Create Invoice',
              route: {
                name: 'invoice-add'
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