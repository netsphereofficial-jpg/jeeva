import React, { useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, ArrowUp, ArrowDown, Flame } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { MonoText } from '@/components/ui/MonoText';
import { SetRow } from './SetRow';
import { useAppTheme } from '@/hooks/useAppTheme';
import { equipmentColors, difficultyColors, opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { WorkoutExercise, WorkoutSet, ProgressionSuggestionV2 } from '@/types';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  progressionSuggestion?: ProgressionSuggestionV2;
  onCompleteSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<WorkoutSet>,
  ) => void;
  onAddSet: (exerciseIndex: number) => void;
  onAddWarmupSet?: (exerciseIndex: number) => void;
  onUpdateNotes?: (exerciseIndex: number, notes: string) => void;
}

export function ExerciseCard({
  exercise,
  exerciseIndex,
  progressionSuggestion,
  onCompleteSet,
  onUpdateSet,
  onAddSet,
  onAddWarmupSet,
  onUpdateNotes,
}: ExerciseCardProps) {
  const { colors } = useAppTheme();
  const exerciseData = exercise.exercise;
  const currentSetIndex = exercise.sets.findIndex((s) => !s.completed);

  const handleAddSet = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAddSet(exerciseIndex);
  };

  const handleAddWarmupSet = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAddWarmupSet?.(exerciseIndex);
  };

  const suggestion = progressionSuggestion;
  const isIncrease =
    suggestion && suggestion.suggestedWeight > suggestion.currentWeight;
  const isDecrease =
    suggestion && suggestion.suggestedWeight < suggestion.currentWeight;
  const weightDiff = suggestion
    ? suggestion.suggestedWeight - suggestion.currentWeight
    : 0;

  const dynamicStyles = useMemo(() => StyleSheet.create({
    exerciseName: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 17,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    progressionIncrease: {
      backgroundColor: `rgba(16, 185, 129, ${opacity['10']})`,
    },
    progressionDecrease: {
      backgroundColor: `rgba(239, 68, 68, ${opacity['10']})`,
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
    warmupButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderLight,
      borderRadius: radius.md,
      minHeight: 40,
    },
    warmupText: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 13,
      color: colors.textTertiary,
    },
    notesInput: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      color: colors.textSecondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingVertical: spacing.sm,
      marginTop: spacing.md,
    },
  }), [colors]);

  return (
    <Card variant="default" style={styles.card}>
      <View style={styles.header}>
        <Text style={dynamicStyles.exerciseName}>
          {exerciseData?.name ?? exercise.exerciseId}
        </Text>
        <View style={styles.tags}>
          {exerciseData && (
            <>
              <Tag
                label={exerciseData.equipment}
                color={equipmentColors[exerciseData.equipment as keyof typeof equipmentColors] ?? colors.textSecondary}
              />
              <Tag
                label={exerciseData.difficulty}
                color={difficultyColors[exerciseData.difficulty as keyof typeof difficultyColors] ?? colors.textSecondary}
              />
            </>
          )}
        </View>
      </View>

      {suggestion && (isIncrease || isDecrease) && (
        <View
          style={[
            styles.progressionBadge,
            isIncrease ? dynamicStyles.progressionIncrease : dynamicStyles.progressionDecrease,
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

      <View style={dynamicStyles.tableHeader}>
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

      {onAddWarmupSet && (
        <Pressable onPress={handleAddWarmupSet} style={dynamicStyles.warmupButton}>
          <Flame size={16} color={colors.textTertiary} strokeWidth={2} />
          <Text style={dynamicStyles.warmupText}>Add Warmup</Text>
        </Pressable>
      )}

      <Pressable onPress={handleAddSet} style={dynamicStyles.addSetButton}>
        <Plus size={18} color={colors.textSecondary} strokeWidth={2} />
        <Text style={dynamicStyles.addSetText}>Add Set</Text>
      </Pressable>

      {onUpdateNotes && (
        <TextInput
          style={dynamicStyles.notesInput}
          placeholder="Add notes..."
          placeholderTextColor={colors.textTertiary}
          value={exercise.notes ?? ''}
          onChangeText={(text) => onUpdateNotes(exerciseIndex, text)}
        />
      )}
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
  progressionText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
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
});
