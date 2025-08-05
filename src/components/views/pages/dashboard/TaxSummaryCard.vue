<template>
  <b-card class="card-stats mb-4 mb-xl-0">
    <b-card-body class="d-flex flex-column">
      <b-row class="flex-nowrap align-items-center">
        <b-col>
          <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
            {{ t('Tax Summary') }}
            <span class="badge badge-warning ml-2">{{ t('Coming Soon') }}</span>
          </h5>
          <span class="h2 font-weight-bold mb-0">{{ t('Unlock Tax Insights') }}</span>
        </b-col>
      </b-row>
      <p class="mt-3 mb-0 text-sm">
        {{ t('Get ready to track your GST, income tax, and taxable income for the fiscal year with ease!') }}
      </p>
      <ul class="mt-2 mb-0 pl-4 text-sm">
        <li>{{ t('Estimate GST collected from invoices') }}</li>
        <li>{{ t('Calculate income tax based on your residency status') }}</li>
        <li>{{ t('Monitor taxable income for the fiscal year') }}</li>
      </ul>
      <div class="mt-3 d-flex align-items-center">
        <b-button
          v-if="isUserLoaded"
          variant="primary"
          size="sm"
          class="cta-button mr-2"
          @click="openCtaModal"
          :disabled="!isUserLoaded"
          :aria-label="isOnWaitlist ? 'View waitlist status' : 'Join waitlist for tax summary feature'"
        >
          {{ isOnWaitlist ? t('Status') : t('Join Waitlist') }}
        </b-button>
        <span v-if="isOnWaitlist && isUserLoaded" class="badge badge-success text-uppercase">{{ t("You're on the waitlist") }}</span>
      </div>
      <!-- CTA Modal -->
      <b-modal id="tax-cta-modal" :title="t('Tax Summary')" :ok-title="isOnWaitlist ? t('Coming Soon') : t('Join Waitlist')" @ok="submitWaitlist" :ok-disabled="isOnWaitlist">
        <p v-if="isOnWaitlist" class="text">
          {{ t('You are already on the waitlist for Tax Summary! We’ll notify you when it’s ready.') }}
        </p>
        <div v-else-if="isUserLoaded">
          <p>{{ t('Our Tax Summary feature will help you stay on top of your tax obligations with personalized calculations.') }}</p>
          <p class="text-muted text-sm">{{ t('Join our waitlist to be notified when this feature is available!') }}</p>
        </div>
        <p v-else class="text-muted">
          {{ t('Loading user information... Please wait.') }}
        </p>
      </b-modal>
    </b-card-body>
  </b-card>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';
import { mapGetters } from 'vuex';

export default {
  components: { BaseFeatherIcon },
  props: {
    t: { type: Function, required: true },
  },
  data() {
    return {
      waitlist: [],
      isLoadingUser: false,
    };
  },
  computed: {
    ...mapGetters('profile', ['me']),
    isUserLoaded() {
      return !!this.me && !this.isLoadingUser;
    },
    isOnWaitlist() {
      if(this.waitlist)
        return true
      return false;
    },
  },
  async created() {
    try {
      this.isLoadingUser = true;
      // Fetch user if not available in getter
      const user = this.$store.getters["profile/me"];
        await this.$store.dispatch('waitlists/list');
        const data = this.$store.getters['waitlists/list'] || [];
        this.waitlist = data.find(list => list.name === "Tax Summary")
    } catch (error) {
      console.error('Error fetching user or waitlist:', error);
      this.$toast.error('Failed to load waitlist status. Please try again.', {
        position: 'top-right',
        icon: false,
        closeButton: false,
        hideProgressBar: true,
        timeout: 3000,
      });
    } finally {
      this.isLoadingUser = false;
    }
  },
  methods: {
    openCtaModal() {
      this.$bvModal.show('tax-cta-modal');
    },
    async submitWaitlist() {
      try {
        const data = {
          data: {
            type: 'waitlists',
            attributes: {
              name: 'Tax Summary',
            },
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: this.me.id,
                },
              },
            },
          },
        };
        await this.$store.dispatch('waitlists/add', data);
        this.waitlist = this.$store.getters['waitlists/get'] || [];
        this.$toast.success(
          'Thank you for joining the waitlist! We’ll notify you when Tax Summary is ready.',
          {
            position: 'top-right',
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000,
          }
        );
      } catch (error) {
        console.error('Error joining waitlist:', error);
        this.$toast.error('Failed to join waitlist. Please try again.', {
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
.tax-summary-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tax-summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.bg-gradient-purple {
  background: linear-gradient(87deg, #6f42c1 0, #a855f7 100%);
}

.cta-button {
  background-color: #0366d6;
  border-color: #0366d6;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.cta-button:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.badge-warning, .badge-success {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  vertical-align: middle;
}

.text-muted {
  font-weight: 400;
}

ul {
  list-style-type: disc;
}

ul li {
  margin-bottom: 0.5rem;
}
</style>