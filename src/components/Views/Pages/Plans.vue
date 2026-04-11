<template>
  <section class="plans-section">
    <div class="text-center mb-3">
      <h3 class="font-weight-bold mb-50">{{ t('Choose your plan') }}</h3>
      <p class="text-muted">{{ t('Simple pricing for Australian small businesses') }}</p>
    </div>

    <b-row class="justify-content-center match-height">
      <b-col
        v-for="plan in plans"
        :key="plan.slug"
        cols="12"
        sm="10"
        md="4"
        lg="3"
        class="mb-2"
      >
        <b-card
          class="plan-card h-100"
          :class="{
            'plan-card--current': isCurrentPlan(plan.slug),
            'plan-card--popular': plan.popular,
          }"
          no-body
        >
          <!-- Popular badge -->
          <div v-if="plan.popular" class="popular-badge">
            <b-badge variant="warning" pill>{{ t('Most Popular') }}</b-badge>
          </div>

          <b-card-body class="d-flex flex-column p-2">
            <!-- Plan name & price -->
            <div class="mb-2">
              <h5 class="font-weight-bold mb-25">{{ t(plan.name) }}</h5>
              <p class="text-muted small mb-1">{{ t(plan.tagline) }}</p>
              <div class="d-flex align-items-end">
                <span class="plan-price font-weight-bold">
                  {{ plan.price === 0 ? t('Free') : '$' + plan.price }}
                </span>
                <span v-if="plan.price > 0" class="text-muted small ml-25 mb-25">/{{ t('month') }}</span>
              </div>
            </div>

            <!-- Feature list -->
            <ul class="plan-features list-unstyled flex-grow-1 mb-2">
              <li
                v-for="feature in plan.features"
                :key="feature.text"
                class="d-flex align-items-start mb-75"
              >
                <base-feather-icon
                  :icon="feature.included ? 'CheckIcon' : 'XIcon'"
                  size="16"
                  class="mr-75 mt-25 flex-shrink-0"
                  :class="feature.included ? 'text-success' : 'text-muted'"
                />
                <span :class="feature.included ? '' : 'text-muted'">{{ t(feature.text) }}</span>
              </li>
            </ul>

            <!-- CTA -->
            <b-button
              :variant="isCurrentPlan(plan.slug) ? 'outline-secondary' : plan.popular ? 'primary' : 'outline-primary'"
              block
              :disabled="isCurrentPlan(plan.slug)"
              @click="onSelectPlan(plan)"
            >
              <span v-if="isCurrentPlan(plan.slug)">{{ t('Current Plan') }}</span>
              <span v-else-if="plan.price === 0">{{ t('Get Started') }}</span>
              <span v-else>{{ t('Upgrade') }}</span>
            </b-button>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <p class="text-center text-muted small mt-1">
      {{ t('All prices in AUD. Cancel anytime.') }}
    </p>
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
      plans: [
        {
          slug: 'free',
          name: 'Free',
          tagline: 'Get started at no cost',
          price: 0,
          popular: false,
          features: [
            { text: 'Up to 10 invoices/month',          included: true  },
            { text: '1 business profile',               included: true  },
            { text: 'Customer management',              included: true  },
            { text: 'PDF invoice download',             included: true  },
            { text: 'Multilingual Platform',            included: true },
            { text: 'Product/service catalog',          included: false },
            { text: 'AI suggest invoices',              included: false },
            { text: 'Multiple business profiles',       included: false },
            { text: 'Telegram payment alerts',          included: false },
          ],
        },
        {
          slug: 'boost',
          name: 'Boost',
          tagline: 'For growing sole traders',
          price: 9,
          popular: true,
          features: [
            { text: 'Up to 50 invoices/month',          included: true  },
            { text: '1 business profile',               included: true  },
            { text: 'Customer management',              included: true  },
            { text: 'Send email + Public invoice link', included: true  },
            { text: 'Multilingual Platform',            included: true },
            { text: 'Product/service catalog',          included: true  },
            { text: 'AI suggest invoices',          included: true },
            { text: 'Multiple business profiles',       included: false },
            { text: 'Telegram payment alerts',          included: false  },
          ],
        },
        {
          slug: 'grow',
          name: 'Grow',
          tagline: 'Unlimited, for serious business',
          price: 19,
          popular: false,
          features: [
            { text: 'Unlimited invoices',               included: true  },
            { text: 'Up to 5 business profiles',        included: true  },
            { text: 'Customer management',              included: true  },
            { text: 'Send email + Public invoice link', included: true  },
            { text: 'Multilingual Platform',            included: true },
            { text: 'Product/service catalog',          included: true  },
            { text: 'AI suggest invoices',          included: true },
            { text: 'Multiple business profiles',       included: true  },
            { text: 'Telegram payment alerts',          included: true  },
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
      if (planSlug === 'free') {
        return !['boost', 'grow', 'pro', 'business', 'enterprise'].includes(this.userSlug)
      }
      if (planSlug === 'boost') {
        return this.userSlug === 'boost'
      }
      if (planSlug === 'grow') {
        return ['grow', 'pro', 'business', 'enterprise'].includes(this.userSlug)
      }
      return false
    },

    onSelectPlan(plan) {
      // Contact / checkout — update this URL once payment is wired up
      this.$bvToast.toast(
        this.t('Please contact us to upgrade to the ') + this.t(plan.name) + this.t(' plan.'),
        {
          title: this.t('Upgrade Plan'),
          variant: 'primary',
          autoHideDelay: 5000,
          solid: true,
        }
      )
    },
  },
}
</script>

<style scoped>
.plans-section {
  padding: 1.5rem 0.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.plan-card {
  border: 2px solid #ebe9f1;
  border-radius: 12px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
}

.plan-card:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.plan-card--popular {
  border-color: #7367f0;
}

.plan-card--current {
  border-color: #28c76f;
  background-color: rgba(40, 199, 111, 0.04);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.plan-price {
  font-size: 2rem;
  line-height: 1;
  color: #5e5873;
}

.plan-features li {
  font-size: 0.9rem;
}
</style>
