import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  View,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius } from '@/theme/spacing';
import { shadows } from '@/theme/shadows';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  onPress: () => void;
  accentColor?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SIZE_CONFIG: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 36, paddingHorizontal: 14, fontSize: 13 },
  md: { height: 48, paddingHorizontal: 20, fontSize: 15 },
  lg: { height: 56, paddingHorizontal: 24, fontSize: 16 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  onPress,
  accentColor,
  icon,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { colors, isDark } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (loading) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const contrastColor = isDark ? colors.background : '#FFFFFF';

  const variantStyles = useMemo((): { container: ViewStyle; label: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.primary,
            ...shadows.sm,
          },
          label: {
            color: contrastColor,
            fontFamily: 'DMSans_700Bold',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderLight,
          },
          label: {
            color: colors.textPrimary,
            fontFamily: 'DMSans_600SemiBold',
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          label: {
            color: colors.textPrimary,
            fontFamily: 'DMSans_600SemiBold',
          },
        };
      case 'accent':
        return {
          container: {
            backgroundColor: accentColor ?? colors.primary,
            ...shadows.sm,
          },
          label: {
            color: contrastColor,
            fontFamily: 'DMSans_700Bold',
          },
        };
    }
  }, [variant, accentColor, colors, contrastColor]);

  const sizeConfig = SIZE_CONFIG[size];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          minHeight: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
        },
        variantStyles.container,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyles.label.color as string}
          />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={[{ fontSize: sizeConfig.fontSize, textAlign: 'center' as const }, variantStyles.label]}>
              {label}
            </Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});
