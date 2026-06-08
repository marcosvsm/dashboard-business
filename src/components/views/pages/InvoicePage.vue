<template>
  <section class="invoice-page-shell">
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

    <div class="invoice-page-tabs-wrap">
      <div class="invoice-page-tabs" role="tablist" :aria-label="t('Invoice navigation')">
        <router-link
          v-for="item in subMenu"
          :key="item.route"
          :to="{ name: item.route }"
          :class="['invoice-page-tab', { 'invoice-page-tab--active': isActiveTab(item.route) }]"
          role="tab"
          :aria-selected="isActiveTab(item.route) ? 'true' : 'false'"
        >
          {{ t(item.name) }}
        </router-link>
      </div>
    </div>

    <router-view></router-view>
  </section>
</template>

<script>
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
export default {
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
  methods: {
    isActiveTab(routeName) {
      if (routeName === 'invoices') {
        return this.$route.name === routeName || this.$route.name === 'invoice'
      }

      return this.$route.name === routeName
    },
  },
};
</script>

<style scoped>
.invoice-page-shell {
  padding-bottom: 1rem;
}

.invoice-page-tabs-wrap {
  display: flex;
  justify-content: center;
  margin: 1rem 0 1.25rem;
}

.invoice-page-tabs {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: min(100%, 30rem);
  padding: 0.25rem;
  border: 1px solid #ebe9f1;
  border-radius: 0.428rem;
  background: #f8f8fb;
  box-shadow: 0 4px 18px 0 rgba(34, 41, 47, 0.06);
}

.invoice-page-tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0.55rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  color: #6e6b7b;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, transform 0.15s ease-in-out;
}

.invoice-page-tab:hover {
  background: #fff;
  color: rgba(38, 43, 67, 0.9);
  text-decoration: none;
}

.invoice-page-tab--active {
  border-color: rgba(3, 102, 214, 0.28);
  background: #fff;
  color: #0366d6;
  box-shadow: 0 4px 12px 0 rgba(34, 41, 47, 0.1);
}

@media (max-width: 575.98px) {
  .invoice-page-tabs-wrap {
    margin-top: 0.75rem;
  }

  .invoice-page-tabs {
    width: 100%;
  }

  .invoice-page-tab {
    min-height: 2.5rem;
    padding: 0.5rem 0.65rem;
    font-size: 0.88rem;
  }
}
</style>
