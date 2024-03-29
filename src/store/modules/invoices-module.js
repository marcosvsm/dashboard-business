import service from '@/store/services/invoices-service';

const state = {
  list: {},
  invoice: {},
  meta: {},
  url: null
};

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list;
  },
  SET_RESOURCE: (state, invoice) => {
    state.invoice = invoice;
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
      .then((invoice) => { commit('SET_RESOURCE', invoice); });
  },

  add({commit, dispatch}, params) {
    return service.add(params)
      .then((invoice) => { commit('SET_RESOURCE', invoice); });
  },

  update({commit, dispatch}, params) {
    return service.update(params)
      .then((invoice) => { commit('SET_RESOURCE', invoice); });
  },

  destroy({commit, dispatch}, params) {
    return service.destroy(params);
  },

};

const getters = {
  list: state => state.list,
  listTotal: state => state.meta.page.total,
  invoice: state => state.invoice,
  url: state => state.url
};

const invoices = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};

export default invoices;
