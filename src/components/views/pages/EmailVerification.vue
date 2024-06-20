<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      message: ''
    };
  },
   async created() {
     
     const randomKey = Object.keys(this.$route.query).find(key => key.match(/^\d+p\d+\..+/));
      
        const parts = randomKey.split('p001.');
        const userId = parts[0];
        const hash = parts[1];
      
    const expires = this.$route.query.expires;
    const signature = this.$route.query.signature;
    await axios.get(`http://localhost:80/api/v1/email/verify/${userId}/${hash}`, {
      params: {
        expires,
        signature
      }
    })
      .then(response => {
        this.$router.push({ name: 'loginPage'});
      })
      .catch(error => {
        console.error(error);
        this.message = 'Email verification failed.';
      });
  }
};
</script>
