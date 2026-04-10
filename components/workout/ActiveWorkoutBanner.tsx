import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Dumbbell, Clock, ChevronRight } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useWorkoutStore } from '@/stores/workoutStore';
import { spacing, radius } from '@/theme/spacing';

/**
 * Floating banner that appears on non-workout tabs when a workout is active.
 * Shows workout name + elapsed time. Tap to return to the active workout.
 */
export function ActiveWorkoutBanner() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeWorkout || activeWorkout.status === 'completed') return;

    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - activeWorkout.startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  if (!activeWorkout || activeWorkout.status === 'completed') return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/workout/${activeWorkout.id}`);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300).springify()}
      exiting={FadeOutUp.duration(200)}
    >
      <Pressable
        onPress={handlePress}
        style={[styles.banner, { backgroundColor: colors.primary }]}
        accessibilityLabel={`Active workout: ${activeWorkout.name}. Tap to return.`}
        accessibilityRole="button"
      >
        <Dumbbell size={16} color="#0A0A0F" strokeWidth={2.5} />
        <Text style={styles.name} numberOfLines={1}>
          {activeWorkout.name}
        </Text>
        <View style={styles.timerSection}>
          <Clock size={12} color="#0A0A0F" strokeWidth={2} />
          <MonoText size={13} weight="bold" color="#0A0A0F">
            {timeStr}
          </MonoText>
        </View>
        <ChevronRight size={16} color="#0A0A0F" strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  name: {
    flex: 1,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#0A0A0F',
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
