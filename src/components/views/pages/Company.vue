<template>
  <section>
    <div>
      <b-row>
        <b-form class="mb-lg-2 col-xl-8 col-12"
                @submit.prevent="saveCompanyData" >
          <b-card>
            <b-card-body>
              <b-card-title>
                Company
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
                    Save
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

export default {
  components:{
      ValidationError,
  },
  data(){
    return {
     name:'',
     abn:'',
     phone:'',
     email:''
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
        console.log(data)
         const createdCompany = await this.$store.dispatch('companies/add', data);
         console.log('New company created:', createdCompany);
      } catch (e){
  console.log('Response data:', e.response.data); // Log the response data for debugging
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