//import middleware
//import auth from "@/middleware/auth"
import guest from "@/middleware/guest"

//Pages
import Login from '../components/views/pages/Login.vue'
import Register from '../components/views/pages/Register.vue'

//Dashboard
import Overview from '../components/views/pages/dashboard/overview/Overview.vue'


let loginPage = {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      layout: 'full', 
      middleware: guest,
    }
}

let registerPage = {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      layout: 'full',
      middleware: guest }
}

const routes = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    loginPage,
    registerPage,
    {
        path: '/dashboard',
        redirect: '/dashboard/overview',
        meta: { 
          layout: 'vertical',  
          middleware: guest },
        children: [
            {
              path: 'overview',
              name: 'Overview',
              component: Overview,
              meta: {
                layout: 'vertical', 
                middleware: guest}
            }
        ]
    }
];

export default routes