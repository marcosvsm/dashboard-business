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

  return axios.get(`${url}/customer/list`, options)
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

  return axios.get(`${url}/customer/${id}`, options)
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

  return axios.post(`${url}/customer`, payload, options)
    .then(response => {
      return jsona.deserialize(response.data);
    });
}

function update(customer) {
  const payload = jsona.serialize({
    stuff: customer,
    includeNames: []
  });

  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.patch(`${url}/customer/${customer.id}`, payload, options)
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

  return axios.delete(`${url}/customer/${id}`, options);
}

export default {
  list,
  get,
  add,
  update,
  destroy
};