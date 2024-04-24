<template>
<div class="auth-wrapper auth-v2">
<<<<<<< HEAD
    <div class="row auth-inner">
=======
    <div class="row auth-inner m-0">
>>>>>>> dev
        <div class="d-none d-lg-flex align-items-center p-5 col-lg-8">

        </div>
        <div class="d-flex align-items-center auth-bg px-2 p-lg-5 col-lg-4 right-bg">
            <div class="px-xl-5 mx-auto col-sm-8 col-md-6 col-lg-12">
                <form @submit.prevent="login">
                    <h3>Welcome to Simplify Invoice!</h3>
                    <p>Please sign-in to your account.</p>
                    <b-form-group label-align-sm="center">
<<<<<<< HEAD
                        <b-input-group class="mt-3">
=======
                        <b-input-group class="mt-1">
>>>>>>> dev
                            <b-input-group-prepend is-text>
                                <span><b-icon-envelope></b-icon-envelope></span>
                            </b-input-group-prepend>
                                <b-input type="email" v-model="email" placeholder="Email"></b-input>
<<<<<<< HEAD
                        </b-input-group>
                        <b-input-group class="mt-3">
=======
                                <validation-error :errors="apiValidationErrors.email" />
                        </b-input-group>
                        <b-input-group class="mt-1">
>>>>>>> dev
                            <b-input-group-prepend is-text>
                                <span><b-icon-lock></b-icon-lock></span>
                            </b-input-group-prepend>
                                <b-form-input type="password" v-model="password" placeholder="Password"></b-form-input>
<<<<<<< HEAD
=======
                                <validation-error :errors="apiValidationErrors.password" />
>>>>>>> dev
                        </b-input-group>
                        <div class="d-flex" style="justify-content: space-between!important;">
                            <span></span>
                            <a href=""><small>Forgot Password?</small></a>
                        </div>
                        <div class="text-center mt-3">
<<<<<<< HEAD
                            <button class="btn btn-sm btn-primary">Sign in</button>
=======
                            <b-button 
                              variant="primary" 
                              size="sm"
                              type="submit"
                            >
                              Sign in
                            </b-button>
>>>>>>> dev
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
<<<<<<< HEAD

export default {
   
    data(){
        return {
            email: '',
            password : ''
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
                this.$notify({
                    message:'Invalid credentials!',
                    type: 'danger',
                });
                this.setApiValidation(e.response.data.errors)
            }
        }
    } 
}
</script>
<style>
=======
import formMixin from "@/mixins/form-mixin"
import ValidationError from "@/components/uiComponents/ValidationError"

export default {
  mixins: [formMixin],
  components:{
      ValidationError,
  },
  data(){
    return {
      email: '',
      password : ''
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
          this.$notify({
            message:'Invalid credentials!',
            type: 'danger',
          });
          this.setApiValidation(e.response.data.errors)
        }
    }
  }, 
}
</script>
<style scoped>
>>>>>>> dev
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
</style>