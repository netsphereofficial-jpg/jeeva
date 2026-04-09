import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Clock, Plus, Dumbbell } from 'lucide-react-native';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { RestTimer } from '@/components/workout/RestTimer';
import { Button } from '@/components/ui/Button';
import { MonoText } from '@/components/ui/MonoText';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useWorkout } from '@/hooks/useWorkout';
import { EXERCISES } from '@/data/exercises';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { Exercise, WorkoutExercise } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    workout,
    elapsedTime,
    restTimer,
    completeSet,
    addSet,
    updateSet,
    addExercise,
    skipRest,
    finishWorkout,
  } = useWorkout();

  const [showExerciseSheet, setShowExerciseSheet] = useState(false);

  const handleFinish = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    finishWorkout();
    router.replace('/workout/summary');
  }, [finishWorkout, router]);

  const handleAddExercisePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowExerciseSheet(true);
  }, []);

  const handleSelectExercise = useCallback(
    (exercise: Exercise) => {
      const workoutExercise: WorkoutExercise = {
        id: generateId(),
        exerciseId: exercise.id,
        exercise,
        sets: Array.from({ length: 3 }, () => ({
          id: generateId(),
          weight: 0,
          reps: 10,
          isWarmup: false,
          completed: false,
        })),
        restTimerSec: 90,
      };
      addExercise(workoutExercise);
      setShowExerciseSheet(false);
    },
    [addExercise],
  );

  // Get next exercise/set info for rest timer
  const nextInfo = useMemo(() => {
    if (!workout) return { name: undefined, setInfo: undefined };
    for (let i = 0; i < workout.exercises.length; i++) {
      const ex = workout.exercises[i];
      const nextSetIdx = ex.sets.findIndex((s) => !s.completed);
      if (nextSetIdx >= 0) {
        return {
          name: ex.exercise?.name,
          setInfo: `Set ${nextSetIdx + 1} of ${ex.sets.length}`,
        };
      }
    }
    return { name: undefined, setInfo: undefined };
  }, [workout]);

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active workout</Text>
          <Button
            variant="primary"
            label="Start New"
            onPress={() => router.replace('/workout/new')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Dumbbell size={20} color={colors.primary} strokeWidth={2} />
          <Text style={styles.workoutName} numberOfLines={1}>
            {workout.name}
          </Text>
        </View>
        <View style={styles.timerBadge}>
          <Clock size={14} color={colors.primary} strokeWidth={2} />
          <MonoText size={14} color={colors.primary}>
            {formatElapsedTime(elapsedTime)}
          </MonoText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {workout.exercises.map((exercise, idx) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            exerciseIndex={idx}
            onCompleteSet={completeSet}
            onUpdateSet={updateSet}
            onAddSet={addSet}
          />
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="secondary"
          label="Add Exercise"
          onPress={handleAddExercisePress}
          icon={<Plus size={18} color={colors.textPrimary} strokeWidth={2} />}
          style={styles.addExerciseButton}
        />
        <Button
          variant="primary"
          label="Finish"
          onPress={handleFinish}
          style={styles.finishButton}
        />
      </View>

      <RestTimer
        isVisible={restTimer.isRunning}
        onSkip={skipRest}
        restTimer={restTimer}
        nextExerciseName={nextInfo.name}
        nextSetInfo={nextInfo.setInfo}
      />

      <BottomSheet
        isOpen={showExerciseSheet}
        onClose={() => setShowExerciseSheet(false)}
        snapPoints={['60%', '90%']}
      >
        <Text style={styles.sheetTitle}>Add Exercise</Text>
        <FlatList
          data={EXERCISES}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectExercise(item)}
              style={styles.exerciseListItem}
            >
              <Text style={styles.exerciseListName}>{item.name}</Text>
              <Text style={styles.exerciseListMuscle}>
                {item.primaryMuscle} | {item.equipment}
              </Text>
            </Pressable>
          )}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  workoutName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  addExerciseButton: {
    flex: 1,
  },
  finishButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.textSecondary,
  },
  sheetTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  exerciseListItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 48,
    justifyContent: 'center',
  },
  exerciseListName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: colors.textPrimary,
  },
  exerciseListMuscle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
