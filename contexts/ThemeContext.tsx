import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from '@/theme/colors';
import { useSettingsStore } from '@/stores/settingsStore';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'dark' | 'light';
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSettingsStore((s) => s.settings.themeMode ?? 'dark');
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const systemScheme = useColorScheme();

  const value = useMemo(() => {
    const resolvedMode: 'dark' | 'light' =
      themeMode === 'system'
        ? (systemScheme ?? 'dark')
        : themeMode;

    return {
      mode: themeMode as ThemeMode,
      resolvedMode,
      colors: resolvedMode === 'dark' ? darkColors : lightColors,
      isDark: resolvedMode === 'dark',
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
