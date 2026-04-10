import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import type { UserSettings } from '@/types';
import { kgToLbs, lbsToKg } from '@/utils/calculations';

function detectUnitSystem(): 'metric' | 'imperial' {
  try {
    let locale = 'en-US';
    if (Platform.OS === 'ios') {
      locale =
        (
          NativeModules.SettingsManager?.settings?.AppleLocale as
            | string
            | undefined
        ) ??
        (
          (
            NativeModules.SettingsManager?.settings
              ?.AppleLanguages as string[]
          )?.[0] ?? 'en-US'
        );
    } else if (Platform.OS === 'android') {
      locale =
        (NativeModules.I18nManager?.localeIdentifier as string | undefined) ??
        'en-US';
    }
    return locale.startsWith('en-US') || locale.startsWith('en_US')
      ? 'imperial'
      : 'metric';
  } catch {
    return 'metric';
  }
}

const DEFAULT_SETTINGS: UserSettings = {
  unitSystem: detectUnitSystem(),
  dailyWaterGoalMl: 3000,
  dailyStepGoal: 10000,
  restTimerDefaultSec: 90,
  hapticEnabled: true,
  themeMode: 'dark' as const,
};

interface SettingsState {
  settings: UserSettings;
  _hasHydrated: boolean;
  updateSettings: (partial: Partial<UserSettings>) => void;
  getDisplayWeight: (kg: number) => number;
  getStorageWeight: (display: number) => number;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      _hasHydrated: false,

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      getDisplayWeight: (kg: number): number => {
        const { unitSystem } = get().settings;
        return unitSystem === 'imperial' ? kgToLbs(kg) : kg;
      },

      getStorageWeight: (display: number): number => {
        const { unitSystem } = get().settings;
        return unitSystem === 'imperial' ? lbsToKg(display) : display;
      },
    }),
    {
      name: 'jeeva-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useSettingsStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
