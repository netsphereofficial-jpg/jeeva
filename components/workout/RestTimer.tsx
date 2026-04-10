import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
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
  const { colors } = useAppTheme();

  const dynamicStyles = useMemo(() => StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    restLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 14,
      color: colors.textTertiary,
      marginTop: spacing.xs,
      letterSpacing: 2,
    },
    nextUpLabel: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    nextExercise: {
      fontFamily: 'DMSans_600SemiBold',
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
      minWidth: 48,
      alignItems: 'center',
    },
    durationPillActive: {
      backgroundColor: `rgba(139, 92, 246, ${opacity['15']})`,
      borderColor: colors.sleep,
    },
  }), [colors]);

  if (!isVisible) return null;

  const { timeRemaining, progress, duration, extend, setDuration } = restTimer;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;

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
    <View style={dynamicStyles.overlay}>
      <View style={styles.content}>
        <View style={styles.ringContainer}>
          <CircularProgress
            progress={progress}
            size={220}
            color={colors.sleep}
            strokeWidth={8}
          >
            <MonoText size={64} color={colors.textPrimary} weight="bold">
              {timeDisplay}
            </MonoText>
            <Text style={dynamicStyles.restLabel}>REST</Text>
          </CircularProgress>
        </View>

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
                color={duration === dur ? colors.textPrimary : colors.textTertiary}
              >
                {dur}s
              </MonoText>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    width: '100%',
  },
  ringContainer: {
    marginBottom: spacing['3xl'],
  },
  nextUp: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
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
