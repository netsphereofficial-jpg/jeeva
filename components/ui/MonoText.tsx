import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface MonoTextProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: 'regular' | 'bold';
  style?: TextStyle;
}

export function MonoText({
  children,
  size = 16,
  color = colors.textPrimary,
  weight = 'regular',
  style,
}: MonoTextProps) {
  const fontFamily =
    weight === 'bold' ? 'SpaceMono_700Bold' : 'SpaceMono_400Regular';

  return (
    <Text
      style={[
        styles.base,
        { fontFamily, fontSize: size, color },
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
