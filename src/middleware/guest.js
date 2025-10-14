// /src/middleware/guest.js
import store from '@/store';

export default async function guest({ next }) {
  if (store.getters['auth/isAuthenticated']) {
    return next({ name: 'dashboard-overview' });
  }
  // only if we *might* have a session, verify once
  if (localStorage.getItem('auth_hint') === '1') {
    const { success } = await store.dispatch('auth/checkAuth');
    if (success) return next({ name: 'dashboard-overview' });
      // Seta hydrated após check, mesmo em guest (pra consistência)
      store.commit('auth/setHydrated', true);
  }
  return next();
}
