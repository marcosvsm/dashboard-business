/**
 * Tax — Vuex Module (Phase 2)
 *
 * State is loaded from the backend on login/mount via fetchProfile + fetchOverview.
 * localStorage is kept as a write-through cache so the UI stays snappy on reload
 * while the async fetch completes in the background.
 *
 * localStorage keys (versioned _v1 to allow future schema migration):
 *   tax_setup_complete_v1
 *   tax_setup_data_v1
 *   tax_saved_amount_v1
 */

import taxService from '@/store/services/tax-service';

const KEYS = {
  setupComplete: 'tax_setup_complete_v1',
  setupData:     'tax_setup_data_v1',
  savedAmount:   'tax_saved_amount_v1',
};

export const DEFAULT_SETUP = {
  // ── Section 1: Business Tax Identity ─────────────────────────
  businessStructure: null,   // 'sole-trader' | 'company' | 'partnership' | 'trust' | 'unsure'
  abn:               '',
  financialYear:     null,   // 'standard' | 'substituted'

  // ── Section 2: GST ────────────────────────────────────────────
  gstRegistered:     null,   // 'yes' | 'no' | 'checking'
  gstRegisteredFrom: '',
  chargesGst:        null,   // 'all' | 'some' | 'no'
  gstBasis:          null,   // 'cash' | 'accrual' | 'unsure'
  gstFrequency:      null,   // 'monthly' | 'quarterly' | 'annually'

  // ── Section 3: Income Tax & Medicare ─────────────────────────
  estimateTax:       null,   // 'yes' | 'no'
  taxResidency:      null,   // 'resident' | 'working-holiday' | 'non-resident' | 'unsure'
  medicareLevy:      null,   // 'yes' | 'exempt' | 'unsure'
  paygInstalments:   null,   // 'yes' | 'no' | 'unsure'
  paygAmountPaid:    0,      // AUD; amount of PAYG already paid this year (if paygInstalments === 'yes')
  alreadySaved:      0,      // AUD; seeds savedAmount when setup completes

  // ── Section 4: Sales & Expenses ──────────────────────────────
  salesTaxable:      null,   // 'yes' | 'mixed' | 'no'
  trackGstExpenses:  null,   // 'yes' | 'no' | 'later'

  // ── Section 5: Compliance ─────────────────────────────────────
  hasTaxAgent:          null,  // 'yes' | 'no'
  wantsReminders:       null,  // 'yes' | 'no'
  invoiceWordingCheck:  null,  // 'yes' | 'no'
};

function load() {
  try {
    return {
      isSetupComplete: localStorage.getItem(KEYS.setupComplete) === 'true',
      setupData:       JSON.parse(localStorage.getItem(KEYS.setupData) || 'null'),
      savedAmount:     parseFloat(localStorage.getItem(KEYS.savedAmount) || '0'),
    };
  } catch {
    return { isSetupComplete: false, setupData: null, savedAmount: 0 };
  }
}

const persisted = load();

const state = {
  isSetupComplete: persisted.isSetupComplete,
  setupData:       { ...DEFAULT_SETUP, ...(persisted.setupData || {}) },
  savedAmount:     persisted.savedAmount,

  // profileId is the backend UUID — null means no profile exists yet.
  profileId:        persisted.setupData?.id ?? null,
  profileUpdatedAt: persisted.setupData?.updatedAt ?? null,

  // API-fed state
  isLoading: false,
  overview:  null,
  error:     null,
};

