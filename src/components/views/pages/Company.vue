<template>
  <section>
    <sub-menu v-bind="subMenu"></sub-menu>
    <div class="mt-1">
      <b-row>
        <b-form class="mb-lg-2 col-xl-8 col-12"
                @submit.prevent="saveCompanyData" >
          <b-card>
            <b-card-body>
              <b-card-title>
                Business
              </b-card-title>
              <b-row>
                <b-col cols="12"> 
                <b-col cols="12">    
                  <b-form-group
                    label="Name"
                    label-for="h-name"
                    label-cols-md="1"
                  >
                    <b-input
                      id="h-name"
                      placeholder="Name"
                      v-model="name"
                      required
                    />
                  </b-form-group>
                </b-col>  
                <b-col cols="12">
                  <b-form-group
                    label="Phone"
                    label-for="h-phone"
                    label-cols-md="1"
                  >
                    <b-input 
                      id="h-phone"
                      placeholder="Phone"
                      v-model="phone"
                    />
                  </b-form-group>
                </b-col>
                <b-col cols="12">
                  <b-form-group
                    label="ABN"
                    label-for="h-abn"
                    label-cols-md="1"
                  >
                    <b-input
                      id="h-abn"
                      placeholder="ABN"
                      v-model="abn"
                      required
                    />
                  </b-form-group>
                </b-col>
                <b-col cols="12">
                  <b-form-group
                    label="Email"
                    label-for="h-email"
                    label-cols-md="1"
                  >
                    <b-input  
                      id="h-email"
                      placeholder="Email"
                      v-model="email"  
                    />
                    
                  </b-form-group>
                </b-col>
                <b-col
                  md="8"
                  offset-md="4"
                >
                  <b-button
                    type="submit"
                    variant="primary"
                    class="mr-1 mt-5"
                  >
                    Create
                  </b-button>
                </b-col>
                </b-col>
              </b-row>
            </b-card-body>
          </b-card> 
        </b-form>
      </b-row>
    </div>      
  </section>
</template>

<script>
import ValidationError from "@/components/uiComponents/ValidationError"
import SubMenu from '@/components/uiComponents/SubMenu.vue'
export default {
  components:{
      ValidationError,
      SubMenu
  },
  data(){
    return {
    name:'',
    abn:'',
    phone:'',
    email:'',
    message: '',
    subMenu: [{
        name: 'Business',
        route: 'companies',
    }],
    }
  },
  methods: {
    async saveCompanyData(){
      try{
       const userId = await this.getId();
       const data = {
         data:{
            type: "companies",
            attributes:{
              name: this.name,
              phone: this.phone,
              abn: this.abn,
              email: this.email,
            },
            relationships:{
              user: {
                data: {
                  type: "users",
                  id: userId,
                }
              }
            },
         }
        };
         const createdCompany = await this.$store.dispatch('companies/add', data);
         await this.$store.dispatch('alerts/showNotification', {
                message: 'Company created successfully.',
                type: 'success'
        });
      } catch (e){
        console.log('Response data:', e.response.data);
        if(e.response.data.errors[0].detail === 'Your email address is not verified.')
          this.message = "Your email address is not verified. Please verify your email."
        else
          this.message = "Something went wrong! Try again later or contact the support."
         await this.$store.dispatch('alerts/showNotification', {
                message: this.message,
                type: 'error'
        }); // Log the response data for debugging
      }
    /* await axios
      .post('http://localhost:80/api/v1/company',data, {
        headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    } ,})
      .then((response) => {
        console.log('Data saved successfully!', response.data);
      })
      .catch((error) => {
        console.error('Error saving data:', error);
      }); */

    },
  async getId(){
      await this.$store.dispatch("profile/me")
      const user = await this.$store.getters["profile/me"]
      return user.id;
  },
  },
}
</script>