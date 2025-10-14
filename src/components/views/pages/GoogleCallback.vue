<template>
  <div class="p-6 text-center">Finishing Google sign-in…</div>
</template>

<script>
export default {
  name: 'GoogleCallback',
  data: () => ({ once: false }),
  async mounted() {
    if (this.once) return; this.once = true;
    try {
      const q = new URLSearchParams(window.location.search);
      const code  = q.get('code');
      const state = q.get('state');
      if (!code) throw new Error('Missing code');

      await this.$store.dispatch('auth/handleGoogleCallback', { code, state });

      // Clean URL to avoid re-processing on reload
      window.history.replaceState({}, document.title, this.$route.path);
    } catch (e) {
      console.error(e);
      this.$router.replace({ name: 'login' }).catch(() => {});
    }
  },
};
</script>
