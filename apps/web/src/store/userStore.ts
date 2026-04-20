import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@arenaiq/types';

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateRating: (newRating: number) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateRating: (newRating) =>
        set((state) =>
          state.profile ? { profile: { ...state.profile, rating: newRating } } : {},
        ),
      clearProfile: () => set({ profile: null }),
    }),
    { name: 'arenaiq-user' },
  ),
);
