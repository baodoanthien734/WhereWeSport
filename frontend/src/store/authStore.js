import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      roles: [],
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      setLoginData: (token, userProfile) => {
        let decodedRoles = [];
        try {
          if (token) {
             const payload = jwtDecode(token);
             if (payload.roles && Array.isArray(payload.roles)) {
               decodedRoles = payload.roles;
             }
          }
        } catch (error) {
          console.error("Lỗi decode JWT:", error);
        }

        set({
          token: token,
          user: userProfile,
          roles: decodedRoles,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          roles: [],
          isAuthenticated: false,
        });
        localStorage.removeItem('auth-storage'); 
      },

      updateUserProfile: (profileData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...profileData } : profileData,
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
             state.setHasHydrated(true);
        }
      },
    }
  )
);

export default useAuthStore;