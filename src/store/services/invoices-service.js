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

  return axios.get(`${url}/invoice/list`, options)
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

  return axios.get(`${url}/invoice/${id}`, options)
    .then(response => {
      return jsona.deserialize(response.data);
    });
}

function add(payload) {
  console.log("test "+JSON.stringify(payload, null, 2))
  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.post(`${url}/invoice`, payload, options)
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

  return axios.delete(`${url}/invoice/${id}`, options);
}

export default {
  list,
  get,
  add,
  update,
  destroy
};