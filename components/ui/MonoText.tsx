import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

interface MonoTextProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: 'regular' | 'medium' | 'bold';
  style?: TextStyle;
}

const FONT_MAP: Record<NonNullable<MonoTextProps['weight']>, string> = {
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
  bold: 'JetBrainsMono_700Bold',
};

export function MonoText({
  children,
  size = 16,
  color,
  weight = 'regular',
  style,
}: MonoTextProps) {
  const { colors } = useAppTheme();
  const resolvedColor = color ?? colors.textPrimary;
  const fontFamily = FONT_MAP[weight];

  return (
    <Text
      style={[
        styles.base,
        { fontFamily, fontSize: size, color: resolvedColor },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
