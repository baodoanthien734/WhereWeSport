import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useOwnerStore = create(
  persist(
    (set) => ({
      center: null,
      courts: [],
      isLoading: false,
      error: null,

      setCenter: (centerData) => {
        set({ center: centerData, isLoading: false, error: null });
      },

      setCourts: (courtsData) => {
        set({ courts: courtsData });
      },

      addCourt: (newCourt) => {
        set((state) => ({
          courts: [...state.courts, newCourt] 
        }));
      },

      updateCourt: (updatedCourt) => {
        set((state) => ({
          courts: state.courts.map((court) => 
            court.court_id === updatedCourt.court_id ? updatedCourt : court
          )
        }));
      },

      deleteCourt: (courtId) => {
        set((state) => ({
          courts: state.courts.filter((court) => court.court_id !== courtId)
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (errMessage) => {
        set({ error: errMessage, isLoading: false });
      },

      clearCenter: () => {
        set({ center: null, courts: [], isLoading: false, error: null });
      }
    }),
    {
      name: 'owner-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);