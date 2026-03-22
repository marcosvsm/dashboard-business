<template>
  <div>
    <!-- The visible navbar item (clickable area) -->
    <b-nav-item
      href="#"
      class="dropdown-language nav-link-language"
      id="nav-link-language"
      @click.prevent="openLanguageModal"
      data-tour-target="language-selector"
    >
      <b-img
        :src="currentLocale.img"
        height="14px"
        width="22px"
        :alt="currentLocale.name"
        class="d-inline-block"
      />
      <span class="ml-50 text-body">{{ currentLocale.name }}</span>
    </b-nav-item>

    <!-- Centered Modal for language selection -->
    <b-modal
      id="language-modal"
      v-model="showLanguageModal"
      centered
      hide-header-close
      no-close-on-backdrop
      no-close-on-esc
      size="sm"
      title="Select Language"
      ok-only
      ok-title="Close"
      @ok="onModalClose"
    >
      <div class="language-modal-content py-3">
        <b-button
          v-for="localeObj in locales"
          :key="localeObj.locale"
          variant="outline-secondary"
          block
          class="mb-3 language-btn"
          :class="{ 'active-language': $i18n.locale === localeObj.locale }"
          @click="changeLocale(localeObj.locale)"
        >
          <b-img
            :src="localeObj.img"
            height="18px"
            width="28px"
            class="mr-3"
            :alt="localeObj.name"
          />
          <span class="font-weight-bold">{{ localeObj.name }}</span>
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import driverObj from '@/utils/tour'
export default {
  data() {
    return {
      showLanguageModal: false,
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
      ],
    };
  },

  mounted() {
    // Restore saved language preference
    const savedLocale = localStorage.getItem('selectedLocale');
    if (savedLocale) {
      this.$i18n.locale = savedLocale;
    }
  },

  computed: {
    currentLocale() {
      return (
        this.locales.find((l) => l.locale === this.$i18n.locale) ||
        this.locales[0]
      );
    },
  },

  methods: {
    openLanguageModal() {
      this.showLanguageModal = true;
    },

    changeLocale(locale) {
      this.$i18n.locale = locale;
      localStorage.setItem('selectedLocale', locale);
      // Optional: close modal after selection
      this.showLanguageModal = false;
      
      // If tour is active → tell the tour we selected a language
      if (driverObj && driverObj.hasNextStep?.()) {
        setTimeout(() => {
          driverObj.moveNext()
        }, 500) 
      }
    },

    onModalClose() {
      // Just close modal – no action needed
      this.showLanguageModal = false;
    },
  },
};
</script>

<style scoped>
/* Navbar language indicator */
.nav-link-language {
  padding: 0.5rem 0.75rem !important;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-link-language:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

/* Modal content styling */
.language-modal-content {
  max-width: 320px;
  margin: 0 auto;
}

.language-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 52px;
  font-size: 1.05rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.language-btn:hover {
  background-color: rgba(115, 103, 240, 0.08) !important;
  border-color: #7367f0 !important;
}

.language-btn.active-language {
  background-color: rgba(115, 103, 240, 0.12) !important;
  border-color: #7367f0 !important;
  font-weight: 600;
  color: #7367f0;
}

.language-btn img {
  border-radius: 3px;
}
</style>