<template>
  <section>
    <div>
        <h4>Invoice > List</h4>
    </div>
    <div>
      <b-row>
        <b-form class="mb-lg-2 col-xl-12 col-12">
          <b-row>
              <b-card-group
                v-for="(invoice, index) in invoices" 
                :key="index"
                class="mb-1 col-12"
                >
                <b-card class="invoice-card" :class="{ expanded: expandedCard === index }">
                  <div class="d-flex justify-content-between align-items-center invoice-header">
            <div class="d-flex flex-column">
              <b-card-title class="mb-0">{{ invoice.name }}</b-card-title>
              <small>Invoice</small>
            </div>
            <div class="d-flex flex-column  text-center">
              <b-card-title class="mb-0">${{ invoice.amount }}</b-card-title>
              <small>Amount</small>
            </div>
            <div class="d-flex flex-column">
              {{ formatDateForDisplay(invoice.invoice_date) }}
              <small>Invoice Date</small>
            </div>
            <span class="btn btn-sm" @click="toggleCard(index)">
              <base-feather-icon :icon="expandedCard === index ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="20" />
            </span>
          </div>
              <transition name="expand">
                <div v-show="expandedCard === index" class="mt-1">
                <b-row no-gutters>
                <b-col cols="12" class="invoice-info">    
                  <b-card-text>
                      Amount  ${{ invoice.amount }}
                  </b-card-text>
                </b-col>  
                <b-col cols="12">    
                  <b-card-text class="invoice-info">
                      Invoice Due  {{ formatDateForDisplay(invoice.due_date) }}
                  </b-card-text>
                </b-col>  
                <b-col cols="12" class="invoice-info">    
                  <b-card-text>
                      Status <span :class="statusClass(invoice.status)">{{invoiceStatusText(invoice)}}</span>
                  </b-card-text>
                </b-col>  
                </b-row>
                  <b-card-footer>
                      <small class="d-flex justify-content-end">
                        <span class="mr-1">Actions</span>
                        <span
                          v-if="invoice.status == 0"
                          class="btn btn-sm mr-1 text-primary"
                          @click="updateInvoiceStatus(invoice,1)">
                            <base-feather-icon
                                    icon="DollarSignIcon"
                                    size="20"
                                    
                            />Paid
                        </span>
                        <span
                          v-if="invoice.status == 1"
                          class="btn btn-sm mr-1 text-warning"
                          @click="updateInvoiceStatus(invoice,0)">
                            <base-feather-icon
                                    icon="DollarSignIcon"
                                    size="20"
                                    
                            />Unpaid
                        </span>  |
                        <span
                          name="delete"
                          class="btn btn-sm ml-1"

                          @click="showMsgBoxTwo(invoice.id)">
                          <base-feather-icon
                            icon="Trash2Icon"
                            size="20"
                            color="#f74040"
                          />
                        </span>
                      </small>
                      
                  </b-card-footer>
                </div>
              </transition>
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
        <b-button size='sm' variant="success" @click="handleInvoiceDelete(invoice.id,true)">OK</b-button>
        <b-button size="sm" variant="danger" @click="cancel()">
        Cancel
      </b-button>
      </template> 
      <div>
        <h3>If you delete the invoice you will lose all data</h3>
        
      </div>
    </b-modal>
    <invoice-edit-sidebar :invoice="invoice"/>
  </section>
</template>

<script>
import ValidationError from "@/components/uiComponents/ValidationError"
import BaseFeatherIcon from '../../../uiComponents/BaseFeatherIcon.vue'
import { formatDateForDisplay, dateNow } from '@/libs/dateUtils.js'

export default {
    components:{
        ValidationError,
        BaseFeatherIcon,
  },
  data(){
      return {
          invoices: {},
          invoice:{},
          expandedCard: null,
          loading: false,
      }
  },
  created(){
    this.loading = true;
    // Async function to fetch invoices
    const getinvoices = async () => {
      try {
        await this.$store.dispatch('invoices/list');
        this.invoices = this.$store.getters["invoices/list"] 
        console.log('invoices data:', this.invoices);// Assuming 'list' contains the list of invoices
        this.loading = false
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    // Call the function to fetch invoices
    getinvoices();
  },
  methods:{
    async handleInvoiceDelete(InvoiceId){
      try{
        await this.$store.dispatch('invoices/destroy',InvoiceId);
        await this.$store.dispatch('alerts/showNotification', {
                  message: 'Invoice deleted successfully.',
                  type: 'success'
          });
        this.invoices = this.invoices.filter(invoice => invoice.id !== InvoiceId);
      } catch(e){
        await this.$store.dispatch('alerts/showNotification', {
                message: 'Something went wrong! Try again later or contact the support.',
                type: 'error'
        }); // Log the response data for debugging
      }
    },
    async updateInvoiceStatus(invoice, status){
      try{
        invoice.status = status;
        await this.$store.dispatch('invoices/update', invoice);
      } catch (e){
         await this.$store.dispatch('alerts/showNotification', {
                message: 'Something went wrong! Try again later or contact the support.',
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
              this.handleInvoiceDelete(id)
          })
          .catch(err => {
            // An error occurred
          })
      },
      toggleBusy() {
        this.isBusy = !this.isBusy
      },
      toggleCard(index) {
      this.expandedCard = this.expandedCard === index ? null : index;
    },
    statusClass(status){
      switch(status){
        case 0:
          return 'text-danger';
        case 1:
          return 'text-success';
      }
    },
    invoiceStatusText(invoice){
      var now = dateNow()
      if (invoice.status == 1)
        return 'Paid'
      else if(invoice.status == 0 && invoice.due_date < now)
        return 'Overdue'
      else
        return 'Pending';
    },
    formatDateForDisplay,
  },
  
}
</script>
<style>
.invoice-card {
  width: 100%;
  max-height: 350px; /* Adjust this to the height you prefer */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.invoice-info {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.invoice-card .btn {
  padding: 0;
}

.invoice-card.expanded {
  max-height: 500px; /* Set this to a value that shows the full content */
}

.expand-enter-active, .expand-leave-active {
  transition: opacity 0.3s ease;
}

.expand-enter, .expand-leave-to {
  opacity: 0;
}


</style>