import api from '@/axios';
import Jsona from 'jsona';

const url = process.env.VUE_APP_API_BASE_URL;
const jsona = new Jsona();

function get() {
  return api.get(`${url}/me`, {withCredentials: true})
    .then(response => {
      return {
        list: jsona.deserialize(response.data),
        meta: response.data.meta
      };
    });
}

function update(profile) {
  // Accept { id, language } and force correct type
  const payload = jsona.serialize({
    stuff: {
      id: profile.id,
      type: 'users',        // ← critical!
      language: profile.language
    },
    includeNames: []
  })

  return api.patch(`${url}/me`, payload, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }
  })
  .then(response => jsona.deserialize(response.data))
}

export default {
  get,
  update
};
