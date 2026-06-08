import axios from '@/axios';
import Jsona from 'jsona';

const url = process.env.VUE_APP_API_BASE_URL;
const jsona = new Jsona();

const jsonApiHeaders = () => ({
  headers: {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  },
});

/**
 * GET /companies/{companyId}/payment-details
 *
 * Returns the single payment_details record for the company or null when
 * none has been configured yet — the backend reliably returns an empty
 * resource document in that case, jsona.deserialize converts it to null.
 */
function get(companyId) {
  return axios.get(`${url}/companies/${companyId}/payment-details`, jsonApiHeaders())
    .then(response => jsona.deserialize(response.data));
}

/**
 * POST /paymentDetails
 *
 * The backend now treats this as an upsert keyed on company_id, so calling
 * `add` twice for the same company silently updates the existing row
 * instead of creating a duplicate.
 */
function add(payload) {
  return axios.post(`${url}/paymentDetails`, payload, jsonApiHeaders())
    .then(response => jsona.deserialize(response.data));
}

/**
 * PATCH /paymentDetails/{id}
 */
function update(payload) {
  return axios.patch(`${url}/paymentDetails/${payload.data.id}`, payload, jsonApiHeaders())
    .then(response => jsona.deserialize(response.data));
}

/**
 * DELETE /paymentDetails/{id}
 *
 * Soft-deletes the record on the backend.
 */
function destroy(id) {
  return axios.delete(`${url}/paymentDetails/${id}`, jsonApiHeaders());
}

export default {
  get,
  add,
  update,
  destroy,
};
