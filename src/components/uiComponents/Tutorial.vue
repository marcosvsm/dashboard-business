<template>
  <div>
    <!-- Prompt shown when user closes the spotlight tour early -->
    <b-modal
      v-model="tourClosedPromptVisible"
      size="sm"
      centered
      modal-class="tutorial-modal"
      hide-header-close
      no-close-on-backdrop
      no-close-on-esc
    >
      <template #modal-title>
        {{ t('tutorial.closePrompt.title') }}
      </template>
      <p class="text-center py-2">{{ t('tutorial.closePrompt.description') }}</p>
      <template #modal-footer>
        <div class="w-100 d-flex justify-content-between">
          <b-button variant="outline-danger" size="sm" @click="optOutForever">
            {{ t('tutorial.closePrompt.dontShow') }}
          </b-button>
          <b-button variant="primary" size="sm" @click="dismissPrompt">
            {{ t('tutorial.closePrompt.resumeLater') }}
          </b-button>
        </div>
      </template>
    </b-modal>

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
          {{ currentStepTitle ? t(currentStepTitle) : '' }}
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

        <div class="mb-4" v-if="safeCurrentStep.icon">
          <base-feather-icon :icon="safeCurrentStep.icon" size="64" class="text-primary" />
        </div>

        <h4 class="mb-3">{{ currentStepTitle ? t(currentStepTitle) : '' }}</h4>
        <div v-html="currentStepDescription ? t(currentStepDescription) : ''" class="text-muted mb-4 lead"></div>

        <b-button
          v-if="safeCurrentStep.actionButton"
          variant="primary"
          size="lg"
          class="px-5"
          @click="handleAction(safeCurrentStep.actionButton.action)"
        >
          {{ currentStepActionText ? t(currentStepActionText) : '' }}
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
      t: null,
    }
  },
  computed: {
    ...mapGetters('tutorial', [
      'currentStep',
      'currentStepIndex',
      'totalSteps',
      'tutorialCompleted',
      'tutorialOptedOut',
      'isTutorialVisible',
    ]),

    safeCurrentStep() {
      return this.currentStep || {}
    },

    currentStepTitle() {
      return this.safeCurrentStep.title || null
    },

    currentStepDescription() {
      return this.safeCurrentStep.description || null
    },

    currentStepActionText() {
      return this.safeCurrentStep.actionButton ? this.safeCurrentStep.actionButton.text : null
    },

    hasCurrentStep() {
      return Boolean(this.currentStep)
    },

    tourClosedPromptVisible: {
      get() { return this.$store.getters['tutorial/tourClosedPromptVisible'] },
      set(value) { this.$store.commit('tutorial/SET_TOUR_CLOSED_PROMPT_VISIBLE', value) },
    },

    isVisible: {
      get() { return this.isTutorialVisible && this.hasCurrentStep },
      set(value) { this.$store.commit('tutorial/SET_TUTORIAL_VISIBLE', value) }
    },

    isLastStep() {
      return this.totalSteps > 0 && this.currentStepIndex === this.totalSteps - 1
    },

    progressPercentage() {
      if (this.totalSteps <= 0) return 0
      const safeIndex = Math.min(this.currentStepIndex, this.totalSteps - 1)
      return ((safeIndex + 1) / this.totalSteps) * 100
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

    async checkAndShowTutorial() {
      if (this.tutorialOptedOut) return

      // Always recalculate progress every time the app loads
      this.setTutorialBasedOnProgress()
      // Only show if not completed
      if (!this.tutorialCompleted) {
        this.showTutorial = true
      }
    },

    nextStep() {
      if (!this.hasCurrentStep) {
        this.showTutorial = false
        return
      }

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

    optOutForever() {
      this.setOptedOut(true)
    },

    dismissPrompt() {
      this.$store.commit('tutorial/SET_TOUR_CLOSED_PROMPT_VISIBLE', false)
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
