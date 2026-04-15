<template>
  <section class="plans-section">

    <!-- Header -->
    <div class="text-center plans-header">
      <p class="plans-eyebrow">{{ t('Pricing') }}</p>
      <h2 class="plans-title">{{ t('Simple, honest pricing') }}</h2>
      <p class="plans-subtitle">{{ t('Built for Australian sole traders, tradies and small businesses.') }}</p>

      <!-- Billing toggle -->
      <div class="billing-toggle">
        <span :class="['toggle-label', !annual && 'toggle-label--active']">{{ t('Monthly') }}</span>
        <b-form-checkbox v-model="annual" switch class="mx-75 mb-0" />
        <span :class="['toggle-label', annual && 'toggle-label--active']">
          {{ t('Yearly') }}
          <span class="savings-pill">{{ t('Save up to 28% yearly') }}</span>
        </span>
      </div>
    </div>

    <!-- Cards -->
    <b-row class="justify-content-center match-height plans-row">
      <b-col
        v-for="plan in plans"
        :key="plan.slug"
        cols="12"
        md="4"
        lg="4"
        class="mb-2"
      >
        <b-card
          class="plan-card h-100"
          :class="{
            'plan-card--popular': plan.popular,
            'plan-card--current': isCurrentPlan(plan.slug),
          }"
          no-body
        >
          <!-- Popular badge -->
          <div v-if="plan.popular" class="popular-badge">{{ t('Most Popular') }}</div>

          <b-card-body class="d-flex flex-column">

            <!-- Plan identity -->
            <div class="plan-identity">
              <p class="plan-name">{{ t(plan.name) }}</p>
              <p class="plan-tagline">{{ t(plan.tagline) }}</p>
            </div>

            <div class="plan-divider" />

            <!-- Price -->
            <div class="plan-pricing">
              <div v-if="plan.price === 0">
                <span class="plan-amount">{{ t('Free') }}</span>
              </div>
              <div v-else class="d-flex align-items-end">
                <span class="plan-currency">$</span>
                <span class="plan-amount">{{ annual ? plan.priceAnnual : plan.price }}</span>
                <span class="plan-period">/{{ t('mo') }}</span>
              </div>
              <p v-if="plan.price > 0" class="plan-billing-note">
                <template v-if="annual">{{ t('Billed') }} ${{ plan.priceAnnual * 12 }} {{ t('per year') }}</template>
                <template v-else>{{ t('or') }} ${{ plan.priceAnnual * 12 }}/{{ t('yr with annual billing') }}</template>
              </p>
              <p v-else class="plan-billing-note">{{ t('No credit card required') }}</p>
            </div>

            <!-- Position note -->
            <p v-if="plan.positionNote" class="plan-note">{{ t(plan.positionNote) }}</p>

            <!-- Features -->
            <ul class="plan-features list-unstyled flex-grow-1">
              <li
                v-for="feature in plan.features"
                :key="feature.text"
                class="plan-feature"
                :class="!feature.included && 'plan-feature--off'"
              >
                <base-feather-icon
                  :icon="feature.included ? 'CheckIcon' : 'MinusIcon'"
                  size="14"
                  class="feature-check flex-shrink-0"
                  :class="feature.included ? 'feature-check--on' : 'feature-check--off'"
                />
                <span>{{ t(feature.text) }}</span>
              </li>
            </ul>

            <!-- Disclaimer -->
            <p v-if="plan.disclaimer" class="plan-disclaimer">{{ t(plan.disclaimer) }}</p>

            <!-- CTA -->
            <b-button
              :variant="ctaVariant(plan)"
              block
              class="plan-cta"
              :disabled="isCurrentPlan(plan.slug)"
              @click="onSelectPlan(plan)"
            >
              <span v-if="isCurrentPlan(plan.slug)">{{ t('Your current plan') }}</span>
              <span v-else-if="plan.price === 0">{{ t('Get started free') }}</span>
              <span v-else>{{ t('Upgrade to') }} {{ t(plan.name) }}</span>
            </b-button>

          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <p class="plans-footer-note">{{ t('All prices in AUD · Cancel anytime · No hidden fees') }}</p>

  </section>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  name: 'Plans',

  components: { BaseFeatherIcon },

  data() {
    const { t } = useI18nUtils()
    return {
      t,
      annual: false,
      plans: [
        {
          slug: 'free',
          name: 'Free',
          tagline: 'Start invoicing in Australia — no cost, no stress.',
          price: 0,
          priceAnnual: 0,
          popular: false,
          positionNote: null,
          disclaimer: 'Trial plan — great to start, limited for growing businesses.',
          features: [
            { text: '1 business profile',                           included: true  },
            { text: 'Customer management',                          included: true  },
            { text: 'Up to 10 invoices / month',                   included: true  },
            { text: 'Basic dashboard',                              included: true  },
            { text: 'PDF invoice download',                         included: true  },
            { text: 'Multilingual interface',                       included: true  },
            { text: 'Send invoices by email',                       included: false },
            { text: 'Public invoice link',                          included: false },
            { text: 'AI invoice descriptions',                      included: false },
            { text: 'Product & service catalog',                    included: false },
            { text: 'Telegram payment alerts',                      included: false },
          ],
        },
        {
          slug: 'boost',
          name: 'Boost',
          tagline: 'Get paid faster and stay in control of your money.',
          price: 6.99,
          priceAnnual: 4.99,
          popular: true,
          positionNote: 'Most users upgrade to Boost to avoid payment delays.',
          disclaimer: null,
          features: [
            { text: '1 business profile',                           included: true  },
            { text: 'Customer management',                          included: true  },
            { text: 'Up to 50 invoices / month',                   included: true  },
            { text: 'Full dashboard with insights',                 included: true  },
            { text: 'PDF invoice download',                         included: true  },
            { text: 'Multilingual interface',                       included: true  },
            { text: 'Send invoices by email',                       included: true  },
            { text: 'Public invoice link',                          included: true  },
            { text: 'AI invoice descriptions',                      included: true  },
            { text: 'Product & service catalog',                    included: true  },
            { text: 'Telegram payment alerts',                      included: false },
          ],
        },
        {
          slug: 'grow',
          name: 'Grow',
          tagline: 'Run your business without limits.',
          price: 18.99,
          priceAnnual: 14.99,
          popular: false,
          positionNote: null,
          disclaimer: null,
          features: [
            { text: 'Up to 5 business profiles',                    included: true  },
            { text: 'Customer management',                          included: true  },
            { text: 'Unlimited invoices',                           included: true  },
            { text: 'Advanced reporting',                           included: true  },
            { text: 'PDF invoice download',                         included: true  },
            { text: 'Multilingual interface',                       included: true  },
            { text: 'Send invoices by email',                       included: true  },
            { text: 'Public invoice link',                          included: true  },
            { text: 'AI invoice descriptions',                      included: true  },
            { text: 'Product & service catalog',                    included: true  },
            { text: 'Telegram payment alerts',                      included: true  },
            { text: 'Tax insights',                                 included: true  },
            { text: 'Priority support',                             included: true  },
          ],
        },
      ],
    }
  },

  computed: {
    userSlug() {
      return this.$store.getters['users/user']?.role?.slug || 'free'
    },
  },

  methods: {
    isCurrentPlan(planSlug) {
      const s = this.userSlug
      if (planSlug === 'free') return !['boost', 'grow', 'pro', 'business', 'enterprise'].includes(s)
      if (planSlug === 'boost') return s === 'boost'
      if (planSlug === 'grow') return ['grow', 'pro', 'business', 'enterprise'].includes(s)
      return false
    },

    ctaVariant(plan) {
      if (this.isCurrentPlan(plan.slug)) return 'outline-secondary'
      if (plan.popular) return 'primary'
      return 'outline-primary'
    },

    onSelectPlan(plan) {
      this.$toast.info(
        this.t('Please contact us to upgrade to the ') + this.t(plan.name) + this.t(' plan.'),
        {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 5000,
        }
      )
    },
  },
}
</script>

