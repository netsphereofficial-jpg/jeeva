import type { TextStyle } from 'react-native';

export const fonts = {
  ui: 'DMSans',
  heading: 'Outfit',
  data: 'JetBrainsMono',
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
  'Outfit-Regular': 'Outfit_400Regular',
  'Outfit-Medium': 'Outfit_500Medium',
  'Outfit-SemiBold': 'Outfit_600SemiBold',
  'Outfit-Bold': 'Outfit_700Bold',
  'Outfit-ExtraBold': 'Outfit_800ExtraBold',
  'JetBrainsMono-Regular': 'JetBrainsMono_400Regular',
  'JetBrainsMono-Medium': 'JetBrainsMono_500Medium',
  'JetBrainsMono-Bold': 'JetBrainsMono_700Bold',
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

export const lineHeights = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const;

export const textPresets = {
  h1: { fontFamily: 'Outfit_700Bold', fontSize: 32, lineHeight: 32 * 1.1 } as TextStyle,
  h2: { fontFamily: 'Outfit_700Bold', fontSize: 24, lineHeight: 24 * 1.1 } as TextStyle,
  h3: { fontFamily: 'Outfit_600SemiBold', fontSize: 20, lineHeight: 20 * 1.25 } as TextStyle,
  h4: { fontFamily: 'Outfit_600SemiBold', fontSize: 17, lineHeight: 17 * 1.25 } as TextStyle,
  body: { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 15 * 1.4 } as TextStyle,
  bodyMedium: { fontFamily: 'DMSans_500Medium', fontSize: 15, lineHeight: 15 * 1.4 } as TextStyle,
  bodySemibold: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, lineHeight: 15 * 1.4 } as TextStyle,
  bodySmall: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 13 * 1.4 } as TextStyle,
  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, lineHeight: 12 * 1.4, letterSpacing: 0.5, textTransform: 'uppercase' as const } as TextStyle,
  caption: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 12 * 1.4 } as TextStyle,
  dataLg: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 28, lineHeight: 28 * 1.1 } as TextStyle,
  dataMd: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 18, lineHeight: 18 * 1.25 } as TextStyle,
  dataSm: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, lineHeight: 13 * 1.25 } as TextStyle,
} as const;
