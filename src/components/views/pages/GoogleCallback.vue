<template>
  <div>Processing Google Sign-In...</div>
</template>

<script>
export default {
  mounted() {
    const token = this.$route.query.token;
    if (token) {
      // Store the token (e.g., in localStorage or Vuex)
      localStorage.setItem('vue-authenticate.vueauth_access_token', token);
      // Optionally update authentication state in Vuex
      this.$store.commit('isAuthenticated', { isAuthenticated: true });
      // Redirect to the dashboard
      this.$router.push('/dashboard/overview');
    } else {
      // Handle missing token error
      console.error('No token received');
      this.$router.push('/login');
    }
  },
};
</script>