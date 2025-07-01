<template>
  <div class="mb-2">
    <nav aria-label="breadcrumb">
        <ol class="px-0 pt-1 mb-0 mb-0 bg-transparent breadcrumb me-sm-6">
            <li class="text-sm breadcrumb-item">
                <router-link :to="{ name: 'client-list'}">{{ t("Client List") }}</router-link>
            </li>
            <li class="text-sm breadcrumb-item active" aria-current="page">{{t('Client')}}</li>
        </ol>
    </nav>
    <b-row class="mt-2">
      <!-- Left Column -->
      <b-col lg="8">
        <b-row>
          <b-col xl="6" class="mb-xl-0">
            <b-card>
                <template #header>
                    <b-card-title>
                        {{client.name}}
                    </b-card-title>
                </template>
                <b-col cols="12">
                    <b-card-text>
                    ABN  {{client.abn}}
                    </b-card-text>
                </b-col>
                <b-col cols="12">
                    <b-card-text>
                    {{ t('Phone') }}  {{client.phone}}
                    </b-card-text>
                </b-col>
                <b-col cols="12">
                    <b-card-text>
                    Email  {{client.email}}
                    </b-card-text>
                </b-col>
                <template #footer>
                    <small>{{ t('Actions') }}
                    <span
                        class="btn btn-sm"
                        v-b-toggle.sidebar-invoice-add-new-customer>
                        <base-feather-icon
                        icon="EditIcon"
                        size="20"
                        />
                    </span> |
                    <span
                        name="deleteCompany"
                        class="btn btn-sm"
                        @click="showMsgBoxTwo()">
                        <base-feather-icon
                        icon="Trash2Icon"
                        size="20"
                        />
                    </span>
                    </small>
                </template>
            </b-card>
          </b-col>
          <b-col md="12" sm="12" xs="12" xl="6">
            <b-row>
              <!-- Amount Received Card -->
              <b-col md="6">
                <b-card class="text-center">
                  <div class="d-flex mb-2 justify-content-center">
                    <div class="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
                      <base-feather-icon
                        icon="TrendingUpIcon" 
                        size="30"
                      />
                    </div>  
                  </div>
                  <b-card-body class="pl-0 pr-0">
                    <h6 class="mb-0">{{t('Amount Received')}}</h6>
                    <hr class="horizontal dark" />
                    <h4 class="font-weight-bold mb-0">+ {{getTotalAmount()}}</h4>
                  </b-card-body>
                </b-card>
              </b-col>

              <!-- Outstanding Card -->
              <b-col md="6">
                <b-card class="text-center">
                  <div class="mb-2 d-flex justify-content-center">
                    <div class="icon icon-shape bg-gradient-orange text-white rounded-circle shadow">
                      <base-feather-icon
                        icon="RepeatIcon"
                        size="30"
                      />
                    </div>
                  </div>
                  <b-card-body class="pl-0 pr-0">
                    <h6 class="mb-0">{{t('Outstanding')}}</h6>
                    <hr class="horizontal dark" />
                    <h4 class="font-weight-bold mb-0">{{getPendingAmount()}}</h4>
                  </b-card-body>
                </b-card>
              </b-col>
            </b-row>
          </b-col>
        <b-col lg="12">
            <b-card role="region" aria-labelledby="unpaid-invoices-title" class="unpaid-invoices-card">
                <b-card-body>
                    <b-row>
                        <b-col class="d-flex align-items-center">
                            <h5 id="unpaid-invoices-title" class="card-title text-uppercase text-muted mb-0" style="color: #0366d6 !important">
                            {{ t('Last Invoices') }}
                            </h5>
                        </b-col>
                        <b-col class="d-flex justify-content-end">
                            <b-link :to="{ name: 'invoices' }" variant="outline-primary" size="sm" aria-label="View all outstanding invoices">
                            {{ t('View All') }}
                            </b-link>
                        </b-col>
                    </b-row>
                </b-card-body>
                <b-card-body class="unpaid-invoices-list">
                    <div v-if="client.invoice.length" role="list" class="invoice-list">
                    <div
                        v-for="(invoice, index) in client.invoice.slice(-5).reverse()"
                        :key="index"
                        :class="['invoice-item', { 'bg-light': index % 2 === 0 }]"
                        role="listitem"
                    >
                        <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex flex-column">
                            <div class="d-flex align-items-center">
                            <h6 class="mb-0 text-dark text-sm font-weight-bold">
                                {{ formatDateForDisplay(invoice.invoice_date) }}
                            </h6>
                            </div>
                            <span class="text-xs text-muted">#{{ invoice.name }}</span>
                        </div>
                        <div class="d-flex align-items-center text-sm">
                            <span class="text-nowrap mr-2">{{ currencyFormatter.format(invoice.amount) }}</span>
                            <span
                            class="btn btn-sm mr-1 ml-1 text-primary"
                            >
                                <base-feather-icon
                                        icon="EyeIcon"
                                        size="20"
                                        
                                /><router-link :to="{ name: 'invoice', params: {id: invoice.id}}"> {{ t("View") }}</router-link>
                            </span>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div v-else class="text-center my-2 no-options-message">
                    <base-feather-icon icon="AlertCircleIcon" size="16" />
                    <p>{{ t('No Invoices could be found') }}</p>
                    <router-link :to="{ name: 'add-invoice'}">{{ t("Create Invoice") }}</router-link>
                    </div>
                </b-card-body>
            </b-card>
        </b-col>
        </b-row>
      </b-col>
           <!-- Unpaid Invoices Card 
        <b-col class="mb-4" md="6" xs="12" sm="6" lg="4" v-if="unpaidInvoices.length">
            <b-card role="region" aria-labelledby="unpaid-invoices-title" class="unpaid-invoices-card">
            <b-card-body>
                <b-row>
                <b-col class="d-flex align-items-center">
                    <h5 id="unpaid-invoices-title" class="card-title text-uppercase text-muted mb-0" style="color: #0366d6 !important">
                    {{ t('Outstanding Invoices') }}
                    </h5>
                </b-col>
                <b-col class="d-flex justify-content-end">
                    <b-link :to="{ name: 'invoices' }" variant="outline-primary" size="sm" aria-label="View all outstanding invoices">
                    {{ t('View All') }}
                    </b-link>
                </b-col>
                </b-row>
            </b-card-body>
            <b-card-body class="unpaid-invoices-list">
                <div role="list" class="invoice-list">
                <div
                    v-for="(invoice, index) in unpaidInvoices"
                    :key="index"
                    :class="['invoice-item', { 'bg-light': index % 2 === 0 }]"
                    role="listitem"
                >
                    <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex flex-column">
                        <div class="d-flex align-items-center">
                        <h6 class="mb-0 text-dark text-sm font-weight-bold">
                            {{ formatDateForDisplay(invoice.invoice_date) }}
                        </h6>
                        </div>
                        <span class="text-xs text-muted">#{{ invoice.name }}</span>
                    </div>
                    <div class="d-flex align-items-center text-sm">
                        <span class="text-nowrap mr-2">{{ currencyFormatter.format(invoice.amount) }}</span>
                        <b-button
                        size="sm"
                        class="paid-button flex-shrink-0"
                        @click="updateInvoiceStatus(invoice, 1)"
                        :aria-label="`Mark invoice ${invoice.name} as paid`"
                        >
                        <base-feather-icon icon="DollarSignIcon" size="16" />
                        {{ t('Paid') }}
                        </b-button>
                    </div>
                    </div>
                </div>
                </div>
            </b-card-body>
            </b-card>
        </b-col>-->
      <!-- Right Column: Invoices -->
      
    <invoice-sidebar-add-new-customer :addCustomerToInvoice="addCustomerToInvoice" :customerToEdit="client"/>
    </b-row>
  </div>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { formatDateForDisplay } from '@/libs/dateUtils.js'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import InvoiceSidebarAddNewCustomer from '@/components/uiComponents/InvoiceSidebarAddNewCustomer.vue'
