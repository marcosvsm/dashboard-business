<template>
  <section class="help-section">
    <div class="header">
      <h4>{{ t('Help Center') }}</h4>
      <p>{{ t('Find answers to your questions or get in touch with our support team.') }}</p>
    </div>

    <div class="search-bar">
      <b-form-input
        v-model="searchQuery"
        :placeholder="t('Search for help topics...')"
        class="mb-3"
      />
    </div>

    <b-row>
      <b-col cols="12" lg="6">
        <h5>{{ t('Quick Links') }}</h5>
        <b-list-group class="mb-4">
          <b-list-group-item
            v-for="(link, index) in localizedQuickLinks"
            :key="index"
            :href="link.url"
            class="quick-link"
          >
            {{ link.title }}
          </b-list-group-item>
        </b-list-group>
      </b-col>

      <b-col cols="12" lg="6">
        <h5>{{ t('Popular Topics') }}</h5>
        <div class="accordion" role="tablist">
          <b-card no-body class="mb-1" v-for="(topic, index) in filteredTopicsLocalized" :key="index">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle="'help-topic-'+index" class="custom-variant">
                {{ t(topic.question) }}
              </b-button>
            </b-card-header>
            <b-collapse :id="'help-topic-'+index" accordion="help-accordion" role="tabpanel">
              <b-card-body>
                <b-card-text>{{ t(topic.answer) }}</b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
      </b-col>
    </b-row>

    <b-row class="mt-4">
      <b-col cols="12">
        <h5>{{ t('Contact Support') }}</h5>
        <p>support@simplifybusiness.com.au</p>

        <!-- If you re-enable the form later, just wrap labels/placeholders with t('...') -->
      </b-col>
    </b-row>
  </section>
</template>

<script>
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import { ref, computed } from 'vue'
import ValidationError from "@/components/uiComponents/ValidationError"
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'

export default {
  components: { ValidationError, BaseFeatherIcon },

  setup() {
    const { t } = useI18nUtils()                 // ✅ now inside instance

    // --- state you want reactive in setup (you can mix with data() if you prefer) ---
    const searchQuery = ref('')

    // EN source arrays (can also keep these in data(); here for completeness)
    const quickLinks = ref([
      { title: 'View FAQ', url: '/faq' },
      { title: 'Create an Invoice', url: '/invoice/create' },
      { title: 'View Invoices', url: '/invoice/list' },
      { title: 'Manage Clients', url: '/client/list' },
      { title: 'Tax Calculator', url: '/tax/calculator' },
    ])

    const helpTopics = ref([
      { question: 'How do I reset my password?', answer: 'Go to the login page and click "Forgot Password". Enter your email address, and you’ll receive a link to reset your password.' },
      { question: 'How can I update my account details?', answer: 'Navigate to the Profile section, and update your details such as name.' },
      { question: 'What payment methods are supported for invoices?', answer: 'You can add PayID or bank transfer as payment methods in the Invoice Settings. PayID details can be saved for reuse, while bank transfer details must be entered each time. Clients will see these options when paying.' },
      { question: 'How do I export my invoice data?', answer: 'In the Invoices section, select an invoice and click "Download" to export it as a PDF. Invoices are exported individually, not as a bundle.' },
    ])

    const localizeTopic = (topic) => ({
      question: t(topic.question),
      answer: t(topic.answer),
    })

    const localizedQuickLinks = computed(() =>
      quickLinks.value.map(l => ({ ...l, title: t(l.title) }))
    )

    const filteredTopicsLocalized = computed(() => {
      const q = (searchQuery.value || '').toLowerCase()
      const all = helpTopics.value.map(localizeTopic)
      if (!q) return all
      return all.filter(it =>
        it.question.toLowerCase().includes(q) ||
        it.answer.toLowerCase().includes(q)
      )
    })

    return {
      // expose to template
      t,
      searchQuery,
      localizedQuickLinks,
      filteredTopicsLocalized,
    }
  },
}
</script>


<style scoped>
.help-section { padding: 20px; max-width: 1200px; margin: 0 auto; }
.header { text-align: center; margin-bottom: 20px; }
.header h4 { font-size: 1.8rem; font-weight: bold; color: #333; }
.header p { color: #666; }
.search-bar { max-width: 600px; margin: 0 auto 30px; }
.custom-variant { background-color: #007eca !important; color: white; border-color: #007eca !important; }
.custom-variant:hover, .custom-variant:focus { background-color: #0066a1 !important; border-color: #0066a1 !important; }
.quick-link { transition: background-color 0.2s; }
.quick-link:hover { background-color: #f0f8ff; }
</style>
