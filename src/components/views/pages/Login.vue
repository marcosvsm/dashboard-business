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
            </div>
        </div> 
   </div>
</div>
</template>
<script>
import formMixin from "@/mixins/form-mixin"
import ValidationError from "@/components/uiComponents/ValidationError.vue"
import { $themeConfig } from '@/themeConfig'

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
    }
  },
  methods:{
    async login(){
      const user = {
        data: {
          type: "token",
          attributes: {
            email: this.email,
            password: this.password
          }
        }
      }
      const requestOptions = {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        }
      }
      try{
        await this.$store.dispatch("login", {user, requestOptions})
      } catch (e){
          this.clearError()
          if (e.response.status === 422) {
            this.setApiValidation(e.response.data.errors);
          } else if (e.response.status === 400 && e.response.data.errors[0].detail === 'The user credentials were incorrect.'){
            this.genericError = "The password that you've entered is incorrect."
          } else {
            this.$notify({
              message:'Invalid credentials!',
              type: 'danger',
            });
          }
        }
    },
    clearError(){
       this.resetApiValidation()
       this.genericError = ''
    }
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
</style>