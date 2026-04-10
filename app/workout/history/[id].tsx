import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Clock,
  Dumbbell,
  Trophy,
  Check,
  X,
  RotateCcw,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { MonoText } from '@/components/ui/MonoText';
import { Button } from '@/components/ui/Button';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, spacing } from '@/theme/spacing';
import type { WorkoutExercise, WorkoutSet } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function WorkoutHistoryDetailScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = useWorkoutStore((s) => s.history.find((w) => w.id === id));
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const workoutPRs = useMemo(
    () => personalRecords.filter((pr) => pr.workoutId === id),
    [personalRecords, id],
  );

  // Build a set of PR set IDs for badge display
  const prSetKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const pr of workoutPRs) {
      keys.add(`${pr.exerciseId}-${pr.weight}-${pr.reps}`);
    }
    return keys;
  }, [workoutPRs]);

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleRepeat = () => {
    if (!workout) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Build fresh exercises from the old workout
    const freshExercises: WorkoutExercise[] = workout.exercises.map((ex) => ({
      id: generateId(),
      exerciseId: ex.exerciseId,
      exercise: ex.exercise,
      sets: ex.sets.map((s) => ({
        id: generateId(),
        weight: s.weight,
        reps: s.reps,
        isWarmup: s.isWarmup,
        completed: false,
        rpe: undefined,
      })),
      restTimerSec: ex.restTimerSec,
      notes: ex.notes,
    }));

    startWorkout(workout.name, freshExercises);
    router.replace('/workout/[id]');
  };

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        headerTitle: {
          fontFamily: 'DMSans_700Bold',
          fontSize: 20,
          color: colors.textPrimary,
          flex: 1,
          marginHorizontal: spacing.sm,
        },
        dateText: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 13,
          color: colors.textTertiary,
        },
        summaryLabel: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 12,
          color: colors.textTertiary,
        },
        exerciseName: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 16,
          color: colors.textPrimary,
        },
        setHeader: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
          color: colors.textTertiary,
          textTransform: 'uppercase',
        },
        prCount: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 13,
          color: colors.pr,
        },
        notFoundText: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: spacing['3xl'],
        },
      }),
    [colors],
  );

  if (!workout) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>
        <Text style={dynamicStyles.notFoundText}>Workout not found</Text>
      </SafeAreaView>
    );
  }

  const contrastColor = isDark ? colors.background : '#FFFFFF';

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle} numberOfLines={1}>
          {workout.name}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary row */}
        <Card variant="glass">
          <Text style={dynamicStyles.dateText}>{formatDate(workout.startTime)}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Clock size={14} color={colors.textTertiary} strokeWidth={2} />
              <MonoText size={14} color={colors.textPrimary}>
                {formatDuration(workout.durationSec)}
              </MonoText>
              <Text style={dynamicStyles.summaryLabel}>Duration</Text>
            </View>
            <View style={styles.summaryItem}>
              <Dumbbell size={14} color={colors.textTertiary} strokeWidth={2} />
              <MonoText size={14} color={colors.textPrimary}>
                {workout.totalVolume.toLocaleString()}
              </MonoText>
              <Text style={dynamicStyles.summaryLabel}>Volume</Text>
            </View>
            <View style={styles.summaryItem}>
              <MonoText size={14} color={colors.textPrimary}>
                {workout.totalSets}
              </MonoText>
              <Text style={dynamicStyles.summaryLabel}>Sets</Text>
            </View>
            <View style={styles.summaryItem}>
              <MonoText size={14} color={colors.textPrimary}>
                {workout.totalReps}
              </MonoText>
              <Text style={dynamicStyles.summaryLabel}>Reps</Text>
            </View>
          </View>
        </Card>

        {/* PR count badge */}
        {workoutPRs.length > 0 && (
          <View style={styles.prRow}>
            <Trophy size={16} color={colors.pr} strokeWidth={2} />
            <Text style={dynamicStyles.prCount}>
              {workoutPRs.length} PR{workoutPRs.length > 1 ? 's' : ''} set
            </Text>
          </View>
        )}

        {/* Exercises */}
        {workout.exercises.map((ex, exIdx) => (
          <Card key={ex.id} variant="default" animationIndex={exIdx + 1}>
            <Text style={dynamicStyles.exerciseName}>{ex.exercise?.name ?? ex.exerciseId}</Text>

            {/* Set table header */}
            <View style={styles.setTableHeader}>
              <Text style={[dynamicStyles.setHeader, styles.setColNum]}>Set</Text>
              <Text style={[dynamicStyles.setHeader, styles.setColWeight]}>Weight</Text>
              <Text style={[dynamicStyles.setHeader, styles.setColReps]}>Reps</Text>
              <Text style={[dynamicStyles.setHeader, styles.setColStatus]}>Status</Text>
            </View>

            {/* Set rows */}
            {ex.sets.map((s, sIdx) => {
              const isPR = prSetKeys.has(`${ex.exerciseId}-${s.weight}-${s.reps}`);
              return (
                <View key={s.id} style={styles.setRow}>
                  <MonoText size={12} color={colors.textTertiary} style={styles.setColNum}>
                    {sIdx + 1}
                  </MonoText>
                  <MonoText size={13} color={colors.textPrimary} style={styles.setColWeight}>
                    {s.weight}kg
                  </MonoText>
                  <MonoText size={13} color={colors.textPrimary} style={styles.setColReps}>
                    {s.reps}
                  </MonoText>
                  <View style={[styles.setColStatus, styles.statusCell]}>
                    {s.completed ? (
                      <Check size={14} color={colors.health} strokeWidth={2.5} />
                    ) : (
                      <X size={14} color={colors.textTertiary} strokeWidth={2} />
                    )}
                    {isPR && s.completed && (
                      <Trophy size={12} color={colors.pr} strokeWidth={2} />
                    )}
                  </View>
                </View>
              );
            })}
          </Card>
        ))}

        {/* Repeat Workout button */}
        <Button
          variant="secondary"
          label="Repeat Workout"
          onPress={handleRepeat}
          icon={<RotateCcw size={18} color={colors.textPrimary} strokeWidth={2} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  setTableHeader: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  setColNum: {
    width: 36,
  },
  setColWeight: {
    flex: 1,
  },
  setColReps: {
    width: 48,
  },
  setColStatus: {
    width: 52,
  },
  statusCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
