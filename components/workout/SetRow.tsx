import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { NumberInput } from '@/components/ui/NumberInput';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { WorkoutSet } from '@/types';

interface SetRowProps {
  set: WorkoutSet;
  setIndex: number;
  exerciseIndex: number;
  isActive: boolean;
  isPR?: boolean;
  onComplete: () => void;
  onUpdate: (updates: Partial<WorkoutSet>) => void;
}

export function SetRow({
  set,
  setIndex,
  isActive,
  isPR,
  onComplete,
  onUpdate,
}: SetRowProps) {
  const isCompleted = set.completed;
  const isUpcoming = !isActive && !isCompleted;

  const handleComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onComplete();
  };

  return (
    <View
      style={[
        styles.row,
        isCompleted && styles.completedRow,
        isActive && !isCompleted && styles.activeRow,
        isUpcoming && styles.upcomingRow,
        isPR && styles.prRow,
      ]}
    >
      <View style={styles.setNumCol}>
        <MonoText
          size={14}
          color={isCompleted ? colors.textTertiary : colors.textSecondary}
        >
          {setIndex + 1}
        </MonoText>
      </View>

      <View style={styles.inputCol}>
        <NumberInput
          value={set.weight}
          onChange={(v) => onUpdate({ weight: v })}
          unit="kg"
          min={0}
          step={2.5}
          compact
        />
      </View>

      <View style={styles.inputCol}>
        <NumberInput
          value={set.reps}
          onChange={(v) => onUpdate({ reps: v })}
          min={0}
          max={100}
          step={1}
          compact
        />
      </View>

      <Pressable
        onPress={handleComplete}
        disabled={isCompleted}
        style={[
          styles.checkButton,
          isCompleted && styles.checkButtonCompleted,
          !isCompleted && styles.checkButtonEmpty,
        ]}
      >
        <Check
          size={20}
          color={isCompleted ? colors.health : colors.textTertiary}
          strokeWidth={2.5}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    borderRadius: radius.sm,
  },
  completedRow: {
    opacity: 0.6,
  },
  activeRow: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  upcomingRow: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    opacity: 0.7,
  },
  prRow: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  setNumCol: {
    width: 32,
    alignItems: 'center',
  },
  inputCol: {
    flex: 1,
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonEmpty: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  checkButtonCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
});
