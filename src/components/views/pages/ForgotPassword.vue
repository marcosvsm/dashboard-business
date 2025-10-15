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
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                    <b-form-group label-align-sm="center">
                        <b-input-group class="mt-1">
                            <b-input-group-prepend is-text>
                                <span><b-icon-envelope></b-icon-envelope></span>
                            </b-input-group-prepend>
                                <b-input type="email" v-model="email" placeholder="Email" required></b-input>
                        </b-input-group>
                        <div class="d-flex" style="justify-content: space-between!important;">
                            <span></span>
                            <a href="/login"><small>Sign in</small></a>
                        </div>
                        <div class="text-center mt-3">
                            <b-button 
                              variant="primary" 
                              size="sm"
                              type="submit"
                              :disabled="loading"
                            >
                            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                              Reset Password
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
import { CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons';
export default {
  mixins: [formMixin],
  components:{
      ValidationError,
  },
  data(){
    const { appLogoImage } = $themeConfig.app
    return {
      email: '',
      appLogoImage,
      loading: false
    }
  },
  methods:{
    async resetPassword(){
      try{
        this.loading = true;
        await this.$store.dispatch("auth/forgotPassword", this.email);
        this.$toast.success(`Password reset link has been sent to your email.`,
          {
          position: "top-right",
          icon: CheckCircleIcon,
          closeButton: false,
          hideProgressBar: true,
          timeout: 2000
        });
      } catch (e){
        this.$toast.error('Something went wrong!', {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        });
      }finally{
        this.loading = false;
        this.email = '';
      }
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
</style>