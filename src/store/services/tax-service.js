/**
 * Tax Service — live API layer (Phase 2)
 *
 * Endpoints:
 *   GET    /api/v1/tax/profile
 *   POST   /api/v1/tax/profile
 *   PATCH  /api/v1/tax/profile/{uuid}
 *   GET    /api/v1/tax/overview
 *
 * Field mapping: frontend uses camelCase + string enums; backend uses snake_case + different enum values.
 */

import axios from '@/axios';

const BASE = `${process.env.VUE_APP_API_BASE_URL}/tax`;

const opts = {
  withCredentials: true,
  headers: {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  },
};

// ── Value maps ──────────────────────────────────────────────────────────────

const BUSINESS_STRUCTURE_TO_API = {
  'sole-trader': 'sole_trader',
  'company':     'company',
  'partnership': 'partnership',
  'trust':       'trust',
};

const BUSINESS_STRUCTURE_FROM_API = Object.fromEntries(
  Object.entries(BUSINESS_STRUCTURE_TO_API).map(([k, v]) => [v, k])
);

const TAX_RESIDENCY_TO_API = {
  'resident':        'resident',
  'working-holiday': 'working_holiday',
  'non-resident':    'non_resident',
  'unsure':          'non_resident',
};

const TAX_RESIDENCY_FROM_API = {
  'resident':        'resident',
  'working_holiday': 'working-holiday',
  'non_resident':    'non-resident',
};

const MEDICARE_TO_API = {
  'yes':    'full',
  'exempt': 'exempt',
  'unsure': 'not_eligible',
};

const MEDICARE_FROM_API = {
  'full':        'yes',
  'reduced':     'yes',
  'exempt':      'exempt',
  'not_eligible':'unsure',
};

// ── Shape transformers ───────────────────────────────────────────────────────

/**
 * Convert frontend DEFAULT_SETUP shape → backend snake_case payload.
 */
function profileToApi(data) {
  const payload = {
    business_structure:       BUSINESS_STRUCTURE_TO_API[data.businessStructure] ?? data.businessStructure,
    company_uuid:             data.companyUuid || null,
    abn:                      data.abn || null,
    financial_year_type:      data.financialYear === 'standard' ? 'standard' : 'non_standard',
    gst_registered:           data.gstRegistered === 'yes',
    gst_basis:                data.gstBasis || null,
    gst_frequency:            data.gstFrequency || null,
    tax_residency:            TAX_RESIDENCY_TO_API[data.taxResidency] ?? data.taxResidency,
    medicare_status:          MEDICARE_TO_API[data.medicareLevy] ?? 'not_eligible',
    payg_instalments_enabled: data.paygInstalments === 'yes',
    payg_paid_amount:         parseFloat(data.paygAmountPaid) || 0,
    already_saved_amount:     parseFloat(data.alreadySaved) || 0,
    tax_agent_enabled:        data.hasTaxAgent === 'yes',
    reminders_enabled:        data.wantsReminders === 'yes',
  };

  return payload;
}

/**
 * Convert backend TaxProfileResource → frontend DEFAULT_SETUP shape.
 * Returns the full merged object including the profile uuid as `id`.
 */
function profileFromApi(d) {
  return {
    id:               d.id,
    businessStructure:BUSINESS_STRUCTURE_FROM_API[d.businessStructure] ?? d.businessStructure,
    abn:              d.abn || '',
    financialYear:    d.financialYearType === 'standard' ? 'standard' : 'substituted',
    gstRegistered:    d.gstRegistered ? 'yes' : 'no',
    gstBasis:         d.gstBasis || null,
    gstFrequency:     d.gstFrequency || null,
    taxResidency:     TAX_RESIDENCY_FROM_API[d.taxResidency] ?? d.taxResidency,
    medicareLevy:     MEDICARE_FROM_API[d.medicareStatus] ?? 'unsure',
    paygInstalments:  d.paygInstalmentsEnabled ? 'yes' : 'no',
    paygAmountPaid:   parseFloat(d.paygPaidAmount) || 0,
    alreadySaved:     parseFloat(d.alreadySavedAmount) || 0,
    hasTaxAgent:      d.taxAgentEnabled ? 'yes' : 'no',
    wantsReminders:   d.remindersEnabled ? 'yes' : 'no',
    isComplete:       d.isComplete,
    updatedAt:        d.updatedAt ?? null,
  };
}

// ── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/tax/profile
 * Returns null when no profile exists yet (404 is handled gracefully).
 */
function getProfile() {
  return axios.get(`${BASE}/profile`, opts)
    .then(r => profileFromApi(r.data.data))
    .catch(err => {
      if (err.response?.status === 404) return null;
      throw err;
    });
}

/**
 * POST /api/v1/tax/profile
 * Creates a new profile; returns the mapped frontend shape including `id`.
 */
function saveProfile(data) {
  return axios.post(`${BASE}/profile`, profileToApi(data), opts)
    .then(r => profileFromApi(r.data.data));
}

/**
 * PATCH /api/v1/tax/profile/{uuid}
 * Updates an existing profile; returns the mapped frontend shape.
 */
function updateProfile(uuid, data) {
  return axios.patch(`${BASE}/profile/${uuid}`, profileToApi(data), opts)
    .then(r => profileFromApi(r.data.data));
}

/**
 * GET /api/v1/tax/overview
 * Returns the backend-calculated tax summary as-is (already camelCase via TaxOverviewResource).
 */
function getOverview(companyUuid = null) {
  const params = companyUuid ? { company_uuid: companyUuid } : {};
  return axios.get(`${BASE}/overview`, { ...opts, params })
    .then(r => r.data.data);
}

export default {
  getProfile,
  saveProfile,
  updateProfile,
  getOverview,
};
