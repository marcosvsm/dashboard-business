import axios from 'axios';
import store from './store';
import router from './router';

const api = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
    withCredentials: true,
    headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      xsrfCookieName: 'XSRF-TOKEN',                // Laravel defaults
      xsrfHeaderName: 'X-XSRF-TOKEN',
});

// If using Laravel Sanctum SPA, make sure you hit the CSRF endpoint once per session
export async function initCsrf() {
  // If you're serving API on same origin: '/sanctum/csrf-cookie'
  // If API is on another domain: `${API_ORIGIN}/sanctum/csrf-cookie`
  await api.get('https://app.simplifybusiness.com.au/sanctum/csrf-cookie').catch(() => {});
}

api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            console.error('401 Unauthorized', {
                url: error.config.url,
                headers: error.config.headers,
                response: error.response?.data,
            });
            // Kill client auth state
        try {
            store.commit('auth/setAuthenticated', false);
            store.commit('auth/setAuthUser', null);
        } catch {}
           // Kill client auth state and send to login without triggering more requests
        localStorage.removeItem('auth_hint');       // 👈 clear hint
        router.push({ name: 'login' });
        } else if (error.response?.status === 429) {
            console.error('429 Too Many Requests', {
                url: error.config.url,
                response: error.response?.data,
            });
        }
        return Promise.reject(error);
    }
);

export default api;