import React, { useEffect, useCallback } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check, AlertTriangle, Info, X } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/theme/spacing';
import { create } from 'zustand';

// ── Toast Store ────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastStore {
  current: ToastData | null;
  show: (message: string, type?: ToastType, duration?: number) => void;
  hide: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  current: null,
  show: (message, type = 'success', duration = 2500) => {
    set({
      current: {
        id: Date.now().toString(36),
        message,
        type,
        duration,
      },
    });
  },
  hide: () => set({ current: null }),
}));

/** Convenience function — call from anywhere */
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
  warning: (message: string) => useToastStore.getState().show(message, 'warning'),
};

// ── Toast Component ────────────────────────────────────────────

const ICON_MAP = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle,
};

const COLOR_MAP: Record<ToastType, (colors: Record<string, string>) => string> = {
  success: (c) => c.health,
  error: (c) => c.heart,
  info: (c) => c.water,
  warning: (c) => c.amber,
};

/**
 * Global toast notification component.
 * Place once in the root layout. Shows at the top of the screen.
 */
export function ToastContainer() {
  const { colors, isDark } = useAppTheme();
  const current = useToastStore((s) => s.current);
  const hide = useToastStore((s) => s.hide);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const handleHide = useCallback(() => {
    hide();
  }, [hide]);

  useEffect(() => {
    if (current) {
      // Haptic on show
      if (Platform.OS !== 'web') {
        if (current.type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (current.type === 'error') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      // Slide in
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto-hide
      translateY.value = withDelay(
        current.duration,
        withTiming(-100, { duration: 300, easing: Easing.in(Easing.ease) }),
      );
      opacity.value = withDelay(
        current.duration + 100,
        withTiming(0, { duration: 200 }, (finished) => {
          if (finished) runOnJS(handleHide)();
        }),
      );
    }
  }, [current, translateY, opacity, handleHide]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!current) return null;

  const accentColor = COLOR_MAP[current.type]?.(colors) ?? colors.primary;
  const Icon = ICON_MAP[current.type] ?? Check;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderColor: accentColor,
          shadowColor: accentColor,
        },
        animStyle,
      ]}
    >
      <Icon size={18} color={accentColor} strokeWidth={2.5} />
      <Text
        style={[
          styles.message,
          { color: colors.textPrimary },
        ]}
        numberOfLines={2}
      >
        {current.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  message: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