<style scoped>
/* ── Layout ── */
.plans-section {
  max-width: 980px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.plans-row {
  margin-top: 0.5rem;
}

/* ── Header ── */
.plans-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7367f0;
  margin-bottom: 0.5rem;
}

.plans-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d2d3a;
  margin-bottom: 0.4rem;
}

.plans-subtitle {
  color: #8a8d93;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

/* ── Billing toggle ── */
.billing-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  border-radius: 50px;
  padding: 6px 16px;
  margin-bottom: 2rem;
}

.toggle-label {
  font-size: 0.875rem;
  color: #b9b9c3;
  transition: color 0.2s;
}

.toggle-label--active {
  color: #2d2d3a;
  font-weight: 600;
}

.savings-pill {
  display: inline-block;
  background: #28c76f;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  margin-left: 6px;
  vertical-align: middle;
}

/* ── Card ── */
.plan-card {
  border: 1.5px solid #e8e8f0;
  border-radius: 16px;
  position: relative;
  overflow: visible;
  transition: box-shadow 0.2s ease;
}

.plan-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.plan-card--popular {
  border-color: #7367f0;
  box-shadow: 0 4px 24px rgba(115, 103, 240, 0.15);
}

.plan-card--current {
  border-color: #28c76f;
  background-color: rgba(40, 199, 111, 0.03);
}

