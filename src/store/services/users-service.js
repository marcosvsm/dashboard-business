import qs from 'qs';
import axios from '@/axios';
import Jsona from 'jsona';

const url = process.env.VUE_APP_API_BASE_URL;
const jsona = new Jsona();

function list(params) {
  const options = {
    params: params,
    paramsSerializer: function (params) {
      return qs.stringify(params, {encode: false});
    }
  };

  return axios.get(`${url}/users`, options)
    .then(response => {
      return {
        list: jsona.deserialize(response.data),
        meta: response.data.meta
      };
    });
}

function get(id) {
  const options = {
    withCredentials: true,
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.get(`${url}/users/${id}?include=roles`, options)
    .then(response => {
      let user = jsona.deserialize(response.data);
      delete user.links;
      return user;
    });
}

function getMe() {
  const options = {
    withCredentials: true,
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.get(`${url}/me?include=role`, options) // Assume /me endpoint exists and returns user with roles
    .then(response => {
      const data = response.data;
      const user = jsona.deserialize(data);
      delete user.links;
      const included = Array.isArray(data.included) ? data.included : [];
      user.roles = included
        .filter((x) => x.type === 'roles')
        .map((r) => r.attributes.slug);
      return user;
    });
}

function add(user) {
  const payload = jsona.serialize({
    stuff: user,
    includeNames: null
  });

  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.post(`${url}/users`, payload, options)
    .then(response => {
      return jsona.deserialize(response.data);
    });
}

function update(user) {
  const payload = jsona.serialize({
    stuff: user,
    includeNames: []
  });

  const options = {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  };

  return axios.patch(`${url}/users/${user.id}`, payload, options)
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

  return axios.delete(`${url}/users/${id}`, options);
}

function upload(user, image) {
  const bodyFormData = new FormData();
  bodyFormData.append('attachment', image);

  return axios.post(`${url}/uploads/users/${user.id}/profile-image`, bodyFormData)
    .then(response => {
      return response.data.url;
    });
}

export default {
  list,
  get,
  getMe,
  add,
  update,
  destroy,
  upload
};