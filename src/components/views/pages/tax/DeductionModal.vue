<template>
  <b-modal
    id="deductionModal"
    ref="deductionModal"
    title="Business Deduction Guidance"
    hide-footer
    size="lg"
    no-close-on-backdrop
    @shown="initializeModal"
  >
    <template #modal-header="{ close }">
      <h5 class="modal-title">{{t('Business Deduction Guidance')}}</h5>
      <b-button
        id="closeDeductionModal"
        variant="link"
        class="text-muted p-0"
        @click="closeModal"
        aria-label="Close"
      >
        <b-icon-x font-scale="2" class="h-6 w-6"></b-icon-x>
      </b-button>
    </template>
    <div class="p-2">
      <!-- Disclaimer -->
      <b-alert variant="primary" show class="border-primary p-2">
        <div class="d-flex">
          <div class="flex-shrink-0 mr-2">
            <b-icon-info-circle-fill variant="primary" class="h-5 w-5"></b-icon-info-circle-fill>
          </div>
          <div>
            <p class="mb-0 text-primary">
              <strong>{{t('Note')}}:</strong> {{t('This is a general guide. Deductions vary based on your specific business circumstances. For personalized advice, consult a tax professional')}}.
            </p>
          </div>
        </div>
      </b-alert>

      <!-- Business Type Dropdown -->
      <b-form-group :label="t('Select Business Type')" label-class="font-weight-bold" class="mb-4">
        <b-form-select
          v-model="localBusinessType"
          :options="businessTypeOptions"
          id="deductionBusinessType"
          @change="updateBusinessType"
        ></b-form-select>
      </b-form-group>

      <!-- Deduction List -->
      <div id="deductionList" class="max-h-96 overflow-y-auto pr-2">
        <b-card
          v-for="(deduction, index) in deductions"
          :key="index"
          class="deduction-item border"
          no-body
        >
          <b-card-body>
            <p class="mb-1 font-weight-bold-600 text-primary"><strong>{{ t(deduction.name) }}</strong></p>
            <p class="mb-0 text">{{ t(deduction.description) }}.</p>
          </b-card-body>
        </b-card>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-3 border-top">
        <div class="d-flex justify-content-end align-items-right">
          
          <b-button
            id="closeDeductionBtn"
            variant="outline-secondary"
            class="font-weight-bold"
            @click="closeModal"
          >
            {{t('Close')}}
          </b-button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import Ripple from 'vue-ripple-directive'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
export default {
  components: {
    BaseFeatherIcon,
  },
  directives: {
    Ripple,
  },
  props: {
    businessType: {
      type: String,
    },
  },
  setup() {
    const { t } = useI18nUtils()
    return { t }
  },
  data() {
    return {
      localBusinessType: 'sole-trader', 
      deductionBusinessType: this.businessType,
      deductions: [],
      businessTypeOptions: [
        { value: 'sole-trader', text: 'Sole Trader' },
        { value: 'partnership', text: 'Partnership' },
        { value: 'company', text: 'Company' },
      ],
    }
  },
  watch: {
    businessType(newVal) {
      this.localBusinessType = newVal;
      this.updateDeductionList();
    },
  },
  methods: {
    initializeModal() {
      const {t} = useI18nUtils();
      this.localBusinessType = this.businessType;
      this.updateDeductionList();
    },
    updateBusinessType() {
      this.$emit('change-business-type', this.localBusinessType);
      this.updateDeductionList();
    },
    updateDeductionList() {
      const deductions = {
        'sole-trader': [
          { name: 'Home Office', description: 'Costs for using part of your home for business (e.g., electricity, internet)' },
          { name: 'Vehicle Expenses', description: 'Costs for business-related vehicle use (e.g., fuel, maintenance)' },
          { name: 'Professional Fees', description: 'Fees for accounting, legal, or consulting services' },
          { name: 'Equipment', description: 'Costs for business equipment (e.g., computers, tools)' },
          { name: 'Travel', description: 'Business-related travel expenses (e.g., flights, accommodation)' },
        ],
        'partnership': [
          { name: 'Shared Office Costs', description: 'Shared office expenses split among partners' },
          { name: 'Professional Services', description: 'Fees for services benefiting the partnership' },
          { name: 'Marketing', description: 'Advertising and promotional expenses' },
          { name: 'Insurance', description: 'Business insurance premiums' },
          { name: 'Training', description: 'Costs for business-related training or courses' },
        ],
        'company': [
          { name: 'Director Fees', description: 'Fees paid to company directors' },
          { name: 'Employee Salaries', description: 'Wages and superannuation for employees' },
          { name: 'Rent', description: 'Costs for renting business premises' },
          { name: 'Software Subscriptions', description: 'Costs for business software licenses' },
          { name: 'Depreciation', description: 'Depreciation of company assets' },
        ],
      };

      this.deductions = deductions[this.localBusinessType] || [];
    },
    closeModal() {
      this.$refs.deductionModal.hide();
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';

// Minimal custom styles to support Bootstrap Vue
.max-h-96 {
  max-height: 24rem;
}
.overflow-y-auto {
  overflow-y: auto;
}
.pr-2 {
  padding-right: 0.5rem;
}
.space-y-2 {
  > * + * {
    margin-top: 0.5rem;
  }
}
.p-3 {
  padding: 0.75rem;
}
.mt-4 {
  margin-top: 1rem;
}
.pt-3 {
  padding-top: 0.75rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
</style>