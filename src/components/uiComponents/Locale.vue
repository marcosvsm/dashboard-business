<template>
  <b-nav-item-dropdown
    id="dropdown-grouped"
    variant="link"
    class="dropdown-language"
    right
  >
    <template #button-content>
      <b-img
        :src="currentLocale.img"
        height="14px"
        width="22px"
        :alt="currentLocale.locale"
      />
      <span class="ml-50 text-body">{{ currentLocale.name }}</span>
    </template>
    <b-dropdown-item
      v-for="localeObj in locales"
      :key="localeObj.locale"
      @click="changeLocale(localeObj.locale)"
    >
      <b-img
        :src="localeObj.img"
        height="14px"
        width="22px"
        :alt="localeObj.locale"
      />
      <span class="ml-50">{{ localeObj.name }}</span>
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>

export default {
  data() {
    return {
      locales: [
        {
          locale: 'en',
          img: require('@/assets/img/flags/aus.png'),
          name: 'English',
        },
        {
          locale: 'es',
          img: require('@/assets/img/flags/es.png'),
          name: 'Spanish',
        },
        {
          locale: 'pt-br',
          img: require('@/assets/img/flags/pt-br.png'),
          name: 'Portuguese',
        },
      ]
    };
  },
  mounted() {
    // Load selected locale from localStorage on component mount
    if (localStorage.getItem('selectedLocale')) {
      this.$i18n.locale = localStorage.getItem('selectedLocale');
    }
  },
  methods: {
    changeLocale(locale) {
      // Set locale in Vue-i18n
      this.$i18n.locale = locale;
      // Save selected locale in localStorage
      localStorage.setItem('selectedLocale', locale);
    }
  },
  computed: {
    currentLocale() {
      return this.locales.find(l => l.locale === this.$i18n.locale) || this.locales[0];
    }
  }
};
</script>

<style>

</style>
