<template>
  <section>
    <div class="mt-1">
      <h4>{{ t('Business') +' > '+ t('List') }}</h4>
    </div>
    <div>
      <template v-if="companies && companies.length">
        <b-row>
          <b-form class="mb-lg-2 col-xl-12 col-12">
            <b-row class="p-1">
              <b-col cols="12" lg="6">
                <b-card-group
                  v-for="(company, index) in paginatedCompanies"
                  :key="company.id"
                  class="mb-2"
                  :busy="isBusy"
                >
                  <b-card>
                    <template #header>
                      <b-card>
                        <b-card-title>
                          {{company.name}}
                        </b-card-title>
                        <small>{{ t('Business name') }}</small>
                      </b-card>
                    </template>
                    <b-col cols="12">
                      <b-card-text>
                        ABN  {{company.abn}}
                      </b-card-text>
                    </b-col>
                    <b-col cols="12">
                      <b-card-text>
                        {{ t('Phone') }}  {{company.phone}}
                      </b-card-text>
                    </b-col>
                    <b-col cols="12">
                      <b-card-text>
                        Email  {{company.email}}
                      </b-card-text>
                    </b-col>
                    <template #footer>
                      <small>{{ t('Actions') }}
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
                          name="deleteCompany"
                          class="btn btn-sm"
                          @click="showMsgBoxTwo('deleteCompany',company.id)">
                          <base-feather-icon
                            icon="Trash2Icon"
                            size="20"
                          />
                        </span>
                      </small>
                    </template>
                  </b-card>
                </b-card-group>
              </b-col>
              <b-col cols="12" lg="3">
                <b-card-group
                  class="mb-2"
                   v-for="(company, index) in paginatedCompanies"
                  :key="company.id"
                >
                  <b-card v-if="company.paymentDetail">
                    <template #header>
                      <b-card>
                        <b-card-title>
                          {{ t('Payment Method') }} - <img src="@/assets/img/PayID_logo.svg" style="width:50px;"/>
                        </b-card-title>
                        <small>{{ t('Details for payments') }}</small>
                      </b-card>
                    </template>
                    <b-col cols="12">
                      <b-card-text>
                        {{ t('PayID') }}: {{ company.paymentDetail.payid }}
                      </b-card-text>
                    </b-col>
                    <b-col cols="12">
                      <b-card-text>
                        {{ t('PayID name') }}: {{ company.paymentDetail.name }}
                      </b-card-text>
                    </b-col>
                    <template #footer>
                      <small>{{ t('Actions') }}
                        <span
                          class="btn btn-sm"
                          @click="editPayment(company)"
                          v-b-toggle.sidebar-payment-method
                          >
                          <base-feather-icon
                            icon="EditIcon"
                            size="20"
                          />
                        </span> |
                        <span
                          name="deletePaymentDetail"
                          class="btn btn-sm"
                          @click="showMsgBoxTwo('deletePaymentDetail',company.paymentDetail.id)">
                          <base-feather-icon
                            icon="Trash2Icon"
                            size="20"
                          />
                        </span>
                      </small>
                    </template>
                  </b-card>
                  <b-card v-if="!company.paymentDetail">
                    <template #header>
                      <b-card>
                        <b-card-title>
                          {{ t('Payment Method - ') }} <img src="@/assets/img/PayID_logo.svg" style="width:50px;"/>
                        </b-card-title>
                        <small>{{ t('Details for payments') }}</small>
                      </b-card>
                    </template>
                    <b-col cols="12">
                      <b-card-text>
                        <span
                          class="btn btn-sm"
                          @click="addPayment(company)"
                          v-b-toggle.sidebar-payment-method>
                          <base-feather-icon
                            icon="PlusCircleIcon"
                            size="22"
                            color="#4caf50"
                          />
                          {{ t('ADD new PayID') }}
                        </span>
                      </b-card-text>
                    </b-col>
                  </b-card>
                </b-card-group>
              </b-col>
            </b-row>
          </b-form>
        </b-row>
        <b-pagination
          v-if="totalCompanies > 1"
          v-model="currentPage"
          :total-rows="totalCompanies"
          :per-page="perPage"
          aria-controls="my-table"
        />
      </template>
      <template v-else-if="loading">
        <div v-if="loading" class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>
      <template v-else>
        <div class="text-center my-2 no-options-message">
          <base-feather-icon icon="AlertCircleIcon" size="16" />
          <p>{{ t('No businesses could be found') }}</p>
          <router-link :to="{ name: 'addCompany'}">{{ t("Add My Business") }}</router-link>
        </div>
      </template>
    </div>
    <company-edit-sidebar :company="company"/>
    <payment-method-sidebar :company="company" :mode="mode" @payment-added="handlePaymentAdded" @payment-updated="handlePaymentUpdated"/>
  </section>
