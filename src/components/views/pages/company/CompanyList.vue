<template>
  <section>
    <sub-menu v-bind="subMenu"></sub-menu>
    <div class="mt-1">
        <h4>Companies > List</h4>
    </div>
    <div>
      <b-row>
        <b-form class="mb-lg-2 col-xl-12 col-12">
          <b-row
            class="p-1"
          >
              <b-card-group
                v-for="(company, index) in companies" 
                :key="index"
                class="mb-2 mr-2 col-lg-3"
                :busy="isBusy"
                >
                <b-card>
                  <template #header>
                    <b-card>
                  <b-card-title>
                      {{company.name}}
                  </b-card-title>
                  <small>Business name</small></b-card>
                  </template>
              
                <b-col cols="12"> 
                <b-col cols="12">    
                  <b-card-text>
                      ABN  {{company.abn}}
                  </b-card-text>
                </b-col>  
                <b-col cols="12">    
                  <b-card-text>
                      Phone  {{company.phone}}
                  </b-card-text>
                </b-col>  
                <b-col cols="12">    
                  <b-card-text>
                      Email  {{company.email}}
                  </b-card-text>
                </b-col>  
               
                </b-col>
                  <template #footer>
                      <small>Actions 
                        <span
                          class="btn btn-sm"
                          @click="editCompany(company)"
                          v-b-toggle.sidebar-company-edit>
                            <base-feather-icon
                                    icon="EditIcon"
                                    size="20"
                                    
                            />
                        </span> |
                        <span
                          name="delete"
                          class="btn btn-sm"
                          @click="showMsgBoxTwo(company.id)">
                          <base-feather-icon
                            icon="Trash2Icon"
                            size="20"
                          />
                        </span>
                      </small>
                      
                  </template>
                </b-card>
                  </b-card-group>
          </b-row>
    </b-form>
      </b-row>
    </div>
    <div v-if="loading" class="text-center text-danger my-2">
      <b-spinner class="align-middle"></b-spinner>
      <strong>Loading...</strong>
    </div>    
    <b-modal ref="modal" id="modal-footer-sm">
      <template #modal-footer="{ok, cancel}">
        <b-button size='sm' variant="success" @click="handleCompanyDelete(company.id,true)">OK</b-button>
        <b-button size="sm" variant="danger" @click="cancel()">
        Cancel
      </b-button>
      </template> 
      <div>
        <h3>If you delete the company you will lose all data</h3>
        
      </div>

    </b-modal>
     <company-edit-sidebar :company="company"/>
  </section>
</template>

<script>
import ValidationError from "@/components/uiComponents/ValidationError"
import BaseFeatherIcon from '../../../uiComponents/BaseFeatherIcon.vue'
import CompanyEditSidebar from '@/components/uiComponents/CompanyEditSidebar.vue'
import SubMenu from '@/components/uiComponents/SubMenu.vue'
export default {
    components:{
        ValidationError,
        BaseFeatherIcon,
        CompanyEditSidebar,
        SubMenu,
  },
  data(){
      return {
          companies: {},
          company: {},
          loading: false,
          subMenu: [{
            name: 'Create Business',
            route: 'addCompany',
          }],
      }
  },
  created(){
    this.loading = true;
    // Async function to fetch companies
    const getCompanies = async () => {
      try {
        await this.$store.dispatch('companies/list');
        this.companies = this.$store.getters["companies/list"] 
        this.loading = false
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    // Call the function to fetch companies
    getCompanies();
  },
  methods:{
    async handleCompanyDelete(CompanyId){
      try{
        await this.$store.dispatch('companies/destroy',CompanyId);
        await this.$store.dispatch('alerts/showNotification', {
                  message: 'Business deleted successfully.',
                  type: 'success'
          });
        this.$router.go(0);
      }catch (e){
         await this.$store.dispatch('alerts/showNotification', {
                message: 'Oops, something went wrong!',
                type: 'error'
        }); // Log the response data for debugging
      }   
    },
     showMsgBoxTwo(id) {
        this.boxTwo = ''
        this.$bvModal.msgBoxConfirm('Please confirm that you want to delete everything.', {
          title: 'Please Confirm',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        })
          .then(value => {
            this.boxTwo = value

            if(this.boxTwo)
              this.handleCompanyDelete(id)
          })
          .catch(err => {
            // An error occurred
          })
      },
      editCompany(company){
        this.company = company;
      },
  },
  
}
</script>