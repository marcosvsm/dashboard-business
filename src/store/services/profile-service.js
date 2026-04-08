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
      name: profile.name
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

function getPreferences() {
  return api.get(`${url}/me/preferences`)
    .then(response => response.data?.data?.attributes ?? {})
}

function updatePreferences(attrs = {}) {
  const attributes = {}
  if (attrs.language          !== undefined) attributes.language          = attrs.language
  if (attrs.tutorialCompleted !== undefined) attributes.tutorialCompleted = attrs.tutorialCompleted
  if (attrs.tutorialOptedOut  !== undefined) attributes.tutorialOptedOut  = attrs.tutorialOptedOut

  return api.patch(`${url}/me/preferences`, {
    data: { type: 'user-preferences', attributes },
  }, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
  }).catch(err => console.warn('[preferences] failed to sync:', err))
}

export default {
  get,
  update,
  getPreferences,
  updatePreferences,
};
