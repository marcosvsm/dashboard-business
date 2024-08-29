<template>
  <b-row align-h="center">
    <b-col cols="12" lg="4" sm="8">
      <div class="nav-wrapper position-relative end-0">
        <b-nav pills fill class="flex-row p-1" role="tablist">
          <b-nav-item
            v-for="(item, index) in subMenu"
            :key="index"
            :active="isActive(item.route)"
            @click="navigateTo(item.route)"
            class="nav-item"
          >
            {{ t(item.name) }}
          </b-nav-item>
        </b-nav>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
export default {
  props: {
    subMenu: {
      type: Array,
      required: true,
    },
  },
  methods: {
    isActive(routeName) {
      return this.$route.name === routeName;
    },
    navigateTo(routeName) {
      this.$router.push({ name: routeName });
    },
    t(name) { 
      const { t } = useI18nUtils();
      const translate = t(name);
      // Implement your translation function here
      return translate; // For example purposes
    },
  },
};
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-flatpicker.scss';

.nav-wrapper {
  .nav {
    display: flex;
    flex-wrap: nowrap;

    .nav-item {
      flex: 1;

      .nav-link {
        display: inline-block;
        padding: 0.5rem 1rem;
        margin: 5px;
        font-size: 1.2rem;
        color: #344767;
        border-radius: 0.25rem;
        text-decoration: none;
        transition: background-color 0.3s, color 0.3s;
        border-radius: 4px;
        text-align: center;
        box-shadow: none;

        &.active {
          background: white;
          color: #344767;
        }

        &:hover {
          background: white;
          color: #344767;
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .nav-link {
    padding: 0.3rem 0.6rem;
    font-size: 1.0rem;
  }
}
</style>
