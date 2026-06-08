import qs from 'qs';
import axios from '@/axios';
import Jsona from 'jsona';

const url = process.env.VUE_APP_API_BASE_URL;
const jsona = new Jsona();

function list(params) {
  const options = {
    params: params,
    paramsSerializer: function (params) {
      return qs.stringify(params, { encode: false });
    }
  };

  return axios.get(`/companies`, options)
    .then(response => {
      return {
        list: jsona.deserialize(response.data),
        meta: response.data.meta
      };
    });
}

function get(id) {
  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.get(`/companies/${id}`, options)
    .then(response => {
      return jsona.deserialize(response.data);
    });
}

function add(payload) {
  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.post('/companies', payload, options)
    .then(response => {
      return jsona.deserialize(response.data);
    });
}

function update(company) {
  const payload = jsona.serialize({
    stuff: company,
    includeNames: []
  });

  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.patch(`/companies/${company.id}`, payload, options)
    .then(response => {
      return jsona.deserialize(response.data);
    });
}

function destroy(id) {
  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.delete(`/companies/${id}`, options);
}

/**
 * Perform a stateless ABN lookup via the backend (Phase 2 endpoint).
 * Returns normalized payload — no persistence happens server-side.
 * Throws on validation/checksum/network/ABR failures; callers should map
 * the response's `error` field to a user-friendly message.
 */
function lookupAbn(abn) {
  return axios.post('/abn-lookup', { abn })
    .then(response => response.data);
}

export default {
  list,
  get,
  add,
  update,
  destroy,
  lookupAbn,
};