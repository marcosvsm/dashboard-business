//import middleware
import auth from "@/middleware/auth"
import guest from "@/middleware/guest"

//Pages
import Login from './src/components/views/pages/Login.vue'
import Register from './src/components/views/pages/Register.vue'

//Dashboard
import Overview from './src/components/views/pages/dashboard/overview/Overview.vue'

//Invoice
import InvoiceAdd from './src/components/views/pages/invoice/InvoiceAdd.vue'
import InvoiceFree from './src/components/views/pages/invoice/InvoiceAdd.vue'

import Company from './src/components/views/pages/Company.vue'
import CompanyList from './src/components/views/pages/company/CompanyList.vue'

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

let invoicePage = {
  path: '/invoice/add',
  name: 'invoice-add',
  component: InvoiceAdd,
  meta: {
    middleware: auth,
  }
}

let invoiceFreePage = {
  path: '/invoice/free',
  name: 'invoice-free',
  component: InvoiceFree,
  meta: {
    layout: 'full',
  }
}

let companyPage = {
  path: '/company',
  name: 'company',
  component: Company,
  meta: {
    middleware: auth,
  },
}

let companyListPage = {
  path: '/company/list',
  name: 'companies',
  component: CompanyList,
  meta: {
    middleware: auth,
  },
}

const routes = [
    {
      path: '/',
      redirect: 'dashboard/overview',
    },
    loginPage,
    registerPage,
    invoicePage,
    invoiceFreePage,
    companyPage,
    companyListPage,
    {
      path: '/dashboard/overview',
      name: 'dashboard-overview',
      component: Overview,
      meta: {
        middleware: auth
      }
    }
];

export default routes