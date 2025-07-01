<template>
  <section>
    <div>
      <nav aria-label="breadcrumb">
        <ol class="px-0 pt-1 mb-0 mb-0 bg-transparent breadcrumb me-sm-6">
          <li class="text-sm breadcrumb-item">
            <router-link :to="{ name: 'invoices'}">{{ t("Invoice") }}</router-link>
          </li>
          <li class="text-sm breadcrumb-item active" aria-current="page">{{currentPath === 'list' ? t('List') : currentPath === 'create' ? t('Create') : currentPath.length > 0 ? t('Overview') :'' }}</li>
        </ol>
      </nav>
    </div>
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
  computed:{
    currentPath(){
      const route = this.$route.path;
      const actual = route.split('/invoice/');
      return actual.pop('');
    },
  },
};
</script>
