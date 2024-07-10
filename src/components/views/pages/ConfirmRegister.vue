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
                <div class="confirm-register">
                    <h1>Registration Successful!</h1>
                    <p>
                    A confirmation email has been sent to your email address. Please check your inbox and click on the confirmation link to complete your registration.
                    </p>
                </div>       
            </div>
        </div> 
   </div>
</div>
</template>
<script>
import { $themeConfig } from '@/themeConfig'

export default {
    data(){
        const { appLogoImage } = $themeConfig.app
        return {
            appLogoImage,
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

.text-success {
  color: green;
}
</style>
