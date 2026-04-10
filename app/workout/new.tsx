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
import { ChevronLeft, Calendar, Star, Heart, Sparkles } from 'lucide-react-native';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { MonoText } from '@/components/ui/MonoText';
import { MuscleGroupPicker } from '@/components/workout/MuscleGroupPicker';
import { ProgramCard } from '@/components/workout/ProgramCard';
import { ProgramDayPicker } from '@/components/workout/ProgramDayPicker';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useCustomExerciseStore } from '@/stores/customExerciseStore';
import { getExercisesByGroup, EXERCISES } from '@/data/exercises';
import { PROGRAMS } from '@/data/programs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, spacing } from '@/theme/spacing';
import type {
  Exercise,
  MuscleGroupCategory,
  Program,
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
  favIds: string[],
  customExs: Exercise[],
): WorkoutExercise[] {
  const groupMap: Record<string, string[]> = {
    chest: ['chest'],
    back: ['back', 'lats'],
    shoulders: ['shoulders', 'traps'],
    biceps: ['biceps'],
    triceps: ['triceps'],
    legs: ['quads', 'hamstrings', 'glutes', 'calves'],
    core: ['abs'],
    fullbody: ['full_body'],
  };
  const targets = groupMap[group] ?? [group];

  // Get all exercises for this group (custom + built-in)
  const allGroupExercises = [
    ...customExs.filter((e) => targets.includes(e.primaryMuscle)),
    ...getExercisesByGroup(group),
  ];

  // Separate favorites and non-favorites for this group
  const favExercises = allGroupExercises.filter((e) => favIds.includes(e.id));
  const nonFavExercises = allGroupExercises.filter((e) => !favIds.includes(e.id));

  // Favorites first, then fill up to 6 total
  const maxNonFav = Math.max(0, 6 - favExercises.length);
  const combined = [...favExercises, ...nonFavExercises.slice(0, maxNonFav)];

  return combined.map((ex) => ({
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
  const { colors } = useAppTheme();
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const templates = useTemplateStore((s) => s.templates);
  const getTodaysTemplate = useTemplateStore((s) => s.getTodaysTemplate);
  const customExercises = useCustomExerciseStore((s) => s.exercises);
  const favoriteIds = useCustomExerciseStore((s) => s.favoriteIds);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroupCategory | null>(null);

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
    const exercises = buildWorkoutExercisesFromGroup(group, favoriteIds, customExercises);
    const label = GROUP_LABELS[group] ?? group;
    startWorkout(`${label} Workout`, exercises);
    const workout = useWorkoutStore.getState().activeWorkout;
    if (workout) {
      router.push(`/workout/${workout.id}`);
    }
  };

  const handleSelectProgram = (program: Program) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedProgram(program);
  };

  const handleStartFromProgram = (program: Program, dayIndex: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const day = program.days[dayIndex];
    if (!day) return;

    const exercises: WorkoutExercise[] = day.exerciseIds
      .map((exerciseId) => {
        const exercise = EXERCISES.find((e) => e.id === exerciseId);
        if (!exercise) return null;
        return {
          id: generateId(),
          exerciseId: exercise.id,
          exercise,
          sets: Array.from({ length: day.targetSets }, () => ({
            id: generateId(),
            weight: 0,
            reps: day.targetReps,
            isWarmup: false,
            completed: false,
          })),
          restTimerSec: 90,
        };
      })
      .filter((e): e is WorkoutExercise => e !== null);

    const workoutName = `${program.name} - ${day.name}`;
    startWorkout(workoutName, exercises);
    const workout = useWorkoutStore.getState().activeWorkout;
    if (workout) {
      router.push(`/workout/${workout.id}`);
    }
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      flex: 1,
      fontFamily: 'DMSans_700Bold',
      fontSize: 20,
      color: colors.textPrimary,
      textAlign: 'center',
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
    lastUsed: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.textTertiary,
    },
    emptyText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  }), [colors]);

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
              <Text style={dynamicStyles.todayText}>Today's Workout</Text>
            </View>
          )}
          <Text style={dynamicStyles.templateName}>{item.name}</Text>
          <View style={styles.templateMeta}>
            <Tag label={`${item.exercises.length} exercises`} color={colors.textSecondary} />
            {item.lastPerformed && (
              <Text style={dynamicStyles.lastUsed}>
                Last: {formatDate(item.lastPerformed)}
              </Text>
            )}
          </View>
        </Card>
      </Pressable>
    );
  };

  const renderProgramItem = ({
    item,
    index,
  }: {
    item: Program;
    index: number;
  }) => (
    <ProgramCard
      program={item}
      onSelect={handleSelectProgram}
      animationIndex={index}
    />
  );

  // Sort templates so today's is first
  const sortedTemplates = useMemo(() => {
    if (!todaysTemplate) return templates;
    const rest = templates.filter((t) => t.id !== todaysTemplate.id);
    return [todaysTemplate, ...rest];
  }, [templates, todaysTemplate]);

  const renderProgramsContent = () => {
    if (selectedProgram) {
      return (
        <ProgramDayPicker
          program={selectedProgram}
          onSelectDay={(dayIndex) =>
            handleStartFromProgram(selectedProgram, dayIndex)
          }
          onBack={() => setSelectedProgram(null)}
        />
      );
    }

    return (
      <FlatList
        data={PROGRAMS}
        keyExtractor={(item) => item.id}
        renderItem={renderProgramItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderContent = () => {
    switch (activeSegment) {
      case 0:
        return renderProgramsContent();
      case 1:
        return (
          <FlatList
            data={sortedTemplates}
            keyExtractor={(item) => item.id}
            renderItem={renderTemplateItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={dynamicStyles.emptyText}>
                  No templates yet. Create one after completing a workout.
                </Text>
              </View>
            }
          />
        );
      case 2:
        return (
          <View style={styles.pickerContainer}>
            <MuscleGroupPicker onSelect={handleSelectGroup} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={dynamicStyles.title}>New Workout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.segmentContainer}>
        <SegmentedControl
          segments={['Programs', 'Templates', 'Exercises']}
          activeIndex={activeSegment}
          onChange={(index) => {
            setActiveSegment(index);
            if (index !== 0) {
              setSelectedProgram(null);
            }
          }}
        />
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  pickerContainer: {
    paddingHorizontal: spacing.lg,
  },
});
