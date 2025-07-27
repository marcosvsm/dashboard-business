import qs from 'qs';
import axios from '@/axios';
import Jsona from 'jsona';

const url = process.env.VUE_APP_API_BASE_URL;
const jsona = new Jsona();

function list(include = []) {
  const options = {
    params: include.length ? { include: include.join(',') } : {},
    paramsSerializer: function (params) {
      return qs.stringify(params, { encode: false });
    }
  };

  return axios.get(`${url}/invoices?sort=-invoice_date`, options)
    .then(response => {
      return {
        list: jsona.deserialize(response.data),
        meta: response.data.meta
      };
    });
}

function get(id, include = []) {
  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    params: include.length ? { include: include.join(',') } : {},
    paramsSerializer: function (params) {
      return qs.stringify(params, { encode: false });
    }
  };

  return axios.get(`${url}/invoices/${id}`, options)
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

  return axios.post(`${url}/invoices`, payload, options)
    .then(response => {
      return jsona.deserialize(response.data);
    });
}

function update(invoice) {
  const payload = jsona.serialize({
    stuff: invoice,
    includeNames: []
  });

  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.patch(`${url}/invoices/${invoice.id}`, payload, options)
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

  return axios.delete(`${url}/invoices/${id}`, options);
}

function suggest(params) {
  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    paramsSerializer: function (params) {
      return qs.stringify(params, { encode: false });
    }
  };
  return axios.get(`${url}/invoices/suggest/${params}`, options)
    .then(response => {
      return jsona.deserialize(response.data);
    });
}

export default {
  list,
  get,
  add,
  update,
  destroy,
  suggest
};