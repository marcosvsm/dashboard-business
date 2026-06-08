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
                <form v-if="!submitted" @submit.prevent="resetPassword">
                    <h3>Reset Password</h3>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                    <b-form-group label-align-sm="center">
                        <b-input-group class="mt-1">
                            <b-input-group-prepend is-text>
                                <span><b-icon-envelope></b-icon-envelope></span>
                            </b-input-group-prepend>
                                <b-input type="email" v-model="email" placeholder="Email" required :disabled="loading"></b-input>
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
                              :disabled="loading || !email"
                            >
                            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                              Reset Password
                            </b-button>
                        </div>
                    </b-form-group>
                </form>
                <div v-else class="text-center">
                    <h3>Check your inbox</h3>
                    <p>If an account exists for that email address, we've sent a password reset link. The link is valid for a limited time.</p>
                    <a href="/login"><small>Back to sign in</small></a>
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

export default {
  mixins: [formMixin],
  components: {
    ValidationError,
  },
  data() {
    const { appLogoImage } = $themeConfig.app
    return {
      email: '',
      appLogoImage,
      loading: false,
      submitted: false,
    }
  },
  methods: {
    async resetPassword() {
      // Always render the same neutral confirmation regardless of outcome.
      // Distinguishing success vs. failure in the UI re-introduces the
      // enumeration leak that the backend now hides.
      this.loading = true
      try {
        await this.$store.dispatch('auth/forgotPassword', this.email)
      } finally {
        this.loading = false
        this.submitted = true
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