import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Clock, Plus, Dumbbell, Heart, Sparkles, Star } from 'lucide-react-native';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { ExerciseFilters } from '@/components/workout/ExerciseFilters';
import { RestTimer } from '@/components/workout/RestTimer';
import { CustomExerciseForm } from '@/components/workout/CustomExerciseForm';
import { ExerciseDetailTooltip } from '@/components/workout/ExerciseDetailTooltip';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { MonoText } from '@/components/ui/MonoText';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useWorkout } from '@/hooks/useWorkout';
import { EXERCISES } from '@/data/exercises';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTemplateStore } from '@/stores/templateStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useCustomExerciseStore } from '@/stores/customExerciseStore';
import { getProgressionSuggestions } from '@/utils/calculations';
import { opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { Exercise, WorkoutExercise, ProgressionSuggestionV2 } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

const EXERCISE_ITEM_HEIGHT = 56;

function getExerciseItemLayout(
  _data: ArrayLike<Exercise> | null | undefined,
  index: number,
): { length: number; offset: number; index: number } {
  return { length: EXERCISE_ITEM_HEIGHT, offset: EXERCISE_ITEM_HEIGHT * index, index };
}

function exerciseKeyExtractor(item: Exercise): string {
  return item.id;
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
  const { colors } = useAppTheme();
  const router = useRouter();
  const {
    workout,
    elapsedTime,
    restTimer,
    completeSet,
    addSet,
    addWarmupSet,
    updateSet,
    addExercise,
    updateExerciseNotes,
    skipRest,
    finishWorkout,
  } = useWorkout();

  const templates = useTemplateStore((s) => s.templates);
  const history = useWorkoutStore((s) => s.history);

  const suggestions = useMemo(() => {
    if (!workout?.templateId) return [];
    const template = templates.find((t) => t.id === workout.templateId);
    if (!template) return [];
    return getProgressionSuggestions(template, history);
  }, [workout?.templateId, templates, history]);

  const customExercises = useCustomExerciseStore((s) => s.exercises);
  const favoriteIds = useCustomExerciseStore((s) => s.favoriteIds);
  const toggleFavorite = useCustomExerciseStore((s) => s.toggleFavorite);

  const [showExerciseSheet, setShowExerciseSheet] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [tooltipExercise, setTooltipExercise] = useState<Exercise | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);

  const allExercises = useMemo(
    () => [...customExercises, ...EXERCISES],
    [customExercises],
  );

  const favoriteExercises = useMemo(
    () => allExercises.filter((e) => favoriteIds.includes(e.id)),
    [allExercises, favoriteIds],
  );

  const filteredExercises = useMemo(() => {
    let list = allExercises;
    if (selectedEquipment.length > 0) {
      list = list.filter((e) => selectedEquipment.includes(e.equipment));
    }
    if (selectedDifficulty.length > 0) {
      list = list.filter((e) => selectedDifficulty.includes(e.difficulty));
    }
    // Remove favorites from main list when favorites section is shown
    if (favoriteIds.length > 0) {
      list = list.filter((e) => !favoriteIds.includes(e.id));
    }
    return list;
  }, [allExercises, selectedEquipment, selectedDifficulty, favoriteIds]);

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

  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      backgroundColor: `rgba(255, 107, 53, ${opacity['10']})`,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
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
  }), [colors]);

  if (!workout) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.emptyContainer}>
          <Text style={dynamicStyles.emptyText}>No active workout</Text>
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
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Dumbbell size={20} color={colors.primary} strokeWidth={2} />
          <Text style={dynamicStyles.workoutName} numberOfLines={1}>
            {workout.name}
          </Text>
        </View>
        <View style={dynamicStyles.timerBadge}>
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
            progressionSuggestion={suggestions.find(
              (s) => s.exerciseId === exercise.exerciseId,
            )}
            onCompleteSet={completeSet}
            onUpdateSet={updateSet}
            onAddSet={addSet}
            onAddWarmupSet={addWarmupSet}
            onUpdateNotes={updateExerciseNotes}
          />
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={dynamicStyles.bottomBar}>
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
        <Text style={dynamicStyles.sheetTitle}>Add Exercise</Text>

        {/* Create Custom Button */}
        <Pressable
          onPress={() => {
            setShowExerciseSheet(false);
            setShowCustomForm(true);
          }}
          style={[styles.createCustomButton, { borderColor: colors.primary, backgroundColor: `rgba(255, 107, 53, ${opacity['8']})` }]}
        >
          <Plus size={18} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.createCustomText, { color: colors.primary }]}>
            Create Custom Exercise
          </Text>
        </Pressable>

        <ExerciseFilters
          selectedEquipment={selectedEquipment}
          selectedDifficulty={selectedDifficulty}
          onEquipmentChange={setSelectedEquipment}
          onDifficultyChange={setSelectedDifficulty}
        />

        <FlatList
          data={filteredExercises}
          keyExtractor={exerciseKeyExtractor}
          showsVerticalScrollIndicator={false}
          getItemLayout={getExerciseItemLayout}
          initialNumToRender={15}
          ListHeaderComponent={
            favoriteExercises.length > 0 ? (
              <View style={styles.favoritesSection}>
                <View style={styles.favoritesSectionHeader}>
                  <Star size={14} color={colors.pr} fill={colors.pr} strokeWidth={2} />
                  <Text style={[styles.favoritesSectionTitle, { color: colors.pr }]}>
                    Favorites
                  </Text>
                </View>
                {favoriteExercises.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectExercise(item)}
                    onLongPress={() => setTooltipExercise(item)}
                    style={dynamicStyles.exerciseListItem}
                  >
                    <View style={styles.exerciseRow}>
                      <View style={styles.exerciseInfo}>
                        <View style={styles.exerciseNameRow}>
                          <Text style={dynamicStyles.exerciseListName}>{item.name}</Text>
                          {item.isCustom && (
                            <Tag
                              label="Custom"
                              color={colors.primary}
                              size="sm"
                              icon={<Sparkles size={9} color={colors.primary} strokeWidth={2} />}
                            />
                          )}
                        </View>
                        <Text style={dynamicStyles.exerciseListMuscle}>
                          {item.primaryMuscle} | {item.equipment}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                          toggleFavorite(item.id);
                        }}
                        hitSlop={8}
                      >
                        <Heart size={18} color="#EF4444" fill="#EF4444" strokeWidth={2} />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
                <View style={[styles.sectionDivider, { borderBottomColor: colors.border }]} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectExercise(item)}
              onLongPress={() => setTooltipExercise(item)}
              style={dynamicStyles.exerciseListItem}
            >
              <View style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={dynamicStyles.exerciseListName}>{item.name}</Text>
                    {item.isCustom && (
                      <Tag
                        label="Custom"
                        color={colors.primary}
                        size="sm"
                        icon={<Sparkles size={9} color={colors.primary} strokeWidth={2} />}
                      />
                    )}
                  </View>
                  <Text style={dynamicStyles.exerciseListMuscle}>
                    {item.primaryMuscle} | {item.equipment}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    toggleFavorite(item.id);
                  }}
                  hitSlop={8}
                >
                  <Heart
                    size={18}
                    color={favoriteIds.includes(item.id) ? '#EF4444' : colors.textTertiary}
                    fill={favoriteIds.includes(item.id) ? '#EF4444' : 'none'}
                    strokeWidth={2}
                  />
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      </BottomSheet>

      <CustomExerciseForm
        isOpen={showCustomForm}
        onClose={() => setShowCustomForm(false)}
      />

      {/* Exercise Detail Tooltip */}
      <Modal
        visible={tooltipExercise !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipExercise(null)}
      >
        <Pressable
          style={styles.tooltipOverlay}
          onPress={() => setTooltipExercise(null)}
        >
          <View style={styles.tooltipContainer}>
            {tooltipExercise && (
              <ExerciseDetailTooltip
                exercise={tooltipExercise}
                visible
                onClose={() => setTooltipExercise(null)}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  createCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  createCustomText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  favoritesSection: {
    marginBottom: spacing.sm,
  },
  favoritesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  favoritesSectionTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDivider: {
    borderBottomWidth: 1,
    marginTop: spacing.sm,
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  tooltipContainer: {
    width: '100%',
    maxWidth: 400,
  },
});
