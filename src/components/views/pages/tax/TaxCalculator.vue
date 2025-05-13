<template>
  <div class="tax-calculator">
    <div class="header">
      <div class="header-content">
        <h1>{{t('Australian Tax Calculator')}}</h1>
        <p>{{t('Understand your tax payments for employees and business owners')}}</p>
      </div>
    </div>
    <div class="content">
      <div class="card">
        <h4>{{t('Select Income Source')}}</h4>
        <div class="tabs">
          <b-button
            @click="setTab('abn')"
            :class="{ 'tab-active': currentTab === 'abn', 'tab-inactive': currentTab !== 'abn' }"
          >
            Business Owner (ABN)
          </b-button>
          <b-button
            @click="setTab('tfn')"
            :class="{ 'tab-active': currentTab === 'tfn', 'tab-inactive': currentTab !== 'tfn' }"
          >
            Employee (TFN)
          </b-button>
        </div>
      </div>
        <TfnSection v-if="currentTab === 'tfn'" />
        <AbnSection v-else />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import TfnSection from './TfnSection.vue';
import AbnSection from './AbnSection.vue';
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
export default {
  name: 'TaxCalculator',
  components: {
    TfnSection,
    AbnSection,
  },
  setup() {
    const currentTab = ref('abn');
    const setTab = (tab) => {
      currentTab.value = tab;
    };
    const { t } = useI18nUtils()
    return { 
      currentTab, 
      setTab,
      t
    };
  },
};
</script>

<style scoped>
.tax-calculator {
  min-height: 100vh;
}
.header {
  background: linear-gradient(to right, #2563eb, #4f46e5);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  border-radius: 5px;
}
.header-content {
  max-width: 1024px;
  margin: 0 auto;
}
.header h1 {
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
}
.header p {
  color: #bfdbfe;
}
.content {
  max-width: 1024px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.card {
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}
.tab-active {
  border-bottom: 2px solid #2563eb !important;
  color: #6b7280!important;
  padding: 1rem;
  margin-right: 2rem;
  font-weight: 500;
  font-size: 0.875rem;
  background-color: transparent !important;
  border:none;
}
.tab-inactive {
  color: #6b7280!important;
  padding: 1rem;
  margin-right: 2rem;
  font-weight: 500;
  font-size: 0.875rem;
  background-color: transparent !important;
  border:none;
}
.tab-inactive:hover {
  color: #FFF;
  border-bottom: 2px solid #d1d5db;
}
.btn-secondary:hover{
  background-color: transparent !important;
  color: #6b7280!important;
  border:none;
  box-shadow: none !important;
}
.btn-secondary:focus{
  background-color: transparent !important;
  color: #6b7280!important;
  border:none;
  box-shadow: none;
}
.card h4{
  color: #007eca !important;
  font-weight: bolder;
}
</style>