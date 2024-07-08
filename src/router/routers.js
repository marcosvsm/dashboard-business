//import middleware
import auth from "@/middleware/auth"
import guest from "@/middleware/guest"

//Pages
import Login from '@/components/views/pages/Login.vue'
import Register from '@/components/views/pages/Register.vue'
import EmailVerification from '@/components/views/pages/EmailVerification.vue'
import ForgotPassword from '@/components/views/pages/ForgotPassword.vue'
import PasswordReset from '@/components/views/pages/PasswordReset.vue'

//Dashboard
import Overview from '@/components/views/pages/dashboard/overview/Overview.vue'

//Invoice
import InvoiceAdd from '@/components/views/pages/invoice/InvoiceAdd.vue'
import InvoiceList from '@/components/views/pages/invoice/InvoiceList.vue'
import InvoiceFree from '@/components/views/pages/invoice/InvoiceAdd.vue'

import Company from '@/components/views/pages/Company.vue'
import CompanyList from '@/components/views/pages/company/CompanyList.vue'

//User
import UserProfile from '@/components/views/pages/user/Profile.vue'

import Faq from '@/components/views/pages/menu/Faq.vue'

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

let forgotPasswordPage = {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: {
      layout: 'full',
      middleware: guest
    }
}

let passwordResetPage = {
  path: '/password-reset',
  name: 'password-reset',
  component: PasswordReset,
  meta: {
    layout: 'full',
    middleware: guest
  }
}

let emailPage = {
  path: '/email/verify',
  name: 'Verification',
  component: EmailVerification,
  meta : {
    layout: 'full',
    middleware: guest,
  }
}

let invoicePage = {
  path: '/invoice/add',
  name: 'invoice-add',
  component: InvoiceAdd,
  meta: {
    middleware: auth,
  }
}

let invoiceListPage = {
  path: '/invoice/list',
  name: 'invoices',
  component: InvoiceList,
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
  path: '/company/add',
  name: 'addCompany',
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

let profilePage = {
  path: '/profile',
  name: 'profile',
  component: UserProfile,
  meta: {
    middleware: auth,
  },
}

let faqPage = {
  path: '/faq',
  name: 'faq',
  component: Faq,
  meta: {
    middleware:auth,
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
    invoiceListPage,
    invoiceFreePage,
    companyPage,
    companyListPage,
    profilePage,
    emailPage,
    forgotPasswordPage,
    passwordResetPage,
    faqPage,
    {
      path: '/dashboard/overview',
      name: 'dashboard-overview',
      component: Overview,
      meta: {
        middleware: auth
      }
    },
];

export default routes