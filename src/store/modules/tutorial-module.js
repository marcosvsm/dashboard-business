const state = {
  tutorialCompleted: false,
  currentTutorialStep: 0,
  tutorialSteps: [
    { component: 'Dashboard',  title: 'Welcome', description: 'Learn how to use Simplify Business!' },
    { component: 'CompanySetup', title: 'Create Company', description: 'Start by creating your company.' },
    { component: 'CustomerManagement', title: 'Add Customers', description: 'Easily add your customers.' },
    { component: 'InvoiceManagement', title: 'Create Invoice', description: 'Now you can create your first invoice.' }
    // Add more steps as necessary
  ],
};
const mutations = {
  SET_TUTORIAL_STEP(state, step) {
    state.currentTutorialStep = step;
  },
  COMPLETE_TUTORIAL(state) {
    state.tutorialCompleted = true;
  }
};
const actions = {
  nextTutorialStep({ commit, state }) {
    if (state.currentTutorialStep < state.tutorialSteps.length - 1) {
      commit('SET_TUTORIAL_STEP', state.currentTutorialStep + 1);
    } else {
      commit('COMPLETE_TUTORIAL');
    }
  },
  completeTutorial({ commit }) {
    commit('COMPLETE_TUTORIAL');
  },
};
const getters = {
  currentStep(state) {
    return state.tutorialSteps[state.currentTutorialStep];
  },
  tutorialCompleted(state) {
    return state.tutorialCompleted;
  }
};
const tutorial = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
  };
  
  export default tutorial;