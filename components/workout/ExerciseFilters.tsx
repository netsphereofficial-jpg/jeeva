import React, { useMemo, useCallback } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
] as const;

const DIFFICULTY_OPTIONS = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

interface ExerciseFiltersProps {
  selectedEquipment: string[];
  selectedDifficulty: string[];
  onEquipmentChange: (equipment: string[]) => void;
  onDifficultyChange: (difficulty: string[]) => void;
}

export function ExerciseFilters({
  selectedEquipment,
  selectedDifficulty,
  onEquipmentChange,
  onDifficultyChange,
}: ExerciseFiltersProps) {
  const { colors } = useAppTheme();

  const toggleEquipment = useCallback(
    (item: string) => {
      const lower = item.toLowerCase();
      if (selectedEquipment.includes(lower)) {
        onEquipmentChange(selectedEquipment.filter((e) => e !== lower));
      } else {
        onEquipmentChange([...selectedEquipment, lower]);
      }
    },
    [selectedEquipment, onEquipmentChange],
  );

  const toggleDifficulty = useCallback(
    (item: string) => {
      const lower = item.toLowerCase();
      if (selectedDifficulty.includes(lower)) {
        onDifficultyChange(selectedDifficulty.filter((d) => d !== lower));
      } else {
        onDifficultyChange([...selectedDifficulty, lower]);
      }
    },
    [selectedDifficulty, onDifficultyChange],
  );

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        chipDefault: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        chipSelected: {
          backgroundColor: `rgba(255, 107, 53, ${opacity['12']})`,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        chipTextDefault: {
          color: colors.textSecondary,
        },
        chipTextSelected: {
          color: colors.primary,
        },
        sectionLabel: {
          color: colors.textTertiary,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.label, dynamicStyles.sectionLabel]}>Equipment</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {EQUIPMENT_OPTIONS.map((item) => {
            const isSelected = selectedEquipment.includes(item.toLowerCase());
            return (
              <Pressable
                key={item}
                onPress={() => toggleEquipment(item)}
                style={[
                  styles.chip,
                  isSelected
                    ? dynamicStyles.chipSelected
                    : dynamicStyles.chipDefault,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected
                      ? dynamicStyles.chipTextSelected
                      : dynamicStyles.chipTextDefault,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, dynamicStyles.sectionLabel]}>Difficulty</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {DIFFICULTY_OPTIONS.map((item) => {
            const isSelected = selectedDifficulty.includes(item.toLowerCase());
            return (
              <Pressable
                key={item}
                onPress={() => toggleDifficulty(item)}
                style={[
                  styles.chip,
                  isSelected
                    ? dynamicStyles.chipSelected
                    : dynamicStyles.chipDefault,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected
                      ? dynamicStyles.chipTextSelected
                      : dynamicStyles.chipTextDefault,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  chipText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
});
