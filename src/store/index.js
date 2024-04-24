import Vue from 'vue';
import Vuex from 'vuex';

//Modules
import auth from "./modules/auth";
import users from "./modules/users-module"
import appConfig from './modules/appConfig'
import verticalMenu from './modules/verticalMenu'
import app from './modules/app'
import profile from './modules/profile-module'
import companies from "./modules/companies-module"

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        auth,
        users,
        app,
        appConfig,
        verticalMenu,
        profile,
        companies,
    }
});