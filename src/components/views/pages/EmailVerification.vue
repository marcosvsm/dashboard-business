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
                    <h1>{{ message }}</h1>
                    <p>
                    The verification link is invalid or something went wrong. Please try again in a few minutes if persists, contact the support.
                    </p>
                </div>       
            </div>
        </div> 
   </div>
</div>
</template>

<script>
import axios from 'axios';
import { $themeConfig } from '@/themeConfig'

export default {
  data() {
    const { appLogoImage } = $themeConfig.app
    return {
      message: '',
      appLogoImage
    };
  },
   async created() {
     
     const randomKey = Object.keys(this.$route.query).find(key => key.match(/^\d+p\d+\..+/));
      
        const parts = randomKey.split('p001.');
        const userId = parts[0];
        const hash = parts[1];
      
    const expires = this.$route.query.expires;
    const signature = this.$route.query.signature;
    await axios.get(`${process.env.VUE_APP_API_BASE_URL}/email/verify/${userId}/${hash}`, {
      params: {
        expires,
        signature
      }
    })
      .then(response => {
        this.$router.push({ name: 'Login'});
      })
      .catch(error => {
        console.error(error);
        this.message = 'Email verification failed.';
      });
  }
};
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

