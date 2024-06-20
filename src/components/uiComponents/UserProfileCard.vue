<template>
  <b-row>
    <b-form class="mb-lg-2 col-xl-8 col-12" @submit.prevent="updateProfile">
      <b-card>
        <b-card-header class="d-flex align-items-center">
          <b-icon icon="person-fill" class="mr-2"></b-icon>
          <h4 class="mb-0">
            Edit Profile
          </h4>
        </b-card-header>

        <b-card-body>
          <b-form-group label="Name">
            <b-form-input v-model="user.name" :state="!apiValidationErrors.name"></b-form-input>
            <validation-error :errors="apiValidationErrors.name"></validation-error>
          </b-form-group>

          <b-form-group label="Email">
            <b-form-input type="email" v-model="user.email" :state="!apiValidationErrors.email"></b-form-input>
            <validation-error :errors="apiValidationErrors.email"></validation-error>
          </b-form-group>
        </b-card-body>

        <b-card-footer class="d-flex justify-content-end">
          <b-button type="submit" variant="primary">
            Update Profile
          </b-button>
        </b-card-footer>
      </b-card>
    </b-form>
  </b-row>
</template>

<script>
import ValidationError from "@/components/uiComponents/ValidationError.vue";
import formMixin from "@/mixins/form-mixin";

export default {
  name: "user-profile-card",
  props: {
    user: Object,
  },
  components: { ValidationError },
  mixins: [formMixin],
  data() {
    return {
      default_img: process.env.VUE_APP_BASE_URL + "/img/placeholder.jpg",
    };
  },

  methods: {
    async updateProfile() {
      try {
        await this.$store.dispatch("profile/update", this.user);
        await this.$store.dispatch('alerts/showNotification', {
                message: 'Profile updated successfully.',
                type: 'success'
        });
        await this.$store.getters["profile/me"];
      } catch (e) {
        await this.$store.dispatch('alerts/showNotification', {
                message: 'Oops, something went wrong!',
                type: 'error'
        });
        this.setApiValidation(e.response.data.errors);
      }
    },
  },
};
</script>

<style scoped>
/* You can add custom styles here */
</style>