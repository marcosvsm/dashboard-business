<template>
<div class="auth-wrapper auth-v2">
    <div class="row auth-inner m-0">
        <div class="d-none d-lg-flex align-items-center p-5 col-lg-8">

        </div>
        <div class="d-flex align-items-center auth-bg px-2 p-lg-5 col-lg-4 right-bg">
            <div class="px-xl-5 mx-auto col-sm-8 col-md-6 col-lg-12">
                <form @submit.prevent="register">
                    <h3>Welcome to Simplify Invoice!</h3>
                    <p>Please sign-up to a new account.</p>
                    <b-form-group label-align-sm="center">
                        <b-input-group class="mt-1">
                            <b-input-group-prepend is-text>
                                <span><b-icon-person></b-icon-person></span>
                            </b-input-group-prepend>
                                <b-input type="text" v-model="username" placeholder="Username"></b-input>
                        </b-input-group>
                        <b-input-group class="mt-1">
                            <b-input-group-prepend is-text>
                                <span><b-icon-envelope></b-icon-envelope></span>
                            </b-input-group-prepend>
                                <b-input type="email" v-model="email" placeholder="Email"></b-input>
                        </b-input-group>
                        <b-input-group class="mt-1">
                            <b-input-group-prepend is-text>
                                <span><b-icon-lock></b-icon-lock></span>
                            </b-input-group-prepend>
                                <b-form-input type="password" v-model="password" placeholder="Password"></b-form-input>
                        </b-input-group>
                        
                        <div class="text-center mt-2">
                            <button class="btn btn-sm btn-primary">Sign up</button>
                        </div>
                        <p class="card-text text-center mt-2"><span>Already have an account? </span><a href="/login" class="" target="_self"><span> Sign in instead</span></a></p>
                    </b-form-group>
                </form>
            </div>
        </div> 
   </div>
</div>
</template>
<script>

export default {
   
    data(){
        return {
            email: '',
            password: '',
            username: ''
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
</style>