export default {
  components:{
      BaseFeatherIcon,
      InvoiceSidebarAddNewCustomer,
  },
  data() {
    return {
      client: [],
      // AUD formatter
      currencyFormatter: new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            minimumFractionDigits: 2,
      }),
      formatDateForDisplay,
    };
  },
  created(){
    this.fetchClient();
    const { t } = useI18nUtils()
    this.t = t
  },
  computed:{
    unpaidInvoices(){
        return this.client.invoice.filter(invoice => invoice.status === 0);
    },
  },
  methods:{
    async fetchClient(){
        const id = this.$route.params.id;
        await this.$store.dispatch("customers/get",{id: id, include:['invoice']});
        this.client = this.$store.getters["customers/customer"];

    },
    getTotalAmount(){
        let totalAmount = 0
        let totalPendingAmount = 0
        this.client.invoice.forEach(invoice => {
            if(invoice.status == 0)
                totalPendingAmount += parseFloat(invoice.amount)
            else 
                totalAmount += parseFloat(invoice.amount)
        });
        this.getPendingTotalAmount = this.currencyFormatter.format(totalPendingAmount);
        return this.currencyFormatter.format(totalAmount);
    },
    getPendingAmount(){
        let totalPendingAmount = 0
        this.client.invoice.forEach(invoice => {
        if(invoice.status == 0)
            totalPendingAmount += parseFloat(invoice.amount)
        })
        const pendingTotalAmount = totalPendingAmount;

        return this.currencyFormatter.format(pendingTotalAmount);
    },
    addCustomerToInvoice(updateCustomer){
        this.client = {
          ...this.client,
          id: updateCustomer.id,
          name: updateCustomer.name,
          email: updateCustomer.email,
          abn: updateCustomer.abn,
          phone: updateCustomer.phone,
        };
    },
    async handleClientDelete(){
      this.isDeleting = true;
      try{
        await this.$store.dispatch('customers/destroy',this.client.id);
         this.$toast.success("Client "+this.client.name+" deleted",
        {
            position: "top-right",
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 2000
        });
        this.$router.push({name:'client-list'});
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
    showMsgBoxTwo() {
      this.boxTwo = ''
      this.$bvModal.msgBoxConfirm('Are you sure you want to delete the '+this.client.name+' client? This action cannot be undone.', {
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
           if(value)this.handleClientDelete()
        })
        .catch(err => {
          // An error occurred
        })
    },
  }
};
</script>

<style scoped>
.w-60px {
  width: 60px;
}
.w-10 {
  width: 10%;
}
.bg-gradient-dark {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
}
.bg-gradient-success {
  background: linear-gradient(90deg, #28a745, #218838);
}
.bg-gradient-green {
  background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%);
}
.bg-gradient-orange {
  background: linear-gradient(87deg, #fb6340 0, #fbb140 100%);
}
.border-radius-lg {
  border-radius: 0.5rem;
}
.icon-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  transition: width 0.2s ease, height 0.2s ease; /* Smooth resizing */
}
.icon-lg {
  width: 3rem;
  height: 3rem;
}
.paid-button {
  color:white;
  background-color:  #4fd1c5 !important;
  border-color: #4fd1c5 !important;
  min-width: 70px;
  min-height: 36px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.paid-button:hover,
.paid-button:focus {
  transform: scale(1.05);
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #3cb7a9 !important; /* Darker teal for hover/focus */
  border-color: #3cb7a9 !important;
}
</style>