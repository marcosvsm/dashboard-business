import service from '@/store/services/waitlists-service';

const state = {
  list: {},
  waitlist: {},
  meta: {},
  url: null
};

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list;
  },
  SET_RESOURCE: (state, waitlist) => {
    state.waitlist = waitlist;
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
  get({commit, dispatch}, { id, include = [] }) {
    return service.get(id, include)
      .then((waitlist) => { commit('SET_RESOURCE', waitlist); });
  },

  add({commit, dispatch}, params) {
    return service.add(params)
      .then((waitlist) => { commit('SET_RESOURCE', waitlist); });
  },
};

const getters = {
  list: state => state.list,
  waitlist: state => state.waitlist,
  url: state => state.url
};

const waitlists = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};

export default waitlists;
