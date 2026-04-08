import service from '@/store/services/products-service';

const state = {
  list: [],
  meta: {},
};

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list;
  },
  SET_META: (state, meta) => {
    state.meta = meta;
  },
  ADD_PRODUCT: (state, product) => {
    state.list.unshift(product);
  },
  REMOVE_PRODUCT: (state, id) => {
    state.list = state.list.filter(p => p.id !== id);
  },
};

const actions = {
  list({ commit }) {
    return service.list()
      .then(({ list, meta }) => {
        commit('SET_LIST', list);
        commit('SET_META', meta);
      })
      .catch(() => {
        // Silently fail while backend endpoint is not yet available
        commit('SET_LIST', []);
      });
  },

  add({ commit }, payload) {
    return service.add(payload)
      .then(product => {
        commit('ADD_PRODUCT', product);
        return product;
      });
  },

  update({ commit, state }, payload) {
    return service.update(payload)
      .then(updated => {
        const newList = state.list.map(p => p.id === updated.id ? updated : p);
        commit('SET_LIST', newList);
        return updated;
      });
  },

  destroy({ commit }, id) {
    return service.destroy(id)
      .then(() => {
        commit('REMOVE_PRODUCT', id);
      });
  },
};

const getters = {
  list: state => state.list,
};

const products = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default products;
