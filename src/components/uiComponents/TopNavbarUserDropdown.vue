<template>
  <b-nav-item-dropdown
    right
    toggle-class="d-flex align-items-center dropdown-user-link"
    class="dropdown-user"
  >
    <template #button-content>
      <div class="d-sm-flex d-none user-nav">
        <p class="user-name font-weight-bolder mb-0">
          {{ user.name}}
        </p>
        <span class="user-status"></span>
      </div>
      <b-avatar
        size="40"
        variant="light-primary"
        badge
        class="badge-minimal"
        :badge-variant="badgeVariant"
        :text="user.name ? user.name.charAt(0) : ''"
      >
        <base-feather-icon
          v-if="!user.name"
          icon="UserIcon"
          size="22"
        />
      </b-avatar>
    </template>

    <b-dropdown-item
      :to="{ name: 'profile'}"
      link-class="d-flex align-items-center"
    >
      <base-feather-icon
        size="16"
        icon="UserIcon"
        class="mr-50"
      />
      <span>Profile</span>
    </b-dropdown-item>
<!--    <b-dropdown-item
      :to="{ name: '' }"
      link-class="d-flex align-items-center"
    >
      <base-feather-icon
        size="16"
        icon="MailIcon"
        class="mr-50"
      />
      <span>Inbox</span>
    </b-dropdown-item>
-->
    <b-dropdown-divider />
<!--
    <b-dropdown-item
      :to="{ name: '' }"
      link-class="d-flex align-items-center"
    >
      <base-feather-icon
        size="16"
        icon="SettingsIcon"
        class="mr-50"
      />
      <span>Settings</span>
    </b-dropdown-item>
    <b-dropdown-item
      :to="{ name: '' }"
      link-class="d-flex align-items-center"
    >
      <base-feather-icon
        size="16"
        icon="CreditCardIcon"
        class="mr-50"
      />
      <span>Pricing</span>
    </b-dropdown-item>--> 
    <b-dropdown-item
      :to="{ name: 'help' }"
      link-class="d-flex align-items-center"
    >
      <base-feather-icon
        size="16"
        icon="InfoIcon"
        class="mr-50"
      />
      <span>Help</span>
    </b-dropdown-item>
    <b-dropdown-item
      :to="{ name: 'faq' }"
      link-class="d-flex align-items-center"
    >
      <base-feather-icon
        size="16"
        icon="HelpCircleIcon"
        class="mr-50"
      />
      <span>FAQ</span>
    </b-dropdown-item>
    <b-dropdown-item
      link-class="d-flex align-items-center"
      @click="logout"
    >
      <base-feather-icon
        size="16"
        icon="LogOutIcon"
        class="mr-50"
      />
      <span>Logout</span>
    </b-dropdown-item></b-nav-item-dropdown>
</template>

<script>
import BaseFeatherIcon from './BaseFeatherIcon.vue'
//import { initialAbility } from '@/libs/acl/config'
//import useJwt from '@/auth/jwt/useJwt'
//import { avatarText } from '@core/utils/filter'

export default {
  components: {
    BaseFeatherIcon,
  },
  computed:{
    user() {
      const user =  this.$store.getters['auth/authUser'] ??
        this.$store.getters['users/user']
      return user || {name: ''};
    },
    isAuthenticated() {
      return (
        this.$store.getters['auth/isAuthenticated'] ??
        this.$store.getters.isAuthenticated ??
        false
      );
    },
    badgeVariant() {
      // show neutral before/when not authed; success once we have a name
      return this.isAuthenticated && this.user?.name ? 'success' : 'light';
    },
  },
  methods: {
    async logout() {
      await this.$store.dispatch("auth/logout");
      this.$router.push({ path: "/login" });
    },
  },
}
</script>
