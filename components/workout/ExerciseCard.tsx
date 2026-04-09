import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { MonoText } from '@/components/ui/MonoText';
import { SetRow } from './SetRow';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { WorkoutExercise, WorkoutSet, ProgressionSuggestion } from '@/types';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  progressionSuggestion?: ProgressionSuggestion;
  onCompleteSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<WorkoutSet>,
  ) => void;
  onAddSet: (exerciseIndex: number) => void;
}

const equipmentColors: Record<string, string> = {
  barbell: '#8B5CF6',
  dumbbell: '#38BDF8',
  cable: '#F59E0B',
  machine: '#10B981',
  bodyweight: '#EF4444',
  kettlebell: '#FF6B35',
  band: '#EC4899',
  other: '#6B7280',
};

const difficultyColors: Record<string, string> = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
};

export function ExerciseCard({
  exercise,
  exerciseIndex,
  progressionSuggestion,
  onCompleteSet,
  onUpdateSet,
  onAddSet,
}: ExerciseCardProps) {
  const exerciseData = exercise.exercise;
  const currentSetIndex = exercise.sets.findIndex((s) => !s.completed);

  const handleAddSet = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAddSet(exerciseIndex);
  };

  const suggestion = progressionSuggestion;
  const isIncrease =
    suggestion && suggestion.suggestedWeight > suggestion.currentWeight;
  const isDecrease =
    suggestion && suggestion.suggestedWeight < suggestion.currentWeight;
  const weightDiff = suggestion
    ? suggestion.suggestedWeight - suggestion.currentWeight
    : 0;

  return (
    <Card variant="default" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>
          {exerciseData?.name ?? exercise.exerciseId}
        </Text>
        <View style={styles.tags}>
          {exerciseData && (
            <>
              <Tag
                label={exerciseData.equipment}
                color={equipmentColors[exerciseData.equipment] ?? colors.textSecondary}
              />
              <Tag
                label={exerciseData.difficulty}
                color={difficultyColors[exerciseData.difficulty] ?? colors.textSecondary}
              />
            </>
          )}
        </View>
      </View>

      {suggestion && (isIncrease || isDecrease) && (
        <View
          style={[
            styles.progressionBadge,
            isIncrease ? styles.progressionIncrease : styles.progressionDecrease,
          ]}
        >
          {isIncrease ? (
            <ArrowUp size={14} color={colors.health} strokeWidth={2.5} />
          ) : (
            <ArrowDown size={14} color={colors.heart} strokeWidth={2.5} />
          )}
          <Text
            style={[
              styles.progressionText,
              { color: isIncrease ? colors.health : colors.heart },
            ]}
          >
            {weightDiff > 0 ? '+' : ''}
            {weightDiff}kg
          </Text>
        </View>
      )}

      <View style={styles.tableHeader}>
        <View style={styles.setNumCol}>
          <MonoText size={11} color={colors.textTertiary}>
            SET
          </MonoText>
        </View>
        <View style={styles.inputCol}>
          <MonoText size={11} color={colors.textTertiary}>
            WEIGHT
          </MonoText>
        </View>
        <View style={styles.inputCol}>
          <MonoText size={11} color={colors.textTertiary}>
            REPS
          </MonoText>
        </View>
        <View style={styles.checkCol}>
          <MonoText size={11} color={colors.textTertiary}>
            {'\u2713'}
          </MonoText>
        </View>
      </View>

      {exercise.sets.map((set, setIdx) => (
        <SetRow
          key={set.id}
          set={set}
          setIndex={setIdx}
          exerciseIndex={exerciseIndex}
          isActive={setIdx === currentSetIndex}
          onComplete={() => onCompleteSet(exerciseIndex, setIdx)}
          onUpdate={(updates) => onUpdateSet(exerciseIndex, setIdx, updates)}
        />
      ))}

      <Pressable onPress={handleAddSet} style={styles.addSetButton}>
        <Plus size={18} color={colors.textSecondary} strokeWidth={2} />
        <Text style={styles.addSetText}>Add Set</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  exerciseName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  progressionIncrease: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  progressionDecrease: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  progressionText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  setNumCol: {
    width: 32,
    alignItems: 'center',
  },
  inputCol: {
    flex: 1,
  },
  checkCol: {
    width: 44,
    alignItems: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    minHeight: 48,
  },
  addSetText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
});
