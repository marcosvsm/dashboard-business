<template>
  <div class="wizard-root">

    <!-- ════════════════════════════════════════════════════
         STAGE: INTRO
    ════════════════════════════════════════════════════ -->
    <div v-if="stage === 'intro'" class="wizard-intro">
      <div class="intro-icon-wrap">
        <base-feather-icon icon="ShieldIcon" size="28" />
      </div>
      <h4 class="intro-title">{{ t('Set Up Your Tax Overview') }}</h4>
      <p class="intro-body">
        {{ t("We'll use your invoice activity and a few quick answers to build a clear, personalised tax picture for your business.") }}
      </p>
      <ul class="intro-benefits">
        <li>
          <base-feather-icon icon="CheckIcon" size="14" class="benefit-icon mr-2" />
          {{ t('See how much you may owe in income tax and GST') }}
        </li>
        <li>
          <base-feather-icon icon="CheckIcon" size="14" class="benefit-icon mr-2" />
          {{ t('Track your savings progress and stay ahead of EOFY') }}
        </li>
        <li>
          <base-feather-icon icon="CheckIcon" size="14" class="benefit-icon mr-2" />
          {{ t('Smart tax savings targets calculated for you') }}
        </li>
      </ul>
      <b-button variant="primary" class="btn-intro-start" @click="stage = 'form'">
        {{ t('Get Started') }}
        <base-feather-icon icon="ArrowRightIcon" size="15" class="ml-1" />
      </b-button>
      <p class="intro-note">{{ t('Takes about 2 minutes. Not financial advice.') }}</p>
      <button class="intro-cancel" @click="$emit('cancel')">{{ t('Not now') }}</button>
    </div>

    <!-- ════════════════════════════════════════════════════
         STAGE: FORM  (sections 1–6)
    ════════════════════════════════════════════════════ -->
    <template v-else-if="stage === 'form'">

      <!-- Modal header -->
      <div class="wizard-header">
        <div>
          <h5 class="wizard-title mb-0">{{ t('Tax Overview Setup') }}</h5>
          <p class="wizard-subtitle mb-0">{{ sectionSubtitle }}</p>
        </div>
        <button class="wizard-close" :aria-label="t('Close')" @click="$emit('cancel')">
          <base-feather-icon icon="XIcon" size="16" />
        </button>
      </div>

      <!-- Progress bar -->
      <div class="wizard-progress">
        <b-progress
          :value="currentSection"
          :max="totalSections"
          variant="primary"
          height="3px"
          class="mb-0 rounded-0"
        />
        <div class="wizard-tabs">
          <span
            v-for="(sec, idx) in sections"
            :key="idx"
            :class="['wizard-tab', { active: currentSection === idx + 1, done: currentSection > idx + 1 }]"
          >
            <span class="tab-num">
              <base-feather-icon v-if="currentSection > idx + 1" icon="CheckIcon" size="10" />
              <span v-else>{{ idx + 1 }}</span>
            </span>
            <span class="tab-name d-none d-md-inline">{{ t(sec.label) }}</span>
          </span>
        </div>
      </div>

      <!-- Section body -->
      <div class="wizard-body">
        <transition name="slide" mode="out-in">
          <div :key="currentSection + ':' + abnView">

            <!-- ═════════════════════════════════════════
                 SECTION 1 — Business
            ═════════════════════════════════════════ -->
            <div v-if="currentSection === 1">

              <!-- Loading state — companies list being fetched -->
              <div v-if="companiesLoading">
                <h6 class="section-heading">{{ t('Your Business') }}</h6>
                <p class="section-intro">{{ t('Loading your company details…') }}</p>
              </div>

              <!-- No-company guard (after load completes) -->
              <div v-else-if="!company">
                <h6 class="section-heading">{{ t('Your Business') }}</h6>
                <b-alert variant="warning" show class="py-2 px-3">
                  <div class="d-flex align-items-start">
                    <base-feather-icon icon="AlertTriangleIcon" size="15" class="mr-2 flex-shrink-0 mt-1" />
                    <div class="text-sm">
                      {{ t('We could not find your company details. Please create your company first, then return to Tax Overview Setup.') }}
                    </div>
                  </div>
                </b-alert>
              </div>

              <!-- REVIEW MODE -->
              <template v-else-if="abnView === 'review'">
                <h6 class="section-heading">{{ t('Your Business') }}</h6>
                <p class="section-intro">{{ t('Confirm your saved company tax details. Re-check the ABN if anything looks out of date.') }}</p>

                <div class="complete-summary">
                  <div class="summary-row">
                    <span class="summary-label">{{ t('Business name') }}</span>
                    <span class="summary-value">{{ company.name || '—' }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">{{ t('ABN') }}</span>
                    <span class="summary-value">{{ formattedAbn || '—' }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">{{ t('ABN status') }}</span>
                    <span class="summary-value">{{ company.abn_status || t('Not checked') }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">{{ t('Entity type') }}</span>
                    <span class="summary-value">{{ company.abn_entity_type || '—' }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">{{ t('Legal name') }}</span>
                    <span class="summary-value">{{ company.abn_legal_name || '—' }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">{{ t('GST status') }}</span>
                    <span class="summary-value">{{ companyGstStatusLabel }}</span>
                  </div>
                  <div class="summary-row" v-if="company.gst_registered">
                    <span class="summary-label">{{ t('GST registered from') }}</span>
                    <span class="summary-value">{{ formatDate(company.gst_registered_from) }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">{{ t('Last ABN check') }}</span>
                    <span class="summary-value">{{ abnFreshnessLabel }}</span>
                  </div>
                </div>

                <!-- Soft warning if details are missing or stale -->
                <b-form-text
                  v-if="abnIsIncomplete"
                  class="field-note field-note-info"
                >
                  <base-feather-icon icon="InfoIcon" size="12" class="mr-1" />
                  {{ t('Some details are missing. Re-check the ABN to fill them in from the Australian Business Register.') }}
                </b-form-text>
                <b-form-text
                  v-else-if="abnIsStale"
                  class="field-note field-note-info"
                >
                  <base-feather-icon icon="InfoIcon" size="12" class="mr-1" />
                  {{ t('It has been a while since you last checked these details. Re-check to make sure they are current.') }}
                </b-form-text>

                <!-- Re-check action + error -->
                <div class="mt-2">
                  <b-button
                    variant="outline-primary"
                    size="sm"
                    :disabled="lookupLoading || !company.abn"
                    @click="performRecheck"
                  >
                    <base-feather-icon v-if="!lookupLoading" icon="RefreshCwIcon" size="13" class="mr-1" />
                    <b-spinner v-else small class="mr-1" />
                    {{ t('Re-check ABN') }}
                  </b-button>
                </div>
                <b-alert
                  v-if="lookupError"
                  variant="warning"
                  show
                  class="mt-2 py-2 px-3"
                >
                  <div class="d-flex align-items-start">
                    <base-feather-icon icon="AlertTriangleIcon" size="15" class="mr-2 flex-shrink-0 mt-1" />
                    <div class="text-sm">{{ lookupError }}</div>
                  </div>
                </b-alert>

                <!-- Wizard-only profile questions -->
                <b-form-group :label="t('What is your business structure?')" label-class="field-label" class="mt-3">
                  <template v-if="lockBusinessStructure">
                    <div class="complete-summary">
                      <div class="summary-row">
                        <span class="summary-label">{{ t('From ABR entity type') }}</span>
                        <span class="summary-value">{{ businessStructureLabel }}</span>
                      </div>
                    </div>
                    <b-form-text class="field-note">
                      {{ t('Set automatically from the entity type returned by the Australian Business Register. Re-check the ABN if this is incorrect.') }}
                    </b-form-text>
                  </template>
                  <template v-else>
                    <b-form-radio-group
                      v-model="draft.businessStructure"
                      :options="businessStructureOptions"
                      stacked
                      class="option-radio-group"
                    />
                  </template>
                </b-form-group>

                <b-form-group label-class="field-label">
                  <template #label>
                    {{ t('What financial year are you reporting for?') }}
                  </template>
                  <b-form-text class="field-note mb-2">
                    {{ t('Almost all Australian businesses use the standard year: 1 July – 30 June.') }}
                  </b-form-text>
                  <b-form-radio-group
                    v-model="draft.financialYear"
                    :options="financialYearOptions"
                    stacked
                    class="option-radio-group"
                  />
                </b-form-group>
              </template>

              <!-- COMPARISON MODE (Re-check confirmation, inline) -->
              <template v-else>
                <h6 class="section-heading">{{ t('Confirm ABR result') }}</h6>
                <p class="section-intro">{{ t('Review what we found in the Australian Business Register. Confirm to update your company, or discard to keep the saved details.') }}</p>

                <div class="comparison-grid">
                  <div class="comparison-col">
                    <p class="comparison-col-heading">{{ t('Currently saved') }}</p>
                    <div class="complete-summary">
                      <div class="summary-row">
                        <span class="summary-label">{{ t('ABN status') }}</span>
                        <span class="summary-value">{{ company.abn_status || '—' }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">{{ t('Entity type') }}</span>
                        <span class="summary-value">{{ company.abn_entity_type || '—' }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">{{ t('Legal name') }}</span>
                        <span class="summary-value">{{ company.abn_legal_name || '—' }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">{{ t('GST status') }}</span>
                        <span class="summary-value">{{ companyGstStatusLabel }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">{{ t('GST registered from') }}</span>
                        <span class="summary-value">{{ formatDate(company.gst_registered_from) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="comparison-col">
                    <p class="comparison-col-heading">{{ t('From ABR') }}</p>
                    <div class="complete-summary">
                      <div class="summary-row" :class="{ 'summary-row--diff': diff('abn_status') }">
                        <span class="summary-label">{{ t('ABN status') }}</span>
                        <span class="summary-value">{{ lookupResult.abn_status || '—' }}</span>
                      </div>
                      <div class="summary-row" :class="{ 'summary-row--diff': diff('abn_entity_type', 'entity_type') }">
                        <span class="summary-label">{{ t('Entity type') }}</span>
                        <span class="summary-value">{{ lookupResult.entity_type || '—' }}</span>
                      </div>
                      <div class="summary-row" :class="{ 'summary-row--diff': diff('abn_legal_name', 'entity_name') }">
                        <span class="summary-label">{{ t('Legal name') }}</span>
                        <span class="summary-value">{{ lookupResult.entity_name || '—' }}</span>
                      </div>
                      <div class="summary-row" :class="{ 'summary-row--diff': diff('gst_registered', 'gst_registered') }">
                        <span class="summary-label">{{ t('GST status') }}</span>
                        <span class="summary-value">{{ lookupResult.gst_registered ? t('Registered') : t('Not registered') }}</span>
                      </div>
                      <div class="summary-row" :class="{ 'summary-row--diff': diff('gst_registered_from', 'gst_registered_from') }">
                        <span class="summary-label">{{ t('GST registered from') }}</span>
                        <span class="summary-value">{{ formatDate(lookupResult.gst_registered_from) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <b-alert
                  v-if="lookupError"
                  variant="warning"
                  show
                  class="mt-2 py-2 px-3"
                >
                  <div class="d-flex align-items-start">
                    <base-feather-icon icon="AlertTriangleIcon" size="15" class="mr-2 flex-shrink-0 mt-1" />
                    <div class="text-sm">{{ lookupError }}</div>
                  </div>
                </b-alert>

                <div class="recheck-actions mt-3">
                  <b-button
                    variant="outline-secondary"
                    size="sm"
                    :disabled="confirmSaving"
                    @click="discardLookup"
                  >
                    {{ t('Discard') }}
                  </b-button>
                  <b-button
                    variant="primary"
                    size="sm"
                    :disabled="confirmSaving"
                    @click="confirmLookup"
                  >
                    <b-spinner v-if="confirmSaving" small class="mr-1" />
                    {{ t('Confirm & update company') }}
                  </b-button>
                </div>
              </template>
            </div>

            <!-- ═════════════════════════════════════════
                 SECTION 2 — GST
            ═════════════════════════════════════════ -->
            <div v-else-if="currentSection === 2">
              <h6 class="section-heading">{{ t('GST') }}</h6>

              <template v-if="companyGstRegistered">
                <p class="section-intro">{{ t('Tell us how you report GST to the ATO so we can show the right BAS due dates and savings targets.') }}</p>

                <b-form-group :label="t('How often do you report GST to the ATO?')" label-class="field-label">
                  <b-form-radio-group
                    v-model="draft.gstFrequency"
                    :options="gstFrequencyOptions"
                    stacked
                    class="option-radio-group"
                  />
                </b-form-group>

                <b-form-group :label="t('What GST accounting basis do you use?')" label-class="field-label">
                  <b-form-radio-group
                    v-model="draft.gstBasis"
                    :options="gstBasisOptions"
                    stacked
                    class="option-radio-group"
                  />
                  <b-form-text class="field-note">
                    {{ t('Most small businesses use cash basis. You report when money is received or paid.') }}
                  </b-form-text>
                </b-form-group>
              </template>

              <template v-else>
                <p class="section-intro">
                  {{ t('Your company is not registered for GST, so there is no BAS reporting to set up. You can update GST registration from your company settings.') }}
                </p>
                <b-form-text class="field-note field-note-info">
                  <base-feather-icon icon="InfoIcon" size="12" class="mr-1" />
                  {{ t('GST registration is required once your annual turnover reaches $75,000 ($150,000 for not-for-profits, or from day one for taxi and ride-share drivers).') }}
                </b-form-text>
              </template>
            </div>

            <!-- ═════════════════════════════════════════
                 SECTION 3 — Income tax
            ═════════════════════════════════════════ -->
            <div v-else-if="currentSection === 3">
              <h6 class="section-heading">{{ t('Income tax') }}</h6>
              <p class="section-intro">{{ t('A few details so we can estimate your income tax position and a sensible savings target.') }}</p>

              <b-form-group :label="t('What is your tax residency status?')" label-class="field-label">
                <b-form-radio-group
                  v-model="draft.taxResidency"
                  :options="taxResidencyOptions"
                  stacked
                  class="option-radio-group"
                />
                <b-form-text v-if="draft.taxResidency === 'working-holiday'" class="field-note field-note-info">
                  {{ t('Working holiday makers (visa 417 or 462) are taxed at 15% on the first $45,000, then resident rates above that.') }}
                </b-form-text>
              </b-form-group>

              <b-form-group
                v-if="draft.taxResidency && draft.taxResidency !== 'non-resident'"
                label-class="field-label"
              >
                <template #label>
                  {{ t('Do you pay the Medicare levy?') }}
                  <base-feather-icon
                    id="medicare-tip"
                    icon="InfoIcon"
                    size="13"
                    class="ml-1 cursor-pointer"
                    v-b-tooltip.hover
                    :title="t('The Medicare levy is 2% of your taxable income. Non-residents and working holiday makers generally do not pay it.')"
                  />
                </template>
                <b-form-radio-group
                  v-model="draft.medicareLevy"
                  :options="medicareLevyOptions"
                  stacked
                  class="option-radio-group"
                />
              </b-form-group>

              <b-form-group :label="t('Is the ATO already taking PAYG instalments from you?')" label-class="field-label">
                <b-form-radio-group
                  v-model="draft.paygInstalments"
                  :options="paygOptions"
                  stacked
                  class="option-radio-group"
                />
                <b-form-text v-if="draft.paygInstalments === 'yes'" class="field-note field-note-info">
                  {{ t('You are already prepaying tax quarterly. We will factor this into your tax estimate.') }}
                </b-form-text>
              </b-form-group>

              <b-form-group
                v-if="draft.paygInstalments === 'yes'"
                label-class="field-label"
              >
                <template #label>
                  {{ t('How much PAYG have you paid so far this financial year?') }}
                  <span class="field-optional">{{ t('optional') }}</span>
                </template>
                <b-input-group prepend="$">
                  <b-form-input
                    v-model.number="draft.paygAmountPaid"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="field-input"
                  />
                  <template #append>
                    <b-input-group-text>AUD</b-input-group-text>
                  </template>
                </b-input-group>
                <b-form-text class="field-note">
                  {{ t('Check your ATO online account or payment receipts. Enter 0 if unsure.') }}
                </b-form-text>
              </b-form-group>

              <b-form-group label-class="field-label">
                <template #label>
                  {{ t('How much have you already set aside for tax?') }}
                  <span class="field-optional">{{ t('optional') }}</span>
                </template>
                <b-input-group prepend="$">
                  <b-form-input
                    v-model.number="draft.alreadySaved"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="field-input"
                  />
                  <template #append>
                    <b-input-group-text>AUD</b-input-group-text>
                  </template>
                </b-input-group>
                <b-form-text class="field-note">{{ t("Enter 0 if you have not started yet. That is fine.") }}</b-form-text>
              </b-form-group>
            </div>

            <!-- ═════════════════════════════════════════
                 SECTION 4 — Sales & Expenses (optional)
            ═════════════════════════════════════════ -->
            <div v-else-if="currentSection === 4">
              <div class="optional-tag">
                <span class="optional-pill">{{ t('Optional') }}</span>
                <span class="optional-note">{{ t('You can skip this and refine it later.') }}</span>
              </div>
              <h6 class="section-heading">{{ t('Sales & Expenses') }}</h6>
              <p class="section-intro">{{ t('This helps us understand your GST exposure and track business expenses more accurately.') }}</p>

              <b-form-group :label="t('Are most of your sales subject to GST?')" label-class="field-label">
                <b-form-radio-group
                  v-model="draft.salesTaxable"
                  :options="salesTaxableOptions"
                  stacked
                  class="option-radio-group"
                />
              </b-form-group>

              <b-form-group :label="t('Would you like to track GST credits on your business expenses?')" label-class="field-label">
                <b-form-radio-group
                  v-model="draft.trackGstExpenses"
                  :options="laterOptions"
                  stacked
                  class="option-radio-group"
                />
              </b-form-group>
            </div>

            <!-- ═════════════════════════════════════════
                 SECTION 5 — Reminders (optional)
            ═════════════════════════════════════════ -->
            <div v-else-if="currentSection === 5">
              <div class="optional-tag">
                <span class="optional-pill">{{ t('Optional') }}</span>
                <span class="optional-note">{{ t('You can skip this and set it up later.') }}</span>
              </div>
              <h6 class="section-heading">{{ t('Reminders') }}</h6>
              <p class="section-intro">{{ t('Help us keep your ATO deadlines on your radar.') }}</p>

              <b-form-group :label="t('Do you have a tax agent or BAS agent?')" label-class="field-label">
                <b-form-radio-group
                  v-model="draft.hasTaxAgent"
                  :options="yesNoOptions"
                  stacked
                  class="option-radio-group"
                />
                <b-form-text v-if="draft.hasTaxAgent === 'yes'" class="field-note">
                  {{ t("Your agent may have extended lodgement deadlines. We will still send early reminders.") }}
                </b-form-text>
              </b-form-group>

              <b-form-group :label="t('Would you like reminders before BAS due dates and EOFY?')" label-class="field-label">
                <b-form-radio-group
                  v-model="draft.wantsReminders"
                  :options="yesNoOptions"
                  stacked
                  class="option-radio-group"
                />
              </b-form-group>
            </div>

            <!-- ═════════════════════════════════════════
                 SECTION 6 — Review & Save
            ═════════════════════════════════════════ -->
            <div v-else-if="currentSection === 6">
              <h6 class="section-heading">{{ t('Review & Save') }}</h6>
              <p class="section-intro">{{ t('A quick check before we save your tax setup.') }}</p>

              <p class="tpc-section-label mt-2 mb-1">{{ t('Business') }}</p>
              <div class="complete-summary">
                <div class="summary-row">
                  <span class="summary-label">{{ t('Business name') }}</span>
                  <span class="summary-value">{{ company ? company.name : '—' }}</span>
                </div>
                <div class="summary-row" v-if="draft.businessStructure">
                  <span class="summary-label">{{ t('Business structure') }}</span>
                  <span class="summary-value">{{ businessStructureLabel }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">{{ t('Financial year') }}</span>
                  <span class="summary-value">{{ financialYearLabel }}</span>
                </div>
              </div>

              <p class="tpc-section-label mt-3 mb-1">{{ t('GST') }}</p>
              <div class="complete-summary">
                <div class="summary-row">
                  <span class="summary-label">{{ t('GST status') }}</span>
                  <span class="summary-value">{{ companyGstStatusLabel }}</span>
                </div>
                <div class="summary-row" v-if="companyGstRegistered && draft.gstFrequency">
                  <span class="summary-label">{{ t('Frequency') }}</span>
                  <span class="summary-value">{{ gstFrequencyLabel }}</span>
                </div>
                <div class="summary-row" v-if="companyGstRegistered && draft.gstBasis">
                  <span class="summary-label">{{ t('Basis') }}</span>
                  <span class="summary-value">{{ gstBasisLabel }}</span>
                </div>
              </div>

              <p class="tpc-section-label mt-3 mb-1">{{ t('Income tax') }}</p>
              <div class="complete-summary">
                <div class="summary-row" v-if="draft.taxResidency">
                  <span class="summary-label">{{ t('Tax residency') }}</span>
                  <span class="summary-value">{{ taxResidencyLabel }}</span>
                </div>
                <div class="summary-row" v-if="draft.medicareLevy">
                  <span class="summary-label">{{ t('Medicare levy') }}</span>
                  <span class="summary-value">{{ medicareLevyLabel }}</span>
                </div>
                <div class="summary-row" v-if="draft.paygInstalments === 'yes' && draft.paygAmountPaid > 0">
                  <span class="summary-label">{{ t('PAYG paid this year') }}</span>
                  <span class="summary-value">${{ Number(draft.paygAmountPaid).toLocaleString('en-AU') }}</span>
                </div>
                <div class="summary-row" v-if="draft.alreadySaved > 0">
                  <span class="summary-label">{{ t('Already saved') }}</span>
                  <span class="summary-value">${{ Number(draft.alreadySaved).toLocaleString('en-AU') }}</span>
                </div>
              </div>

              <b-alert
                v-if="saveError"
                variant="warning"
                show
                class="mt-3 py-2 px-3"
              >
                <div class="d-flex align-items-start">
                  <base-feather-icon icon="AlertTriangleIcon" size="15" class="mr-2 flex-shrink-0 mt-1" />
                  <div class="text-sm">{{ saveError }}</div>
                </div>
              </b-alert>

              <p class="field-note mt-3">
                {{ t('Estimates shown in your Tax Overview are a guide only and are not financial or tax advice.') }}
              </p>
            </div>

          </div>
        </transition>
      </div>

      <!-- Footer navigation -->
      <div class="wizard-footer">
        <div class="footer-left">
          <b-button variant="outline-secondary" size="sm" @click="goBack">
            {{ t('Back') }}
          </b-button>
          <b-button
            v-if="canSkipCurrentSection"
            variant="link"
            size="sm"
            class="btn-skip"
            @click="skip"
          >
            {{ t('Skip for now') }}
          </b-button>
        </div>
        <div class="footer-right">
          <span class="step-counter text-muted">{{ currentSection }}/{{ totalSections }}</span>
          <b-button
            variant="primary"
            size="sm"
            :disabled="!canProceed || saving"
            @click="goNext"
          >
            <b-spinner v-if="saving" small class="mr-1" />
            {{ continueLabel }}
          </b-button>
        </div>
      </div>

    </template>

    <!-- ════════════════════════════════════════════════════
         STAGE: COMPLETE
    ════════════════════════════════════════════════════ -->
    <div v-else-if="stage === 'complete'" class="wizard-complete">
      <div class="complete-icon-wrap">
        <base-feather-icon icon="CheckCircleIcon" size="28" />
      </div>
      <h4 class="complete-title">{{ t('Your Tax Overview is ready') }}</h4>
      <p class="complete-body">{{ t("We have saved your tax setup. You can refine these settings any time from your Tax Overview card.") }}</p>

      <b-button variant="primary" class="btn-complete" block @click="$emit('cancel')">
        {{ t('View Tax Overview') }}
        <base-feather-icon icon="ArrowRightIcon" size="15" class="ml-1" />
      </b-button>
    </div>

  </div>
</template>

<script>
import { VBTooltip } from 'bootstrap-vue';
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue';

/**
 * Map an ABR-returned entity_type string to our internal business_structure
 * enum. Defensive case-insensitive substring matching — ABR labels vary
 * ("Individual/Sole Trader", "Australian Private Company", "Discretionary
 * Investment Trust", "Limited Partnership", etc.). Returns null when no
 * confident match is found, so the wizard falls back to the manual picker.
 *
 * Order matters: more-specific terms first ("partnership", "trust") so they
 * win over the broader "company" match.
 */
function mapEntityTypeToStructure(entityType) {
  if (!entityType) return null;
  const lower = String(entityType).toLowerCase();
  if (lower.includes('individual') || lower.includes('sole trader')) return 'sole-trader';
  if (lower.includes('partnership')) return 'partnership';
  if (lower.includes('trust'))       return 'trust';
  if (lower.includes('company'))     return 'company';
  return null;
}

export default {
  name: 'TaxSetupWizard',

  components: { BaseFeatherIcon },

  directives: { 'b-tooltip': VBTooltip },

  props: {
    t:           { type: Function, required: true },
    initialData: { type: Object,   default: () => ({}) },
  },

  data() {
    const id = this.initialData;
    const companiesList = this.$store.getters['companies/list'];
    const primaryCompany = Array.isArray(companiesList) ? companiesList[0] : null;

    // Pre-fill business_structure from the ABR entity type when the company
    // already has one. This is the locked path; users without an ABR-derived
    // entity type pick a structure manually in Section 1.
    const inferredStructure = primaryCompany && primaryCompany.abn_entity_type
      ? mapEntityTypeToStructure(primaryCompany.abn_entity_type)
      : null;

    return {
      stage:           'intro',  // 'intro' | 'form' | 'complete'
      currentSection:  1,
      totalSections:   6,

      // Business section — sub-mode for the Re-check ABN inline flow
      abnView:         'review', // 'review' | 'comparison'
      lookupResult:    null,
      lookupLoading:   false,
      lookupError:     null,
      confirmSaving:   false,

      // Companies load flag (set true once the list has been fetched at least
      // once during this wizard session). Until then we render a small
      // placeholder rather than the "no company" warning.
      companiesLoading: !primaryCompany,

      // Save flow (Section 6 → backend)
      saving:          false,
      saveError:       null,

      // Snapshot of the active company. Refreshed locally after a successful
      // Re-check confirmation. Not deep-mutated outside of confirmLookup().
      company:         primaryCompany ? { ...primaryCompany } : null,

      draft: {
        // Section 1 (profile-only fields)
        businessStructure: id.businessStructure || inferredStructure || null,
        financialYear:     id.financialYear      || 'standard',
        // Section 2 — sensible AU defaults: quarterly BAS, cash basis
        // (the most common setup for sole traders / small businesses)
        gstFrequency:      id.gstFrequency      || 'quarterly',
        gstBasis:          id.gstBasis          || 'cash',
        // Section 3
        taxResidency:      id.taxResidency      || null,
        medicareLevy:      id.medicareLevy      || null,
        paygInstalments:   id.paygInstalments   || null,
        paygAmountPaid:    id.paygAmountPaid    || 0,
        alreadySaved:      id.alreadySaved      || 0,
        // Section 4
        salesTaxable:      id.salesTaxable      || null,
        trackGstExpenses:  id.trackGstExpenses  || null,
        // Section 5
        hasTaxAgent:       id.hasTaxAgent       || null,
        wantsReminders:    id.wantsReminders    || null,
      },

      // ── Option sets ───────────────────────────────────────────
      businessStructureOptions: [
        { value: 'sole-trader',  text: 'Sole trader (most common for tradies and freelancers)' },
        { value: 'company',      text: 'Company (Pty Ltd)' },
        { value: 'partnership',  text: 'Partnership' },
        { value: 'trust',        text: 'Trust' },
        { value: 'unsure',       text: "I'm not sure" },
      ],
      financialYearOptions: [
        { value: 'standard',    text: 'Standard Australian year: 1 July – 30 June' },
        { value: 'substituted', text: 'Substituted accounting period (requires ATO approval)' },
      ],
      gstFrequencyOptions: [
        { value: 'quarterly', text: 'Quarterly (most common)' },
        { value: 'monthly',   text: 'Monthly' },
        { value: 'annually',  text: 'Annually' },
      ],
      gstBasisOptions: [
        { value: 'cash',    text: 'Cash basis. I report when money is received or paid' },
        { value: 'accrual', text: 'Accrual basis. I report when the invoice is issued' },
      ],
      taxResidencyOptions: [
        { value: 'resident',        text: 'Australian resident for tax purposes' },
        { value: 'working-holiday', text: 'Working holiday visa holder (417 or 462)' },
        { value: 'non-resident',    text: 'Non-resident for tax purposes' },
        { value: 'unsure',          text: "I'm not sure" },
      ],
      medicareLevyOptions: [
        { value: 'yes',    text: 'Yes, I pay the standard Medicare levy (2%)' },
        { value: 'exempt', text: 'No, I have an exemption or am not eligible' },
        { value: 'unsure', text: "I'm not sure, include it to be safe" },
      ],
      paygOptions: [
        { value: 'yes',   text: 'Yes, I already make PAYG instalment payments' },
        { value: 'no',    text: 'No' },
        { value: 'unsure', text: "I'm not sure" },
      ],
      yesNoOptions: [
        { value: 'yes', text: 'Yes' },
        { value: 'no',  text: 'No' },
      ],
      salesTaxableOptions: [
        { value: 'yes',   text: 'Yes, most of my sales include GST' },
        { value: 'mixed', text: 'Mixed. Some sales include GST, some do not' },
        { value: 'no',    text: 'No, my sales are GST-free or input-taxed' },
      ],
      laterOptions: [
        { value: 'yes',   text: 'Yes' },
        { value: 'no',    text: 'No' },
        { value: 'later', text: 'Not now, maybe later' },
      ],
    };
  },

  async created() {
    // If the companies store hasn't loaded yet (or is empty), fetch it so the
    // wizard always has up-to-date company tax details to display in Section 1.
    if (!this.company) {
      try {
        await this.$store.dispatch('companies/list', {});
        const list = this.$store.getters['companies/list'];
        const primary = Array.isArray(list) ? list[0] : null;
        if (primary) {
          this.company = { ...primary };
          // Infer structure from the freshly-loaded company's entity type, but
          // never overwrite a value the parent already provided via initialData.
          if (!this.draft.businessStructure && primary.abn_entity_type) {
            const inferred = mapEntityTypeToStructure(primary.abn_entity_type);
            if (inferred) this.draft.businessStructure = inferred;
          }
        }
      } catch (e) {
        // Swallow — the "no company" banner in Section 1 covers this case.
      } finally {
        this.companiesLoading = false;
      }
    } else {
      this.companiesLoading = false;
    }
  },

  watch: {
    // Re-check confirmation updates the company. If the new ABR data carries a
    // different entity type, lock business_structure to the freshly-mapped
    // value (the locked field in Section 1 is the source of truth when present).
    'company.abn_entity_type'(newVal) {
      if (!newVal) return;
      const inferred = mapEntityTypeToStructure(newVal);
      if (inferred && this.draft.businessStructure !== inferred) {
        this.draft.businessStructure = inferred;
      }
    },
  },

  computed: {
    sections() {
      return [
        { label: 'Business' },
        { label: 'GST' },
        { label: 'Income' },
        { label: 'Sales' },
        { label: 'Reminders' },
        { label: 'Review' },
      ];
    },

    sectionSubtitle() {
      const map = {
        1: this.abnView === 'comparison'
          ? this.t('Confirm details from the Australian Business Register')
          : this.t('Saved company tax details'),
        2: this.t('GST reporting frequency and basis'),
        3: this.t('Tax residency, Medicare and PAYG'),
        4: this.t('Sales types and expense tracking'),
        5: this.t('Tax agent and ATO reminders'),
        6: this.t('Final check before we save'),
      };
      return map[this.currentSection] || '';
    },

    // ── Business structure lock (driven by ABR entity_type) ───────
    // When the company has an ABR-derived entity type we trust that to
    // determine the structure and prevent the user picking a different one.
    // Without an entity type, the user picks manually.
    lockBusinessStructure() {
      return !!(this.company && this.company.abn_entity_type
        && mapEntityTypeToStructure(this.company.abn_entity_type));
    },

    // ── Company-derived display values ────────────────────────────
    companyGstRegistered() {
      return !!(this.company && this.company.gst_registered);
    },
    companyGstStatusLabel() {
      if (!this.company) return '—';
      return this.company.gst_registered ? this.t('Registered') : this.t('Not registered');
    },
    formattedAbn() {
      return this.formatAbn(this.company ? this.company.abn : '');
    },
    abnFreshnessLabel() {
      if (!this.company || !this.company.abr_last_checked_at) return this.t('Never checked');
      const checked = new Date(this.company.abr_last_checked_at);
      const months  = Math.floor((Date.now() - checked.getTime()) / (1000 * 60 * 60 * 24 * 30));
      if (months <= 0) return this.t('Checked this month');
      if (months === 1) return this.t('Checked 1 month ago');
      return `${this.t('Checked')} ${months} ${this.t('months ago')}`;
    },
    abnIsStale() {
      if (!this.company || !this.company.abr_last_checked_at) return false;
      const checked = new Date(this.company.abr_last_checked_at);
      const months  = (Date.now() - checked.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return months > 3;
    },
    abnIsIncomplete() {
      if (!this.company) return true;
      return !this.company.abn_status
          || !this.company.abn_entity_type;
    },

    // ── Footer behaviour ──────────────────────────────────────────
    canProceed() {
      if (!this.company) return false;
      if (this.currentSection === 1) {
        if (this.abnView === 'comparison') return false;
        return !!this.draft.businessStructure && !!this.draft.financialYear;
      }
      if (this.currentSection === 2) {
        if (!this.companyGstRegistered) return true;
        return !!this.draft.gstFrequency && !!this.draft.gstBasis;
      }
      if (this.currentSection === 3) {
        return !!this.draft.taxResidency
          && (this.draft.taxResidency === 'non-resident' || !!this.draft.medicareLevy)
          && !!this.draft.paygInstalments;
      }
      return true; // Sections 4, 5, 6 always allow advance
    },
    canSkipCurrentSection() {
      return this.currentSection === 4 || this.currentSection === 5;
    },
    continueLabel() {
      if (this.currentSection < this.totalSections) return this.t('Continue');
      return this.t('Save tax setup');
    },

    // ── Review summary labels ─────────────────────────────────────
    businessStructureLabel() {
      const found = this.businessStructureOptions.find(o => o.value === this.draft.businessStructure);
      return found ? found.text.split(' (')[0] : (this.draft.businessStructure || '—');
    },
    financialYearLabel() {
      return this.draft.financialYear === 'substituted'
        ? this.t('Substituted accounting period')
        : this.t('Standard (1 July – 30 June)');
    },
    gstFrequencyLabel() {
      const map = {
        quarterly: this.t('Quarterly'),
        monthly:   this.t('Monthly'),
        annually:  this.t('Annually'),
      };
      return map[this.draft.gstFrequency] || '—';
    },
    gstBasisLabel() {
      const map = {
        cash:    this.t('Cash basis'),
        accrual: this.t('Accrual basis'),
      };
      return map[this.draft.gstBasis] || '—';
    },
    taxResidencyLabel() {
      const map = {
        'resident':        this.t('AU resident'),
        'working-holiday': this.t('Working holiday'),
        'non-resident':    this.t('Non-resident'),
        'unsure':          this.t('To be confirmed'),
      };
      return map[this.draft.taxResidency] || this.draft.taxResidency;
    },
    medicareLevyLabel() {
      const map = {
        yes:    this.t('Standard 2%'),
        exempt: this.t('Exempt'),
        unsure: this.t('To be confirmed'),
      };
      return map[this.draft.medicareLevy] || '—';
    },
  },

  methods: {
    // ── Navigation ────────────────────────────────────────────────
    async goNext() {
      if (this.currentSection < this.totalSections) {
        this.currentSection++;
        return;
      }
      await this.finish();
    },

    goBack() {
      // From comparison, Back returns to review (does not change section).
      if (this.currentSection === 1 && this.abnView === 'comparison') {
        this.discardLookup();
        return;
      }
      if (this.currentSection > 1) {
        this.currentSection--;
      } else {
        this.stage = 'intro';
      }
    },

    skip() {
      if (this.currentSection < this.totalSections) {
        this.currentSection++;
      }
    },

    // ── ABR Re-check sub-flow (inline within Section 1) ───────────
    async performRecheck() {
      if (this.lookupLoading || !this.company || !this.company.abn) return;
      this.lookupLoading = true;
      this.lookupError   = null;
      try {
        const result = await this.$store.dispatch('companies/lookupAbn', this.company.abn);
        this.lookupResult = result;
        this.abnView = 'comparison';
      } catch (err) {
        const code = err?.response?.data?.error;
        this.lookupError = this.abnErrorMessage(code);
      } finally {
        this.lookupLoading = false;
      }
    },

    discardLookup() {
      this.lookupResult = null;
      this.lookupError  = null;
      this.abnView      = 'review';
    },

    async confirmLookup() {
      if (this.confirmSaving || !this.lookupResult || !this.company) return;
      this.confirmSaving = true;
      this.lookupError   = null;
      const r = this.lookupResult;
      try {
        const updated = await this.$store.dispatch('companies/update', {
          ...this.company,
          abn:                  r.abn || this.company.abn,
          abn_status:           r.abn_status,
          abn_entity_type:      r.entity_type,
          abn_legal_name:       r.entity_name,
          gst_registered:       !!r.gst_registered,
          gst_registered_from:  r.gst_registered_from || null,
          abr_last_checked_at:  r.abr_last_checked_at,
          gst_manual_override:  false,
        });
        this.company       = { ...updated };
        this.lookupResult  = null;
        this.abnView       = 'review';
      } catch (err) {
        const code = err?.response?.data?.error;
        this.lookupError = this.abnErrorMessage(code);
      } finally {
        this.confirmSaving = false;
      }
    },

    // Highlight rows where the ABR value differs from what is stored.
    diff(localField, abrField = null) {
      if (!this.lookupResult || !this.company) return false;
      const abrKey  = abrField || localField;
      const left    = this.company[localField];
      const right   = this.lookupResult[abrKey];
      const normalise = v => (v === null || v === undefined || v === '') ? null : v;
      return normalise(left) !== normalise(right);
    },

    // ── Save (Section 6) ──────────────────────────────────────────
    async finish() {
      this.saving    = true;
      this.saveError = null;
      try {
        // Mirror company GST identity into the draft so the service mapper
        // can satisfy backend validators that still require these fields.
        // The companies table is the source of truth; profile mirrors only.
        const payload = {
          ...this.draft,
          companyUuid:       this.company ? (this.company.uuid || this.company.id) : null,
          abn:               this.company ? this.company.abn : null,
          gstRegistered:     this.companyGstRegistered ? 'yes' : 'no',
          gstRegisteredFrom: this.company ? this.company.gst_registered_from : null,
        };
        await this.$emit('complete', payload);
        this.stage = 'complete';
      } catch (err) {
        this.saveError = this.t('We could not save your tax setup. Please try again.');
      } finally {
        this.saving = false;
      }
    },

    // ── Helpers ───────────────────────────────────────────────────
    abnErrorMessage(code) {
      switch (code) {
        case 'invalid_abn_format':
          return this.t("That doesn't look like a valid 11-digit ABN.");
        case 'invalid_abn_checksum':
          return this.t('That ABN failed the official ATO checksum. Please double-check it.');
        case 'abn_not_found':
          return this.t("We couldn't find that ABN in the Australian Business Register.");
        case 'abr_not_configured':
          return this.t("ABN lookup isn't available right now. Please try again later.");
        case 'abr_unavailable':
          return this.t('The Australian Business Register is unreachable. Please try again in a moment.');
        case 'unexpected_response':
          return this.t('We got an unexpected response from the ABN service. Please try again.');
        default:
          return this.t('Something went wrong checking that ABN. Please try again.');
      }
    },

    formatAbn(abn) {
      if (!abn) return '';
      const digits = String(abn).replace(/\D/g, '');
      if (digits.length !== 11) return abn;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
    },

    formatDate(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleDateString('en-AU', {
          day: 'numeric', month: 'short', year: 'numeric',
        });
      } catch {
        return d;
      }
    },
  },
};
</script>

<style scoped>
/* ── Root ────────────────────────────────────────────────────── */
.wizard-root {
  display: flex;
  flex-direction: column;
  min-height: 420px;
  height: 100%;
}

/* ── Intro stage ─────────────────────────────────────────────── */
.wizard-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 2rem 2rem;
}
.intro-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(3, 102, 214, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0366d6;
  margin-bottom: 1.25rem;
}
.intro-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.6rem;
}
.intro-body {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  max-width: 380px;
  margin-bottom: 1.25rem;
}
.intro-benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 1.75rem;
  text-align: left;
  width: 100%;
  max-width: 380px;
}
.intro-benefits li {
  display: flex;
  align-items: flex-start;
  font-size: 0.84rem;
  color: #374151;
  padding: 0.3rem 0;
  line-height: 1.4;
}
.benefit-icon {
  color: #10b981;
  flex-shrink: 0;
  margin-top: 1px;
}
.btn-intro-start {
  background-color: #0366d6 !important;
  border-color: #0366d6 !important;
  border-radius: 8px !important;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.6rem 2rem !important;
  box-shadow: 0 2px 10px rgba(3, 102, 214, 0.25);
  width: 100%;
  max-width: 320px;
  transition: opacity 0.15s, transform 0.12s;
}
.btn-intro-start:hover { opacity: 0.92; transform: translateY(-1px); }
.intro-note {
  font-size: 0.72rem;
  color: #9ca3af;
  margin: 0.6rem 0 0.4rem;
}
.intro-cancel {
  background: none;
  border: none;
  font-size: 0.78rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.12s;
}
.intro-cancel:hover { color: #6b7280; }

/* ── Form header ─────────────────────────────────────────────── */
.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem 1.5rem 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}
.wizard-title { font-size: 1rem; font-weight: 700; color: #1f2937; }
.wizard-subtitle { font-size: 0.78rem; color: #6b7280; margin-top: 2px; }
.wizard-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px;
  transition: color 0.12s;
  line-height: 1;
}
.wizard-close:hover { color: #374151; }

/* ── Progress tabs ───────────────────────────────────────────── */
.wizard-progress { padding: 0.75rem 1.5rem 0; }
.wizard-tabs { display: flex; gap: 4px; margin-top: 0.5rem; flex-wrap: wrap; }
.wizard-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: #9ca3af;
  padding: 2px 8px;
  border-radius: 20px;
  transition: all 0.18s;
}
.wizard-tab.active { background: #eef2ff; color: #0366d6; font-weight: 600; }
.wizard-tab.done { color: #0366d6; }
.wizard-tab.done .tab-num { background: #0366d6; color: #fff; }
.tab-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e5e7eb;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.18s;
}
.wizard-tab.active .tab-num { background: #0366d6; color: #fff; }

/* ── Body ────────────────────────────────────────────────────── */
.wizard-body { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; }

/* ── Section content ─────────────────────────────────────────── */
.optional-tag { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
.optional-pill {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f3f4f6;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}
.optional-note { font-size: 0.75rem; color: #9ca3af; }
.section-heading { font-size: 1rem; font-weight: 700; color: #111827; margin-bottom: 0.3rem; }
.section-intro { font-size: 0.82rem; color: #6b7280; margin-bottom: 1.1rem; line-height: 1.55; }

/* ── Form fields ─────────────────────────────────────────────── */
.field-label { font-size: 0.85rem !important; font-weight: 600 !important; color: #374151 !important; margin-bottom: 0.4rem; }
.field-optional { font-size: 0.72rem; font-weight: 400; color: #9ca3af; margin-left: 6px; }
.field-input { font-size: 0.875rem; }
.field-note { font-size: 0.75rem; color: #6b7280; margin-top: 5px; }
.field-note-info { color: #0366d6!important; background: #eff6ff; border-radius: 4px; padding: 5px 10px; }
.field-note-link {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: inherit; color: #0366d6; font-weight: 500; margin-left: 4px;
}
.field-note-link:hover { text-decoration: underline; }

.option-radio-group >>> .custom-control { margin-bottom: 0.35rem; }
.option-radio-group >>> .custom-control-label { font-size: 0.84rem; color: #374151; cursor: pointer; }
.option-radio-group >>> .custom-control-label::before { border-color: #d1d5db; }
.option-radio-group >>> .custom-control-input:checked ~ .custom-control-label::before {
  background-color: #0366d6;
  border-color: #0366d6;
}

/* ── Footer ──────────────────────────────────────────────────── */
.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}
.footer-left, .footer-right { display: flex; align-items: center; gap: 0.5rem; }
.btn-skip { font-size: 0.78rem; color: #6b7280; padding: 0 0.25rem; text-decoration: none; }
.btn-skip:hover { color: #374151; }
.step-counter { font-size: 0.75rem; color: #9ca3af; }

/* ── Complete stage ──────────────────────────────────────────── */
.wizard-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 2rem 2rem;
}
.complete-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #059669;
  margin-bottom: 1.25rem;
}
.complete-title { font-size: 1.2rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem; }
.complete-body { font-size: 0.84rem; color: #6b7280; max-width: 360px; line-height: 1.55; margin-bottom: 1.5rem; }
.complete-summary {
  width: 100%;
  max-width: 360px;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.25rem;
  text-align: left;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 0.875rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.82rem;
}
.summary-row:last-child { border-bottom: none; }
.summary-label { color: #6b7280; }
.summary-value { font-weight: 600; color: #111827; }
.complete-disclaimer { font-size: 0.72rem; color: #9ca3af; max-width: 320px; line-height: 1.5; margin-bottom: 1.25rem; }
.btn-complete {
  background-color: #0366d6 !important;
  border-color: #0366d6 !important;
  border-radius: 8px !important;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.6rem 1.5rem !important;
  box-shadow: 0 2px 10px rgba(3, 102, 214, 0.25);
  max-width: 320px;
  transition: opacity 0.15s, transform 0.12s;
}
.btn-complete:hover { opacity: 0.92; transform: translateY(-1px); }

/* ── Re-check comparison (inline within Section 1) ──────────── */
.complete-summary { max-width: none; margin-bottom: 0; }

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.comparison-col-heading {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: #64748b;
  margin: 0 0 0.4rem;
}
.summary-row--diff {
  background: #eff6ff;
}
.summary-row--diff .summary-value {
  color: #0366d6;
}
.recheck-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.tpc-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: #64748b;
}

@media (max-width: 575.98px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Step transition ─────────────────────────────────────────── */
.slide-enter-active, .slide-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.slide-enter  { opacity: 0; transform: translateX(10px); }
.slide-leave-to { opacity: 0; transform: translateX(-10px); }
</style>
