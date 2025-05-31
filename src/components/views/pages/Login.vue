<template>
<div class="auth-wrapper auth-v2">
    <div class="row auth-inner m-0">
        <div class="d-none d-lg-flex align-items-center p-5 col-lg-8">

        </div>
        <div class="d-flex align-items-center auth-bg px-2 p-lg-5 col-lg-4 right-bg">
            <div class="px-xl-5 mx-auto col-sm-8 col-md-6 col-lg-12">
              <span class="brand-logo">
                <b-img
                  :src="appLogoImage"
                  alt="logo"
                />
                </span>
                <form @submit.prevent="login">
                    <h3>Welcome to Simplify Business!</h3>
                    <p>Please sign-in to your account.</p>
                    <b-form-group label-align-sm="center">
                        <b-input-group class="mt-1">
                            <b-input-group-prepend is-text>
                                <span><b-icon-envelope></b-icon-envelope></span>
                            </b-input-group-prepend>
                                <b-input type="email" v-model="email" placeholder="Email" required></b-input>
                        </b-input-group>
                        <validation-error :errors="apiValidationErrors.email" />
                        <b-input-group class="mt-1">
                            <b-input-group-prepend is-text>
                                <span><b-icon-lock></b-icon-lock></span>
                            </b-input-group-prepend>
                                <b-form-input type="password" v-model="password" placeholder="Password" required></b-form-input>
                        </b-input-group>
                        <validation-error :errors="apiValidationErrors.password" />
                        <div class="d-flex" style="justify-content: space-between!important;">
                            <span></span>
                            <a href="/forgot-password"><small>Forgot Password?</small></a>
                        </div>
                        <div v-if="genericError" class="text-danger text-center mt-2">
                            {{ genericError }}
                        </div>
                        <div class="text-center mt-3">
                            <b-button 
                              variant="primary" 
                              size="sm"
                              type="submit"
                            >
                              Sign in
                            </b-button>
                        </div>
                        <p class="card-text text-center mt-2"><span>New on our platform? </span><a href="/register" class="" target="_self"><span> Create an account</span></a></p>
                    </b-form-group>
                </form>
            <div  class="separator my-3">
              <span class="separator-text">OR</span>
            </div>
            <div class="col-lg-12">
              <b-button
                @click="signInWithGoogle"
                class="btn w-100 d-flex align-items-center justify-content-center"
                :disabled="loading"
                style="background-color: #ffffff !important; border: 1px solid #dadce0 !important; color: #3c4043 !important; font-family: 'Roboto', sans-serif; font-weight: 500;"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="20"
                  height="20"
                  class="mr-2"
                >
                  <g>
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </g>
                </svg>
                <span>Sign in with Google</span>
              </b-button>
              </div>
            </div>
        </div> 
   </div>
</div>
</template>
<script>
import formMixin from "@/mixins/form-mixin"
import ValidationError from "@/components/uiComponents/ValidationError.vue"
import { $themeConfig } from '@/themeConfig'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'

export default {
  mixins: [formMixin],
  components:{
      ValidationError,
  },
  data(){
    const { appLogoImage } = $themeConfig.app
    return {
      email: '',
      password : '',
      appLogoImage,
      genericError: '',
      loading: false,

    }
  },
  methods:{
    async login(){
      this.clearError()
      const user = {
        data: {
          type: "token",
          attributes: {
            email: this.email,
            password: this.password
          }
        }
      }
      try{
        await this.$store.dispatch("login", {user})
      } catch (e){
          this.clearError()
          if (e.response.status === 422) {
            this.genericError = "Invalid credentials"
          } else if (e.response.status === 400 || e.response.status === 500){
            this.genericError = "Invalid credentials"
          } else if (e.response.status === 401 && e.response.data.errors[0].detail === 'You need to verify your email address before logging in.'){
            this.genericError = "You need to verify your email address before logging in."
          }
        }
    },
    clearError(){
       this.genericError = ''
    },
    signInWithGoogle(){
      this.loading = true;
      // Sanitize redirect to prevent open redirect
      const redirectUrl = 'https://app.simplifybusiness.com.au/api/v1/auth/google';
      window.location.href = redirectUrl;

    },
  }, 
}
</script>
<style scoped>
.auth-wrapper{
    
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-preferred-size: 100%;
    flex-basis: 100%;
    min-height: 100vh;
    min-height: calc(var(--vh, 1vh)*100);
    width: 100%;
}
.auth-inner{
    overflow-y: auto;
    height: calc(var(--vh, 1vh)*100);
    width: 100%;
    position: relative;
}
.right-bg{
    background-color: #fff;
}

.brand-logo img{
  width:100px;
}
.separator {
  display: flex;
  align-items: center;
  text-align: center;
  color: #5f6368;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
}
.separator::before,
.separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #dadce0;
}
.separator-text {
  padding: 0 12px;
}
</style>

