import Vue from 'vue';
import Vuex from 'vuex';

//Modules
import auth from "./modules/auth";
import users from "./modules/users-module"
import appConfig from './modules/appConfig'
import verticalMenu from './modules/verticalMenu'
import app from './modules/app'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        auth,
        users,
        app,
        appConfig,
        verticalMenu,
    }
});