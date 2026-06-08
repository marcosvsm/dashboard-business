import axios from '@/axios';

const BASE = `${process.env.VUE_APP_API_BASE_URL}/dashboard`;

const opts = {
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

function getOverview({ range = 'current_fy', companyUuid = null } = {}) {
  const params = { range };

  if (companyUuid) {
    params.company_uuid = companyUuid;
  }

  return axios.get(`${BASE}/overview`, { ...opts, params })
    .then(response => response.data.data);
}

export default {
  getOverview,
};
