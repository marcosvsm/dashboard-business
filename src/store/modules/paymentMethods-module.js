import service from '@/store/services/paymentMethods-service';

const state = {
  list: {},
  paymentMethod: {}, // Add payment details to state
  meta: {},
  url: null,
};

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list;
  },
  SET_RESOURCE: (state, paymentMethod) => {
    state.paymentMethod = paymentMethod;
  },
  SET_META: (state, meta) => {
    state.meta = meta;
  },
  SET_URL: (state, url) => {
    state.url = url;
  }
};

const actions = {
  list({commit, dispatch}, params) {
    return service.list(params)
      .then(({list, meta}) => {
        commit('SET_LIST', list);
        commit('SET_META', meta);
      });
  },

  get({commit, dispatch}, params) {
    return service.get(params)
      .then((paymentMethod) => { commit('SET_RESOURCE', paymentMethod); });
  },

  add({commit, dispatch}, params) {
    return service.add(params)
      .then((paymentMethod) => { commit('SET_RESOURCE', paymentMethod); });
  },

  update({commit, dispatch}, params) {
    return service.update(params)
      .then((paymentMethod) => { commit('SET_RESOURCE', paymentMethod); });
  },

  destroy({commit, dispatch}, params) {
    return service.destroy(params);
  },

};

const getters = {
  list: state => state.list,
  listTotal: state => state.meta.page.total,
  paymentMethod: state => state.paymentMethod,
  url: state => state.url
};

const paymentMethods = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};

export default paymentMethods;
