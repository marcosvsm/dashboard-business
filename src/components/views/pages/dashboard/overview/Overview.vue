<template>
  <div>
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

    <div class="dashboard-overview-header mb-2 ml-1">
      <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
        {{ t('Dashboard') }}
        <span class="cursor-pointer" @click="handleHideAmount" style="color:#0366d6 !important">
          <base-feather-icon :icon="hideAmount ? 'EyeOffIcon' : 'EyeIcon'" size="22" />
        </span>
      </h5>

      <b-dropdown variant="link" no-caret right class="dashboard-range-dropdown">
        <template #button-content>
          <base-feather-icon icon="CalendarIcon" size="16" class="mr-1" />
          {{ selectedDashboardDateRange.label }}
        </template>
        <b-dropdown-item
          v-for="option in dashboardDateRangeOptions"
          :key="option.key"
          :active="option.key === dashboardRange"
          @click="setDashboardRange(option.key)"
        >
          {{ option.label }}
        </b-dropdown-item>
      </b-dropdown>
    </div>

    <div v-if="!isLoadingOverview">
      <b-row>
        <b-col class="mb-2" md="4" sm="6" xs="12">
          <invoices-card
            :summary="invoiceSummary"
            :t="t"
            :currency-formatter="currencyFormatter"
            :format-date-for-display="formatDateForDisplay"
            :format-date-for-invoice-display="formatDateForInvoiceDisplay"
            :hide-amount="hideAmount"
          />
        </b-col>
        <b-col class="mb-2" md="4" sm="6" xs="12">
          <income-card
            :summary="incomeSummary"
            :range-label="selectedDashboardDateRange.label"
            :t="t"
            :hide-amount="hideAmount"
            :currency-formatter="currencyFormatter"
          />
        </b-col>
        <b-col class="mb-2" md="4" sm="12" xs="12">
          <outstanding-card
            :summary="outstandingSummary"
            :t="t"
            :currency-formatter="currencyFormatter"
            :hide-amount="hideAmount"
          />
        </b-col>
      </b-row>

      <b-row>
        <b-col class="mb-2" md="12" lg="8">
          <revenue-trend-chart
            :revenue="revenueSeries"
            :range-label="selectedDashboardDateRange.label"
            :is-all-time="selectedDashboardDateRange.key === 'all_time'"
            :t="t"
            :time-period="timePeriod"
            @set-time-period="setTimePeriod"
            :currency-formatter="currencyFormatter"
            :hide-amount="hideAmount"
          />
        </b-col>
        <b-col class="mb-2" md="12" sm="12" xs="12" lg="4">
          <tax-position-entry
            :invoices="[]"
            :t="t"
            :hide-amount="hideAmount"
            :currency-formatter="currencyFormatter"
            :dashboard-range="selectedDashboardDateRange.key"
            :range-label="selectedDashboardDateRange.label"
          />
        </b-col>
      </b-row>

      <b-row class="dashboard-bottom-row">
      <b-col
          class="mb-2 dashboard-bottom-col dashboard-bottom-col--compact"
          :md="hasOutstandingInvoices ? 5 : 4"
          xs="12"
          sm="12"
          :lg="hasOutstandingInvoices ? 3 : 4"
          :xl="hasOutstandingInvoices ? 4 : 4"
        >
          <top-customers
            :top-customers="topCustomers"
            :max-customer-total="maxCustomerTotal"
            :t="t"
            :currency-formatter="currencyFormatter"
            :hide-amount="hideAmount"
          />
        </b-col>
        <b-col class="mb-2 dashboard-bottom-col dashboard-bottom-col--primary" md="7" xs="12" sm="12" lg="5" xl="8" v-if="hasOutstandingInvoices">
          <outstanding-invoices-list
            :unpaid-invoices="unpaidInvoices"
            :t="t"
            :currency-formatter="currencyFormatter"
            :format-date-for-display="formatDateForDisplay"
            :hide-amount="hideAmount"
            @update-invoice-status="updateInvoiceStatus"
          />
        </b-col>

        <b-col
          class="mb-2 dashboard-bottom-col dashboard-bottom-col--secondary"
          :md="hasOutstandingInvoices ? 12 : 8"
          xs="12"
          :lg="hasOutstandingInvoices ? 6 : 8"
          :xl="hasOutstandingInvoices ? 6 : 8"
        >
          <recent-activity-card
            :activities="recentActivities"
            :t="t"
            :currency-formatter="currencyFormatter"
            :hide-amount="hideAmount"
            :format-date-for-display="formatDateForDisplay"
          />
        </b-col>
      </b-row>
    </div>

    <tutorial @open-language-selector="openLanguageSelector" />
  </div>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import { formatDateForDisplay } from '@/libs/dateUtils.js'
