export const fonts = {
  ui: 'DMSans',
  data: 'SpaceMono',
} as const;

// Font family mappings for specific weights
export const fontFamilies = {
  'DMSans-Regular': 'DMSans_400Regular',
  'DMSans-Medium': 'DMSans_500Medium',
  'DMSans-SemiBold': 'DMSans_600SemiBold',
  'DMSans-Bold': 'DMSans_700Bold',
  'DMSans-ExtraBold': 'DMSans_800ExtraBold',
  'SpaceMono-Regular': 'SpaceMono_400Regular',
  'SpaceMono-Bold': 'SpaceMono_700Bold',
} as const;

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 48,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;