</template>



<script>
import ValidationError from "@/components/uiComponents/ValidationError"
import BaseFeatherIcon from '../../../uiComponents/BaseFeatherIcon.vue'
import CompanyEditSidebar from '@/components/uiComponents/CompanyEditSidebar.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import PaymentMethodSidebar from '@/components/uiComponents/PaymentMethodSidebar.vue'

export default {
  components: {
    ValidationError,
    BaseFeatherIcon,
    CompanyEditSidebar,
    PaymentMethodSidebar,
  },
  data() {
    return {
      companies: [],
      company: {
        name: '',
        email: '',
        abn: '',
        phone: '',
        paymentDetail: {
          payid: '',
          name: ''
        },
      },
      loading: false,
      t: null,
      currentPage: 1,
      perPage: 1, // Set the number of companies per page to 1
      mode: '',
    }
  },
  computed: {
    totalCompanies() {
      return this.companies.length;
    },
    paginatedCompanies() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.companies.slice(start, end);
    }
  },
  created() {
    this.loading = true;
    // Async function to fetch companies
    const getCompanies = async () => {
      try {
        await this.$store.dispatch('companies/list');
        this.companies = this.$store.getters["companies/list"];
        this.loading = false;
        console.log(this.companies)
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    const { t } = useI18nUtils()
    this.t = t
    // Call the function to fetch companies
    getCompanies();
  },
  methods: {
    async handleCompanyDelete(companyId) {
      try {
        await this.$store.dispatch('companies/destroy', companyId);
        this.companies = this.companies.filter(company => company.id !== companyId);
      } catch (e) {
        await this.$store.dispatch('alerts/showNotification', {
          message: 'Oops, something went wrong!',
          type: 'error'
        }); // Log the response data for debugging
      }
    },
    async handlePaymentDelete(paymentId) {
      try {
        await this.$store.dispatch('paymentMethods/destroy', paymentId);
        // Update local state
        const companyIndex = this.companies.findIndex(company => company.paymentDetail && company.paymentDetail.id === paymentId);
        if (companyIndex > -1) {
          this.companies[companyIndex].paymentDetail = null;
        }
      } catch (e) {
        await this.$store.dispatch('alerts/showNotification', {
          message: 'Oops, something went wrong!',
          type: 'error'
        }); // Log the response data for debugging
      }
    },
    showMsgBoxTwo(action,id) {
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

          if (this.boxTwo && action === 'deleteCompany')
            this.handleCompanyDelete(id)
          else if(this.boxTwo && action === 'deletePaymentDetail')
            this.handlePaymentDelete(id)
        })
        .catch(err => {
          // An error occurred
        })
    },
    editCompany(company) {
      this.company = company;
    },
    editPayment(company){
      this.company = { ...company };
      this.mode = 'update'
    },
    addPayment(company){
      this.company = { ...company };
      this.mode = 'create'
    },
    handlePaymentAdded(payment){
      const index = this.companies.findIndex(c => c.id === this.company.id);
      if (index > -1) {
        this.$set(this.companies[index], 'paymentDetail', payment);
      }
    },
    handlePaymentUpdated(payment){
      const index = this.companies.findIndex(c => c.id === this.company.id);
      if (index > -1) {
        this.$set(this.companies[index], 'paymentDetail', payment);
      }
    }
  },
}
</script>
