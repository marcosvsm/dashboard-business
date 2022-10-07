<template>
  <div class="wrapper" id="body-row">
    <sidebar></sidebar>
    <div class="sidenav-overlay"></div>
    <dashboard-content></dashboard-content>
  </div>
</template>
<script>
import Sidebar from "../../UIComponents/Sidebar/Sidebar.vue"
import DashboardContent from "./Content.vue"

export default {
    components: {
      Sidebar,
      DashboardContent,
    },
   
}
</script>
<style>
.sidenav-overlay{
  position: fixed;
  top: 0;
  height: 120vh;
  z-index: 997;
  display: block;
  visibility: hidden;
  opacity: 0;
  -webkit-transition: all .5s ease;
  transition: all .5s ease;
}
#body-row {
    margin-left:0;
    margin-right:0;
}
.show{
  opacity: 1;
  visibility: visible;
  -webkit-transition: all .5s ease;
  transition: all .5s ease;
}
</style>