const mutations = {
  SET_SETUP_COMPLETE(state, value) {
    state.isSetupComplete = value;
    localStorage.setItem(KEYS.setupComplete, String(value));
  },

  SET_SETUP_DATA(state, data) {
    state.setupData = { ...DEFAULT_SETUP, ...data };
    localStorage.setItem(KEYS.setupData, JSON.stringify(state.setupData));
  },

  SET_PROFILE_ID(state, uuid) {
    state.profileId = uuid;
  },

  SET_PROFILE_UPDATED_AT(state, iso) {
    state.profileUpdatedAt = iso;
  },

  SET_SAVED_AMOUNT(state, amount) {
    state.savedAmount = amount;
    localStorage.setItem(KEYS.savedAmount, String(amount));
  },

  SET_LOADING(state, value) {
    state.isLoading = value;
  },

  SET_OVERVIEW(state, data) {
    state.overview = data;
  },

  SET_ERROR(state, message) {
    state.error = message;
  },

  CLEAR_ERROR(state) {
    state.error = null;
  },

  RESET(state) {
    state.isSetupComplete = false;
    state.setupData       = { ...DEFAULT_SETUP };
    state.savedAmount     = 0;
    state.profileId        = null;
    state.profileUpdatedAt = null;
    state.overview         = null;
    state.error           = null;
    localStorage.removeItem(KEYS.setupComplete);
    localStorage.removeItem(KEYS.setupData);
    localStorage.removeItem(KEYS.savedAmount);
  },
};

const actions = {
  /**
   * Called when the user completes the tax setup wizard.
   * Creates a new backend profile (POST) or updates an existing one (PATCH).
   */
  async completeSetup({ commit, state }, data) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    try {
      let saved;
      if (state.profileId) {
        saved = await taxService.updateProfile(state.profileId, data);
      } else {
        saved = await taxService.saveProfile(data);
        if (saved?.id) commit('SET_PROFILE_ID', saved.id);
      }

      const merged = { ...data, ...(saved || {}) };
      commit('SET_SETUP_DATA', merged);

      if (merged.alreadySaved > 0) {
        commit('SET_SAVED_AMOUNT', parseFloat(merged.alreadySaved) || 0);
      }
      commit('SET_SETUP_COMPLETE', true);
    } catch (err) {
      commit('SET_ERROR', err?.response?.data?.message || err?.message || 'Failed to save tax profile');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Update only the "already saved" amount and sync to backend.
   */
  async updateSavedAmount({ commit, state }, amount) {
    const parsed = parseFloat(amount) || 0;
    commit('SET_SAVED_AMOUNT', parsed);

    if (state.profileId) {
      try {
        await taxService.updateProfile(state.profileId, {
          ...state.setupData,
          alreadySaved: parsed,
        });
      } catch (err) {
        commit('SET_ERROR', err?.response?.data?.message || err?.message || 'Failed to update saved amount');
      }
    }
  },

  /**
   * Fetch the user's persisted tax profile from the backend.
   * Called on mount / after login to hydrate state from the server.
   */
  async fetchProfile({ commit }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    try {
      const profile = await taxService.getProfile();
      if (profile) {
        if (profile.id) commit('SET_PROFILE_ID', profile.id);
        if (profile.updatedAt) commit('SET_PROFILE_UPDATED_AT', profile.updatedAt);
        commit('SET_SETUP_DATA', profile);
        commit('SET_SETUP_COMPLETE', true);
        if (profile.alreadySaved > 0) {
          commit('SET_SAVED_AMOUNT', parseFloat(profile.alreadySaved) || 0);
        }
      }
    } catch (err) {
      commit('SET_ERROR', err?.response?.data?.message || err?.message || 'Failed to load tax profile');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Fetch the backend-calculated tax overview for the current financial year.
   */
  async fetchOverview({ commit }, { companyUuid = null } = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    try {
      const overview = await taxService.getOverview(companyUuid);
      commit('SET_OVERVIEW', overview);
    } catch (err) {
      commit('SET_ERROR', err?.response?.data?.message || err?.message || 'Failed to load tax overview');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  resetSetup({ commit }) {
    commit('RESET');
  },
};

const getters = {
  isSetupComplete: state => state.isSetupComplete,
  setupData:       state => state.setupData,
  savedAmount:     state => state.savedAmount,
  profileId:        state => state.profileId,
  profileUpdatedAt: state => state.profileUpdatedAt,
  isLoading:       state => state.isLoading,
  overview:        state => state.overview,
  error:           state => state.error,
  hasOverviewData: state => !!state.overview,
  isGstRegistered: state => state.setupData?.gstRegistered === 'yes',
  taxResidency:    state => state.setupData?.taxResidency,
  medicareLevy:    state => state.setupData?.medicareLevy,
  estimateTax:     state => state.setupData?.estimateTax === 'yes',
};

const tax = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default tax;
