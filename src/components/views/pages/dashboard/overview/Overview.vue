<template>
  <div>    
    <!-- Welcome Message for New Users -->
    <b-alert v-if="showWelcome" variant="info" dismissible @dismissed="hideWelcome" class="mb-3">
      <h5 class="alert-heading">
        <base-feather-icon icon="InfoIcon" size="18" class="mr-1" />
        {{ t('Welcome to Simplify!') }}
      </h5>
      <p class="mb-2">{{ t('Get started by creating your business profile and adding customers.') }}</p>
      <b-button size="sm" variant="outline-info" @click="startTutorial">
        {{ t('Take Tutorial') }}
      </b-button>
    </b-alert>
    
    <div v-if="!isLoadingInvoices">
      <b-row>
      <b-col class="mb-2" md="4" sm="6" xs="12">
        <invoices-card
          :invoices="invoices"
          :t="t"
          :currency-formatter="currencyFormatter"
          :format-date-for-display="formatDateForDisplay"
          :format-date-for-invoice-display="formatDateForInvoiceDisplay"
        />
      </b-col>
      <b-col class="mb-2" md="4" sm="6" xs="12">
        <income-card
          :invoices="invoices"
          :t="t"
          :hide-amount="hideAmount"
          :currency-formatter="currencyFormatter"
          @toggle-hide-amount="handleHideAmount"
        />
      </b-col>
      <b-col class="mb-2" md="4" sm="6" xs="12">
        <outstanding-card
          :invoices="invoices"
          :t="t"
          :currency-formatter="currencyFormatter"
        />
      </b-col>
    </b-row>

    <b-row>
      <b-col class="mb-2" md="6" lg="8">
        <revenue-trend-chart
          :invoices="invoices"
          :t="t"
          :time-period="timePeriod"
          @set-time-period="setTimePeriod"
          :currency-formatter="currencyFormatter"
        />
      </b-col>
      <b-col class="mb-2" md="6" sm="6" xs="12" lg="4">
        <tax-summary-card
          :invoices="invoices"
          :t="t"
          :hide-amount="hideAmount"
          :currency-formatter="currencyFormatter"
        />
      </b-col>
<!--
      <b-col class="mb-2" md="6" lg="4">
        <invoice-status-pie
          :invoices="invoices"
          :t="t"
        />
      </b-col> -->
    </b-row>

    <b-row>
      <b-col class="mb-2" md="6" xs="12" sm="6" lg="4" v-if="unpaidInvoices.length">
        <outstanding-invoices-list
          :unpaid-invoices="unpaidInvoices"
          :t="t"
          :currency-formatter="currencyFormatter"
          :format-date-for-display="formatDateForDisplay"
          @update-invoice-status="updateInvoiceStatus"
        />
      </b-col>

      <b-col class="mb-2" md="6" lg="4">
        <top-customers
          :top-customers="topCustomers"
          :max-customer-total="maxCustomerTotal"
          :t="t"
          :currency-formatter="currencyFormatter"
        />
      </b-col>

      <b-col class="mb-2" md="6" lg="4">
        <recent-activity-card
          :invoices="invoices"
          :t="t"
          :currency-formatter="currencyFormatter"
          :hide-amount="hideAmount"
          :format-date-for-display="formatDateForDisplay"
        />
            </b-col>
    </b-row>
    </div>
    <!-- Tutorial Component -->
    <tutorial @open-language-selector="openLanguageSelector" />
  </div>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import { formatDateForDisplay } from '@/libs/dateUtils.js'
import { formatDateForInvoiceDisplay } from '@/libs/dateUtils.js'

import InvoicesCard from '@/components/views/pages/dashboard/InvoicesCard.vue';
import IncomeCard from '@/components/views/pages/dashboard/IncomeCard.vue';
import OutstandingCard from '@/components/views/pages/dashboard/OutstandingCard.vue';
import RevenueTrendChart from '@/components/views/pages/dashboard/RevenueTrendChart.vue';
import OutstandingInvoicesList from '@/components/views/pages/dashboard/OutstandingInvoicesList.vue';
import TopCustomers from '@/components/views/pages/dashboard/TopCustomers.vue';
import RecentActivityCard from '@/components/views/pages/dashboard/RecentActivityCard.vue';
import TaxSummaryCard from '@/components/views/pages/dashboard/TaxSummaryCard.vue';
import Tutorial from '@/components/uiComponents/Tutorial.vue';

