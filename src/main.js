import Vue from 'vue'
import App from './App.vue'
//import VueRouter from 'vue-router'
import VueNotify from 'vue-notifyjs'

//router setup
import router from './router/index'

//Translation
import i18n from '@/libs/i18n'

//bootstrap import
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'

// library imports 
import store from "./store";
import './registerServiceWorker'

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueNotify);
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
