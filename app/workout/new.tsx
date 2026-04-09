import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { MonoText } from '@/components/ui/MonoText';
import { MuscleGroupPicker } from '@/components/workout/MuscleGroupPicker';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useTemplateStore } from '@/stores/templateStore';
import { getExercisesByGroup, EXERCISES } from '@/data/exercises';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type {
  MuscleGroupCategory,
  WorkoutExercise,
  WorkoutTemplate,
  WorkoutSet,
} from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function buildWorkoutExercisesFromTemplate(
  template: WorkoutTemplate,
): WorkoutExercise[] {
  return template.exercises.map((te) => ({
    id: generateId(),
    exerciseId: te.exerciseId,
    exercise: te.exercise,
    sets: Array.from({ length: te.targetSets }, () => ({
      id: generateId(),
      weight: te.targetWeight ?? 0,
      reps: te.targetReps,
      isWarmup: false,
      completed: false,
    })),
    restTimerSec: te.restTimerSec,
  }));
}

function buildWorkoutExercisesFromGroup(
  group: MuscleGroupCategory,
): WorkoutExercise[] {
  const exercises = getExercisesByGroup(group).slice(0, 6);
  return exercises.map((ex) => ({
    id: generateId(),
    exerciseId: ex.id,
    exercise: ex,
    sets: Array.from({ length: 3 }, () => ({
      id: generateId(),
      weight: 0,
      reps: 10,
      isWarmup: false,
      completed: false,
    })),
    restTimerSec: 90,
  }));
}

const GROUP_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs',
  core: 'Core',
  fullbody: 'Full Body',
};

function formatDate(timestamp?: number): string {
  if (!timestamp) return 'Never';
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NewWorkoutScreen() {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState(0);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const templates = useTemplateStore((s) => s.templates);
  const getTodaysTemplate = useTemplateStore((s) => s.getTodaysTemplate);

  const todaysTemplate = useMemo(() => getTodaysTemplate(), [getTodaysTemplate]);

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleStartFromTemplate = (template: WorkoutTemplate) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const exercises = buildWorkoutExercisesFromTemplate(template);
    startWorkout(template.name, exercises);
    const workout = useWorkoutStore.getState().activeWorkout;
    if (workout) {
      router.push(`/workout/${workout.id}`);
    }
  };

  const handleSelectGroup = (group: MuscleGroupCategory) => {
    const exercises = buildWorkoutExercisesFromGroup(group);
    const label = GROUP_LABELS[group] ?? group;
    startWorkout(`${label} Workout`, exercises);
    const workout = useWorkoutStore.getState().activeWorkout;
    if (workout) {
      router.push(`/workout/${workout.id}`);
    }
  };

  const renderTemplateItem = ({
    item,
    index,
  }: {
    item: WorkoutTemplate;
    index: number;
  }) => {
    const isToday = todaysTemplate?.id === item.id;
    return (
      <Pressable
        onPress={() => handleStartFromTemplate(item)}
        style={styles.templatePressable}
      >
        <Card
          variant={isToday ? 'tinted' : 'default'}
          tintColor={isToday ? colors.primary : undefined}
          animationIndex={index}
          style={styles.templateCard}
        >
          {isToday && (
            <View style={styles.todayLabel}>
              <Calendar size={12} color={colors.primary} strokeWidth={2} />
              <Text style={styles.todayText}>Today's Workout</Text>
            </View>
          )}
          <Text style={styles.templateName}>{item.name}</Text>
          <View style={styles.templateMeta}>
            <Tag label={`${item.exercises.length} exercises`} color={colors.textSecondary} />
            {item.lastPerformed && (
              <Text style={styles.lastUsed}>
                Last: {formatDate(item.lastPerformed)}
              </Text>
            )}
          </View>
        </Card>
      </Pressable>
    );
  };

  // Sort templates so today's is first
  const sortedTemplates = useMemo(() => {
    if (!todaysTemplate) return templates;
    const rest = templates.filter((t) => t.id !== todaysTemplate.id);
    return [todaysTemplate, ...rest];
  }, [templates, todaysTemplate]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>New Workout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.segmentContainer}>
        <SegmentedControl
          segments={['Templates', 'Exercises']}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />
      </View>

      {activeSegment === 0 ? (
        <FlatList
          data={sortedTemplates}
          keyExtractor={(item) => item.id}
          renderItem={renderTemplateItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No templates yet. Create one after completing a workout.
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.pickerContainer}>
          <MuscleGroupPicker onSelect={handleSelectGroup} />
        </View>
      )}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  segmentContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  templatePressable: {
    marginBottom: spacing.md,
  },
  templateCard: {
    gap: spacing.sm,
  },
  todayLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  todayText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: colors.primary,
  },
  templateName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    color: colors.textPrimary,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  lastUsed: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  pickerContainer: {
    paddingHorizontal: spacing.lg,
  },
});