export default {
    components: {
    BaseFeatherIcon,
    InvoicesCard,
    IncomeCard,
    OutstandingCard,
    RevenueTrendChart,
    OutstandingInvoicesList,
    TopCustomers,
    RecentActivityCard,
    TaxSummaryCard,
    Tutorial,
  },
    data() {
    return {
      invoices: [],
      isLoadingInvoices: false,
      t: null,
      formatDateForDisplay,
      formatDateForInvoiceDisplay,
      hideAmount: true,
      timePeriod: 'monthly',
      showWelcome: false,
      currencyFormatter: new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
      }),
    }
  },
    created() {
    const { t } = useI18nUtils();
    this.t = t;
    this.fetchInvoices('first');
    this.checkWelcomeStatus();
  },
  computed: {
    unpaidInvoices() {
      return this.invoices.filter(invoice => invoice.status === 0).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    },
    topCustomers() {
      const customerMap = this.invoices.reduce((acc, inv) => {
        const name = inv.customer?.name || 'Unknown';
        if (!acc[name]) acc[name] = 0;
        if (inv.status === 1) acc[name] += parseFloat(inv.amount);
        return acc;
      }, {});
      return Object.entries(customerMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    },
    maxCustomerTotal() {
      return Math.max(...this.topCustomers.map(c => c.total), 1);
    },
  },
  methods: {
    async fetchInvoices(time) {
      if(time === 'first')
      this.isLoadingInvoices = true;
      try {
        await this.$store.dispatch('invoices/list',['customer']);
        this.invoices = this.$store.getters["invoices/list"] || [];
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
       if(time === 'first')
       this.isLoadingInvoices = false;
      }
    },
    async updateInvoiceStatus(invoice, status) {
      try {
        invoice.status = status;
        await this.$store.dispatch('invoices/update', invoice);
        this.fetchInvoices('update');
      } catch (e) {
        await this.$store.dispatch('alerts/showNotification', {
          message: 'Something went wrong! Try again later or contact the support.',
          type: 'error'
        });
      }
    },
    handleHideAmount() {
      this.hideAmount = !this.hideAmount;
      localStorage.setItem('hideAmount', this.hideAmount);
    },
    setTimePeriod(period) {
      this.timePeriod = period;
    },
    checkWelcomeStatus() {
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      const hasCompanies = this.$store.getters['companies/list']?.length > 0;
      this.showWelcome = !hasSeenTutorial && !hasCompanies;
    },
    async startTutorial() {
      await this.$store.dispatch('tutorial/resetTutorial');
      this.$store.dispatch('tutorial/startTour');
      this.showWelcome = false;
    },
    hideWelcome() {
      this.showWelcome = false;
      localStorage.setItem('welcomeMessageSeen', 'true');
    },
    getLastInvoice() {
      if (!this.invoices.length) return 'N/A';
      const latest = this.invoices.reduce((max, inv) => {
        const date = new Date(inv.invoice_date);
        return date > max ? date : max;
      }, new Date(0));
      return formatDateForDisplay(latest);
    },
    openLanguageSelector() {
      // Open your language dropdown
      const btn = document.querySelector('.dropdown-language .dropdown-toggle')
      if (btn) btn.click()
    },
  },
  mounted() {
    const isHide = localStorage.getItem('hideAmount');
    if (isHide !== null) {
      this.hideAmount = isHide === 'true';
    }
    this.$nextTick(() => {
      if (this.$store.getters['tutorial/isTourActive']) {
        this.$store.dispatch('tutorial/startTour')
      }
    })
  },
}
</script>

<style scoped>
/* Add global dashboard styles here if needed */
.card{
  height:100%;
}
.card-stats{
  height: 100%;
}
.card-stats .card-body{
  height: 100%;
  padding:0.75rem !important;
}
.card-body{
  padding:0.75rem !important;
}
.icon-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  transition: width 0.2s ease, height 0.2s ease; /* Smooth resizing */
}
/* Reduce icon size and adjust layout on smaller screens */
@media (max-width: 820px) {
  .icon-shape {
    width: 40px;
    height: 40px;
  }
  .icon-shape .feather {
    width: 24px; /* Reduce icon size */
    height: 24px;
  }
}

.bg-gradient-green {
  background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%);
}
.bg-gradient-blue {
  background: linear-gradient(87deg, #0366d6 0, #1a91ff 100%);
}
.bg-gradient-orange {
  background: linear-gradient(87deg, #fb6340 0, #fbb140 100%);
}
</style>