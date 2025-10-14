import Vue from 'vue'
import Root from './Root.vue'
//import VueRouter from 'vue-router'
//import VueNotify from 'vue-notifyjs'
import Toast from 'vue-toastification'
//router setup
import router from './router/index'

//Translation
import i18n from '@/libs/i18n'

//bootstrap import
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'

// library imports 
import store from "./store";
//import './registerServiceWorker'

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(Toast, {
  transition: "Vue-Toastification__fade",
  maxToasts: 5,
  newestOnTop: true
});

//plugin setup
//Vue.use(VueRouter);

// import core styles
import'@/scss/core.scss'

// import assets styles
import '@/assets/scss/style.scss'
//Vue.config.productionTip = false

// Wait until router resolves initial route (async components etc.)
(async () => {

  new Vue({
    router,
    store,
    i18n,
    render: h => h(Root),
  }).$mount('#app');
})();