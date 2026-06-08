import service from '@/store/services/companies-service';

const state = {
  list: {},
  company: {},
  meta: {},
  url: null
};

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list;
  },
  SET_RESOURCE: (state, company) => {
    state.company = company;
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
      .then((company) => {
        commit('SET_RESOURCE', company);
        return company;
      });
  },

  add({commit, dispatch}, params) {
    return service.add(params)
      .then((company) => {
        commit('SET_RESOURCE', company);
        return company;
      });
  },

  update({commit, dispatch}, params) {
    return service.update(params)
      .then((company) => {
        commit('SET_RESOURCE', company);
        return company;
      });
  },

  destroy({commit, dispatch}, params) {
    return service.destroy(params);
  },

  // Stateless: does not commit anything. Returns normalized ABR payload to the caller.
  lookupAbn(_ctx, abn) {
    return service.lookupAbn(abn);
  },

};

const getters = {
  list: state => state.list,
  listTotal: state => state.meta.page.total,
  company: state => state.company,
  url: state => state.url
};

const companies = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};

export default companies;
