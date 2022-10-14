<template>
  <div class="navbar-container d-flex content align-items-center">

    <!-- Nav Menu Toggler -->
    <ul class="nav navbar-nav d-xl-none">
      <li class="nav-item">
        <b-link
          class="nav-link"
          @click="toggleVerticalMenuActive"
        >
          <base-feather-icon 
            icon="MenuIcon" 
            size="21"
          />
        </b-link>
      </li>
    </ul>

    <!-- Left Col -->
    <div class="bookmark-wrapper align-items-center flex-grow-1 d-none d-lg-flex">

      <!-- Bookmarks Container -->
      
    </div>

    <b-navbar-nav class="nav align-items-center ml-auto">
     <locale/>
     <user-dropdown/>
    </b-navbar-nav>
  </div>
</template>
<script>
import UserDropdown from './TopNavbarUserDropdown.vue'
import Locale from './Locale.vue'
import BaseFeatherIcon from './BaseFeatherIcon.vue'

export default {
  components:{
    UserDropdown,
    Locale,
    BaseFeatherIcon,
  },
  props: {
    toggleVerticalMenuActive: {
      type: Function,
      default: () => {},
    },
  }
}
</script>