// middleware/auth.js (atualizado pra setar hydrated após check, antes do next/redirect)
import store from '@/store';

export default async function auth({ next, to }) {
  if (!store.getters['auth/hydrated']) {
    const { success } = await store.dispatch('auth/checkAuth');
    store.commit('auth/setHydrated', true); // Seta AGORA, após check, antes de decidir next

    if (!success) {
      // remember destination
      store.commit('auth/setIntendedRoute', to.fullPath);
      return next({ name: 'login' });
    }
  }
  return next();
}