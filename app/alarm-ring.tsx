import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Bell, BellOff, Clock, Sun, Dumbbell, Pill } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { startAlarmSound, stopAlarmSound } from '@/services/alarmSound';
import { formatTime12h } from '@/services/notifications';
import { spacing } from '@/theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AlarmRingScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    hour?: string;
    minute?: string;
    label?: string;
    type?: string;
  }>();

  const hour = params.hour ? parseInt(params.hour, 10) : new Date().getHours();
  const minute = params.minute ? parseInt(params.minute, 10) : new Date().getMinutes();
  const label = params.label || 'Alarm';
  const type = params.type || 'wakeup';

  const timeStr = formatTime12h(hour, minute);

  // Pulsing ring animation
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);
  const pulse3 = useSharedValue(0);
  const bellSwing = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Start alarm sound + vibration
    startAlarmSound();

    // Pulsing rings — staggered
    pulse1.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1, // infinite
      false,
    );
    setTimeout(() => {
      pulse2.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      );
    }, 600);
    setTimeout(() => {
      pulse3.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      );
    }, 1200);

    // Bell swinging
    bellSwing.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 250, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 250, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    // Background glow pulsing
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.2, { duration: 1000 }),
      ),
      -1,
      true,
    );

    return () => {
      stopAlarmSound();
    };
  }, []);

  const pulseStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse1.value, [0, 1], [1, 2.5]) }],
    opacity: interpolate(pulse1.value, [0, 0.5, 1], [0.4, 0.2, 0]),
  }));

  const pulseStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse2.value, [0, 1], [1, 2.2]) }],
    opacity: interpolate(pulse2.value, [0, 0.5, 1], [0.3, 0.15, 0]),
  }));

  const pulseStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse3.value, [0, 1], [1, 1.8]) }],
    opacity: interpolate(pulse3.value, [0, 0.5, 1], [0.2, 0.1, 0]),
  }));

  const bellAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${bellSwing.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getTypeIcon = () => {
    switch (type) {
      case 'workout': return Dumbbell;
      case 'medication': return Pill;
      default: return Sun;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'workout': return colors.sleep;
      case 'medication': return colors.health;
      default: return colors.primary;
    }
  };

  const TypeIcon = getTypeIcon();
  const typeColor = getTypeColor();

  const handleDismiss = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    stopAlarmSound();
    router.back();
  };

  const handleSnooze = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    stopAlarmSound();
    // TODO: Reschedule alarm for +5 or +10 minutes
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Radial glow background */}
      <Animated.View
        style={[
          styles.backgroundGlow,
          glowStyle,
          {
            backgroundColor: typeColor,
          },
        ]}
      />

      {/* Pulsing rings */}
      <View style={styles.pulseContainer}>
        <Animated.View
          style={[styles.pulseRing, pulseStyle1, { borderColor: typeColor }]}
        />
        <Animated.View
          style={[styles.pulseRing, pulseStyle2, { borderColor: typeColor }]}
        />
        <Animated.View
          style={[styles.pulseRing, pulseStyle3, { borderColor: typeColor }]}
        />

        {/* Center bell icon */}
        <Animated.View
          style={[styles.bellContainer, bellAnimStyle, { backgroundColor: `${typeColor}20` }]}
        >
          <Bell size={48} color={typeColor} strokeWidth={1.5} />
        </Animated.View>
      </View>

      {/* Time display */}
      <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.timeSection}>
        <MonoText size={56} weight="bold" color={colors.textPrimary}>
          {timeStr}
        </MonoText>
      </Animated.View>

      {/* Label + type */}
      <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.labelSection}>
        <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
          <TypeIcon size={16} color={typeColor} strokeWidth={2} />
          <Text style={[styles.typeText, { color: typeColor }]}>
            {type === 'wakeup' ? 'Wake Up' : type === 'workout' ? 'Workout' : 'Medication'}
          </Text>
        </View>
        <Text style={[styles.labelText, { color: colors.textSecondary }]} numberOfLines={2}>
          {label}
        </Text>
      </Animated.View>

      {/* Action buttons */}
      <Animated.View entering={FadeIn.delay(600).duration(500)} style={styles.actions}>
        {/* Snooze button */}
        <Pressable
          onPress={handleSnooze}
          style={[styles.snoozeButton, { backgroundColor: colors.surfaceGlass, borderColor: colors.borderLight }]}
        >
          <Clock size={24} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.snoozeText, { color: colors.textSecondary }]}>Snooze</Text>
          <MonoText size={11} color={colors.textTertiary}>5 min</MonoText>
        </Pressable>

        {/* Dismiss button */}
        <Pressable
          onPress={handleDismiss}
          style={[styles.dismissButton, { backgroundColor: typeColor }]}
        >
          <BellOff size={28} color={colors.background} strokeWidth={2} />
          <Text style={[styles.dismissText, { color: colors.background }]}>Dismiss</Text>
        </Pressable>

        {/* Snooze 10min */}
        <Pressable
          onPress={handleSnooze}
          style={[styles.snoozeButton, { backgroundColor: colors.surfaceGlass, borderColor: colors.borderLight }]}
        >
          <Clock size={24} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.snoozeText, { color: colors.textSecondary }]}>Snooze</Text>
          <MonoText size={11} color={colors.textTertiary}>10 min</MonoText>
        </Pressable>
      </Animated.View>

      {/* Swipe hint */}
      <Animated.View entering={FadeIn.delay(1000).duration(500)} style={styles.hint}>
        <Text style={[styles.hintText, { color: colors.textTertiary }]}>
          Tap dismiss to stop the alarm
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  backgroundGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2,
    height: SCREEN_WIDTH * 2,
    borderRadius: SCREEN_WIDTH,
    top: SCREEN_HEIGHT * 0.1,
    alignSelf: 'center',
  },
  pulseContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
  },
  bellContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSection: {
    marginBottom: spacing.lg,
  },
  labelSection: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
    gap: spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  typeText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  labelText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  snoozeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 100,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.xs,
  },
  snoozeText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  dismissButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    gap: spacing.sm,
  },
  dismissText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
  hint: {
    position: 'absolute',
    bottom: 60,
  },
  hintText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
});
