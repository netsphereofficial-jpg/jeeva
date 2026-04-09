import React from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';

interface CardProps {
  variant?: 'default' | 'elevated' | 'tinted';
  tintColor?: string;
  animationIndex?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({
  variant = 'default',
  tintColor,
  animationIndex = 0,
  children,
  style,
}: CardProps) {
  const variantStyle = getVariantStyle(variant, tintColor);

  return (
    <Animated.View
      entering={FadeInDown.delay(animationIndex * 80).duration(400)}
      style={[styles.base, variantStyle, style]}
    >
      {children}
    </Animated.View>
  );
}

function getVariantStyle(
  variant: CardProps['variant'],
  tintColor?: string,
): ViewStyle {
  switch (variant) {
    case 'elevated':
      return {
        backgroundColor: colors.surfaceElevated,
        borderColor: colors.border,
        borderWidth: 1,
      };
    case 'tinted':
      return {
        backgroundColor: tintColor
          ? `${tintColor}0A` // ~0.04 opacity
          : 'rgba(255,255,255,0.04)',
        borderColor: tintColor
          ? `${tintColor}14` // ~0.08 opacity
          : colors.border,
        borderWidth: 1,
      };
    case 'default':
    default:
      return {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: colors.border,
        borderWidth: 1,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    padding: 16,
    overflow: 'hidden',
  },
});
