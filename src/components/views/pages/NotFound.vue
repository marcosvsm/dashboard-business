<template>
  <div class="not-found-container">
    <span class="brand-logo">
        <b-img
          :src="appLogoImage"
          alt="logo"
        />
    </span>
    <h1>404 Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <router-link to="/">Go to Home Page</router-link>
  </div>
</template>

<script>
import { $themeConfig } from '@/themeConfig'
export default {
  name: 'NotFound',
  setup(){
    const { appLogoImage } = $themeConfig.app
    return {
      appLogoImage
    }
  }
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Adjust height as needed */
  text-align: center;
}
.brand-logo img{
  width:100px;
}
</style>