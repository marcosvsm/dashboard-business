<template>
  <b-nav-item-dropdown
    right
    toggle-class="d-flex align-items-center dropdown-user-link"
    class="dropdown-user"
  >
    <template #button-content>
      <div class="d-sm-flex d-none user-nav">
        <p class="user-name font-weight-bolder mb-0">
          {{ user.name || user.name }}
        </p>
        <span class="user-status"></span>
      </div>
      <b-avatar
        size="40"
        variant="light-primary"
        badge
        class="badge-minimal"
        badge-variant="success"
      >
        <base-feather-icon
          v-if="!user.name"
          icon="UserIcon"
          size="22"
        />
      </b-avatar>
    </template>

    <b-dropdown-item
      :to="{ name: ''}"
      link-class="d-flex align-items-center"
    >
      <base-feather-icon
        size="16"
        icon="UserIcon"
        class="mr-50"
      />
      <span>Profile</span>
    </b-dropdown-item>
    <b-dropdown-item
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
    <b-dropdown-item
      :to="{ name: '' }"
      link-class="d-flex align-items-center"
    >
      <base-feather-icon
        size="16"
        icon="CheckSquareIcon"
        class="mr-50"
      />
      <span>Task</span>
    </b-dropdown-item>
    <b-dropdown-item
      :to="{ name: '' }"
      link-class="d-flex align-items-center"
    >
      <base-feather-icon
        size="16"
        icon="MessageSquareIcon"
        class="mr-50"
      />
      <span>Chat</span>
    </b-dropdown-item>

    <b-dropdown-divider />

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
    </b-dropdown-item>
    <b-dropdown-item
      :to="{ name: '' }"
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
  data() {
    return {
      user: null,
      //avatarText,
    }
  },
  created(){
    this.getMe();
  },
  methods: {
    async getMe(){
      await this.$store.dispatch("profile/me")
      this.user = await this.$store.getters["profile/me"]
    },
    logout() {
      this.$store.dispatch("logout");
      // Remove userData from localStorage
      // ? You just removed token from localStorage. If you like, you can also make API call to backend to blacklist used token
    //  localStorage.removeItem(useJwt.jwtConfig.storageTokenKeyName)
    //  localStorage.removeItem(useJwt.jwtConfig.storageRefreshTokenKeyName)

    },
  },
}
</script>
