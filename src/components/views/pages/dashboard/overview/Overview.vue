<template>
    <div>
        <b-row>
        <b-col md="3">
            <b-card class="card-stats mb-4 mb-xl-0">
            <b-card-body>
                <b-row>
                <b-col>
                    <h5 class="card-title text-uppercase text-muted mb-0">{{ t('Invoices') }}</h5>
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
                <span class="text-success mr-2"><i class="fa fa-arrow-up"></i> 0.00%</span>
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
                    <h5 class="card-title text-uppercase text-muted mb-0">{{ t('Profit') }}</h5>
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
                <span class="text-success mr-2"><i class="fa fa-arrow-up"></i> 0.00%</span>
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
                    <h5 class="card-title text-uppercase text-muted mb-0">{{ t('Pending') }}</h5>
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
                <span class="text-success mr-2"><i class="fa fa-arrow-up"></i> 0.00%</span>
                <span class="text-nowrap">{{ t('Since last month') }}</span>
                </p>
            </b-card-body>
            </b-card>
        </b-col>
        </b-row>
    </div>
</template>
<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
export default {
    components:{
        BaseFeatherIcon,
    },
    data(){
        return {
            invoices: {},
            getPendingTotalAmount: parseFloat(0),
            t: null
        }
    },
    created(){
       // Async function to fetch invoices
    const getinvoices = async () => {
      try {
        await this.$store.dispatch('invoices/list');
        this.invoices = this.$store.getters["invoices/list"] 
        console.log('invoices data:', this.invoices);// Assuming 'list' contains the list of invoices
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
    }
}
</script>
