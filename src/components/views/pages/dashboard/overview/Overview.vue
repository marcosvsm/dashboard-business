<template>
    <div>
        <b-row>
            <b-col md="3">
                <b-card class="card-stats mb-4 mb-xl-0">
                <b-card-body>
                    <b-row>
                    <b-col>
                        <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">{{ t('Invoices') }}</h5>
                        <span class="h2 font-weight-bold mb-0">{{getNumberInvoices()}}</span>
                    </b-col>
                    <b-col cols="auto">
                        <div class="icon icon-shape bg-gradient-red">
                        <base-feather-icon
                            icon="FileTextIcon"
                            size="30"
                            class=""
                        />
                        </div>
                    </b-col>
                    </b-row>
                    <p class="mt-3 mb-0 text-sm">
                    <span class="text-success mr-2">
                        <base-feather-icon
                            icon="ArrowUpIcon"
                            size="16"
                            class=""
                        />
                        {{invoiceChangePercentage}}%
                    </span>
                    <span class="text-nowrap">{{ t ('Since last month') }}</span>
                    </p>
                </b-card-body>
                </b-card>
            </b-col>
            <b-col md="3">
                <b-card class="card-stats mb-4 mb-xl-0">
                <b-card-body>
                    <b-row>
                    <b-col>
                        <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">{{ t('Profit') }}</h5>
                        <span class="h2 font-weight-bold mb-0">${{getTotalAmount()}}</span>
                    </b-col>
                    <b-col cols="auto">
                        <div class="icon icon-shape bg-gradient-blue">
                        <base-feather-icon
                            icon="TrendingUpIcon"
                            size="30"
                            class="text-success"
                        />
                        </div>
                    </b-col>
                    </b-row>
                    <p class="mt-3 mb-0 text-sm">
                    <span class="text-success mr-2">
                        <base-feather-icon
                            icon="ArrowUpIcon"
                            size="16"
                            class=""
                        />
                        {{profitChangePercentage}}%
                    </span>
                    <span class="text-nowrap">{{ t('Since last month') }}</span>
                    </p>
                </b-card-body>
                </b-card>
            </b-col>
            <!-- Add more cards here following the same pattern -->
            <b-col md="3">
                <b-card class="card-stats mb-4 mb-xl-0">
                <b-card-body>
                    <b-row>
                    <b-col>
                        <h5 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">{{ t('Outstanding') }}</h5>
                        <span class="h2 font-weight-bold mb-0">${{this.getPendingTotalAmount.toFixed(2)}}</span>
                    </b-col>
                    <b-col cols="auto">
                        <div class="icon icon-shape bg-gradient-blue">
                        <base-feather-icon
                            icon="RepeatIcon"
                            size="30"
                            class="text-danger"
                        />
                        </div>
                    </b-col>
                    </b-row>
                    <p class="mt-3 mb-0 text-sm">
                    <span class="text-success mr-2">
                        <base-feather-icon
                            :icon="pendingChangeIcon"
                            size="16"
                            class=""
                        />
                        {{pendingChangePercentage}}%
                    </span>
                    <span class="text-nowrap">{{ t('Since last month') }}</span>
                    </p>
                </b-card-body>
                </b-card>
            </b-col>
            <b-col md="6" class="mt-2" v-if="unpaidInvoices.length">
                <b-card>
                    <b-card-body>
                    <b-row>
                        <b-col class="d-flex align-items-center">
                        <h6 class="card-title text-uppercase text-muted mb-0" style="color:#0366d6 !important">{{ t('Outstanding Invoices') }}</h6>
                        </b-col>
                        <b-col class="d-flex justify-content-end">
                        <b-link :to="{ name: 'invoices'}" variant="outline-primary" size="sm">{{ t('View All') }}</b-link>
                        </b-col>
                    </b-row>
                    </b-card-body>
                    <b-card-body>
                    <b-list-group>
                        <b-list-group-item
                        v-for="(invoice, index) in unpaidInvoices"
                        :key="index"
                        class="d-flex justify-content-between ps-0 mb-2 border-radius-lg border-0"
                        >
                        <div class="d-flex flex-column">
                            <h6 
                                class="mb-0 text-dark text-sm" 
                                style="font-weight:600;color:#344767 !important"
                            >
                                {{ formatDateForDisplay(invoice.invoice_date) }}
                            </h6>
                            <span class="text-xs">#{{ invoice.name }}</span>
                        </div>
                        <div class="d-flex align-items-center text-sm">
                            ${{ invoice.amount }}
                            <span
                                class="btn btn-sm mr-1 text-primary"
                                @click="updateInvoiceStatus(invoice,1)">
                                    <base-feather-icon
                                            icon="DollarSignIcon"
                                            size="20"
                                            
                            />
                                {{t('Paid')}}
                            </span>
                        </div>
                        </b-list-group-item>
                    </b-list-group>
                    </b-card-body>
                </b-card>
            </b-col>

        </b-row>
    </div>
</template>
<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import { formatDateForDisplay, dateNow } from '@/libs/dateUtils.js'
export default {
    components:{
        BaseFeatherIcon,
    },
    data(){
        return {
            invoices: {},
            getPendingTotalAmount: parseFloat(0),
            t: null,
            formatDateForDisplay,
        }
    },
    created(){
       // Async function to fetch invoices
    const getinvoices = async () => {
      try {
        await this.$store.dispatch('invoices/list');
        this.invoices = this.$store.getters["invoices/list"] 
        this.isBusy = false
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };
    const {t} = useI18nUtils()
    this.t = t

    // Call the function to fetch invoices
    getinvoices();
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
        profitChangePercentage() {
            const lastMonthProfit = this.getProfitForLastMonth();
            const currentMonthProfit = this.getTotalAmount();
            if (lastMonthProfit === '0.00') {
                return currentMonthProfit > 0 ? '100.00' : '0.00'; 
                // If no invoices last month and some this month, return 100% increase
            }
            const change = ((currentMonthProfit - lastMonthProfit) / lastMonthProfit) * 100;
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
        }
    },
    methods:{
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
            this.getPendingTotalAmount = totalPendingAmount
            return totalAmount.toFixed(2);
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
        getProfitForLastMonth(){
            if (!Array.isArray(this.invoices)) {
                console.warn('Invoices is not an array or is undefined');
                return [];
            }
            const lastMonthInvoices = this.getInvoicesForLastMonth();
                // Calculate the outstanding amount
            const profit = lastMonthInvoices.reduce((total, invoice) => {
                if (invoice.status === 1) { // Assuming 0 indicates an outstanding invoice
                    return total + parseFloat(invoice.amount);
                }
                return total;
            }, 0);

            return profit.toFixed(2); // Return as a fixed decimal numbe
        }
    }
}
</script>
