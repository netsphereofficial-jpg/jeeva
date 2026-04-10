import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { MonoText } from '@/components/ui/MonoText';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/hooks/useAppTheme';
import { opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { useRestTimer } from '@/hooks/useRestTimer';

interface RestTimerProps {
  isVisible: boolean;
  onSkip: () => void;
  restTimer: ReturnType<typeof useRestTimer>;
  nextExerciseName?: string;
  nextSetInfo?: string;
}

const DURATION_OPTIONS = [60, 90, 120, 180] as const;

export function RestTimer({
  isVisible,
  onSkip,
  restTimer,
  nextExerciseName,
  nextSetInfo,
}: RestTimerProps) {
  const { colors, isDark } = useAppTheme();

  // Breathing circle animation
  const breatheScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.15);
  const ringPulse = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      // Breathing: 4s inhale + 4s exhale
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );

      // Background glow pulse
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 2000 }),
          withTiming(0.1, { duration: 2000 }),
        ),
        -1,
        true,
      );

      // Ring outer pulse
      ringPulse.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }
  }, [isVisible, breatheScale, glowOpacity, ringPulse]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const ringPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringPulse.value }],
  }));

  const dynamicStyles = useMemo(() => StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? 'rgba(10,10,15,0.95)' : 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    backgroundGlow: {
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: colors.sleep,
    },
    breatheLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 12,
      color: colors.sleep,
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginTop: spacing.sm,
    },
    restLabel: {
      fontFamily: 'Outfit_600SemiBold',
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: spacing.xs,
      letterSpacing: 3,
      textTransform: 'uppercase',
    },
    nextUpLabel: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    nextExercise: {
      fontFamily: 'Outfit_600SemiBold',
      fontSize: 17,
      color: colors.textPrimary,
    },
    durationPill: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 50,
      alignItems: 'center',
    },
    durationPillActive: {
      backgroundColor: `rgba(139, 92, 246, ${opacity['15']})`,
      borderColor: colors.sleep,
    },
  }), [colors, isDark]);

  if (!isVisible) return null;

  const { timeRemaining, progress, duration, extend, setDuration } = restTimer;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;

  // Determine breathing text
  const breatheCycle = Math.floor(Date.now() / 4000) % 2;
  const breatheText = breatheCycle === 0 ? 'Breathe In' : 'Breathe Out';

  const handleExtend = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    extend(30);
  };

  const handleDurationSelect = (dur: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDuration(dur);
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={dynamicStyles.overlay}>
      {/* Background radial glow */}
      <Animated.View style={[dynamicStyles.backgroundGlow, glowStyle]} />

      <View style={styles.content}>
        {/* Pulsing ring with countdown */}
        <Animated.View style={[styles.ringContainer, ringPulseStyle]}>
          <CircularProgress
            progress={progress}
            size={220}
            color={colors.sleep}
            strokeWidth={8}
            glow
          >
            <MonoText size={56} color={colors.textPrimary} weight="bold">
              {timeDisplay}
            </MonoText>
            <Text style={dynamicStyles.restLabel}>REST</Text>
          </CircularProgress>
        </Animated.View>

        {/* Breathing circle indicator */}
        <Animated.View style={[styles.breatheCircle, breatheStyle]}>
          <View style={[styles.breatheDot, { backgroundColor: colors.sleep }]} />
        </Animated.View>
        <Text style={dynamicStyles.breatheLabel}>{breatheText}</Text>

        {/* Next up info */}
        {(nextExerciseName || nextSetInfo) && (
          <View style={styles.nextUp}>
            <Text style={dynamicStyles.nextUpLabel}>Next up</Text>
            {nextExerciseName && (
              <Text style={dynamicStyles.nextExercise}>{nextExerciseName}</Text>
            )}
            {nextSetInfo && (
              <MonoText size={13} color={colors.textTertiary}>
                {nextSetInfo}
              </MonoText>
            )}
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <Button
            variant="secondary"
            label="+30s"
            onPress={handleExtend}
            style={styles.extendButton}
          />
          <Button
            variant="accent"
            accentColor={colors.sleep}
            label="Skip Rest"
            onPress={onSkip}
            style={styles.skipButton}
          />
        </View>

        {/* Duration pills */}
        <View style={styles.durationSelector}>
          {DURATION_OPTIONS.map((dur) => (
            <Pressable
              key={dur}
              onPress={() => handleDurationSelect(dur)}
              style={[
                dynamicStyles.durationPill,
                duration === dur && dynamicStyles.durationPillActive,
              ]}
            >
              <MonoText
                size={13}
                color={duration === dur ? colors.sleep : colors.textTertiary}
                weight={duration === dur ? 'bold' : 'regular'}
              >
                {dur}s
              </MonoText>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    width: '100%',
  },
  ringContainer: {
    marginBottom: spacing.lg,
  },
  breatheCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  breatheDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextUp: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
    gap: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
    width: '100%',
  },
  extendButton: {
    flex: 1,
  },
  skipButton: {
    flex: 1,
  },
  durationSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
