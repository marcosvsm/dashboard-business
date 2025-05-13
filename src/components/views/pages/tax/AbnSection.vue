<template>
<div class="pb-4">
<b-card>
  <b-card-body class="invoice-padding pt-0">
    <b-row class="invoice-spacing">
      <!-- ABN Input Section -->
      <b-col cols="12" xl="6" class="mb-lg-1">
        <b-form-group :label="t('Annual Business Income (Before Tax)')">
          <b-input-group>
            <template #prepend>
              <b-input-group-text>$</b-input-group-text>
            </template>
            <b-form-input
              type="text"
              v-model="abnIncome"
              @input="formatInputWithCommas('abnIncome', $event)"
              @keydown="restrictToNumeric($event)"
              id="abnIncome"
              ref="abnIncomeInput"
              placeholder="0.00"
              :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
            />
            <template #append>
              <b-input-group-text>AUD</b-input-group-text>
            </template>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col cols="12" xl="6" class="mb-lg-1">
        <b-form-group :label="t('Tax Year')">
          <b-form-select
            v-model="abnTaxYear"
            :options="taxYearOptions"
            :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
          ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col cols="12" xl="12" class="mb-lg-1">
        <b-form-group :label="t('Business Type')">
          <b-form-select
            v-model="businessType"
            :options="businessTypeOptions"
            :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
          ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col cols="12" xl="6" class="mb-lg-1">
        <b-form-group :label="t('Total Expenses')">
          <b-input-group>
            <template #prepend>
              <b-input-group-text>$</b-input-group-text>
            </template>
            <b-form-input
              type="text"
              v-model="expenses"
              @input="formatInputWithCommas('expenses', $event)"
              @keydown="restrictToNumeric($event)"
              id="expenses"
              ref="expensesInput"
              placeholder="0.00"
              :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
            />
            <template #append>
              <b-input-group-text>AUD</b-input-group-text>
            </template>
          </b-input-group>
        </b-form-group>

      </b-col>
      <b-col cols="12" xl="6" class="mb-lg-1">
        <b-button
          v-ripple.400="'rgba(255, 255, 255, 0.15)'"
          variant="outline-secondary"
          class="mt-2"
          @click="openDeductionModal"
        >
          <base-feather-icon icon="InfoIcon" size="16" />
          <span class="align-middle ml-25">{{t('Deduction Guidance')}}</span>
        </b-button>
      </b-col>
      <!-- Advanced Options -->
      <b-col xl="12" cols="12" class="mt-xl-0 mt-2">
        <h6 class="mb-2">{{t('Advanced Options')}}</h6>
        <b-form-group>
          <b-form-checkbox v-model="abnHasMedicare">
            {{t('Include Medicare Levy')}} (2%)
            <base-feather-icon
                id="medicareTooltip"
                icon="InfoIcon"
                size="16"
                class="ml-25 cursor-pointer"
                v-b-tooltip.hover
                :title="t('The Medicare levy is generally 2% of your taxable income. Exemptions may apply for low-income earners, seniors, foreign residents, temporary visa holders without Medicare access, or certain medical conditions.')"
              />
          </b-form-checkbox>
          <b-form-checkbox v-model="gstRegistered">
            {{t('GST Registered')}}
            <base-feather-icon
              id="gstTooltip"
              icon="InfoIcon"
              size="16"
              class="ml-25 cursor-pointer"
              v-b-tooltip.hover
              :title="t('You must register for GST if your annual turnover is $75,000 or more. GST is 10% of your sales.')"
            />
          </b-form-checkbox>
        </b-form-group>

        <b-button
          v-ripple.400="'rgba(255, 255, 255, 0.15)'"
          variant="primary"
          class="mt-2 w-100"
          @click="calculateAbnTax"
        >
          {{t('Calculate Business Tax')}}
        </b-button>
      </b-col>
    </b-row>
  </b-card-body>
