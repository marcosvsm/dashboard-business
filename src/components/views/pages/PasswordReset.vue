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
                <form @submit.prevent="resetPassword">
                    <h3>Reset Password</h3>
                    <b-form-group label-align-sm="center">
                        <b-input-group class="mt-1">
                            <b-input-group-prepend is-text>
                                <span><b-icon-lock></b-icon-lock></span>
                            </b-input-group-prepend>
                                <b-form-input type="password" v-model="password" placeholder="New Password" required></b-form-input>
                        </b-input-group>
                        <b-input-group class="mt-1">
                            <b-input-group-prepend is-text>
                                <span><b-icon-lock></b-icon-lock></span>
                            </b-input-group-prepend>
                                <b-form-input type="password" v-model="password_confirmation" placeholder="Confirm Password" required></b-form-input>
                                <validation-error :errors="apiValidationErrors.password_confirmation" />
                        </b-input-group>
                         <div v-if="passwordMismatch" class="text-danger mt-1">
                            Password and Password Confirmation do not match.
                        </div>
                        <div class="d-flex" style="justify-content: space-between!important;">
                            <span></span>
                            <a href="/login"><small>Sign in</small></a>
                        </div>
                        <div v-if="genericError" class="text-danger text-center mt-2">
                            {{ genericError }}
                        </div>
                        <div class="mt-1">
                            <div :class="{ 'text-success': hasMinLength }">
                                <span><b-icon-check-circle></b-icon-check-circle> At least 8 characters</span>
                            </div>
                            <div :class="{ 'text-success' : hasUppercase }">
                                <span><b-icon-check-circle></b-icon-check-circle> At least 1 uppercase letter</span>
                             </div>
                             <div :class="{ 'text-success' : hasLowercase }">
                                <span><b-icon-check-circle></b-icon-check-circle> At least 1 lowercase letter</span>
                             </div>
                             <div :class="{ 'text-success' : hasNumber }">
                                <span><b-icon-check-circle></b-icon-check-circle> At least 1 number</span>
                             </div>

                        </div>

                        <div class="text-center mt-3">
                            <b-button 
                              variant="primary" 
                              size="sm"
                              type="submit"
                            >
                              Change Password
                            </b-button>
                        </div>
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
      password: '',
      password_confirmation: '',
      passwordMismatch: false,
      appLogoImage,
      genericError: '',
    }
  },
  computed: {
    isFormValid(){
        return (
            this.password &&
            this.password_confirmation &&
            this.password.length >= 8 &&
            /[A-Z]/.test(this.password) &&
            /[a-z]/.test(this.password) &&
            /\d/.test(this.password) &&
            !this.passwordMismatch
        );
    },
    hasMinLength(){
        return this.password.length >= 8;
    },
    hasUppercase(){
        return  /[A-Z]/.test(this.password);
    },
    hasLowercase(){
        return /[a-z]/.test(this.password);
    },
    hasNumber(){
        return /\d/.test(this.password);
    },
  },
  methods:{
    async resetPassword(){
    const email = this.$route.query.email;
    const token = this.$route.query.token;
    const user = {
        data: {
          attributes:{
            email: email,
            token: token,
            password: this.password,
            password_confirmation: this.password_confirmation,
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
        await this.$store.dispatch("resetPassword", {user, requestOptions})
        this.$router.push("login");
      } catch (e){
          this.clearError()
          if (e.response.status === 422) {
            this.setApiValidation(e.response.data.errors);
          } else  if (e.response && e.response.status === 422) {
          this.genericError = e.response.data.errors[0].detail;
          } else {
            this.$notify({
              message:'Something went wrong!',
              type: 'danger',
            });
          }
        }
    },
    validatePassword(){
      if(this.password_confirmation)
        this.passwordMismatch = this.password !== this.password_confirmation;
      else
        this.passwordMismatch = false
    },
    clearError(){
       this.resetApiValidation()
       this.genericError = ''
    }
  },
  watch: {
    password_confirmation(){
        this.validatePassword();
    }
  }  
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