/* ── Popular badge ── */
.popular-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: #7367f0;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 4px 16px;
  border-radius: 20px;
  white-space: nowrap;
  z-index: 1;
}

/* ── Plan identity ── */
.plan-identity {
  padding-top: 0.5rem;
}

.plan-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d2d3a;
  margin-bottom: 0.2rem;
}

.plan-tagline {
  font-size: 0.82rem;
  color: #8a8d93;
  margin-bottom: 0;
  line-height: 1.4;
  min-height: 2.4em;
}

.plan-divider {
  height: 1px;
  background: #f0f0f5;
  margin: 1rem 0;
}

/* ── Pricing ── */
.plan-pricing {
  margin-bottom: 0.75rem;
}

.plan-currency {
  font-size: 1.2rem;
  font-weight: 600;
  color: #5e5873;
  align-self: flex-start;
  margin-top: 6px;
  margin-right: 2px;
}

.plan-amount {
  font-size: 2.6rem;
  font-weight: 700;
  line-height: 1;
  color: #2d2d3a;
}

.plan-period {
  font-size: 0.875rem;
  color: #8a8d93;
  margin-bottom: 6px;
  margin-left: 4px;
}

.plan-billing-note {
  font-size: 0.78rem;
  color: #b9b9c3;
  margin-top: 0.25rem;
  margin-bottom: 0;
  min-height: 1.2em;
}

/* ── Position note ── */
.plan-note {
  font-size: 0.8rem;
  font-weight: 600;
  color: #ff9f43;
  background: rgba(255, 159, 67, 0.08);
  border-left: 3px solid #ff9f43;
  border-radius: 4px;
  padding: 6px 10px;
  margin-bottom: 0.75rem;
}

/* ── Features ── */
.plan-features {
  margin-bottom: 1rem;
}

.plan-feature {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.875rem;
  color: #2d2d3a;
  margin-bottom: 0.6rem;
  line-height: 1.4;
}

.plan-feature--off {
  color: #c0bfcd;
}

.feature-check {
  margin-top: 2px;
}

.feature-check--on {
  color: #28c76f;
}

.feature-check--off {
  color: #dddde5;
}

/* ── Disclaimer ── */
.plan-disclaimer {
  font-size: 0.76rem;
  color: #b9b9c3;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

/* ── CTA ── */
.plan-cta {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.6rem;
}

/* ── Footer ── */
.plans-footer-note {
  text-align: center;
  font-size: 0.78rem;
  color: #c0bfcd;
  margin-top: 1.25rem;
}
</style>
