<template>
  <navbar navbar-menu-classes="navbar-right" v-model="showMenu">
    <div class="navbar-wrapper">
      <a class="navbar-brand" href="">Simplify Business</a>
    </div>
    <template slot="navbar-menu">
      <router-link to="/register" class="nav-item" custom v-slot="{ navigate }">
        <a class="nav-link" @click="navigate" @keypress.enter="navigate" role="link">
          <i class="nc-icon nc-book-bookmark"></i> Register
        </a>
      </router-link>
      <router-link to="/login" class="nav-item" custom v-slot="{ navigate }">
        <a class="nav-link" @click="navigate" @keypress.enter="navigate">
          <b-icon-person-circle></b-icon-person-circle>
           Login
        </a>
      </router-link>
    </template>
  </navbar>
</template>

<script>
  import Navbar from '../../UIComponents/Navbar/Navbar';
  export default {
    name: 'main-navbar',
    components: {
      Navbar
    },
    data() {
      return {
        showMenu: false
      }
    }
  }
</script>
