import React, { useMemo } from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, spacing } from '@/theme/spacing';
import { shadows } from '@/theme/shadows';

interface CardProps {
  variant?: 'default' | 'elevated' | 'glass' | 'tinted';
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
  const { colors } = useAppTheme();

  const variantStyle = useMemo((): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          borderWidth: 1,
          ...shadows.md,
        };
      case 'glass':
        return {
          backgroundColor: colors.surfaceGlass,
          borderColor: colors.surfaceGlassBorder,
          borderWidth: 1,
        };
      case 'tinted':
        return {
          backgroundColor: tintColor
            ? `${tintColor}0A` // ~0.04 opacity
            : colors.surfaceGlass,
          borderColor: tintColor
            ? `${tintColor}14` // ~0.08 opacity
            : colors.border,
          borderWidth: 1,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surfaceGlass,
          borderColor: colors.border,
          borderWidth: 1,
        };
    }
  }, [variant, tintColor, colors]);

  return (
    <Animated.View
      entering={FadeInDown.delay(animationIndex * 80).duration(400)}
      style={[styles.base, variantStyle, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
  },
});
