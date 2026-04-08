import { runSpotlightTour } from '@/utils/tour'
import profileService from '@/store/services/profile-service'
const STORAGE_KEYS = {
  completed: 'tutorial_completed_v1',
  optOut: 'tutorial_opted_out_v1',
  pending: 'tutorial_pending_step_v1',
}
const INTRO_STEPS = []
const SPOTLIGHT_STEPS = [
  {
    popover: {
      title: 'tutorial.welcome.title',
      description: 'tutorial.welcome.description',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#nav-link-language',
    popover: {
      title: 'tutorial.language.title',
      description: 'tutorial.language.description',
      side: 'bottom',
      align: 'start',
      showButton: ['previous','close'],
    },
  },
  // Step 2: Highlight the menu – user must pick a language, no nav buttons
  {
    element: '#language-modal',
    popover: {
      title: 'tutorial.languageModal.title',
      description: 'tutorial.languageModal.description',
      align: 'start',
      showButtons: ['previous','close'],
    },
  },
  // Step 3: Confirmation – no back button, user can only go forward
  {
    popover: {                       // no element – floating instruction
      title: 'tutorial.languageUpdated.title',
      description: 'tutorial.languageUpdated.description',
      side: 'bottom',
      align: 'center',
      showButtons: ['next', 'close'],
    },
  },
  {
    element: '[data-tour-target="nav-my-business"]',
    popover: {
      title: 'tutorial.myBusiness.title',
      description: 'tutorial.myBusiness.description',
      side: 'right',
    },
  },
  {
    element: '[data-tour-target="nav-business"]',
    popover: {
      title: 'tutorial.business.title',
      description: 'tutorial.business.description',
      side: 'right',
    },
  },
  {
    element: '[data-tour-target="nav-clients"]',
    popover: {
      title: 'tutorial.clients.title',
      description: 'tutorial.clients.description',
      side: 'right',
    },
  },
  {
    element: '[data-tour-target="nav-finance"]',
    popover: {
      title: 'tutorial.finance.title',
      description: 'tutorial.finance.description',
      side: 'right',
    },
  },
  {
    element: '[data-tour-target="nav-invoice"]',
    popover: {
      title: 'tutorial.invoice.title',
      description: 'tutorial.invoice.description',
      side: 'right',
    },
  },
]
const hasBrowser = typeof window !== 'undefined'
const storage = hasBrowser ? window.localStorage : null
const getStoredNumber = key => {
  if (!storage) return 0
  const raw = storage.getItem(key)
  const parsed = raw !== null ? parseInt(raw, 10) : 0
  return Number.isFinite(parsed) ? parsed : 0
}
const cloneSteps = steps => steps.map(step => ({
  ...step,
  popover: step.popover ? { ...step.popover } : undefined,
  actionButton: step.actionButton ? { ...step.actionButton } : undefined,
}))
const getTotalSteps = state => state.introSteps.length + state.spotlightSteps.length
const clampStep = (state, value) => {
  if (!Number.isFinite(value)) return 0
  const total = getTotalSteps(state)
  return Math.min(Math.max(value, 0), total)
}
const state = () => ({
  currentStepIndex: 0,
  tutorialVisible: false,
  tourClosedPromptVisible: false,
  tutorialCompleted: false,   // DB is source of truth — never read from localStorage on init
  tutorialOptedOut: false,    // DB is source of truth — never read from localStorage on init
  pendingStep: getStoredNumber(STORAGE_KEYS.pending),
  introSteps: cloneSteps(INTRO_STEPS),
  spotlightSteps: cloneSteps(SPOTLIGHT_STEPS),
})
const mutations = {
  SET_TUTORIAL_VISIBLE(state, value) {
    state.tutorialVisible = value
  },
  SET_CURRENT_STEP(state, index) {
    state.currentStepIndex = clampStep(state, index)
  },
  SET_PENDING_STEP(state, step) {
    let safeValue = clampStep(state, step)
    if (safeValue === 2)
      safeValue = 1
    state.pendingStep = safeValue
    if (storage) storage.setItem(STORAGE_KEYS.pending, safeValue.toString())
  },
  SET_COMPLETED(state, value) {
    state.tutorialCompleted = value
  },
  SET_OPTED_OUT(state, value) {
    state.tutorialOptedOut = value
  },
  SET_TOUR_CLOSED_PROMPT_VISIBLE(state, value) {
    state.tourClosedPromptVisible = value
  },
  RESET_TUTORIAL_STATE(state) {
    state.currentStepIndex = 0
    state.pendingStep = 0
    state.tutorialVisible = false
    state.tutorialCompleted = false
    state.tutorialOptedOut = false
  },
}
const getters = {
  currentStep: state => {
    if (!state.introSteps.length) return null
    const index = Math.min(state.currentStepIndex, state.introSteps.length - 1)
    return state.introSteps[index]
  },
  currentStepIndex: state => state.currentStepIndex,
  totalSteps: state => getTotalSteps(state),
  tutorialCompleted: state => state.tutorialCompleted,
  tutorialOptedOut: state => state.tutorialOptedOut,
  isTutorialVisible: state => state.tutorialVisible,
  isTourActive: state => !state.tutorialCompleted && !state.tutorialOptedOut,
  tourClosedPromptVisible: state => state.tourClosedPromptVisible,
}
const actions = {
  // Called after login to sync DB preferences into local state
  async loadPreferences({ commit, rootGetters }) {
    try {
      // Get user from your auth module (as you already do)
      const user = rootGetters['auth/authUser'] || rootGetters['users/user']
      const prefs = user?.preferences || {}

      console.log('Tutorial - Loading preferences from auth/user:', prefs)
      // === ONLY CARE ABOUT TUTORIAL STATUS ===
      if (prefs.tutorialCompleted === true) {
        commit('SET_COMPLETED', true)
        storage?.setItem(STORAGE_KEYS.completed, 'true')
        storage?.removeItem(STORAGE_KEYS.pending)
      } 
      else if (prefs.tutorialCompleted === false) {
        commit('SET_COMPLETED', false)
        storage?.removeItem(STORAGE_KEYS.completed)
        storage?.removeItem(STORAGE_KEYS.pending)
      }

      if (prefs.tutorialOptedOut === true) {
        commit('SET_OPTED_OUT', true)
        storage?.setItem(STORAGE_KEYS.optOut, 'true')
      } 
      else if (prefs.tutorialOptedOut === false) {
        commit('SET_OPTED_OUT', false)
        storage?.removeItem(STORAGE_KEYS.optOut)
      }

    } catch (e) {
      console.warn('Failed to load tutorial preferences', e)
    }
  },

  async startTour({ getters, dispatch, state, commit }) {
    await dispatch('loadPreferences')
    if (!getters.isTourActive) return
    await dispatch('setTutorialBasedOnProgress')
    if (state.pendingStep >= state.introSteps.length) {
      dispatch('startSpotlightTour')
    } else {
      commit('SET_TUTORIAL_VISIBLE', true)
    }
  },
  async nextTutorialStep({ state, commit, dispatch }) {
    const nextIndex = Math.min(state.currentStepIndex + 1, getTotalSteps(state))
    commit('SET_CURRENT_STEP', nextIndex)
    commit('SET_PENDING_STEP', nextIndex)
    if (nextIndex >= state.introSteps.length) {
      commit('SET_TUTORIAL_VISIBLE', false)
      await dispatch('startSpotlightTour', nextIndex - state.introSteps.length)
    }
  },
  previousTutorialStep({ state, commit }) {
    const prevIndex = Math.max(state.currentStepIndex - 1, 0)
    commit('SET_CURRENT_STEP', prevIndex)
    commit('SET_PENDING_STEP', prevIndex)
  },
  async startSpotlightTour({ state, dispatch }, explicitStartAt) {
    if (!state.spotlightSteps.length) return
    const defaultStart = Math.max(state.pendingStep - state.introSteps.length, 0)
    const maxStart = Math.max(state.spotlightSteps.length - 1, 0)
    const startAtRaw = typeof explicitStartAt === 'number' ? explicitStartAt : defaultStart
    const startAt = Math.min(Math.max(startAtRaw, 0), maxStart)
    runSpotlightTour(state.spotlightSteps, {
      startAt,
      onFinish: () => dispatch('completeTutorial'),
      onClose: () => dispatch('closedTourEarly'),
    })
  },
  completeTutorial({ commit, state }) {
    commit('SET_COMPLETED', true)
    commit('SET_TUTORIAL_VISIBLE', false)
    commit('SET_PENDING_STEP', getTotalSteps(state))
    if (storage) {
      storage.setItem(STORAGE_KEYS.completed, 'true')
      storage.removeItem(STORAGE_KEYS.pending)
    }
    profileService.updatePreferences({ tutorialCompleted: true })
  },
  closedTourEarly({ commit }) {
    commit('SET_TOUR_CLOSED_PROMPT_VISIBLE', true)
  },
  async setTutorialBasedOnProgress({ state, getters, commit, rootGetters }) {
    if (!getters.isTourActive) {
      commit('SET_TUTORIAL_VISIBLE', false)
      return
    }
    let progress = Number.isInteger(state.pendingStep) ? state.pendingStep : 0
    const companies = rootGetters['companies/list'] || []
    const customers = rootGetters['customers/list'] || []
    const invoices = rootGetters['invoices/list'] || []
    if (companies.length) progress = Math.max(progress, 1)
    if (customers.length) progress = Math.max(progress, 2)
    if (invoices.length) progress = Math.max(progress, state.introSteps.length)
    const safeProgress = clampStep(state, progress)
    commit('SET_PENDING_STEP', safeProgress)
    commit('SET_CURRENT_STEP', safeProgress)
  },
  setPendingStep({ commit }, step) {
    commit('SET_PENDING_STEP', step)
  },
  setOptedOut({ commit }, value) {
    commit('SET_OPTED_OUT', value)
    commit('SET_TOUR_CLOSED_PROMPT_VISIBLE', false)
    if (storage) {
      if (value) {
        storage.setItem(STORAGE_KEYS.optOut, 'true')
      } else {
        storage.removeItem(STORAGE_KEYS.optOut)
      }
    }
    if (value) {
      commit('SET_TUTORIAL_VISIBLE', false)
      profileService.updatePreferences({ tutorialOptedOut: true })
    }
  },
  resetTutorial({ commit }) {
    commit('RESET_TUTORIAL_STATE')
    if (storage) {
      storage.removeItem(STORAGE_KEYS.completed)
      storage.removeItem(STORAGE_KEYS.pending)
      storage.removeItem(STORAGE_KEYS.optOut)
    }
  },
}
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}