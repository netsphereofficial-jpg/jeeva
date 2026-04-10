import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasOnboarded: boolean;
  setOnboarded: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      setOnboarded: () => set({ hasOnboarded: true }),
    }),
    {
      name: 'jeeva-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
