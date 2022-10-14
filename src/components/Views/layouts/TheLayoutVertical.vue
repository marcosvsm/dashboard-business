<template>
  <layout-vertical :nav-menu-items="navMenuItems">

    <router-view />

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
          icon: 'HomeIcon',
        },
        {
          title: 'Company',
          icon: 'BriefcaseIcon',
        },
        {
          title: 'Invoice',
          icon: 'FileTextIcon',
          children: [
            {
              title: 'List',
            },
            {
              title: 'Add',
            },
          ],
        },
      ],
    }
  },
}
</script>
