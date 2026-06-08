import Vue from 'vue';
import router from '@/router';
import api, { initCsrf } from '@/axios';

export default { 
    namespaced: true,   
    state: () => ( {
        isAuthenticated: false,
        authUser: null,
        intendedRoute: null, // Store intended route
        hydrated: false,
    }),
    getters: {
        isAuthenticated: s => s.isAuthenticated,
        authUser: s => s.authUser,
        intendedRoute: s => s.intendedRoute,
        hydrated: s => s.hydrated,
      },
      mutations: {
        setAuthenticated(s, v) { s.isAuthenticated = !!v; },
        setAuthUser(s, u) { s.authUser = u; },
        setIntendedRoute(s, r) { s.intendedRoute = r; },
        setHydrated(s, v) { s.hydrated = !!v; },
      },
    actions: {
        async login(context, { email, password }) {
            
                await initCsrf();
                const response = await api.post('/login', { email, password });
                if (response.data.message === 'Authenticated') {
                    // Hydrate the user from the server session (critical)
                    await context.dispatch('users/getMe', null, { root: true });
                    const user = context.getters['users/user']
                    context.commit('setAuthUser', user);
                    context.commit('setAuthenticated', true);
                    localStorage.setItem('auth_hint', '1');     // 👈 set hint
                    if (!context.getters.hydrated)
                      context.commit('setHydrated', true);
                    return true;
                }
        },
        async register(context, user){
          await initCsrf();
          const response = await api.post('/register', user);
          return response.data
        },
        async checkAuth(context) {
            try {
                const user = await context.dispatch('users/getMe', null, { root: true });
                context.commit('setAuthenticated', true);
                context.commit('setAuthUser', user);
                return { success: true, user };
            } catch {
                context.commit('setAuthenticated', false);
                context.commit('setAuthUser', null);
                return { success: false };
            }
        },
        async logout(context) {
            try {
                await initCsrf();
                await api.post('/logout', {});
            } catch {
                console.error('Logout failed:', error);
            }
            context.commit('setAuthenticated', false);
            context.commit('setAuthUser', null);
            localStorage.removeItem('auth_hint');       // 👈 clear hint
            // Garante hydrated após logout
            context.commit('setHydrated', true);
        },
        async authenticateGoogle(_, { remember = false } = {}) {
            try {
              // Ask backend for the Google OAuth URL (backend will manage state)
              const { data } = await api.get('/auth/google', {
                params: { remember: remember ? 1 : 0 },
              });
              const { url, state } = data || {};
              if (!url) throw new Error('Missing Google OAuth URL');
              // (optional) keep state briefly for client-side sanity, use sessionStorage instead of localStorage
              if (state) sessionStorage.setItem('google_oauth_state', state);
              // Go to Google
              window.location.href = url;
            } catch (err) {
              console.error('Google auth init failed:', err?.response?.data || err);
              router.push({ name: 'login' }).catch(() => {});
              throw err;
            }
          },
          
          async handleGoogleCallback({ commit, dispatch }, { code, state, remember = false } = {}) {
            try {
              // If your callback page doesn't pass code/state explicitly, read from URL
              if (!code) {
                const q = new URLSearchParams(window.location.search);
                code = q.get('code');
                state = state ?? q.get('state');
              }
              if (!code) throw new Error('Missing code from Google');
          
              // (optional) client-side state check; backend also validates
              const stored = sessionStorage.getItem('google_oauth_state');
              if (stored && state && stored !== state) {
                throw new Error('OAuth state mismatch');
              }
              sessionStorage.removeItem('google_oauth_state');
          
              // Sanctum CSRF first, then exchange code->session (no tokens)
              await initCsrf();
              await api.post('/auth/google/callback', { code, state, remember });
          
              // Hydrate authenticated user from the server session
              const user = await dispatch('users/getMe', null, { root: true });
              commit('setAuthUser', user);
              commit('setAuthenticated', true);
              commit('setHydrated', true);
              localStorage.setItem('auth_hint', '1');
              // Redirect back to intended or dashboard
              const dest =
                router.currentRoute?.query?.redirect
                  ? { path: router.currentRoute.query.redirect }
                  : { name: 'dashboard-overview' };
              router.replace(dest).catch(() => {});
            } catch (err) {
              console.error('Google callback failed:', err?.response?.data || err);
              commit('setAuthenticated', false);
              commit('setAuthUser', null);
              router.push({ name: 'login' }).catch(() => {});
              throw err;
            }
          },
        async forgotPassword(_context, email) {
            // Never throw and never expose backend outcome — UI must render the
            // same neutral message regardless of whether the email exists or
            // delivery failed. Anything observable here is an enumeration leak.
            try {
                await api.post('/password-forgot', {
                    data: { attributes: { email } },
                });
            } catch (error) {
                console.error('Forgot password request failed:', error);
            }
        },
        async resetPassword(context, payload) {
            try {
                const response = await api.post('/password-reset', payload);
                return response.data;
            } catch (error) {
                console.error('Reset password failed:', error);
                throw error;
            }
        },
    },
};