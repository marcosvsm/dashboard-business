<template>
  <section>
    <div>
      <nav aria-label="breadcrumb">
        <ol class="px-0 pt-1 mb-0 mb-0 bg-transparent breadcrumb me-sm-6">
          <li class="text-sm breadcrumb-item">
            <router-link :to="{ name: 'client-list'}">{{ t("Client") }}</router-link>
          </li>
          <li class="text-sm breadcrumb-item active" aria-current="page">{{t('List')}}</li>
        </ol>
      </nav>
    </div>
    <div class="d-flex justify-content-end align-items-center">
      <div>
        <b-form-input v-model="searchQuery" :placeholder="t('Search client...')" />
      </div>
      <div class="p-1">
        <b-button 
            class="btn"
            variant="primary"
            v-b-toggle.sidebar-invoice-add-new-customer
        >
            {{t('Add Client')}}
        </b-button>
      </div>
    </div>
    <div>
      <template v-if="filteredCustomers && filteredCustomers.length">
        <b-row>
          <b-form class="mb-lg-2 col-xl-12 col-12">
            <b-row>
              <b-card-group
                v-for="(customer) in filteredCustomers" 
                :key="customer.id"
                class="mb-1 col-12"
              >
                <b-card class="customer-card">
                  <div class="d-flex justify-content-between align-items-center customer-header">
                    <div>
                      <b-card-title class="mb-0">{{ customer.name }}</b-card-title>
                      <small>{{ t('Client') }}</small>
                    </div>
                    <div>
                      <small class="d-flex justify-content-end">
                        <span class="mr-1">{{t('Actions')}}</span>
                        <span
                          class="btn btn-sm mr-1 ml-1 text-primary"
                          >
                            <base-feather-icon
                                    icon="EyeIcon"
                                    size="20"
                                    
                            /><router-link :to="{ name: 'client', params: {id: customer.id}}"> {{ t("View") }}</router-link>
                        </span>  |
                        <span
                          name="delete"
                          class="btn btn-sm ml-1"
                          :disabled="isDeleting"
                          @click.stop="showMsgBoxTwo(customer)">
                          <base-feather-icon
                            icon="Trash2Icon"
                            size="20"
                            color="#f74040"
                          />
                        </span>
                      </small>
                    </div>
                  </div>
                </b-card>
              </b-card-group>
            </b-row>
          </b-form>
        </b-row>
      </template>
      <template v-else-if="loading">
        <div v-if="loading" class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong> {{t('Loading')}}...</strong>
        </div>
      </template>
      <template v-else>
        <div class="text-center my-2 no-options-message">
          <base-feather-icon icon="AlertCircleIcon" size="16" />
          <p>{{ t('No Clients could be found') }}</p>
          <router-link :to="{ name: 'add-customer'}">{{ t("Create Client") }}</router-link>
        </div>
      </template>
    </div>    
   <!-- <customer-edit-sidebar :customer="customer"/> -->
    <invoice-sidebar-add-new-customer 
        :addCustomerToInvoice="addCustomerToInvoice" 
    />
  </section>
</template>

<script>
import BaseFeatherIcon from '../../../uiComponents/BaseFeatherIcon.vue'
import { formatDateForDisplay, dateNow } from '@/libs/dateUtils.js'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import InvoiceSidebarAddNewCustomer from '@/components/uiComponents/InvoiceSidebarAddNewCustomer.vue'
import {VBToggle} from 'bootstrap-vue'

export default {
  components:{
    BaseFeatherIcon,
    InvoiceSidebarAddNewCustomer,
    VBToggle,
  },
  directives: {
    VBToggle,
  },
  data(){
    return {
        customers: [],
        expandedCard: null,
        loading: false,
        isDeleting: false,
        now: dateNow(),
        searchQuery: '',
    };
  },
  created(){
    this.loading = true;
    // Call the function to fetch customers
    this.fetchCustomers();
    const {t} = useI18nUtils();
    this.t = t;
  },
  computed:{
    filteredCustomers(){
      if (!this.searchQuery.trim()) return this.customers; // Return all customers if search is empty
      const query = this.searchQuery.trim().toLowerCase();
      return this.customers.filter(customer =>
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.abn?.toLowerCase().includes(query)
      );
    },
  },
  methods:{
    async fetchCustomers(){
      try{
        await this.$store.dispatch('customers/list');
        this.customers = this.$store.getters["customers/list"] || [];
      } catch(error){
        this.$toast.error(this.t('Failed to load customers. Please try again.'), {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        });
      } finally{
        this.loading = false;
      }
    },
    async handleClientDelete(customer){
      this.isDeleting = true;
      try{
        await this.$store.dispatch('customers/destroy',customer.id);
        this.customers = this.customers.filter(c => c.id !== customer.id);
         this.$toast.success("Client "+customer.name+" deleted",
        {
            position: "top-right",
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000
        });
      } catch(error){
        this.$toast.error(this.t('Failed to delete client. Please try again.'), {
          position: 'top-right',
          icon: false,
          closeButton: false,
          hideProgressBar: true,
          timeout: 3000,
        });
      } finally{
        this.isDeleting = false;
      }
    },
     showMsgBoxTwo(customer) {
        this.$bvModal.msgBoxConfirm('Are you sure you want to delete '+customer.name+' client? This action cannot be undone.', {
          title: 'Please Confirm',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          cancelVariant: 'primary',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        })
          .then(value => {
            if(value) this.handleClientDelete(customer);
          });
      },
    statusClass(status){
      switch(status){
        case 0:
          return 'text-danger';
        case 1:
          return 'text-success';
      }
    },
    addCustomerToInvoice(newCustomer){
      if(newCustomer?.id){
        this.customers = [...this.customers, newCustomer];
      }
    },
  },
  
}
</script>
<style>
.customer-card {
  width: 100%;
  max-height: 350px; /* Adjust this to the height you prefer */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.customer-info {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.customer-card .btn {
  padding: 0;
}

.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.customer-header > div {
  flex: 1; /* Allow each column to grow equally */
  min-width: 150px; /* Ensure columns have a minimum width */
  display: flex;
  flex-direction: column;
}

.customer-header > div:first-child {
  text-align: left; /* Align text to the left */
}

.customer-header > div:nth-child(2) {
  text-align: center; /* Align text to the center */
}

.customer-header > div:last-child {
  text-align: right; /* Align text to the right */
}

@media (max-width: 768px) {
  .customer-header > div {
    min-width: 100px; /* Adjust for smaller screens */
  }
}

</style>