<template>
  <b-navbar v-model="showNavbar" class="header-navbar navbar-shadow align-items-center navbar-expand floating-nav">
    <b-navbar class="navbar navbar-container p-3">
      <b-navbar-brand href="#">NavBar</b-navbar-brand>

        <b-navbar-nav>
          <b-nav-item href="#">Link</b-nav-item>
          <b-nav-item href="#" disabled>Disabled</b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto" style="margin-left:auto">
          <b-nav-form>
            <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
          </b-nav-form>

          <b-nav-item-dropdown text="Lang" right>
            <b-dropdown-item href="#">EN</b-dropdown-item>
            <b-dropdown-item href="#">ES</b-dropdown-item>
            <b-dropdown-item href="#">RU</b-dropdown-item>
            <b-dropdown-item href="#">FA</b-dropdown-item>
          </b-nav-item-dropdown>

          <b-nav-item-dropdown no-caret>
            <!-- Using 'button-content' slot -->
            <template #button-content>
              <em>Marcos </em>
              <b-img v-bind="mainProps" rounded="circle" alt="Circle image"></b-img>
            </template>
            <b-dropdown-item href="#">Profile</b-dropdown-item>
            <b-dropdown-item href="#">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
    </b-navbar>
  </b-navbar>
</template>
<script>

export default {

  data() {
    return {
      activeNotifications: false,
      showNavbar: false,
      mainProps: {
          blank: true,
          blankColor: '#777',
          width: 40,
          height: 40,
          class: 'm1'
      }
    };
  },
  methods: {
   
  },
};
</script>
<style>
#docs:hover,
#docs:active,
#docs:focus {
  background-color: #6bd098 !important;
}
#downb:hover,
#downb:active,
#downb:focus {
  background-color: #ef8157 !important;
}
.header-navbar{
  background-color: #283046;
  margin: 1.3rem 2rem 0;
  border-radius: 0.428rem;
  padding: 0 !important;
}
.header-navbar a{
  color: #d0d2d6;
}
.header-navbar.floating-nav{
  position: fixed;
  width: calc(100% - 4rem - 260px);
  z-index: 12;
  right: 0;
}
.navbar-container{
      flex-basis: 100%;
}
</style>
