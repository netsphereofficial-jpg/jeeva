import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  darkColors,
  lightColors,
  arcticBlueColors,
  midnightGoldColors,
  type ThemeColors,
} from '@/theme/colors';
import { useSettingsStore } from '@/stores/settingsStore';

export type ThemeMode = 'dark' | 'light' | 'system' | 'arctic' | 'midnight';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'dark' | 'light';
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const THEME_MAP: Record<string, { colors: ThemeColors; isDark: boolean }> = {
  dark: { colors: darkColors, isDark: true },
  light: { colors: lightColors, isDark: false },
  arctic: { colors: arcticBlueColors, isDark: true },
  midnight: { colors: midnightGoldColors, isDark: true },
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSettingsStore((s) => s.settings.themeMode ?? 'dark') as ThemeMode;
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const systemScheme = useColorScheme();

  const value = useMemo(() => {
    let resolvedMode: 'dark' | 'light';
    let themeColors: ThemeColors;
    let isDark: boolean;

    if (themeMode === 'system') {
      resolvedMode = systemScheme ?? 'dark';
      themeColors = resolvedMode === 'dark' ? darkColors : lightColors;
      isDark = resolvedMode === 'dark';
    } else {
      const theme = THEME_MAP[themeMode] ?? THEME_MAP.dark;
      themeColors = theme.colors;
      isDark = theme.isDark;
      resolvedMode = isDark ? 'dark' : 'light';
    }

    return {
      mode: themeMode,
      resolvedMode,
      colors: themeColors,
      isDark,
      setMode: (mode: ThemeMode) => updateSettings({ themeMode: mode }),
    };
  }, [themeMode, systemScheme, updateSettings]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within AppThemeProvider');
  return ctx;
}
