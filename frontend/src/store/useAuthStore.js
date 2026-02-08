import { create } from 'zustand';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  fetchProfile,
  isLoggedIn,
  clearTokens,
} from '../api/client';

const useAuthStore = create((set, get) => ({
  user: null,
  authenticated: isLoggedIn(),
  loading: false,
  error: null,

  // Hydrate user from existing token on startup
  hydrate: async () => {
    if (!isLoggedIn()) return;
    set({ loading: true, error: null });
    try {
      const user = await fetchProfile();
      set({ user, authenticated: true, loading: false });
    } catch {
      clearTokens();
      set({ user: null, authenticated: false, loading: false });
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      await apiLogin(username, password);
      const user = await fetchProfile();
      set({ user, authenticated: true, loading: false });
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Invalid credentials';
      set({ error: msg, loading: false });
      return false;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await apiRegister(payload);
      set({ user: data.user, authenticated: true, loading: false });
      return true;
    } catch (err) {
      const errors = err.response?.data;
      // Flatten DRF validation errors
      let msg = 'Registration failed';
      if (errors && typeof errors === 'object') {
        const flat = Object.entries(errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n');
        if (flat) msg = flat;
      }
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: async () => {
    set({ loading: true });
    await apiLogout();
    set({ user: null, authenticated: false, loading: false, error: null });
  },

  clearError: () => set({ error: null }),

  // Called from the 401 interceptor via window event
  forceLogout: () => {
    set({ user: null, authenticated: false, loading: false, error: null });
  },
}));

export default useAuthStore;
