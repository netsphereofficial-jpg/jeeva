import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Achievement } from '@/types';
import { ACHIEVEMENTS } from '@/data/achievements';

interface AchievementState {
  unlockedIds: string[];
  unlockTimestamps: Record<string, number>;
  recentlyUnlocked: string | null;

  checkAndUnlock: (achievementId: string) => boolean;
  getUnlocked: () => Achievement[];
  getLocked: () => Achievement[];
  isUnlocked: (id: string) => boolean;
  clearRecentlyUnlocked: () => void;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlockedIds: [],
      unlockTimestamps: {},
      recentlyUnlocked: null,

      checkAndUnlock: (achievementId: string): boolean => {
        const state = get();
        if (state.unlockedIds.includes(achievementId)) {
          return false;
        }
        // Verify achievement exists
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!achievement) {
          return false;
        }
        const now = Date.now();
        set({
          unlockedIds: [...state.unlockedIds, achievementId],
          unlockTimestamps: {
            ...state.unlockTimestamps,
            [achievementId]: now,
          },
          recentlyUnlocked: achievementId,
        });
        return true;
      },

      getUnlocked: (): Achievement[] => {
        const state = get();
        return ACHIEVEMENTS.filter((a) =>
          state.unlockedIds.includes(a.id),
        ).map((a) => ({
          ...a,
          unlockedAt: state.unlockTimestamps[a.id],
        }));
      },

      getLocked: (): Achievement[] => {
        const state = get();
        return ACHIEVEMENTS.filter(
          (a) => !state.unlockedIds.includes(a.id),
        );
      },

      isUnlocked: (id: string): boolean => {
        return get().unlockedIds.includes(id);
      },

      clearRecentlyUnlocked: () => {
        set({ recentlyUnlocked: null });
      },
    }),
    {
      name: 'jeeva-achievements',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        unlockedIds: state.unlockedIds,
        unlockTimestamps: state.unlockTimestamps,
      }),
    },
  ),
);
