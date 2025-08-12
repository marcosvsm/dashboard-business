<template>
  <section class="help-section">
    <div class="header">
      <h4>Help Center</h4>
      <p>Find answers to your questions or get in touch with our support team.</p>
    </div>
    <div class="search-bar">
      <b-form-input
        v-model="searchQuery"
        placeholder="Search for help topics..."
        class="mb-3"
        @input="filterTopics"
      ></b-form-input>
    </div>
    <b-row>
      <b-col cols="12" lg="6">
        <h5>Quick Links</h5>
        <b-list-group class="mb-4">
          <b-list-group-item
            v-for="(link, index) in quickLinks"
            :key="index"
            :href="link.url"
            class="quick-link"
          >
            {{ link.title }}
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col cols="12" lg="6">
        <h5>Popular Topics</h5>
        <div class="accordion" role="tablist">
          <b-card no-body class="mb-1" v-for="(topic, index) in filteredTopics" :key="index">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle="'help-topic-'+index" class="custom-variant">
                {{ topic.question }}
              </b-button>
            </b-card-header>
            <b-collapse :id="'help-topic-'+index" accordion="help-accordion" role="tabpanel">
              <b-card-body>
                <b-card-text>{{ topic.answer }}</b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
      </b-col>
    </b-row>
    <b-row class="mt-4">
      <b-col cols="12">
        <h5>Contact Support</h5>
        <p>support@simplifybusiness.com.au</p>
        <!-- <b-form @submit.prevent="submitSupportRequest">
          <b-form-group label="Your Name" label-for="name-input">
            <b-form-input
              id="name-input"
              v-model="supportForm.name"
              required
              placeholder="Enter your name"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Your Email" label-for="email-input">
            <b-form-input
              id="email-input"
              v-model="supportForm.email"
              type="email"
              required
              placeholder="Enter your email"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Your Message" label-for="message-input">
            <b-form-textarea
              id="message-input"
              v-model="supportForm.message"
              required
              placeholder="Describe your issue or question..."
              rows="4"
            ></b-form-textarea>
          </b-form-group>
          <b-button type="submit" class="custom-variant">Submit</b-button>
        </b-form> -->
      </b-col>
    </b-row>
  </section>
</template>

<script>
import ValidationError from "@/components/uiComponents/ValidationError"
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons';
export default {
  components: {
    ValidationError,
    BaseFeatherIcon,
  },
  data() {
    return {
      searchQuery: '',
      supportForm: {
        name: '',
        email: '',
        message: '',
      },
      quickLinks: [
        { title: 'View FAQ', url: '/faq' },
        { title: 'Create an Invoice', url: '/invoice/create' },
        { title: 'View Invoices', url: '/invoice/list'},
        { title: 'Manage Clients', url: '/client/list' },
        { title: 'Tax Calculator', url: '/tax/calculator' },
      ],
      helpTopics: [
        {
          question: 'How do I reset my password?',
          answer: 'Go to the login page and click "Forgot Password". Enter your email address, and you’ll receive a link to reset your password.'
        },
        {
          question: 'How can I update my account details?',
          answer: 'Navigate to the Profile section, and update your details such as name.'
        },
        {
          question: 'What payment methods are supported for invoices?',
          answer: 'You can add PayID or bank transfer as payment methods in the Invoice Settings. PayID details can be saved for reuse, while bank transfer details must be entered each time. Clients will see these options when paying.'
        },
        {
          question: 'How do I export my invoice data?',
          answer: 'In the Invoices section, select an invoice and click "Download" to export it as a PDF. Invoices are exported individually, not as a bundle.'
        },
      ],
      filteredTopics: [],
    }
  },
  created() {
    this.filteredTopics = [...this.helpTopics]
  },
  methods: {
    filterTopics() {
      const query = this.searchQuery.toLowerCase()
      this.filteredTopics = this.helpTopics.filter(topic =>
        topic.question.toLowerCase().includes(query) ||
        topic.answer.toLowerCase().includes(query)
      )
    },
    submitSupportRequest() {
      // Simulate form submission (replace with actual API call)
      this.$toast.success(`Support request submitted! Our team will get back to you soon.`,
            {
            position: "top-right",
            icon: CheckCircleIcon,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000
            })
      this.supportForm = { name: '', email: '', message: '' }
    },
  },
}
</script>

<style scoped>
.help-section {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h4 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.header p {
  color: #666;
}

.search-bar {
  max-width: 600px;
  margin: 0 auto 30px;
}

.custom-variant {
  background-color: #007eca !important;
  color: white;
  border-color: #007eca !important;
}

.custom-variant:hover, .custom-variant:focus {
  background-color: #0066a1 !important;
  border-color: #0066a1 !important;
}

.quick-link {
  transition: background-color 0.2s;
}

.quick-link:hover {
  background-color: #f0f8ff;
}
</style>