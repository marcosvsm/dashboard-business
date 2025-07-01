import service from '@/store/services/customers-service';

const state = {
  list: {},
  customer: {},
  meta: {},
  url: null
};

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list;
  },
  SET_RESOURCE: (state, customer) => {
    state.customer = customer;
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

  get({commit, dispatch}, {id, include= []}) {
    return service.get(id,include)
      .then((customer) => { commit('SET_RESOURCE', customer); });
  },

  add({commit, dispatch}, params) {
    return service.add(params)
      .then((customer) => { commit('SET_RESOURCE', customer); });
  },

  update({commit, dispatch}, params) {
    return service.update(params)
      .then((customer) => { commit('SET_RESOURCE', customer); });
  },

  destroy({commit, dispatch}, params) {
    return service.destroy(params);
  },

};

const getters = {
  list: state => state.list,
  listTotal: state => state.meta.page.total,
  customer: state => state.customer,
  url: state => state.url
};

const customers = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};

export default customers;
