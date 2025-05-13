<template>
<div class="pb-4">
  <b-card>
    <b-card-body class="invoice-padding pt-0">
      <b-row class="invoice-spacing">
        <!-- TFN Input Section -->
        <b-col cols="12" xl="6" class="mb-lg-1">
          <b-form-group :label="t('Annual Salary')">
            <b-input-group>
              <template #prepend>
                <b-input-group-text>$</b-input-group-text>
              </template>
              <b-form-input
                type="text"
                v-model="tfnIncome"
                @input="formatInputWithCommas('tfnIncome', $event)"
                @keydown="restrictToNumeric($event)"
                id="tfnIncome"
                ref="tfnIncomeInput"
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
              v-model="tfnTaxYear"
              :options="taxYearOptions"
              id="tfnTaxYear"
              :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col cols="12" xl="6" class="mb-lg-1">
          <b-form-group>
            <b-form-checkbox v-model="hasMedicare" id="hasMedicare">
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
          </b-form-group>
        </b-col>
        <b-col cols="12" xl="12" class="mb-lg-1">
          <b-button
            v-ripple.400="'rgba(255, 255, 255, 0.15)'"
            variant="primary"
            class="mt-2 w-100"
            @click="calculateTfnTax"
            id="calculateTfnBtn"
          >
            {{t('Calculate Employee Tax')}}
          </b-button>
        </b-col>
      </b-row>
    </b-card-body>
  </b-card>
  <b-card v-if="showResults">
    <b-card-body>
      <!-- Results Section: Employee Tax Breakdown -->
      <b-row v-if="showResults" class="invoice-spacing" id="tfnResultsSection">
        <b-col cols="12">
          <div>
            <h4 class="mb-2">{{t('Employee Tax Breakdown')}}</h4>
            <b-row>
              <b-col cols="12" md="6" class="mb-2">
                <div class="tax-card bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100">
                  <h3 class="text-lg font-medium text-gray-800 mb-2">{{t('Take Home Pay')}}</h3>
                  <p class="text-3xl font-bold text-blue-700 m-0" id="tfnTakeHomePay">{{ formatCurrency(takeHomePay) }}</p>
                  <p class="text-sm text-gray-500">{{t('Per year')}}</p>
                  <div class="mt-1">
                    <p class="text-sm font-medium text-gray-600 m-0" id="tfnTakeHomePayMonthly">{{ formatCurrency(takeHomePay / 12) }} {{t('monthly')}}</p>
                    <p class="text-sm font-medium text-gray-600 m-0" id="tfnTakeHomePayWeekly">{{ formatCurrency(takeHomePay / 52) }} {{t('weekly')}}</p>
                  </div>
                </div>
              </b-col>
              <b-col cols="12" md="6" class="mb-2">
                <div class="tax-card bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-2 border border-red-100">
                  <h3 class="text-lg font-medium text-gray-800 mb-1">{{t('Total Tax')}}</h3>
                  <p class="text-3xl font-bold text-red-600 mb-0" id="tfnTotalTax">{{ formatCurrency(totalTax) }}</p>
                  <p class="text-sm text-gray-500">{{t('Per year')}}</p>
                  <div class="mt-1">
                    <b-progress
                      :value="effectiveTaxRate"
                      max="100"
                      class="bg-gray-200 rounded-full h-2.5"
                    >
                      <b-progress-bar variant="danger" :style="{ width: `${effectiveTaxRate}%` }"></b-progress-bar>
                    </b-progress>
                    <p class="text-sm font-medium text-gray-600 mt-1 mb-0" id="tfnEffectiveTaxRate">{{ effectiveTaxRate.toFixed(2) }}% {{t('effective tax rate')}}</p>
                  </div>
                </div>
              </b-col>
            </b-row>
              <!-- Tax Components -->
              <div class="bg-gray-50 rounded-lg p-2">
                <h4 class="text-lg font-medium text-gray-800 mb-4">{{t('Tax Components')}}</h4>
                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700">{{t('Income Tax')}}</span>
                      <span class="text-sm font-medium text-gray-900" id="tfnIncomeTax">{{ formatCurrency(incomeTax) }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full progress-bar" id="tfnIncomeTaxBar" :style="{ width: `${incomeTaxPercentage}%` }"></div>
                    </div>
                  </div>
                  <div v-if="showMedicareSection" id="tfnMedicareSection">
                    <div class="flex justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700">{{t('Medicare Levy')}}</span>
                      <span class="text-sm font-medium text-gray-900" id="tfnMedicareLevy">{{ formatCurrency(medicareLevy) }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-green-500 h-2 rounded-full progress-bar" id="tfnMedicareLevyBar" :style="{ width: `${medicareLevyPercentage}%` }"></div>
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
        <!-- Employer Cost Breakdown -->
        <b-row v-if="showResults" class="invoice-spacing">
          <b-col cols="12">
            <div>
              <h4 class="mb-2">{{t('Employer Cost Breakdown')}}</h4>
              <b-row>
                <b-col cols="12" md="6" class="mb-2">
                  <div class="tax-card bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-100">
                    <h3 class="text-lg font-medium text-gray-800 mb-2">{{t('Total Cost to Employer')}}</h3>
                    <p class="text-3xl font-bold text-purple-700 m-0" id="tfnTotalEmployerCost">{{ formatCurrency(totalEmployerCost) }}</p>
                    <p class="text-sm text-gray-500">{{t('Per year')}}</p>
                  </div>
                </b-col>
                <b-col cols="12" md="6" class="mb-2">
                  <div class="tax-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-100">
                    <h3 class="text-lg font-medium text-gray-800 mb-2">{{t('Superannuation Contribution')}}</h3>
                    <p class="text-3xl font-bold text-emerald-600 m-0" id="tfnSuperContribution">{{ formatCurrency(superContribution) }}</p>
                    <p class="text-sm text-gray-500 m-0">{{t('Per year')}}</p>
                    <p class="text-xs text-gray-500 mb-0" id="tfnSuperRate">{{ (superRate * 100).toFixed(1) }}% {{t('of base salary')}}</p>
                  </div>
                </b-col>
              </b-row>
              <!-- Cost Distribution -->
              <div class="bg-gray-50 rounded-lg p-2">
                <h3 class="text-lg font-medium text-gray-800 mb-4">{{t('Cost Distribution')}}</h3>
                <div class="h-16 w-full bg-gray-200 rounded-lg overflow-hidden flex mb-6">
                  <div
                    class="bg-blue-600 flex items-center justify-center text-xs font-medium text-white"
                    id="tfnTakeHomePayBar"
                    :style="{ width: `${takeHomePayPercentage}%` }"
                  >
                    <span class="px-2 truncate" id="tfnTakeHomePayBarLabel">{{ takeHomePayPercentage.toFixed(0) }}%</span>
                  </div>
                  <div
                    class="bg-red-500 flex items-center justify-center text-xs font-medium text-white"
                    id="tfnTaxBar"
                    :style="{ width: `${taxPercentage}%` }"
                  >
                    <span class="truncate" id="tfnTaxBarLabel">{{ taxPercentage.toFixed(0) }}%</span>
                  </div>
                  <div
                    class="bg-emerald-500 flex items-center justify-center text-xs font-medium text-white"
                    id="tfnSuperBar"
                    :style="{ width: `${superPercentage}%` }"
                  >
                    <span class="truncate" id="tfnSuperBarLabel">{{ superPercentage.toFixed(0) }}%</span>
                  </div>
                </div>
                <div class="flex flex-wrap gap-4">
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>
                    <span class="text-sm text-gray-700">{{t('Take Home Pay')}}</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    <span class="text-sm text-gray-700">{{t('Tax')}}</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-emerald-500 rounded-full mr-1"></div>
                    <span class="text-sm text-gray-700">{{t('Superannuation')}}</span>
                  </div>
                </div>
              </div>
            </div>
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
                <strong>{{t('Medicare Levy Disclaimer')}}:</strong> {{t('This calculator assumes the standard 2% Medicare levy applies. You may be exempt or eligible for a reduced rate if you are a low-income earner, senior, foreign resident, or have specific medical conditions. Temporary visa holders without Medicare access are generally exempt from the Medicare levy. For personalized advice, please consult a tax professional.')}}
              </p>
            </div>
          </div>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" xl="12">
        <p align="center">{{t('This tax calculator provides estimates based on current Australian tax rates and simplified assumptions. It is for informational purposes only and does not account for all tax offsets, deductions, or individual circumstances. For accurate tax advice, please consult a qualified tax professional.')}}</p>
      </b-col>
    </b-row>
</div>  
</template>
<script>
import {VBTooltip} from 'bootstrap-vue'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import Ripple from 'vue-ripple-directive'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
export default {
  components: {
    BaseFeatherIcon,
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
      tfnIncome: '',
      tfnTaxYear: '2023-2024',
      hasMedicare: true,
      showResults: false,
      takeHomePay: 0,
      totalTax: 0,
      incomeTax: 0,
      medicareLevy: 0,
      superContribution: 0,
      superRate: 0,
      totalEmployerCost: 0,
      effectiveTaxRate: 0,
      showMedicareSection: false,
      taxYearOptions: [
        { value: '2024-2025', text: '2024-2025' },
        { value: '2023-2024', text: '2023-2024' },
        { value: '2022-2023', text: '2022-2023' },
        { value: '2021-2022', text: '2021-2022' },
      ],
    }
  },
  computed: {
    takeHomePayPercentage() {
      const total = this.totalEmployerCost;
      return total > 0 ? (this.takeHomePay / total) * 100 : 0;
    },
    taxPercentage() {
      const total = this.totalEmployerCost;
      return total > 0 ? (this.totalTax / total) * 100 : 0;
    },
    superPercentage() {
      const total = this.totalEmployerCost;
      return total > 0 ? (this.superContribution / total) * 100 : 0;
    },
    incomeTaxPercentage() {
      return this.totalTax > 0 ? (this.incomeTax / this.totalTax) * 100 : 0;
    },
    medicareLevyPercentage() {
      return this.totalTax > 0 ? (this.medicareLevy / this.totalTax) * 100 : 0;
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
      if (event.key === '.' && this.tfnIncome.includes('.')) {
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
    calculateTfnTax() {
      try {
        // Get income value and remove commas for calculation
        const income = parseFloat(this.tfnIncome.replace(/,/g, '')) || 0;
        const taxYear = this.tfnTaxYear;
        const includeMedicare = this.hasMedicare;

        if (income < 0) {
          alert('Income cannot be negative.');
          return;
        }

        // Calculate income tax based on selected tax year
        let incomeTax = 0;
        let superRate = 0;

        if (taxYear === '2024-2025') {
          // Stage 3 tax cuts for 2024-2025
          if (income <= 18200) {
            incomeTax = 0;
          } else if (income <= 45000) {
            incomeTax = (income - 18200) * 0.16;
          } else if (income <= 135000) {
            incomeTax = 4288 + (income - 45000) * 0.30;
          } else if (income <= 190000) {
            incomeTax = 31288 + (income - 135000) * 0.37;
          } else {
            incomeTax = 51538 + (income - 190000) * 0.45;
          }
          superRate = 0.12; // 12% for 2024-2025
        } else if (taxYear === '2023-2024') {
          if (income <= 18200) {
            incomeTax = 0;
          } else if (income <= 45000) {
            incomeTax = (income - 18200) * 0.19;
          } else if (income <= 120000) {
            incomeTax = 5092 + (income - 45000) * 0.325;
          } else if (income <= 180000) {
            incomeTax = 29467 + (income - 120000) * 0.37;
          } else {
            incomeTax = 51667 + (income - 180000) * 0.45;
          }
          superRate = 0.115; // 11.5% for 2023-2024
        } else if (taxYear === '2022-2023') {
          if (income <= 18200) {
            incomeTax = 0;
          } else if (income <= 45000) {
            incomeTax = (income - 18200) * 0.19;
          } else if (income <= 120000) {
            incomeTax = 5092 + (income - 45000) * 0.325;
          } else if (income <= 180000) {
            incomeTax = 29467 + (income - 120000) * 0.37;
          } else {
            incomeTax = 51667 + (income - 180000) * 0.45;
          }
          superRate = 0.105; // 10.5% for 2022-2023
        } else if (taxYear === '2021-2022') {
          if (income <= 18200) {
            incomeTax = 0;
          } else if (income <= 45000) {
            incomeTax = (income - 18200) * 0.19;
          } else if (income <= 120000) {
            incomeTax = 5092 + (income - 45000) * 0.325;
          } else if (income <= 180000) {
            incomeTax = 29467 + (income - 120000) * 0.37;
          } else {
            incomeTax = 51667 + (income - 180000) * 0.45;
          }
          superRate = 0.10; // 10% for 2021-2022
        }

        // Calculate Medicare Levy (2% of taxable income)
        const medicareLevy = includeMedicare ? income * 0.02 : 0;

        // Calculate total tax
        const totalTax = incomeTax + medicareLevy;

        // Calculate take home pay
        const takeHomePay = income - totalTax;

        // Calculate superannuation
        const superContribution = income * superRate;

        // Calculate total cost to employer
        const totalEmployerCost = income + superContribution;

        // Calculate effective tax rate
        const effectiveTaxRate = income > 0 ? (totalTax / income) * 100 : 0;

        // Update reactive data
        this.takeHomePay = takeHomePay;
        this.totalTax = totalTax;
        this.incomeTax = incomeTax;
        this.medicareLevy = medicareLevy;
        this.superContribution = superContribution;
        this.superRate = superRate;
        this.totalEmployerCost = totalEmployerCost;
        this.effectiveTaxRate = effectiveTaxRate;
        this.showMedicareSection = includeMedicare;
        this.showResults = true;
      } catch (error) {
        console.error('Error in TFN tax calculation:', error);
        alert('An error occurred while calculating TFN tax. Please check your inputs.');
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/scss/base/pages/app-invoice.scss';
@import '~@/scss/base/components/variables-dark';

// Styles adapted from AbnSection.vue with new colors for TFN results
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
  .from-purple-50 {
    --gradient-from: #faf5ff;
    --gradient-to: #fce7f3;
  }
  .to-pink-50 {
    --gradient-to: #fce7f3;
  }
  .from-emerald-50 {
    --gradient-from: #ecfdf5;
    --gradient-to: #e0f2fe;
  }
  .to-teal-50 {
    --gradient-to: #e0f2fe;
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
  .border-purple-100 {
    border-color: #f3e8ff;
  }
  .border-emerald-100 {
    border-color: #d1fae5;
  }
  .border-yellow-400 {
    border-color: #facc15;
  }
  .bg-yellow-50 {
    background-color: #fefce8;
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
  .text-purple-700 {
    color: #6b21a8;
  }
  .text-emerald-600 {
    color: #059669;
  }
  .text-yellow-700 {
    color: #b45309
  }
  .text-yellow-400{
    color: rgb(250 204 21 / var(--tw-text-opacity, 1));
  }
  .mb-1 {
    margin-bottom: 0.25rem;
  }
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
  .text-gray-500 {
    color: #6b7280;
  }
  .mt-3 {
    margin-top: 0.75rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .text-gray-600 {
    color: #4b5563;
  }
  .mt-1 {
    margin-top: 0.25rem;
  }
  .ml-3 {
    margin-left: 0.75rem;
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
  .h-5 {
    height: 1.25rem;
  }
  .w-5 {
    width: 1.25rem;
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
  .bg-emerald-500 {
    background-color: #10b981;
  }
  .bg-green-500 {
    background-color: #22c55e;
  }
  .bg-purple-500 {
    background-color: #a855f7;
  }
  .text-white {
    color: #ffffff;
  }
  .flex {
    display: flex;
  }
  .flex-shrink-0 {
    flex-shrink: 0;
  }
  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-between {
    justify-content: space-between;
  }
  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .p-4 {
    padding: 1rem;
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
  .mr-1{
    margin-right: 0.5rem !important;
  }
  .text-gray-700 {
    color: #374151;
  }
  .text-gray-900 {
    color: #111827;
  }
  .space-y-4 {
    > * + * {
      margin-top: 1rem;
    }
  }
  .bg-gray-50 {
    background-color: #f9fafb;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .mb-8 {
    margin-bottom: 2rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
  .font-semibold {
    font-weight: 600;
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
  .progress-bar {
    transition: width 0.5s ease-in-out;
  }
}
</style>