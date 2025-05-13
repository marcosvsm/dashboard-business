<template>
    <div v-if="!isLoadingInvoices">
    <!-- Welcome Header 
    <div class="welcome-header text-uppercase text-muted mb-4 text-sm-left" aria-label="User greeting">
      <h4 class="font-weight-bold">Welcome, {{ user.name }}</h4>
    </div>
    -->
      <b-row>
        <!-- Invoices Card -->  
        <b-col md="4" sm="6" xs="12">
          <b-card class="card-stats mb-4 mb-xl-0">
            <b-card-body class="d-flex flex-column">
              <b-row>
                <b-col>
                  <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">{{ t('Invoices') }}</h5>
                  <span class="h2 font-weight-bold mb-0">{{getNumberInvoices()}}</span>
                </b-col>
                <b-col cols="auto">
                    <router-link :to="{ name: 'invoices'}">
                  <div class="icon icon-shape bg-gradient-blue text-white rounded-circle shadow">
                    <base-feather-icon
                      icon="FileTextIcon"
                      size="30"
                    />
                  </div>
                    </router-link>
                </b-col>
              </b-row>
              <p class="mt-1 mb-0 text-sm">
                <span class="text-nowrap">
                  {{ t('Paid') }}: {{ getInvoicePaid() }} | {{ t('Unpaid') }}: {{ getInvoiceUnpaid() }}
                </span>
              </p>
              <!-- Move Last Invoice to bottom with flex-grow -->
              <div class="last-invoice mt-auto">
                <span class="text-nowrap">
                <span class="text-muted">{{ t('Last Invoice') }}:</span> {{ getLastInvoice() }}
                </span>
              </div>
            </b-card-body>
          </b-card>
        </b-col>
        <!-- Income Card  -->
        <b-col md="4" sm="6" xs="12">
          <b-card class="card-stats mb-4 mb-xl-0">
            <b-card-body>
              <b-row>
                <b-col>
                    <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
                      {{ t('Amount Received') }}
                    </h5>
                  <span class="h2 font-weight-bold mb-0">{{getTotalAmount()}}</span>
                  <div class="mt-2 text-sm">
                    <span class="text-muted"> {{ t('This Month') }}: </span>
                    <span class="font-weight-bold"> {{ getIncomeForThisMonth() }} </span>
                  </div>
                  <div class="text-sm">
                    <span class="text-muted"> {{ t('Last Month') }}: </span>
                    <span class="font-weight-bold"> {{ getIncomeForLastMonth() }} </span>
                  </div>
                </b-col>
                <b-col cols="auto">
                  <div class="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
                      <base-feather-icon
                        icon="TrendingUpIcon" 
                        size="30"
                      />
                    </div>  
                </b-col>
              </b-row>
            </b-card-body>
          </b-card>
        </b-col>
        <!-- Outstanding Card -->
        <b-col md="4" sm="6" xs="12">
          <b-card class="card-stats mb-4 mb-xl-0">
            <b-card-body>
              <b-row>
                <b-col>
                  <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">
                    {{ t('Outstanding') }}
                  </h5>
                  <span class="h2 font-weight-bold mb-0">{{this.getPendingTotalAmount}}</span>
                </b-col>
                <b-col cols="auto">
                  <div class="icon icon-shape bg-gradient-orange text-white rounded-circle shadow">
                    <base-feather-icon
                      icon="RepeatIcon"
                      size="30"
                    />
                  </div>
                </b-col>
              </b-row>
              <p class="mt-3 mb-0 text-sm">
                <span class="text-nowrap text-danger">
                  {{ t('Overdue') }}: {{ getOverdueCount() }} ({{ currencyFormatter.format(getOverdueAmount()) }})
                </span>
              </p>
            </b-card-body>
          </b-card>
        </b-col>
       <!-- Unpaid Invoices Card -->
  <b-col md="4" xs="12" class="mt-2 mb-4" v-if="unpaidInvoices.length">
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
  </b-col>
      </b-row>
 <!--   <b-modal v-model="showTutorial">
            <div v-if="currentStep">
            <div class="tutorial-step">
                <h2>{{ currentStep.title === 'Welcome' ? t(currentStep.title) +' '+ user.name : currentStep.title }}</h2>
                <p>{{ currentStep.description }}</p>
            </div>
        </div>
            Custom Footer Buttons 
        <template #modal-footer>
            <b-button variant="secondary" @click="closeTutorial">
                {{ t('Skip') }}
            </b-button>

             Conditionally display Next or Finish based on the current step 
            <b-button v-if="!tutorialCompleted" variant="primary" @click="nextStep">
                {{ isLastStep ? t('Finish') : t('Next') }}
            </b-button>
        </template>
    </b-modal>       -->
    </div>
