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
