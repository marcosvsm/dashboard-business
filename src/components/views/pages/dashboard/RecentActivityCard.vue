<template>
  <b-card class="card-stats mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column">
      <b-row class="flex-nowrap align-items-center">
        <b-col>
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
            {{ t('Recent Activity') }}
          </h5>
          <span class="h2 font-weight-bold mb-0">{{ t('Latest Invoice Updates') }}</span>
        </b-col>
      </b-row>
      <p class="mt-2 mb-0 text-sm text-muted">
        {{ t('Stay updated with your most recent invoice actions.') }}
      </p>
      <div class="mt-2 activity-list">
        <div v-for="(activity, index) in recentActivities" :key="index" class="activity-item" :class="{ 'bg-light': index % 2 === 0 }">
          <div class="d-flex align-items-center">
            <div class="activity-icon mr-3" :class="getActivityClass(activity.status)">
              <base-feather-icon :icon="getActivityIcon(activity.status)" size="20" />
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-center">
                <span class="font-weight-bold text-sm">
                  {{ activity.customer_name.substring(0,25) || t('Unknown') }} - #{{ activity.name }}
                </span>
                <span class="text-sm font-weight-bolder">
                  {{ currencyFormatter.format(activity.amount) }}
                </span>
              </div>
              <div class="text-sm text-muted">
                {{ getActivityDescription(activity) }}
                - {{ formatDateForDisplay(activity.date) }}
              </div>
              <div class="mt-1">
              <!--  <b-link
                  v-if="activity.status === 'overdue'"
                  class="text-primary text-xs"
                  @click="sendReminder(activity)"
                  :aria-label="`Send reminder for invoice ${activity.name}`"
                >
                  {{ t('Send Reminder') }}
                </b-link> -->
                <b-link
                  :to="{ name: 'invoice', params: { id: activity.id } }"
                  class="text-primary text-xs ml-2"
                  :aria-label="`View invoice ${activity.name}`"
                >
                  {{ t('View Details') }}
                </b-link>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!recentActivities.length" class="text-sm text-muted text-center">
          {{ t('No recent activity available.') }}
        </div>
      </div>
      <div class="mt-3">
        <b-link :to="{ name: 'invoices' }" class="text-primary text-sm" aria-label="View all invoices">
          {{ t('View All Invoices') }}
        </b-link>
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';
import dayjs from 'dayjs';

export default {
  components: { BaseFeatherIcon },
  props: {
    invoices: { type: Array, required: true },
    t: { type: Function, required: true },
    hideAmount: { type: Boolean, required: true },
    currencyFormatter: { required: true },
    formatDateForDisplay: { type: Function, required: true },
  },
  computed: {
    recentActivities() {
      const today = dayjs();
      return this.invoices
        .map(inv => ({
          id: inv.id,
          name: inv.name,
          customer_name: inv.customer?.name || 'Unknown',
          amount: parseFloat(inv.amount) || 0,
          status: inv.status === 1 ? 'paid' : new Date(inv.due_date) < today ? 'overdue' : 'issued',
          date: inv.status === 1 && inv.paid_date ? new Date(inv.paid_date) : new Date(inv.invoice_date),
          updated: new Date(inv.updated_at),
        }))
        .sort((a, b) => b.updated - a.updated) // Sort by most recent
        .slice(0, 5); // Limit to 5 entries
    },
  },
  methods: {
    getActivityIcon(status) {
      switch (status) {
        case 'paid':
          return 'CheckCircleIcon';
        case 'overdue':
          return 'AlertTriangleIcon';
        case 'issued':
          return 'FileTextIcon';
        default:
          return 'InfoIcon';
      }
    },
    getActivityClass(status) {
      return {
        'bg-success': status === 'paid',
        'bg-danger': status === 'overdue',
        'bg-info': status === 'issued',
      };
    },
    getActivityDescription(activity) {
      switch (activity.status) {
        case 'paid':
          return this.t('Invoice paid');
        case 'overdue':
          return this.t('Invoice overdue');
        case 'issued':
          return this.t('Invoice issued');
        default:
          return this.t('Unknown status');
      }
    },
    async sendReminder(invoice) {
      try {
        // Placeholder for sending reminder (replace with actual API call)
        await this.$store.dispatch('invoices/sendReminder', { id: invoice.id });
        this.$toast.success(
          'Reminder sent for invoice #{name}', { name: invoice.name },
          {
            position: 'top-right',
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000,
          }
        );
      } catch (error) {
        console.error('Error sending reminder:', error);
        this.$toast.error('Failed to send reminder. Please try again.', {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        });
      }
    },
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
.recent-activity-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.recent-activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.bg-gradient-blue {
  background: linear-gradient(87deg, #0366d6 0, #1a91ff 100%);
}

.activity-list {
  max-height: 250px;
  overflow-y: auto;
  margin-top: 1rem;
}

.activity-item {
  padding: 0.75rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.activity-item.bg-light {
  background-color: #f8f9fa;
}

.activity-item:hover {
  background-color: #f1f3f5;
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: white;
}

.activity-icon.bg-success {
  background-color: #2dce89;
}

.activity-icon.bg-danger {
  background-color: #f5365c;
}

.activity-icon.bg-info {
  background-color: #11cdef;
}

.text-muted {
  font-weight: 400;
}
</style>