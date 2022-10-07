<template>
  <b-container>
            <div class="col-lg-4 col-md-6 ml-auto mr-auto card">
                <form>
                    <b-card 
                        header="Login"
                        header-tag="login"        
                    >
                        <template #header>
                            <h3>Login</h3>
                        </template>
                        <b-card-body>
                            <b-row v-for="type in types" :key="type">
                              <b-input :id="{type}"></b-input>
                            </b-row>
                        </b-card-body>
                        
                    </b-card>
                </form>
            </div>
        </b-container>
</template>
<script>
  export default {
    name: 'card',
    props: {
      types: String
    }
  }
</script>
<style>
</style>
