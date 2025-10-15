<template>
  <Loading /> <!-- your existing loading page -->
</template>

<script>
import api from '@/axios'
import Loading from '@/components/views/pages/Loading.vue'

function parseLink(query) {
  const key = Object.keys(query).find(k => /^\d+p\d+\..+/.test(k))
  if (!key) throw new Error('invalid link')
  const parts = key.split('p001.')
  if (parts.length < 2) throw new Error('invalid link')
  return { userId: parts[0], hash: parts[1] }
}

export default {
  components: { Loading },
  async created () {
    try {
      const { expires, signature } = this.$route.query
      const { userId, hash } = parseLink(this.$route.query)

      await api.get(`/email/verify/${userId}/${hash}`, {
        params: { expires, signature }
      })

      // success → go to login (or wherever)
      this.$router.replace({ name: 'login', query: { verified: 1 } })
    } catch (e) {
      // choose a friendly message
      const msg =
        e?.response?.status === 403
          ? 'This link has already been used.'
          : e?.response?.status === 410
          ? 'This verification link has expired.'
          : 'The verification link is invalid. Please request a new one.'
      // failure → show your error page (only now it renders)
      this.$router.replace({
        name: 'verification',
        params: { errorMessage: msg }
      })
    }
  }
}
</script>
