<template>
  <div>
    <b-modal
      v-model="isVisible"
      size="lg"
      centered
      modal-class="tutorial-modal"
      hide-header-close
      no-close-on-backdrop
      no-close-on-esc
    >
      <!-- Title -->
      <template #modal-title>
        <div class="d-flex align-items-center">
          <base-feather-icon icon="SparklesIcon" size="24" class="text-primary mr-2" />
          {{ currentStep.title }}
        </div>
      </template>

      <!-- Content -->
      <div class="tutorial-content text-center py-4">
        <div class="progress mb-4" style="height: 8px;">
          <div
            class="progress-bar bg-primary"
            :style="{ width: progressPercentage + '%' }"
            role="progressbar"
          ></div>
        </div>
        <small class="text-muted d-block mb-4">
          Step {{ currentStepIndex + 1 }} of {{ totalSteps }}
        </small>

        <div class="mb-4" v-if="currentStep.icon">
          <base-feather-icon :icon="currentStep.icon" size="64" class="text-primary" />
        </div>

        <h4 class="mb-3">{{ t(currentStep.title) }}</h4>
        <div v-html="t(currentStep.description)" class="text-muted mb-4 lead"></div>

        <b-button
          v-if="currentStep.actionButton"
          variant="primary"
          size="lg"
          class="px-5"
          @click="handleAction(currentStep.actionButton.action)"
        >
          {{ currentStep.actionButton.text }}
        </b-button>
      </div>

      <!-- Footer -->
      <template #modal-footer>
        <div class="w-100 d-flex justify-content-between align-items-center">
          <div>
            <b-button variant="link" size="sm" @click="skipTutorialForever">
              Don't show again
            </b-button>
            <b-button variant="link" size="sm" @click="skipTutorial" class="ml-3">
              Skip for now
            </b-button>
          </div>

          <div>
            <b-button
              v-if="currentStepIndex > 0"
              variant="outline-secondary"
              size="sm"
              @click="previousStep"
              class="mr-2"
            >
              Previous
            </b-button>
            <b-button variant="primary" @click="nextStep">
              {{ isLastStep ? 'Get Started' : 'Next' }}
              <base-feather-icon
                v-if="!isLastStep"
                icon="ArrowRightIcon"
                class="ml-1"
              />
              <base-feather-icon v-else icon="PartyPopperIcon" class="ml-1" />
            </b-button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  components: { BaseFeatherIcon },

  data() {
    return {
      showTutorial: false,
    }
  },

  computed: {
    ...mapGetters('tutorial', [
      'currentStep',
      'currentStepIndex',
      'totalSteps',
      'tutorialCompleted',
      'tutorialOptedOut',
      'isTutorialVisible'
    ]),

    isVisible: {
      get() { return this.isTutorialVisible },
      set(value) { this.$store.commit('tutorial/SET_TUTORIAL_VISIBLE', value) }
    },

    isLastStep() {
      return this.currentStepIndex === this.totalSteps - 1
    },

    progressPercentage() {
      return ((this.currentStepIndex + 1) / this.totalSteps) * 100
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.checkAndShowTutorial()
    })
  },

  created(){
    const {t} = useI18nUtils()
    this.t = t
  },

  methods: {
    ...mapActions('tutorial', [
      'nextTutorialStep',
      'previousTutorialStep',
      'completeTutorial',
      'setTutorialBasedOnProgress',
      'setPendingStep',
      'setOptedOut',
    ]),

    checkAndShowTutorial() {
      if (this.tutorialOptedOut) return

      // Always recalculate progress every time the app loads
      this.setTutorialBasedOnProgress()
      this.showTutorial = true
    },

    nextStep() {
      if (this.currentStepIndex < 2) { // Modal steps
        if (this.isLastStep) {
          this.completeTutorial()
          localStorage.setItem('tutorial_seen', 'true')
          this.showTutorial = false
        } else {
          this.nextTutorialStep()
        }
      } else {
        // Switch to spotlight for steps 3+
        this.showTutorial = false
        this.$store.dispatch('tutorial/startSpotlightTour')
      }
    },

    previousStep() {
      this.previousTutorialStep()
    },

    skipTutorial() {
      this.showTutorial = false
    },

    skipTutorialForever() {
      this.setOptedOut(true)
      this.showTutorial = false
    },

    handleAction(action) {
      switch (action) {
        case 'open-language-settings':
          this.$emit('open-language-selector') // Parent will open locale dropdown
          break

        case 'go-to-companies':
          this.setPendingStep(this.currentStepIndex + 1) // Resume here after creating company
          this.$router.push({ name: 'companies' })
          this.showTutorial = false
          break

        case 'go-to-customers':
          this.$router.push({ name: 'client-list' })
          this.setPendingStep(this.currentStepIndex + 1)
          this.showTutorial = false
          break

        case 'go-to-add-invoice':
          this.$router.push({ name: 'add-invoice' })
          this.setPendingStep(this.currentStepIndex + 1)
          this.showTutorial = false
          break
      }
    },
  },
}
</script>

<style scoped>
.progress { height: 8px; border-radius: 4px; background-color: #e9ecef; }
.progress-bar { border-radius: 4px; }
.tutorial-content { padding: 1rem 0; }
</style>