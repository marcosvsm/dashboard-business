//import middleware
import auth from "@/middleware/auth"
import guest from "@/middleware/guest"

//Pages
import Login from '@/components/views/pages/Login.vue'
import Register from '@/components/views/pages/Register.vue'
import EmailVerification from '@/components/views/pages/EmailVerification.vue'
import ForgotPassword from '@/components/views/pages/ForgotPassword.vue'
import PasswordReset from '@/components/views/pages/PasswordReset.vue'
import ConfirmRegister from '@/components/views/pages/ConfirmRegister.vue'
import NotFound from '@/components/views/pages/NotFound.vue'
import CompanyPage from '@/components/views/pages/CompanyPage.vue'
import InvoicePage from '@/components/views/pages/InvoicePage.vue'

//Dashboard
import Overview from '@/components/views/pages/dashboard/overview/Overview.vue'

//Invoice
import InvoiceAdd from '@/components/views/pages/invoice/InvoiceAdd.vue'
import InvoiceList from '@/components/views/pages/invoice/InvoiceList.vue'
import InvoiceFree from '@/components/views/pages/invoice/InvoiceAdd.vue'
import InvoiceOverview from '@/components/views/pages/invoice/InvoiceOverview.vue'

import Company from '@/components/views/pages/Company.vue'
import CompanyList from '@/components/views/pages/company/CompanyList.vue'

//tax
import TaxCalculator from '@/components/views/pages/tax/TaxCalculator.vue'

//User
import UserProfile from '@/components/views/pages/user/Profile.vue'

import Faq from '@/components/views/pages/menu/Faq.vue'

import GoogleCallback from '@/components/views/pages/GoogleCallback.vue'

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
    name: 'register',
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


let invoiceFreePage = {
  path: '/invoice/free',
  name: 'invoice-free',
  component: InvoiceFree,
  meta: {
    layout: 'full',
  }
}

let invoicePage = {
  path: '/invoice',
  component: InvoicePage,
  meta: {
    middleware: auth,
  },
  children: [
    {
      path: 'create',
      name: 'add-invoice',
      component: InvoiceAdd,
      meta: {
        middleware: auth,
      },
    },
    {
      path: 'list',
      name: 'invoices',
      component: InvoiceList,
      meta:{
        middleware: auth,
      },
    },
    {
      path: 'overview/:id',
      name: 'invoice',
      component: InvoiceOverview,
      meta:{
        middleware: auth,
      },
    },
  ]
}

let companyPage = {
  path: '/company',
  component: CompanyPage,
  meta: {
    middleware: auth,
  },
  children: [
    {
      path: 'add',
      name: 'addCompany',
      component: Company,
      meta: {
        middleware: auth,
      },
    },
    {
      path: 'list',
      name: 'companies',
      component: CompanyList,
      meta: {
        middleware: auth,
      },
    }
  ]
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

let confirmRegisterPage = {
  path: '/confirm-registration',
  name: 'confirmRegister',
  component: ConfirmRegister,
  meta: {
    layout: 'full',
    middleware: guest,
  },
}

let dashboardPage = {
    path: '/dashboard/overview',
    name: 'dashboard-overview',
    component: Overview,
    meta: {
      middleware: auth
    }
}

let taxPage = {
  path: '/tax/calculator',
  name: 'tax-calculator',
  component: TaxCalculator,
  meta: {
    middleware: auth
  }
}

let googleCallbackPage = {
  path: '/auth/google/callback',
  name: 'GoogleCallback',
  component: GoogleCallback,
  meta: {
    middleware: guest,
  },
}

let notFoundPage = {
  // Add a catch-all route for 404 Not Found
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound,
    meta: {
      layout: 'full',
    },
}



const routes = [
  {
    path: '/',
    redirect: '/dashboard/overview',
  },
    dashboardPage,
    loginPage,
    registerPage,
    invoicePage,
    invoiceFreePage,
    companyPage,
    profilePage,
    emailPage,
    forgotPasswordPage,
    passwordResetPage,
    faqPage,
    confirmRegisterPage,
    taxPage,
    googleCallbackPage,
    notFoundPage,
];

export default routes