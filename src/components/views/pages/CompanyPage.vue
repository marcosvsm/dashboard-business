<template>
  <section>
    <div>
      <nav aria-label="breadcrumb">
        <ol class="px-0 pt-1 mb-0 mb-0 bg-transparent breadcrumb me-sm-6">
          <li class="text-sm breadcrumb-item">
            <router-link :to="{ name: 'invoices'}">{{ t("My Business") }}</router-link>
          </li>
          <li class="text-sm breadcrumb-item active" aria-current="page">{{currentPath === 'list' ? t('Business') : currentPath === 'add' ? t('Add My Business') : '' }}</li>
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
        { name: 'Business', route: 'companies' },
        { name: 'Add My Business', route: 'addCompany' },
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
      const actual = route.split('/company/');
      return actual.pop('');
    },
  },
};
</script>
