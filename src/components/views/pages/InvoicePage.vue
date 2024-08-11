<template>
  <section>
    <sub-menu :subMenu="subMenu"></sub-menu>
    <router-view></router-view>
  </section>
</template>

<script>
import SubMenu from '@/components/uiComponents/SubMenu.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  components: {
    SubMenu,
  },
  data() {
    return {
      t: null,
      subMenu: [
        { name: 'Create Invoice', route: 'add-invoice' },
        { name: 'View Invoices', route: 'invoices' },
      ],
    };
  },
  created() {
    const { t } = useI18nUtils();
    this.t = t;
  },
};
</script>