</b-card>
<b-card v-if="showResults">
  <b-card-body>
    <!-- Results Section: Business Tax Breakdown -->
    <b-row v-if="showResults" class="invoice-spacing">
      <b-col cols="12">
        <div>
          <h4 class="mb-2">{{t('Business Tax Breakdown')}}</h4>
          <b-row>
            <b-col cols="12" md="6" class="mb-2">
              <div class="tax-card bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100">
                <h3 class="text-lg font-medium text-gray-800 mb-2">{{t('Net Income After Tax')}}</h3>
                <p class="text-3xl font-bold text-blue-700 m-0">{{ formatCurrency(netIncome) }}</p>
                <p class="text-sm text-gray-500">{{t('Per year')}}</p>
                <div class="mt-1">
                  <p class="text-sm font-medium text-gray-600 m-0">{{ formatCurrency(netIncome / 12) }} {{t('monthly')}}</p>
                  <p class="text-sm font-medium text-gray-600 m-0">{{ formatCurrency(netIncome / 52) }} {{t('weekly')}}</p>
                </div>
              </div>
            </b-col>
            <b-col cols="12" md="6" class="mb-2">
              <div class="tax-card bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-2 border border-red-100">
                <h3 class="text-lg font-medium text-gray-800 mb-2">{{t('Total Tax')}}</h3>
                <p class="text-3xl font-bold text-red-600 m-0">{{ formatCurrency(totalTax) }}</p>
                <p class="text-sm text-gray-500">{{t('Per year')}}</p>
                <div class="mt-1">
                  <b-progress
                    :value="effectiveTaxRate"
                    max="100"
                    class="bg-gray-200 rounded-full h-2.5"
                  >
                    <b-progress-bar variant="danger" :style="{ width: `${effectiveTaxRate}%` }"></b-progress-bar>
                  </b-progress>
                  <p class="text-sm font-medium text-gray-600 mt-1 m-0">{{ effectiveTaxRate.toFixed(2) }}% {{t('effective tax rate')}}</p>
                </div>
              </div>
            </b-col>
          </b-row>
           <!-- Business Summary -->
        <div class="invoice-padding bg-gray-50 rounded-lg p-2 mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">{{t('Business Summary')}}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">{{t('Gross Business Income')}}</p>
              <p class="text-xl font-bold text-gray-800" id="abnGrossIncome">{{ formatCurrency(grossIncome) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">{{t('Business Expenses')}}</p>
              <p class="text-xl font-bold text-gray-800" id="abnExpenses">{{ formatCurrency(expenses) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">{{t('Taxable Income')}}</p>
              <p class="text-xl font-bold text-gray-800" id="abnTaxableIncome">{{ formatCurrency(taxableIncome) }}</p>
            </div>
            <div v-if="showGstSection" id="abnGstSection">
              <p class="text-sm font-medium text-gray-600 mb-1">{{t('GST Collected')}}</p>
              <p class="text-xl font-bold text-gray-800" id="abnGstCollected">{{ formatCurrency(gstCollected) }}</p>
            </div>
          </div>
        </div>

         <!-- Detailed Tax Components -->
          <div class="bg-gray-50 rounded-lg p-2">
            <h3 class="text-lg font-medium text-gray-800 mb-4">{{t('Tax Components')}}</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">{{t('Income Tax')}}</span>
                  <span class="text-sm font-medium text-gray-900" id="abnIncomeTax">{{ formatCurrency(incomeTax) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full progress-bar" id="abnIncomeTaxBar" :style="{ width: `${incomeTaxPercentage}%` }"></div>
                </div>
              </div>
              <div v-if="showMedicareSection" id="abnMedicareSection">
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">{{t('Medicare Levy')}}</span>
                  <span class="text-sm font-medium text-gray-900" id="abnMedicareLevy">{{ formatCurrency(medicareLevy) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full progress-bar" id="abnMedicareLevyBar" :style="{ width: `${medicareLevyPercentage}%` }"></div>
                </div>
              </div>
              <div v-if="showCompanyTaxSection" id="abnCompanyTaxSection">
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">{{t('Company Tax')}} ({{ companyTaxRate * 100 }}%)</span>
                  <span class="text-sm font-medium text-gray-900" id="abnCompanyTax">{{ formatCurrency(companyTax) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-500 h-2 rounded-full progress-bar" id="abnCompanyTaxBar" :style="{ width: `${companyTaxPercentage}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-col>
    </b-row>
  </b-card-body>
</b-card>
  <b-card v-if="showResults">
    <b-card-body>  
    <!-- Results Section: Business Income Distribution -->
    <b-row class="invoice-spacing">
      <b-col cols="12">
        <b-card-body class="invoice-padding p-2">
          <h4 class="mb-2">{{t('Business Income Distribution')}}</h4>
          <div class="h-16 bg-gray-200 rounded-lg overflow-hidden flex mb-6">
            <div
              class="bg-blue-600 flex items-center justify-center text-xs font-medium text-white"
              :style="{ width: `${netIncomePercentage}%` }"
              v-b-tooltip.hover.click
              :title="`${t('Net Income')}: ${netIncomePercentage.toFixed(2)}%`"
            >
              <span class="px-2 truncate">{{ netIncomePercentage.toFixed(1) }}%</span>
            </div>
            <div
              class="bg-red-500 flex items-center justify-center text-xs font-medium text-white"
              :style="{ width: `${taxPercentage}%` }"
               v-b-tooltip.hover.click
              :title="`${t('Tax')}: ${taxPercentage.toFixed(2)}%`"
            >
              <span class="truncate">{{ taxPercentage.toFixed(1) }}%</span>
            </div>
            <div
              class="bg-amber-500 flex items-center justify-center text-xs font-medium text-white"
              :style="{ width: `${expensesPercentage}%`, minWidth: expensesPercentage > 0 ? '20px' : '0'}"
              v-b-tooltip.hover.click
              :title="`${t('Expenses')}: ${expensesPercentage.toFixed(2)}%`"
            >
              <span class="truncate">{{ expensesPercentage.toFixed(1) }}%</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-4">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>
              <span class="text-sm text-gray-700">{{t('Net Income')}}</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span class="text-sm text-gray-700">{{t('Tax')}}</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
              <span class="text-sm text-gray-700">{{t('Expenses')}}</span>
            </div>
          </div>
        </b-card-body>
      </b-col>
    </b-row>

  </b-card-body>
</b-card>
    <!-- Medicare Disclaimer -->
    <b-row v-if="showResults && showMedicareSection" class="invoice-spacing">
      <b-col cols="12" xl="12">
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-8" id="abnMedicareDisclaimer">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                <strong>{{t('Medicare Levy Disclaimer')}}:</strong> {{t("This calculator assumes the standard 2% Medicare levy applies. You may be exempt or eligible for a reduced rate if you are a low-income earner, senior, foreign resident, or have specific medical conditions. Temporary visa holders without Medicare access are generally exempt from the Medicare levy. For personalized advice, please consult a tax professional.")}}
              </p>
            </div>
          </div>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" xl="12" v-if="showResults">
        <!-- Business Owner Note Disclaimer -->
        <b-alert variant="primary" show class="border-l-4 border-primary p-4 mb-8">
          <div class="d-flex">
            <div class="flex-shrink-0 mr-2">
              <b-icon-info-circle-fill variant="primary" class="h-5 w-5"></b-icon-info-circle-fill>
            </div>
            <div>
              <p class="text-sm text-primary">
                <strong>{{ t('Business Owner Note') }}:</strong> {{ t('This calculator provides a simplified estimate of your tax situation. As a business owner, you may be eligible for additional deductions and tax concessions. Consider consulting with a tax professional for personalized advice') }}
              </p>
            </div>
          </div>
        </b-alert>
      </b-col>
      <b-col cols="12" xl="12">
        <p align="center">{{t('This tax calculator provides estimates based on current Australian tax rates and simplified assumptions. It is for informational purposes only and does not account for all tax offsets, deductions, or individual circumstances. For accurate tax advice, please consult a qualified tax professional.')}}</p>
      </b-col>
    </b-row>
    <deduction-modal :business-type="businessType" />
  </div>
</template>

<script>
import {VBTooltip} from 'bootstrap-vue'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import Ripple from 'vue-ripple-directive'
import DeductionModal from '@/components/views/pages/tax/DeductionModal.vue';
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
export default {
  components: {
    BaseFeatherIcon,
    DeductionModal,
  },
  directives: {
    Ripple,
    'b-tooltip': VBTooltip,
  },
  setup() {
    const { t } = useI18nUtils()
    return { t }
  },
  data() {
    return {
      abnIncome: '',
      abnTaxYear: '2023-2024',
      businessType: 'sole-trader',
      expenses: '',
      abnHasMedicare: false,
      gstRegistered: false,
      showResults: false,
      netIncome: 0,
      totalTax: 0,
      incomeTax: 0,
      medicareLevy: 0,
      companyTax: 0,
      companyTaxRate: 0,
      effectiveTaxRate: 0,
      grossIncome: 0,
      taxableIncome: 0,
      gstCollected: 0,
      showMedicareSection: false,
      showGstSection: false,
      showCompanyTaxSection: false,
      taxYearOptions: [
        { value: '2024-2025', text: '2024-2025' },
        { value: '2023-2024', text: '2023-2024' },
        { value: '2022-2023', text: '2022-2023' },
        { value: '2021-2022', text: '2021-2022' },
      ],
      businessTypeOptions: [
        { value: 'sole-trader', text: 'Sole Trader' },
        { value: 'partnership', text: 'Partnership' },
        { value: 'company', text: 'Company' },
      ],
    }
  },
  computed: {
    netIncomePercentage() {
      const total = this.netIncome + this.totalTax + parseFloat(this.expenses.replace(/,/g, '') || 0)
      return total > 0 ? (this.netIncome / total) * 100 : 0
    },
    taxPercentage() {
      const total = this.netIncome + this.totalTax + parseFloat(this.expenses.replace(/,/g, '') || 0)
      return total > 0 ? (this.totalTax / total) * 100 : 0
    },
    expensesPercentage() {
      const total = this.netIncome + this.totalTax + parseFloat(this.expenses.replace(/,/g, '') || 0)
      return total > 0 ? (parseFloat(this.expenses.replace(/,/g, '') || 0) / total) * 100 : 0
    },
    incomeTaxPercentage() {
      return this.totalTax > 0 ? (this.incomeTax / this.totalTax) * 100 : 0
    },
    medicareLevyPercentage() {
      return this.totalTax > 0 ? (this.medicareLevy / this.totalTax) * 100 : 0
    },
    companyTaxPercentage() {
      return this.totalTax > 0 ? (this.companyTax / this.totalTax) * 100 : 0
    },
  },
  methods: {
    formatNumberWithCommas(value) {
      if (!value) return '';
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
     formatInputWithCommas(field, value) {
      const input = this.$refs[field + 'Input'];
      const cursorPosition = input ? input.$el.selectionStart : 0;
      let inputValue = value || '';
      inputValue = inputValue.replace(/[^\d.]/g, ''); // Remove non-numeric and non-decimal characters
      const parts = inputValue.split('.');
      if (parts.length > 1) {
        inputValue = `${parts[0]}.${parts[1].slice(0, 2)}`; // Limit to 2 decimal places
      }
      const formattedValue = this.formatNumberWithCommas(inputValue);
      this[field] = formattedValue;
      // Adjust cursor position
      if (input) {
        this.$nextTick(() => {
          const newCursorPosition = cursorPosition + (formattedValue.length - (value || '').length);
          input.$el.setSelectionRange(newCursorPosition, newCursorPosition);
        });
      }
    },
    restrictToNumeric(event) {
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End', 'PageUp', 'PageDown',
        '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
      ];
      const isCtrlKey = event.ctrlKey || event.metaKey;
      const isAllowedKey = allowedKeys.includes(event.key);
      const isValidCtrlCombo = isCtrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase());
      
      if (!isAllowedKey && !isValidCtrlCombo) {
        event.preventDefault();
      }
      
      // Prevent multiple decimal points
      if (event.key === '.' && this[event.target.id === 'abnIncome' ? 'abnIncome' : 'expenses'].includes('.')) {
        event.preventDefault();
      }
    },
    formatCurrency(value) {
      const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
      if (isNaN(numValue) || numValue === null || numValue === undefined) {
        return '$0.00';
      }
      return '$' + numValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },
    calculateAbnTax() {
      try {
        // Get values and remove commas for calculation
        const grossIncome = parseFloat(this.abnIncome.replace(/,/g, '')) || 0;
        const expenses = parseFloat(this.expenses.replace(/,/g, '')) || 0;
        const taxYear = this.abnTaxYear;
        const includeMedicare = this.abnHasMedicare;
        const isGstRegistered = this.gstRegistered;
        const businessType = this.businessType;

        if (grossIncome < 0 || expenses < 0) {
          alert('Income and expenses cannot be negative.');
          return;
        }

        // Calculate GST (if registered)
        const gstRate = 0.1; // 10%
        const gstCollected = isGstRegistered ? grossIncome * gstRate / (1 + gstRate) : 0; // GST is 1/11 of gross for registered businesses

        // Calculate taxable income (gross income minus expenses)
        // For GST registered businesses, we remove GST from gross income
        const taxableIncome = Math.max(0, (isGstRegistered ? grossIncome - gstCollected : grossIncome) - expenses);

        // Calculate income tax based on selected tax year and business type
        let incomeTax = 0;
        let companyTax = 0;
        let companyTaxRate = 0;

        if (businessType === 'company') {
          // Company tax rate (flat 30% for larger companies, 25% for small business)
          companyTaxRate = grossIncome <= 50000000 ? 0.25 : 0.30;
          companyTax = taxableIncome * companyTaxRate;
          incomeTax = 0; // No personal income tax for company structure
        } else {
          // Personal income tax rates for sole traders and partnerships
          if (taxYear === '2024-2025') {
            if (taxableIncome <= 18200) {
              incomeTax = 0;
            } else if (taxableIncome <= 45000) {
              incomeTax = (taxableIncome - 18200) * 0.16;
            } else if (taxableIncome <= 135000) {
              incomeTax = 4288 + (taxableIncome - 45000) * 0.30;
            } else if (taxableIncome <= 190000) {
              incomeTax = 31288 + (taxableIncome - 135000) * 0.37;
            } else {
              incomeTax = 51538 + (taxableIncome - 190000) * 0.45;
            }
          } else if (taxYear === '2023-2024') {
            if (taxableIncome <= 18200) {
              incomeTax = 0;
            } else if (taxableIncome <= 45000) {
              incomeTax = (taxableIncome - 18200) * 0.19;
            } else if (taxableIncome <= 120000) {
              incomeTax = 5092 + (taxableIncome - 45000) * 0.325;
            } else if (taxableIncome <= 180000) {
              incomeTax = 29467 + (taxableIncome - 120000) * 0.37;
            } else {
              incomeTax = 51667 + (taxableIncome - 180000) * 0.45;
            }
          } else if (taxYear === '2022-2023' || taxYear === '2021-2022') {
            if (taxableIncome <= 18200) {
              incomeTax = 0;
            } else if (taxableIncome <= 45000) {
              incomeTax = (taxableIncome - 18200) * 0.19;
            } else if (taxableIncome <= 120000) {
              incomeTax = 5092 + (taxableIncome - 45000) * 0.325;
            } else if (taxableIncome <= 180000) {
              incomeTax = 29467 + (taxableIncome - 120000) * 0.37;
            } else {
              incomeTax = 51667 + (taxableIncome - 180000) * 0.45;
            }
          }
        }

        // Calculate Medicare Levy (2% of taxable income) - not applicable for companies
        const medicareLevy = (includeMedicare && businessType !== 'company') ? taxableIncome * 0.02 : 0;

        // Calculate total tax
        const totalTax = incomeTax + medicareLevy + companyTax;

        // Calculate net income after tax
        const netIncome = taxableIncome - totalTax;

        // Calculate effective tax rate
        const effectiveTaxRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

        // Update reactive data
        this.netIncome = netIncome;
        this.totalTax = totalTax;
        this.incomeTax = incomeTax;
        this.medicareLevy = medicareLevy;
        this.companyTax = companyTax;
        this.companyTaxRate = companyTaxRate;
        this.effectiveTaxRate = effectiveTaxRate;
        this.grossIncome = grossIncome;
        this.taxableIncome = taxableIncome;
        this.gstCollected = gstCollected;
        this.showMedicareSection = includeMedicare;
        this.showGstSection = isGstRegistered;
        this.showCompanyTaxSection = businessType === 'company';
        this.showResults = true;
      } catch (error) {
        console.error('Error in ABN tax calculation:', error);
        alert('An error occurred while calculating ABN tax. Please check your inputs.');
      }
    },
    openDeductionModal() {
      // Add a 300ms delay to allow the deduction list to load
      setTimeout(() => {
        this.$bvModal.show('deductionModal');
      }, 300);
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';

// Tailwind-inspired styles converted to SCSS
.invoice-spacing {
  .grid {
    display: grid;
  }
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .md\:grid-cols-2 {
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  .gap-6 {
    gap: 1.5rem;
  }
  .gap-4 {
    gap: 1rem;
  }
  .mb-6 {
    margin-bottom: 1.5rem;
  }
  .mb-8 {
    margin-bottom: 2rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .h-5 {
    height: 1.25rem;
  }
  .w-5 {
    width: 1.25rem;
  }
  .bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, var(--gradient-from), var(--gradient-to));
  }
  .from-blue-50 {
    --gradient-from: #eff6ff;
    --gradient-to: #eef2ff;
  }
  .to-indigo-50 {
    --gradient-to: #eef2ff;
  }
  .from-red-50 {
    --gradient-from: #fef2f2;
    --gradient-to: #fff7ed;
  }
  .to-orange-50 {
    --gradient-to: #fff7ed;
  }
  .rounded-lg {
    border-radius: 0.5rem;
  }
  .border {
    border-width: 1px;
    border-style: solid;
  }
  .border-blue-100 {
    border-color: #dbeafe;
  }
  .border-red-100 {
    border-color: #fee2e2;
  }
  .text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  .font-medium {
    font-weight: 500;
  }
  .text-gray-800 {
    color: #1f2937;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
  .font-bold {
    font-weight: 700;
  }
  .text-blue-700 {
    color: #1d4ed8;
  }
  .text-red-600 {
    color: #dc2626;
  }
  .mb-1 {
    margin-bottom: 0.25rem;
  }
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .text-gray-500 {
    color: #6b7280;
  }
  .mt-3 {
    margin-top: 0.75rem !important;
  }
  .ml-3 {
    margin-left: 0.75rem;
  }
  .text-gray-600 {
    color: #4b5563;
  }
  .mt-1 {
    margin-top: 0.25rem;
  }
  .bg-gray-200 {
    background-color: #e5e7eb;
  }
  .h-2 {
    height: 0.5rem;
  }
  .h-2\.5 {
    height: 0.625rem;
  }
  .h-16 {
    height: 4rem;
    @media (max-width: 640px) {
      height: 3rem;
    }
  }
  .rounded-full {
    border-radius: 9999px;
  }
  .bg-blue-600 {
    background-color: #2563eb;
  }
  .bg-red-500 {
    background-color: #ef4444;
  }
  .bg-amber-500 {
    background-color: #f59e0b;
  }
  .border-yellow-400 {
    border-color: #facc15;
  }
  .bg-yellow-50 {
    background-color: #fefce8;
  }
  .text-yellow-700 {
    color: #b45309
  }
  .text-yellow-400{
    color: rgb(250 204 21 / var(--tw-text-opacity, 1));
  }
  .text-white {
    color: #ffffff;
  }
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }
  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .flex-wrap {
    flex-wrap: wrap;
  }
  .w-3 {
    width: 0.75rem;
  }
  .h-3 {
    height: 0.75rem;
  }
  .mr-1 {
    margin-right: 0.5rem !important;
  }
  .text-gray-700 {
    color: #374151;
  }
  .space-y-4 {
    > * + * {
      margin-top: 1rem;
    }
  }
  .justify-between {
    justify-content: space-between;
  }
  .bg-gray-50 {
    background-color: #f9fafb;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .bg-purple-500 {
    background-color: #a855f7;
  }
  .bg-green-500 {
    background-color: #22c55e;
  }
  .overflow-hidden {
    overflow: hidden;
  }
  .tax-card {
    transition: all 0.3s ease;
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>