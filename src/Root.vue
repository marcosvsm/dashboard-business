<template>
  <loading v-if="!hydrated" />
  <app v-else />
</template>

<script>
import App from './App.vue'
import Loading from '@/components/views/pages/Loading.vue'
import { mapGetters } from "vuex";

export default {
  components: { App, Loading },
  computed: {
    ...mapGetters("auth", ["hydrated"]),
  },
  created() {
    this.$router.onReady(() => {
      const middleware = this.$route.meta.middleware;
      const requiresAuth = Array.isArray(middleware) ? middleware.includes('auth') : middleware === 'auth';
      if (requiresAuth) {
        if (!this.hydrated) {
          this.$store.dispatch("auth/checkAuth").finally(() => {
            this.$store.commit("auth/setHydrated", true);
          });
        }
      } else {
        // For guest, set hydrated true immediately if not already
        if (!this.hydrated) this.$store.commit("auth/setHydrated", true);
      }
    });
  }
}
</script>