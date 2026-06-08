<template>
  <b-card class="card-stats recent-activity-card mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column recent-activity-body">
      <div class="recent-activity-header">
        <div class="recent-activity-heading">
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
            {{ t('Recent Activity') }}
          </h5>
          <p class="recent-activity-subtitle mb-0">
            {{ t('Latest invoice updates.') }}
          </p>
        </div>
      </div>

      <ul class="timeline">
        <li
          v-for="(activity, index) in recentActivities"
          :key="activity.id || index"
          class="timeline-item"
          :class="getTimelineToneClass(activity.activityStatus)"
        >
          <span class="timeline-dot"></span>
          <div class="timeline-content">
            <div class="timeline-topline">
              <h6 class="timeline-title">
                {{ getActivityDescription(activity) }}
              </h6>
              <span class="timeline-time">{{ getRelativeTime(activity.updatedAt) }}</span>
            </div>
            <p class="timeline-description mb-0">
              {{ getCustomerName(activity) }} · #{{ activity.name }}
              <span v-if="!hideAmount" class="timeline-amount">
                · {{ currencyFormatter.format(activity.amount) }}
              </span>
              <span v-else class="timeline-amount timeline-amount--masked">· ••••••</span>
            </p>
            <b-link
              :to="{ name: 'invoice', params: { id: activity.id } }"
              class="timeline-link"
              :aria-label="`View invoice ${activity.name}`"
            >
              {{ t('View Details') }}
            </b-link>
          </div>
        </li>

        <li v-if="!recentActivities.length" class="activity-empty-state">
          <div class="activity-empty-icon">
            <base-feather-icon icon="ClockIcon" size="18" />
          </div>
          <p class="activity-empty-title mb-1">{{ t('No recent activity available.') }}</p>
          <p class="activity-empty-copy mb-0">{{ t('New invoice updates will appear here.') }}</p>
        </li>
      </ul>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

const MAX_ACTIVITIES = 4;

export default {
  components: { BaseFeatherIcon },
  props: {
    activities: { type: Array, required: true },
    t: { type: Function, required: true },
    hideAmount: { type: Boolean, required: true },
    currencyFormatter: { required: true },
    formatDateForDisplay: { type: Function, required: true },
  },
  computed: {
    recentActivities() {
      return [...(this.activities || [])]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, MAX_ACTIVITIES);
    },
  },
  methods: {
    getTimelineToneClass(status) {
      return `timeline-item--${status || 'default'}`;
    },
    getActivityDescription(activity) {
      switch (activity.activityStatus) {
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
    getCustomerName(activity) {
      return activity.customerName?.substring(0, 30) || this.t('Unknown');
    },
    getRelativeTime(date) {
      if (!date) return '';
      const diffMs = Date.now() - new Date(date).getTime();
      if (Number.isNaN(diffMs)) return this.formatDateForDisplay(date);

      const absMs = Math.max(diffMs, 0);
      const seconds = Math.floor(absMs / 1000);
      if (seconds < 60) {
        return seconds <= 1 ? this.t('just now') : `${seconds} ${this.t('sec ago')}`;
      }

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? this.t('min ago') : this.t('mins ago')}`;
      }

      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return `${hours} ${hours === 1 ? this.t('hour ago') : this.t('hours ago')}`;
      }

      const days = Math.floor(hours / 24);
      if (days < 7) {
        return `${days} ${days === 1 ? this.t('day ago') : this.t('days ago')}`;
      }

      return this.formatDateForDisplay(date);
    },
  },
}
</script>

<style scoped>
.card {
  height: 100%;
}
.card-stats {
  height: 100%;
}
.card-stats .card-body {
  height: 100%;
  padding: 0.75rem !important;
}
.card-body {
  padding: 0.75rem !important;
}
.recent-activity-card {
  border: 1px solid #e9ecef;
  border-radius: 0.428rem;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
}

.recent-activity-body {
  gap: 0.85rem;
}

.recent-activity-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.recent-activity-heading {
  min-width: 0;
}

.recent-activity-subtitle {
  margin-top: 0.35rem;
  color: #6b7280;
  font-size: 0.82rem;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0 0 0;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0.6rem;
  bottom: 0.6rem;
  left: 0.4rem;
  width: 1px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  padding: 0 0 1.1rem 1.75rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  top: 0.35rem;
  left: 0;
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
  background: #6366f1;
  box-shadow: 0 0 0 3px #fff;
}

.timeline-item--paid .timeline-dot {
  background: #22c55e;
}

.timeline-item--overdue .timeline-dot {
  background: #f59e0b;
}

.timeline-item--issued .timeline-dot {
  background: #3b82f6;
}

.timeline-item--default .timeline-dot {
  background: #94a3b8;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.timeline-topline {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.timeline-title {
  margin: 0;
  color: rgba(38, 43, 67, 0.9);
  font-weight: 600;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-time {
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.timeline-description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-amount {
  color: rgba(38, 43, 67, 0.9);
  font-weight: 500;
}

.timeline-amount--masked {
  color: #94a3b8;
  letter-spacing: 0.08em;
}

.timeline-link {
  margin-top: 0.15rem;
  color: #0366d6 !important;
  font-size: 0.85rem;
  font-weight: 600;
  align-self: flex-start;
}

.activity-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  border: 1px dashed #dbe3ec;
  border-radius: 0.428rem;
  background: #fbfcfe;
  text-align: center;
}

.activity-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.75rem;
  border-radius: 999px;
  color: #64748b;
  background: #eef2f7;
}

.activity-empty-title {
  font-weight: 500;
}

.activity-empty-copy {
  color: #6b7280;
  font-size: 0.82rem;
  line-height: 1.45;
}

@media (max-width: 430px) {
  .timeline-topline {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
  }

  .timeline-description {
    white-space: normal;
  }
}
</style>
