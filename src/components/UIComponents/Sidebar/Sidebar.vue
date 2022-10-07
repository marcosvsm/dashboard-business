<template>
  <div class="main-menu menu-fixed menu-accordion menu-shadow expanded menu-light collapse show">
    <div>
        <div class="navbar navbar-header d-flex justify-content-center mt-4">
            <ul class="nav navbar-nav">
                <li class="nav-item"><span>Simplify Invoice</span></li>
            </ul>
        </div>
        <b-nav vertical class="nav navbar-nav p-4 accordion ">
            <b-nav-item><b-icon-person-fill></b-icon-person-fill><span class="m-4">Dashboard</span></b-nav-item>

            <b-navbar-toggle target="accordion-1" v-b-toggle.accordion-1>
                <template #default="{ expanded }">
                    <b-nav-item class="d-flex align-items-start" active>
                        <b-icon-receipt></b-icon-receipt><span class="m-4 ">Invoice</span>
                    <span class="position-absolute right">   
                        <b-icon v-if="expanded" icon="chevron-up"></b-icon>
                        <b-icon v-else icon="chevron-down"></b-icon>
                    </span>
                    </b-nav-item>
                </template>
            </b-navbar-toggle>
            <b-collapse class="p-2" id="accordion-1" accordion="my-accordion">
              <b-nav-item><b-icon icon="arrow-return-right" font-scale="0.75"></b-icon><span class="px-2">List</span></b-nav-item>
              <b-nav-item><b-icon icon="arrow-return-right" font-scale="0.75"></b-icon><span class="px-2">Add</span></b-nav-item>
            </b-collapse>

            <b-navbar-toggle target="accordion-2" v-b-toggle.accordion-2>
                <template #default="{ expanded }">
                    <b-nav-item class="d-flex align-items-start">
                        <b-icon-cart></b-icon-cart>
                        <span class="px-4">eCommerce</span>
                    <span class="position-absolute right">   
                        <b-icon v-if="expanded" icon="chevron-up"></b-icon>
                        <b-icon v-else icon="chevron-down"></b-icon>
                    </span>
                    </b-nav-item>
                </template>
            </b-navbar-toggle>
            <b-collapse class="p-2" id="accordion-2" accordion="my-accordion">
              <b-nav-item><b-icon icon="arrow-return-right" font-scale="0.75"></b-icon><span class="px-2">Shop</span></b-nav-item>
              <b-nav-item><b-icon icon="arrow-return-right" font-scale="0.75"></b-icon><span class="px-2">Details</span></b-nav-item>
              <b-nav-item><b-icon icon="arrow-return-right" font-scale="0.75"></b-icon><span class="px-2">Wishlist</span></b-nav-item>
            </b-collapse>

            <b-nav-item><b-icon icon="building"></b-icon><span class="px-4">Company</span></b-nav-item>
            <b-nav-item><span class="px-4">Another Link</span></b-nav-item>
            <b-nav-item disabled><span class="px-4">Disabled</span></b-nav-item>
        </b-nav>
    </div>
  </div>
</template>
<script>

export default {
 

}
</script>
<style>
.main-menu{
    width:260px;
    background-color: #283046;
    z-index: 1031;
    position: absolute;
    display: table-cell;
    height: 100%;
    overflow: hidden;
}
.main-menu.menu-fixed{
    position: fixed;
}
.main-menu.menu-light {
    color: #d0d2d6!important;

}
.right{
    right: 30px;
}
@media screen and (max-width: 1199px){
    .main-menu{
        visibility: hidden;
    }
}

</style>