import { runSpotlightTour } from '@/utils/tour'
const STORAGE_KEYS = {
  completed: 'tutorial_completed_v1',
  optOut: 'tutorial_opted_out_v1',
  pending: 'tutorial_pending_step_v1',
}
const INTRO_STEPS = []
const SPOTLIGHT_STEPS = [
  {
    popover: {
      title: 'Welcome to Simplify!',
      description: 'Let\'s take a quick tour to get you familiar with the main features of the platform.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#nav-link-language',
    popover: {
      title: 'Choose Your Language',
      description: 'Click here to open the language selector and choose your preferred language.',
      side: 'bottom',
      align: 'start',
    },
    showButton: ['close'],
  },
  // Step 2: Highlight the menu (will be activated when open)
  {
    element: '#language-modal',
    popover: {
      title: 'Select Your Language',
      description: 'Pick your preferred language from the list below. The tour will continue automatically after you choose.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    popover: {                       // no element – floating instruction
      title: 'Great choice!',
      description: 'Your language has been updated. Let’s continue the tour.',
      side: 'bottom',
      align: 'center',
    },
  // Optional: stagePadding: 0, popoverClass: 'floating-success'
  },
  {
    element: '[data-tour-target="nav-my-business"]',
    popover: {
      title: 'My Business',
      description: 'All your company info lives here. Expand this menu whenever you need to manage business data.',
      side: 'right',
    },
  },
  {
    element: '[data-tour-target="nav-business"]',
    popover: {
      title: 'Manage Your Company',
      description: 'Open the Business section to add or edit your company details.',
      side: 'right',
    },
  },
  {
    element: '[data-tour-target="nav-clients"]',
    popover: {
      title: 'Customers',
      description: 'Keep your customer list up to date so invoices are ready to send.',
      side: 'right',
    },
  },
  {
    element: '[data-tour-target="nav-finance"]',
    popover: {
      title: 'Finance Tools',
      description: 'Everything related to invoices and taxes is organized here.',
      side: 'right',
    },
  },
  {
    element: '[data-tour-target="nav-invoice"]',
    popover: {
      title: 'Create Invoices',
      description: 'Jump straight into creating an invoice from this shortcut.',
      side: 'right',
    },
  },
]
const hasBrowser = typeof window !== 'undefined'
const storage = hasBrowser ? window.localStorage : null
const getStoredBoolean = key => storage?.getItem(key) === 'true'
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
  tutorialCompleted: getStoredBoolean(STORAGE_KEYS.completed),
  tutorialOptedOut: getStoredBoolean(STORAGE_KEYS.optOut),
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
    const safeValue = clampStep(state, step)
    state.pendingStep = safeValue
    if (storage) storage.setItem(STORAGE_KEYS.pending, safeValue.toString())
  },
  SET_COMPLETED(state, value) {
    state.tutorialCompleted = value
  },
  SET_OPTED_OUT(state, value) {
    state.tutorialOptedOut = value
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
}
const actions = {
  async startTour({ getters, dispatch, state, commit }) {
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
    if (storage) {
      if (value) {
        storage.setItem(STORAGE_KEYS.optOut, 'true')
      } else {
        storage.removeItem(STORAGE_KEYS.optOut)
      }
    }
    if (value) {
      commit('SET_TUTORIAL_VISIBLE', false)
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