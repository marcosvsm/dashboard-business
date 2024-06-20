<template>
  <div v-if="user" class="layout gutter">
    <div class="layout-item size-33 small-size-100">
      <user-profile-card :user="user"/>
    </div>
  </div>
</template>

<script>
import UserProfileCard from "@/components/uiComponents/UserProfileCard.vue";

export default {
name: "user-profile-example",
components: {
    "user-profile-card": UserProfileCard,
},
data: () => ({
    user: null
}),
created() {
    this.getProfile();
},
methods: {
    async getProfile() {
    await this.$store.dispatch("profile/me")
    this.user = await this.$store.getters["profile/me"]
    }
}
}
</script>