import qs from 'qs';
import axios from '@/axios';
import Jsona from 'jsona';

const url = process.env.VUE_APP_API_BASE_URL;
const jsona = new Jsona();

function list(params = {}) {
  const options = {
    params,
    paramsSerializer: p => qs.stringify(p, { encode: false }),
  };

  return axios.get(`${url}/products`, options)
    .then(response => ({
      list: jsona.deserialize(response.data),
      meta: response.data.meta,
    }));
}

function add(payload) {
  return axios.post(`${url}/products`, payload, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
  }).then(response => jsona.deserialize(response.data));
}

function update(payload) {
  const id = payload.data.id;
  return axios.patch(`${url}/products/${id}`, payload, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
  }).then(response => jsona.deserialize(response.data));
}

function destroy(id) {
  return axios.delete(`${url}/products/${id}`, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
  });
}

export default { list, add, update, destroy };
