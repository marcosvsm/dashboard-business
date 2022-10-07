import DashboardLayout from '../components/Views/Layout/DashboardLayout.vue'

//import middleware
import auth from "@/middleware/auth"
import guest from "@/middleware/guest"

//Pages
import Login from '../components/Views/Pages/Login.vue'
import Register from '../components/Views/Pages/Register.vue'

//Dashboard
import Overview from '../components/Views/Pages/Dashboard/Overview/Overview.vue'

//import HelloWorld from '../components/HelloWorld.vue'

let loginPage = {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { middleware: guest }
}

let registerPage = {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { middleware: guest }
}

const routes = [
    {
        path: '/',
        component: DashboardLayout,
        redirect: '/dashboard',
    },
    loginPage,
    registerPage,
    {
        path: '/dashboard',
        component: DashboardLayout,
        redirect: '/dashboard/overview',
        meta: { middleware: auth },
        children: [
            {
                path: 'overview',
                name: 'Overview',
                component: Overview,
                meta: {middleware: guest}
            }
        ]
    }
];

export default routes