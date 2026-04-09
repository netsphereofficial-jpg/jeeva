import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';

interface ButtonProps {
  variant?: ButtonVariant;
  label: string;
  onPress: () => void;
  accentColor?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  variant = 'primary',
  label,
  onPress,
  accentColor,
  icon,
  disabled = false,
  style,
}: ButtonProps) {
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
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const variantStyles = getVariantStyles(variant, accentColor);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.base,
        variantStyles.container,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[styles.label, variantStyles.label]}>{label}</Text>
      </View>
    </AnimatedPressable>
  );
}

function getVariantStyles(variant: ButtonVariant, accentColor?: string) {
  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: colors.primary,
        } as ViewStyle,
        label: {
          color: '#0A0A0F',
          fontFamily: 'DMSans_700Bold',
        },
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderLight,
        } as ViewStyle,
        label: {
          color: colors.textPrimary,
          fontFamily: 'DMSans_600SemiBold',
        },
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
        } as ViewStyle,
        label: {
          color: colors.textPrimary,
          fontFamily: 'DMSans_600SemiBold',
        },
      };
    case 'accent':
      return {
        container: {
          backgroundColor: accentColor ?? colors.primary,
        } as ViewStyle,
        label: {
          color: '#0A0A0F',
          fontFamily: 'DMSans_700Bold',
        },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  label: {
    fontSize: 15,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