</template>
<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import { formatDateForDisplay, dateNow } from '@/libs/dateUtils.js'
import { mapGetters, mapActions } from 'vuex';
import { formatDateForInvoiceDisplay } from '@/libs/dateUtils.js'
export default {
    components:{
        BaseFeatherIcon,
    },
    data(){
        return {
            invoices: [],
            isLoadingInvoices: false,
            getPendingTotalAmount: 0,
            t: null,
            formatDateForDisplay,
            showTutorial: false,
            user: {name:""},
            tutorialSteps: [
                { title: 'Welcome', description: 'Learn how to use Simplify Business!' },
                { title: 'Create Company', description: 'Start by creating your company.' },
                { title: 'Add Customers', description: 'Easily add your customers.' },
                { title: 'Create Invoice', description: 'Now you can create your first invoice.' }
            ],
            // AUD formatter
            currencyFormatter: new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: 'AUD',
                minimumFractionDigits: 2,
            }),
            paid: 0,
            unpaid: 0,

        }
    },
    created(){
    const {t} = useI18nUtils()
    this.t = t
    // Call the function to fetch invoices
    // Fetch invoices
    this.fetchInvoices();
    },
    computed:{
        unpaidInvoices(){
            return this.invoices.filter(invoice => invoice.status === 0);
        },
        invoiceChangePercentage() {
            if (!Array.isArray(this.invoices)) {
                return '0.00'; // Return 0.00 if invoices are not ready
            }
            const lastMonthInvoices = this.getInvoicesForLastMonth().length;
            const currentMonthInvoices = this.getInvoicesForThisMonth().length;
            if (lastMonthInvoices === 0) {
                return currentMonthInvoices > 0 ? '100.00' : '0.00'; 
                // If no invoices last month and some this month, return 100% increase
            }
            const change = ((currentMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100;
            return isNaN(change) ? '0.00' : change.toFixed(2);
        },
        incomeChangePercentage() {
            const lastMonthIncome = this.getIncomeForLastMonth();
            const currentMonthIncome = this.getTotalAmount();
            if (lastMonthIncome === '0.00') {
                return currentMonthIncome > 0 ? '100.00' : '0.00'; 
                // If no invoices last month and some this month, return 100% increase
            }
            const change = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
            return isNaN(change) ? '0.00' : change.toFixed(2);
        },
        pendingChangePercentage() {
            const lastMonthPending = this.getPendingForLastMonth();
            const currentMonthPending = this.getPendingTotalAmount;
             if (lastMonthPending === '0.00') {
                return currentMonthPending > 0 ? '100.00' : '0.00'; 
                // If no invoices last month and some this month, return 100% increase
            }
            const change = ((currentMonthPending - lastMonthPending) / lastMonthPending) * 100;
            return isNaN(change) ? '0.00' : change.toFixed(2);
        },
        pendingChangeIcon(){
            return this.pendingChangePercentage >= 0 ? 'ArrowUpIcon' : 'ArrowDownIcon';
        },
 //       currentStep(){
  //          return this.$store.getters.currentStep;
  //      },
  //      ...mapGetters('tutorial', ['currentStep', 'tutorialCompleted']),
  //      isLastStep() {
  //          return this.$store.state.tutorial.currentTutorialStep === this.$store.state.tutorial.tutorialSteps.length - 1;
  //      },
    },
    methods:{
        async fetchInvoices() {
          this.isLoadingInvoices = true;
          try {
            await this.$store.dispatch('invoices/list');
            this.invoices = this.$store.getters["invoices/list"] || [] 
          } catch (error) {
            console.error('Error fetching invoices:', error);
          } finally {
              this.isLoadingInvoices = false;
          }
        },
        getNumberInvoices(){
            return this.invoices.length
        },
        getTotalAmount(){
            let totalAmount = 0
            let totalPendingAmount = 0
            this.invoices.forEach(invoice => {
                if(invoice.status == 0)
                    totalPendingAmount += parseFloat(invoice.amount)
                else 
                    totalAmount += parseFloat(invoice.amount)
            });
            this.getPendingTotalAmount = this.currencyFormatter.format(totalPendingAmount);
            return this.currencyFormatter.format(totalAmount);
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
        getInvoicesForThisMonth() {
            if (!Array.isArray(this.invoices)) {
                console.warn('Invoices is not an array or is undefined');
                return [];
            }
            const currentMonthDate = new Date();
            return this.invoices.filter(invoice => {
                const invoiceDate = new Date(invoice.invoice_date);
                return (
                    invoiceDate.getMonth() === currentMonthDate.getMonth() &&
                    invoiceDate.getFullYear() === currentMonthDate.getFullYear()
                );
            });
        },
        getInvoicesForLastMonth(){
            if (!Array.isArray(this.invoices)) {
                console.warn('Invoices is not an array or is undefined');
                return [];
            }
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            return this.invoices.filter(invoice => {
                const invoiceDate = new Date(invoice.invoice_date);
                return(
                    invoiceDate.getMonth() === lastMonthDate.getMonth() &&
                    invoiceDate.getFullYear() === lastMonthDate.getFullYear()
                );
            });
        },
        getPendingForLastMonth(){
            if (!Array.isArray(this.invoices)) {
                console.warn('Invoices is not an array or is undefined');
                return [];
            }
            const lastMonthInvoices = this.getInvoicesForLastMonth();
                // Calculate the outstanding amount
            const outstandingAmount = lastMonthInvoices.reduce((total, invoice) => {
                if (invoice.status === 0) { // Assuming 0 indicates an outstanding invoice
                    return total + parseFloat(invoice.amount);
                }
                return total;
            }, 0);

            return outstandingAmount.toFixed(2); // Return as a fixed decimal numbe
        },
        getIncomeForLastMonth(){
            if (!Array.isArray(this.invoices)) {
                console.warn('Invoices is not an array or is undefined');
                return [];
            }
            const lastMonthInvoices = this.getInvoicesForLastMonth();
                // Calculate the outstanding amount
            const income = lastMonthInvoices.reduce((total, invoice) => {
                if (invoice.status === 1) { // Assuming 0 indicates an outstanding invoice
                    return total + parseFloat(invoice.amount);
                }
                return total;
            }, 0);

            return this.currencyFormatter.format(income); // Return as a fixed decimal numbe
        },
        getIncomeForThisMonth(){
            if (!Array.isArray(this.invoices)) {
                console.warn('Invoices is not an array or is undefined');
                return [];
            }
            const thisMonthInvoices = this.getInvoicesForThisMonth();
                // Calculate the outstanding amount
            const income = thisMonthInvoices.reduce((total, invoice) => {
                if (invoice.status === 1) { // Assuming 0 indicates an outstanding invoice
                    return total + parseFloat(invoice.amount);
                }
                return total;
            }, 0);

            return this.currencyFormatter.format(income); // Return as a fixed decimal numbe
        },
  //      ...mapActions('tutorial', ['nextTutorialStep', 'completeTutorial']),
   //     async startTutorial(){
   //         await this.$store.dispatch("profile/me")
   //         this.user = await this.$store.getters["profile/me"]
   //         this.showTutorial = true;
  //          this.tutorialSteps[0].title += ' '+this.user.name
  //      },
  //      nextStep(){
  //          if(this.currentStep < this.tutorialSteps.length - 1)
  //              this.nextTutorialStep();
  //          else
  //              this.completeTutorial();
  //      },
  //      completeTutorial(){
  //          this.showTutorial = false;
  //      },
        getInvoicePaid(){
            return this.invoices.filter(invoice => invoice.status === 1).length;
        },
        getInvoiceUnpaid(){
            return this.invoices.filter(invoice => invoice.status === 0).length;
        },
        getOverdueCount(){
          const today = new Date();
          const overdue = this.invoices.filter(
            invoice => invoice.status === 0 && new Date(invoice.due_date) < today
          );
          return overdue.length;
        },
        getOverdueAmount(){
          const today = new Date();
          const overdue = this.invoices.filter(
            invoice => invoice.status === 0 && new Date(invoice.due_date) < today
          );
          const amount = overdue.reduce((total, invoice) => total + (parseFloat(invoice.amount) || 0), 0);
          return amount; 
        },
        getLastInvoice(){
          const dates = this.invoices.map((invoice) => new Date(invoice.invoice_date));
          const latestDate = new Date(Math.max(...dates));
          
          return formatDateForInvoiceDisplay(latestDate) !== 'Invalid Date' ? formatDateForInvoiceDisplay(latestDate) : "N/A" 
        }
    },
 //   mounted(){
 //       this.startTutorial();
//    },
}
</script>

<style scoped>

.icon-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
}
.bg-gradient-green {
  background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%);
}
.bg-gradient-blue {
  background: linear-gradient(87deg, #0366d6 0, #1a91ff 100%);
}
.bg-gradient-orange {
  background: linear-gradient(87deg, #fb6340 0, #fbb140 100%);
}
.welcome-header {
  color: var(--primary-color);
}

.welcome-header h4 {
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  margin: 0;
}

.unpaid-invoices-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.unpaid-invoices-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0;
}

.invoice-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invoice-item {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.invoice-item.bg-light {
  background-color: #f8f9fa;
}

.invoice-item:hover {
  background-color: #f1f3f5;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
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

@media (max-width: 576px) {
  .unpaid-invoices-list {
    padding: 0 0.5rem;
  }

  .invoice-item {
    padding: 0.5rem 0.75rem;
  }

  .paid-button {
    min-width: 60px;
    min-height: 32px;
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
  }
}
/* Flexbox styling for last-invoice */
.last-invoice {
  margin-top: auto; /* Push to bottom in flex context */
  padding-top: 0.5rem; /* Visual separation */
}

/* Fallback: Absolute positioning with spacer */
.card-stats .card-body.position-relative {
  position: relative;
}
.last-invoice.absolute-bottom {
  position: absolute;
  bottom: 1rem; /* Align with padding */
  left: 1.25rem;
  right: 1.25rem;
}
.last-invoice-spacer {
  height: 1.5rem; /* Reserve space for absolute-positioned last-invoice */
}
</style>