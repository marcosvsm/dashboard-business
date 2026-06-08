<template>
  <b-modal
    v-model="localShow"
    hide-footer
    hide-header
    size="md"
    centered
    body-class="p-0"
    dialog-class="tum-dialog"
  >
    <div class="tum-root">

      <!-- Header -->
      <div class="tum-header">
        <div class="tum-icon-wrap">
          <base-feather-icon icon="ShieldIcon" size="22" />
        </div>
        <button class="tum-close" :aria-label="t('Close')" @click="localShow = false">
          <base-feather-icon icon="XIcon" size="16" />
        </button>
      </div>

      <!-- Body -->
      <div class="tum-body">
        <p class="tum-eyebrow">{{ t('Boost & Grow') }}</p>
        <h4 class="tum-title">{{ t('Stay ahead of your tax automatically') }}</h4>
        <p class="tum-desc">
          {{ t("Connect your invoices and answer a few quick questions. We'll build you a live tax picture so you're never caught off guard at tax time.") }}
        </p>

        <ul class="tum-benefits">
          <li v-for="benefit in benefits" :key="benefit.icon">
            <span class="tum-benefit-icon">
              <base-feather-icon :icon="benefit.icon" size="14" />
            </span>
            <div>
              <strong>{{ t(benefit.title) }}</strong>
              <span class="tum-benefit-desc">{{ t(benefit.desc) }}</span>
            </div>
          </li>
        </ul>

        <p class="tum-disclaimer">
          {{ t('Estimates are a guide only and not financial advice. We recommend speaking with a registered tax agent for your specific situation.') }}
        </p>
      </div>

      <!-- Footer -->
      <div class="tum-footer">
        <b-button variant="primary" class="tum-cta" block @click="goToPlans">
          <base-feather-icon icon="ZapIcon" size="14" class="mr-1" />
          {{ t('See Boost plan') }}
        </b-button>
        <button class="tum-dismiss" @click="localShow = false">
          {{ t('Not now, maybe later') }}
        </button>
      </div>

    </div>
  </b-modal>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

export default {
  name: 'TaxUpgradeModal',

  components: { BaseFeatherIcon },

  model: {
    prop:  'value',
    event: 'input',
  },

  props: {
    value: { type: Boolean, default: false },
    t:     { type: Function, required: true },
  },

  data() {
    return {
      localShow: this.value,
      benefits: [
        {
          icon:  'DollarSignIcon',
          title: 'Income tax estimate',
          desc:  'See what you may owe based on your actual invoiced income updated as you work.',
        },
        {
          icon:  'PercentIcon',
          title: 'GST calculation',
          desc:  'Track GST collected and what you owe at your next BAS date.',
        },
        {
          icon:  'TrendingUpIcon',
          title: 'Smart savings recommendations',
          desc:  'Know exactly how much to set aside from each payment no guesswork.',
        },
        {
          icon:  'ClockIcon',
          title: 'PAYG-aware tracking',
          desc:  'Already making PAYG instalments? We factor them in so you are never double-counting.',
        },
        {
          icon:  'BellIcon',
          title: 'Avoid tax surprises',
          desc:  'Stay on track with EOFY and BAS deadline reminders before things get urgent.',
        },
      ],
    };
  },

  watch: {
    // Parent opens/closes the modal by updating the `value` prop
    value(v) {
      this.localShow = v;
    },
    // When BootstrapVue closes the modal internally (ESC, backdrop), sync back to parent
    localShow(v) {
      if (!v) this.$emit('input', false);
    },
  },

  methods: {
    goToPlans() {
      this.localShow = false;
      this.$emit('input', false);
      this.$router.push('/plans');
    },
  },
};
</script>

<style scoped>
.tum-root { display: flex; flex-direction: column; }

/* ── Header ──────────────────────────────────────────────────── */
.tum-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
}
.tum-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(3, 102, 214, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0366d6;
  flex-shrink: 0;
}
.tum-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px;
  transition: color 0.12s;
  line-height: 1;
}
.tum-close:hover { color: #374151; }

/* ── Body ────────────────────────────────────────────────────── */
.tum-body { padding: 1.25rem 1.5rem 0.5rem; }

.tum-eyebrow {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0366d6;
  margin-bottom: 0.4rem;
}
.tum-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  margin-bottom: 0.6rem;
}
.tum-desc {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.tum-benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
}
.tum-benefits li {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f9fafb;
}
.tum-benefits li:last-child { border-bottom: none; }
.tum-benefit-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0366d6;
  flex-shrink: 0;
  margin-top: 1px;
}
.tum-benefits strong {
  display: block;
  font-size: 0.84rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}
.tum-benefit-desc {
  display: block;
  font-size: 0.78rem;
  color: #6b7280;
  line-height: 1.45;
}

.tum-disclaimer {
  font-size: 0.72rem;
  color: #9ca3af;
  line-height: 1.5;
  margin-bottom: 0;
}

/* ── Footer ──────────────────────────────────────────────────── */
.tum-footer {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.tum-cta {
  background-color: #0366d6 !important;
  border-color: #0366d6 !important;
  border-radius: 8px !important;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.65rem 1.5rem !important;
  box-shadow: 0 2px 10px rgba(3, 102, 214, 0.25);
  transition: opacity 0.15s, transform 0.12s;
}
.tum-cta:hover { opacity: 0.92; transform: translateY(-1px); }

.tum-dismiss {
  background: none;
  border: none;
  font-size: 0.78rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.12s;
}
.tum-dismiss:hover { color: #6b7280; }

:deep(.tum-dialog .modal-content) { border-radius: 14px; overflow: hidden; }
</style>
