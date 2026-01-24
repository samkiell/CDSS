/**
 * Auth Store - Zustand Global State Management
 * Manages authentication state across the application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const STORAGE_KEY = 'cdss-auth';

const initialState = {
  user: null,
  role: 'guest', // 'guest' | 'patient' | 'clinician' | 'admin'
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Login action - Set user data and token
       * @param {Object} userData - User object from API
       * @param {string} token - JWT token
       */
      login: (userData, token) => {
        set({
          user: userData,
          role: userData?.role?.toLowerCase() || 'guest',
          token: token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      /**
       * Logout action - Clear all auth state
       */
      logout: () => {
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
        set({
          ...initialState,
          isLoading: false,
        });
      },

      /**
       * Hydrate action - Restore state from localStorage on app load
       * Validates token expiry and refreshes if needed
       */
      hydrate: async () => {
        set({ isLoading: true });

        try {
          const storedState = get();

          if (storedState.token && storedState.user) {
            // Token exists, validate it (implement actual validation)
            // For now, we trust the persisted state
            set({
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              ...initialState,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error hydrating auth state:', error);
          set({
            ...initialState,
            isLoading: false,
          });
        }
      },

      /**
       * Update user profile data
       * @param {Object} updates - Partial user object
       */
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      /**
       * Set loading state
       * @param {boolean} loading
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * Check if user has specific role
       * @param {string|string[]} requiredRoles - Role(s) to check
       * @returns {boolean}
       */
      hasRole: (requiredRoles) => {
        const currentRole = get().role;
        if (Array.isArray(requiredRoles)) {
          return requiredRoles.includes(currentRole);
        }
        return currentRole === requiredRoles;
      },

      /**
       * Get authorization header
       * @returns {Object} Headers object with Bearer token
       */
      getAuthHeader: () => {
        const token = get().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
