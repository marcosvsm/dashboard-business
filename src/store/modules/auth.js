import Vue from "vue";
import router from "@/router/index";
import { VueAuthenticate } from "vue-authenticate";

import axios from "@/axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, axios);

const vueAuth = new VueAuthenticate(Vue.prototype.$http, {
  baseUrl: process.env.VUE_APP_API_BASE_URL,
  tokenName: "access_token",
  loginUrl: "/login",
  registerUrl: '/register'
});

export default {
  state: {
    isAuthenticated: localStorage.getItem("vue-authenticate.vueauth_access_token") !== null
  },

  getters: {
    isAuthenticated(state){
      return state.isAuthenticated;
    }
  },

  mutations: {
    isAuthenticated(state, payload){
      state.isAuthenticated = payload.isAuthenticated;
    }
  },

  actions: {
    login(context, payload){
      const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    return vueAuth.login(payload.user, requestOptions ).then(response => {
      context.commit("isAuthenticated", {
        isAuthenticated: vueAuth.isAuthenticated()
      });
      // After successful login, fetch user data with roles
      context.dispatch('users/getMe', null, { root: true }); // Dispatch to users module to fetch and store user with roles
      router.push({ path: "/dashboard/overview" });
    })
    },

    register(context, payload){
      return vueAuth.register(payload.user, payload.requestOptions).then(response => {
        context.commit("isAuthenticated", {
          isAuthenticated: vueAuth.isAuthenticated()
        });
        router.push({ name: 'confirmRegister' })
      });
    },

    logout(context, payload){
      return vueAuth.logout().then(response => {
        context.commit("isAuthenticated", {
          isAuthenticated: vueAuth.isAuthenticated()
        });
        // Clear user data on logout
        context.commit('users/SET_RESOURCE', null, { root: true });
        localStorage.removeItem('userRoles'); // Clear roles on logout
        router.push({name: "Login"});
      });
    },

    forgotPassword(context, payload){
      return Vue.prototype.$http.post(`${process.env.VUE_APP_API_BASE_URL}/password-forgot`, { data: {attributes: {email: payload, redirect_url: process.env.VUE_APP_BASE_URL+'/password-reset' }}})
        .then(response => {
          return response.data;
        })
        .catch(error => {
          throw error;
        });
    },

    resetPassword(context,payload){
      return Vue.prototype.$http.post(`${process.env.VUE_APP_API_BASE_URL}/password-reset`, payload.user )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          throw error;
        });
    },
  }
}