export const darkColors = {
  background: '#0A0A0F',
  surface: '#111118',
  surfaceElevated: '#1A1A24',
  textPrimary: '#E8E4DE',
  textSecondary: '#9B9B9B',
  textTertiary: '#666666',
  primary: '#FF6B35',
  sleep: '#8B5CF6',
  health: '#10B981',
  water: '#38BDF8',
  heart: '#EF4444',
  pr: '#F59E0B',
  alarmWakeup: '#FF6B35',
  alarmWorkout: '#8B5CF6',
  alarmMedication: '#10B981',
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.1)',
  overlay: 'rgba(0,0,0,0.6)',
  amber: '#F59E0B',
  gold: '#D4A017',
  ember: '#FF8C42',
  surfaceGlass: 'rgba(255,255,255,0.04)',
  surfaceGlassBorder: 'rgba(255,255,255,0.08)',
  tabBar: 'rgba(10, 10, 15, 0.95)',
  tabBarBorder: 'rgba(255, 255, 255, 0.05)',
  inputBackground: '#111118',
  inputBorder: 'rgba(255,255,255,0.1)',
} as const;

export const lightColors = {
  background: '#F5F3EF',
  surface: '#FFFFFF',
  surfaceElevated: '#F0EDE8',
  textPrimary: '#1A1A1F',
  textSecondary: '#6B6B70',
  textTertiary: '#9B9B9B',
  primary: '#FF6B35',
  sleep: '#8B5CF6',
  health: '#10B981',
  water: '#38BDF8',
  heart: '#EF4444',
  pr: '#F59E0B',
  alarmWakeup: '#FF6B35',
  alarmWorkout: '#8B5CF6',
  alarmMedication: '#10B981',
  border: 'rgba(0,0,0,0.06)',
  borderLight: 'rgba(0,0,0,0.1)',
  overlay: 'rgba(0,0,0,0.4)',
  amber: '#F59E0B',
  gold: '#D4A017',
  ember: '#FF8C42',
  surfaceGlass: 'rgba(0,0,0,0.03)',
  surfaceGlassBorder: 'rgba(0,0,0,0.06)',
  tabBar: 'rgba(245, 243, 239, 0.95)',
  tabBarBorder: 'rgba(0, 0, 0, 0.05)',
  inputBackground: '#F5F3EF',
  inputBorder: 'rgba(0,0,0,0.1)',
} as const;

/** Arctic Blue — icy whites, electric blues, frosted glass */
export const arcticBlueColors: ThemeColors = {
  background: '#0B1628',
  surface: '#0F1E35',
  surfaceElevated: '#162A45',
  textPrimary: '#E8F0FF',
  textSecondary: '#8BA4C4',
  textTertiary: '#546B8A',
  primary: '#3B82F6',
  sleep: '#818CF8',
  health: '#34D399',
  water: '#22D3EE',
  heart: '#F87171',
  pr: '#FBBF24',
  alarmWakeup: '#3B82F6',
  alarmWorkout: '#818CF8',
  alarmMedication: '#34D399',
  border: 'rgba(138,180,255,0.08)',
  borderLight: 'rgba(138,180,255,0.12)',
  overlay: 'rgba(0,0,0,0.7)',
  amber: '#FBBF24',
  gold: '#F59E0B',
  ember: '#60A5FA',
  surfaceGlass: 'rgba(138,180,255,0.04)',
  surfaceGlassBorder: 'rgba(138,180,255,0.08)',
  tabBar: 'rgba(11, 22, 40, 0.95)',
  tabBarBorder: 'rgba(138,180,255,0.06)',
  inputBackground: '#0F1E35',
  inputBorder: 'rgba(138,180,255,0.12)',
};

/** Midnight Gold — deep navy, gold accents, luxury feel */
export const midnightGoldColors: ThemeColors = {
  background: '#0C0A14',
  surface: '#14112A',
  surfaceElevated: '#1C1838',
  textPrimary: '#F0E8D8',
  textSecondary: '#A89F8A',
  textTertiary: '#6B6358',
  primary: '#D4A017',
  sleep: '#A78BFA',
  health: '#6EE7B7',
  water: '#67E8F9',
  heart: '#FCA5A5',
  pr: '#FDE68A',
  alarmWakeup: '#D4A017',
  alarmWorkout: '#A78BFA',
  alarmMedication: '#6EE7B7',
  border: 'rgba(212,160,23,0.06)',
  borderLight: 'rgba(212,160,23,0.1)',
  overlay: 'rgba(0,0,0,0.7)',
  amber: '#F59E0B',
  gold: '#D4A017',
  ember: '#E5B94E',
  surfaceGlass: 'rgba(212,160,23,0.03)',
  surfaceGlassBorder: 'rgba(212,160,23,0.06)',
  tabBar: 'rgba(12, 10, 20, 0.95)',
  tabBarBorder: 'rgba(212,160,23,0.06)',
  inputBackground: '#14112A',
  inputBorder: 'rgba(212,160,23,0.1)',
};

export type ThemeColors = { [K in keyof typeof darkColors]: string };

/** @deprecated Use useAppTheme().colors instead — kept for backward compat during migration */
export const colors = darkColors;

export const opacity = {
  '4': 0.04,
  '6': 0.06,
  '8': 0.08,
  '10': 0.10,
  '12': 0.12,
  '15': 0.15,
  '20': 0.20,
  '25': 0.25,
  '30': 0.30,
  '50': 0.50,
} as const;

export const equipmentColors = {
  barbell: '#8B5CF6',
  dumbbell: '#38BDF8',
  cable: '#F59E0B',
  machine: '#10B981',
  bodyweight: '#EF4444',
  kettlebell: '#FF6B35',
  band: '#EC4899',
} as const;

export const difficultyColors = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
} as const;

export const sleepStageColors = {
  deep: '#6D28D9',
  rem: '#8B5CF6',
  light: '#A78BFA',
  awake: 'rgba(255,255,255,0.08)',
} as const;

export const sleepStageColorsLight = {
  deep: '#6D28D9',
  rem: '#8B5CF6',
  light: '#A78BFA',
  awake: 'rgba(0,0,0,0.06)',
} as const;
