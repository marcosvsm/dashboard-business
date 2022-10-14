import Vue from 'vue'
import App from './App.vue'
//import VueRouter from 'vue-router'

//router setup
import router from './router/index'

//Translation
import i18n from '@/libs/i18n'

//bootstrap import
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'

// Import Bootstrap and BootstrapVue CSS files (order is important)
//import 'bootstrap/dist/css/bootstrap.css'
//import 'bootstrap-vue/dist/bootstrap-vue.css'

// library imports 
import store from "./store";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

//plugin setup
//Vue.use(VueRouter);

// import core styles
require('@/scss/core.scss')

// import assets styles
require('@/assets/scss/style.scss')


//Vue.config.productionTip = false

new Vue({
  el: '#app',
  render: h => h(App),
  router: router,
  store: store,
  i18n,
})
