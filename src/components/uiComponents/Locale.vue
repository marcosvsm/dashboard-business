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
      no-close-on-esc
      size="sm"
      hide-footer
      modal-class="language-modal"
    >
      <template #modal-header>
        <div class="language-modal-header w-100 text-center">
          <h4 class="mb-25">Select your language</h4>
          <p class="text-muted mb-0 small">Choose the language you understand best</p>
        </div>
      </template>
      <div class="language-modal-content py-2">
        <button
          v-for="localeObj in locales"
          :key="localeObj.locale"
          type="button"
          class="language-btn"
          :class="{ 'active-language': $i18n.locale === localeObj.locale }"
          @click="changeLocale(localeObj.locale)"
        >
          <b-img
            :src="localeObj.img"
            height="24px"
            width="36px"
            class="language-flag mr-1"
            :alt="localeObj.name"
          />
          <div class="language-label text-left flex-grow-1">
            <div class="native-name">{{ localeObj.native }}</div>
            <div class="text-muted english-name">{{ localeObj.name }}</div>
          </div>
          <base-feather-icon
            v-if="$i18n.locale === localeObj.locale"
            icon="CheckIcon"
            size="20"
            class="text-primary check-icon"
          />
        </button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import driverObj from '@/utils/tour'
import profileService from '@/store/services/profile-service'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'

export default {
  components: {
    BaseFeatherIcon,
  },
  data() {
    return {
      showLanguageModal: false,
      locales: [
        {
          locale: 'en',
          img: require('@/assets/img/flags/aus.png'),
          name: 'English',
          native: 'English',
        },
        {
          locale: 'es',
          img: require('@/assets/img/flags/es.png'),
          name: 'Spanish',
          native: 'Español',
        },
        {
          locale: 'pt-br',
          img: require('@/assets/img/flags/pt-br.png'),
          name: 'Portuguese',
          native: 'Português',
        },
      ],
    };
  },

  async mounted() {
    const user =  await this.$store.getters['auth/authUser'] ?? this.$store.getters['users/user']
    // Restore saved language preference
    this.$i18n.locale = user.preferences?.language || 'en';
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
      this.showLanguageModal = false;

      profileService.updatePreferences({ language: locale })

      // If tour is active → tell the tour we selected a language
      if (driverObj && driverObj.hasNextStep?.()) {
        setTimeout(() => driverObj.moveNext(), 500)
      }
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

/* Modal header */
.language-modal-header {
  padding: 0.25rem 0;
}

.language-modal-header h4 {
  color: rgb(3, 102, 214) !important;
  font-weight: 500;
  text-transform: uppercase;
}

/* Modal content styling */
.language-modal-content {
  max-width: 340px;
  margin: 0 auto;
}

.language-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.65rem 0.85rem;
  margin-bottom: 0.5rem;
  background-color: transparent;
  border: 1px solid #ebe9f1;
  border-radius: 0.358rem;
  cursor: pointer;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  text-align: left;
}

.language-btn:last-child {
  margin-bottom: 0;
}

.language-btn:hover {
  background-color: #eef5ff;
  border-color: #eef5ff;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, background 0s, border 0s;
  
}

.language-btn:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(3, 102, 214, 0.12);
}

.language-btn.active-language {
  background-color: #0366d6;
  border-color: #0366d6;
}

.language-btn.active-language .native-name {
  color: #FFF;
  font-weight: 600;
}

.language-btn.active-language .english-name {
  color: #FFF !important;
}

.language-flag {
  border-radius: 3px;
  object-fit: cover;
  flex-shrink: 0;
}

.language-label .native-name {
  line-height: 1.2;
}

.language-label .english-name {
  font-size: 0.95rem;
  line-height: 1.2;
  margin-top: 2px;
}

.check-icon {
  flex-shrink: 0;
  margin-left: 0.5rem;
}
</style>