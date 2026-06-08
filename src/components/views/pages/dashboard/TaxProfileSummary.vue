<template>
  <div class="tps-root">
    <div class="tps-header">
      <span class="tps-label">{{ t('Tax Profile') }}</span>
      <button class="tps-edit-btn" @click="$emit('edit')">
        <base-feather-icon icon="Edit3Icon" size="11" class="mr-1" />
        {{ t('Edit') }}
      </button>
    </div>
    <div class="tps-pills" v-if="pills.length">
      <span v-for="pill in pills" :key="pill.key" class="tps-pill">{{ pill.value }}</span>
    </div>
    <p v-if="lastUpdated" class="tps-updated">{{ t('Updated') }} {{ lastUpdated }}</p>
  </div>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

const STRUCTURE_LABELS = {
  'sole-trader': 'Sole trader',
  'company':     'Company',
  'partnership': 'Partnership',
  'trust':       'Trust',
  'unsure':      'Structure TBD',
};

const GST_LABELS = {
  yes:      'GST registered',
  no:       'No GST',
  checking: 'GST checking',
};

const RESIDENCY_LABELS = {
  'resident':        'AU resident',
  'working-holiday': 'Working holiday',
  'non-resident':    'Non-resident',
  'unsure':          'Residency TBD',
};

export default {
  name: 'TaxProfileSummary',

  components: { BaseFeatherIcon },

  props: {
    setupData:   { type: Object,   default: () => ({}) },
    lastUpdated: { type: String,   default: null },  // ISO date string; Phase 2: pass from API
    t:           { type: Function, required: true },
  },

  computed: {
    pills() {
      const d = this.setupData || {};
      const items = [];

      if (d.businessStructure) {
        items.push({ key: 'structure', value: STRUCTURE_LABELS[d.businessStructure] || d.businessStructure });
      }
      if (d.gstRegistered) {
        items.push({ key: 'gst', value: GST_LABELS[d.gstRegistered] || d.gstRegistered });
      }
      if (d.taxResidency) {
        items.push({ key: 'residency', value: RESIDENCY_LABELS[d.taxResidency] || d.taxResidency });
      }
      if (d.paygInstalments) {
        items.push({ key: 'payg', value: d.paygInstalments === 'yes' ? 'PAYG active' : 'No PAYG' });
      }
      if (d.financialYear === 'substituted') {
        items.push({ key: 'fy', value: 'Substituted FY' });
      }

      return items;
    },
  },
};
</script>

<style scoped>
.tps-root { }

.tps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.45rem;
}
.tps-label {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.tps-edit-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  color: #0366d6;
  display: flex;
  align-items: center;
  transition: color 0.12s;
  line-height: 1;
}
.tps-edit-btn:hover { color: #0247a1; }

.tps-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.tps-pill {
  font-size: 0.72rem;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 2px 8px;
  white-space: nowrap;
}

.tps-updated {
  font-size: 0.72rem;
  margin: 0.4rem 0 0;
}
</style>