import { formatDateForInvoiceDisplay } from '@/libs/dateUtils.js'
import dashboardService from '@/store/services/dashboard-service';

import InvoicesCard from '@/components/views/pages/dashboard/InvoicesCard.vue';
import IncomeCard from '@/components/views/pages/dashboard/IncomeCard.vue';
import OutstandingCard from '@/components/views/pages/dashboard/OutstandingCard.vue';
import RevenueTrendChart from '@/components/views/pages/dashboard/RevenueTrendChart.vue';
import OutstandingInvoicesList from '@/components/views/pages/dashboard/OutstandingInvoicesList.vue';
import TopCustomers from '@/components/views/pages/dashboard/TopCustomers.vue';
import RecentActivityCard from '@/components/views/pages/dashboard/RecentActivityCard.vue';
import TaxPositionEntry from '@/components/views/pages/dashboard/TaxPositionEntry.vue';
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
    TaxPositionEntry,
    Tutorial,
  },
  data() {
    return {
      overviewData: null,
      isLoadingOverview: false,
      t: null,
      formatDateForDisplay,
      formatDateForInvoiceDisplay,
      hideAmount: true,
      timePeriod: 'monthly',
      dashboardRange: 'current_fy',
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
    this.restoreRevenueTimePeriod();
    this.restoreDashboardRange();
    this.checkWelcomeStatus();
    this.fetchOverview('first');
  },
  computed: {
    currentUser() {
      return this.$store.getters['auth/authUser'] || this.$store.getters['users/user'] || null;
    },
    dashboardDateRangeOptions() {
      return this.overviewData?.range?.available || this.getFallbackDashboardRanges();
    },
    selectedDashboardDateRange() {
      return this.dashboardDateRangeOptions.find(option => option.key === this.dashboardRange) || this.dashboardDateRangeOptions[0];
    },
    invoiceSummary() {
      return this.overviewData?.summary?.invoices || {
        totalCount: 0,
        paidCount: 0,
        unpaidCount: 0,
        lastInvoiceDate: null,
      };
    },
    incomeSummary() {
      return this.overviewData?.summary?.income || {
        amountReceived: 0,
        paidCount: 0,
        averageInvoiceValue: 0,
        thisMonthAmount: 0,
        lastMonthAmount: 0,
      };
    },
    outstandingSummary() {
      return this.overviewData?.summary?.outstanding || {
        pendingAmount: 0,
        overdueCount: 0,
        overdueAmount: 0,
      };
    },
    revenueSeries() {
      return this.overviewData?.revenue || {
        monthly: [],
        quarterly: [],
        annual: [],
      };
    },
    unpaidInvoices() {
      return (this.overviewData?.outstandingInvoices || []).map(invoice => ({
        id: invoice.uuid,
        name: invoice.name || invoice.ref,
        amount: invoice.amount,
        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate,
        customer: {
          name: invoice.customerName || 'Unknown',
        },
      }));
    },
    hasOutstandingInvoices() {
      return this.unpaidInvoices.length > 0;
    },
    topCustomers() {
      return this.overviewData?.topCustomers || [];
    },
    maxCustomerTotal() {
      return Math.max(...this.topCustomers.map(c => c.total), 1);
    },
    recentActivities() {
      return (this.overviewData?.recentActivity || []).map(activity => ({
        id: activity.uuid,
        name: activity.name || activity.ref,
        customerName: activity.customerName || 'Unknown',
        amount: activity.amount,
        activityStatus: activity.activityStatus,
        displayDate: activity.displayDate,
        updatedAt: activity.updatedAt,
      }));
    },
  },
  methods: {
    getValidTimePeriod(period) {
      return ['monthly', 'quarterly', 'annual'].includes(period) ? period : 'monthly';
    },
    getValidDashboardRange(range) {
      return ['current_fy', 'last_fy'].includes(range) ? range : 'current_fy';
    },
    getFallbackDashboardRanges() {
      const today = new Date();
      const startYear = today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
      const formatFinancialYear = year => `FY${year}–${String(year + 1).slice(-2)}`;

      return [
        { key: 'current_fy', label: formatFinancialYear(startYear) },
        { key: 'last_fy', label: formatFinancialYear(startYear - 1) },
      ];
    },
    getUserPreferenceKey(key) {
      const userId = this.currentUser?.id;
      return userId ? `${key}.${userId}` : key;
    },
    getUserPreference(key) {
      return localStorage.getItem(this.getUserPreferenceKey(key));
    },
    setUserPreference(key, value) {
      localStorage.setItem(this.getUserPreferenceKey(key), value);
    },
    restoreRevenueTimePeriod() {
      const storedPeriod = this.getUserPreference('dashboard.revenueTrend.timePeriod');
      if (storedPeriod !== null) {
        this.timePeriod = this.getValidTimePeriod(storedPeriod);
      }
    },
    restoreDashboardRange() {
      const storedRange = this.getUserPreference('dashboard.overview.range');
      if (storedRange !== null) {
        this.dashboardRange = this.getValidDashboardRange(storedRange);
      }
    },
    async fetchOverview(time) {
      if (time === 'first' || time === 'switch') {
        this.isLoadingOverview = true;
      }

      try {
        const overview = await dashboardService.getOverview({ range: this.dashboardRange });
        this.overviewData = overview;
        if (overview?.range?.resolved) {
          this.dashboardRange = this.getValidDashboardRange(overview.range.resolved);
        }
      } catch (error) {
        console.error('Error fetching dashboard overview:', error);
      } finally {
        if (time === 'first' || time === 'switch') {
          this.isLoadingOverview = false;
        }
      }
    },
    async updateInvoiceStatus(invoice, status, paidDate = null) {
      try {
        const attributes = { status };
        if (status === 1 && paidDate) {
          attributes.paid_date = paidDate;
        }
        const payload = {
          data: {
            type: 'invoices',
            id: invoice.id,
            attributes,
          },
        };
        await this.$store.dispatch('invoices/update', payload);
        await Promise.allSettled([
          this.fetchOverview('update'),
          this.$store.dispatch('tax/fetchOverview'),
        ]);
      } catch (e) {
        await this.$toast.error('Something went wrong! Try again later or contact the support.', {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        });
      }
    },
    handleHideAmount() {
      this.hideAmount = !this.hideAmount;
      localStorage.setItem('hideAmount', this.hideAmount);
    },
    setTimePeriod(period) {
      this.timePeriod = this.getValidTimePeriod(period);
      this.setUserPreference('dashboard.revenueTrend.timePeriod', this.timePeriod);
    },
    setDashboardRange(range) {
      const nextRange = this.getValidDashboardRange(range);
      if (nextRange === this.dashboardRange) return;

      this.dashboardRange = nextRange;
      this.setUserPreference('dashboard.overview.range', this.dashboardRange);
      this.fetchOverview('switch');
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
    openLanguageSelector() {
      const btn = document.querySelector('.dropdown-language .dropdown-toggle')
      if (btn) btn.click()
    },
  },
  watch: {
    currentUser: {
      immediate: true,
      handler() {
        const previousRange = this.dashboardRange;
        this.restoreRevenueTimePeriod();
        this.restoreDashboardRange();
        if (this.overviewData && previousRange !== this.dashboardRange) {
          this.fetchOverview('switch');
        }
      },
    },
  },
  mounted() {
    const isHide = localStorage.getItem('hideAmount');
    if (isHide !== null) {
      this.hideAmount = isHide === 'true';
    }
    this.restoreRevenueTimePeriod();
    this.restoreDashboardRange();
    this.$nextTick(() => {
      if (this.$store.getters['tutorial/isTourActive']) {
        this.$store.dispatch('tutorial/startTour')
      }
    })
  },
}
</script>

<style scoped>
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
.dashboard-overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.dashboard-range-dropdown .dropdown-toggle {
  color: #0366d6 !important;
  font-weight: 600;
  padding-right: 0;
}
.dashboard-bottom-row .dashboard-bottom-col {
  display: flex;
}
.dashboard-bottom-row .dashboard-bottom-col > * {
  width: 100%;
}
.icon-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  transition: width 0.2s ease, height 0.2s ease;
}
@media (max-width: 820px) {
  .icon-shape {
    width: 40px;
    height: 40px;
  }
  .icon-shape .feather {
    width: 24px;
    height: 24px;
  }
  .dashboard-bottom-row .dashboard-bottom-col {
    display: block;
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
