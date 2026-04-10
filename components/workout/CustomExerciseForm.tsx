import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Sparkles } from 'lucide-react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCustomExerciseStore } from '@/stores/customExerciseStore';
import { opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { MuscleGroup, Equipment, Difficulty } from '@/types';

interface CustomExerciseFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const MUSCLE_GROUP_OPTIONS: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'quads', label: 'Legs' },
  { value: 'abs', label: 'Core' },
  { value: 'full_body', label: 'Full Body' },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'cable', label: 'Cable' },
  { value: 'machine', label: 'Machine' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'band', label: 'Band' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function CustomExerciseForm({ isOpen, onClose }: CustomExerciseFormProps) {
  const { colors } = useAppTheme();
  const addExercise = useCustomExerciseStore((s) => s.addExercise);

  const [name, setName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [notes, setNotes] = useState('');

  const isValid = name.trim().length > 0 && primaryMuscle !== null && equipment !== null && difficulty !== null;

  const resetForm = useCallback(() => {
    setName('');
    setPrimaryMuscle(null);
    setEquipment(null);
    setDifficulty(null);
    setNotes('');
  }, []);

  const handleCreate = useCallback(() => {
    if (!isValid || !primaryMuscle || !equipment || !difficulty) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    addExercise({
      name: name.trim(),
      primaryMuscle,
      secondaryMuscles: [],
      equipment,
      difficulty,
      isCustom: true,
      notes: notes.trim() || undefined,
    });

    resetForm();
    onClose();
  }, [isValid, name, primaryMuscle, equipment, difficulty, notes, addExercise, resetForm, onClose]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontFamily: 'Outfit_700Bold',
          fontSize: 22,
          color: colors.textPrimary,
        },
        sectionLabel: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 12,
          color: colors.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        nameInput: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 16,
          color: colors.textPrimary,
          backgroundColor: colors.inputBackground,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
        notesInput: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 14,
          color: colors.textPrimary,
          backgroundColor: colors.inputBackground,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          minHeight: 72,
          textAlignVertical: 'top',
        },
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
      }),
    [colors],
  );

  const renderChip = <T extends string>(
    item: { value: T; label: string },
    selected: T | null,
    onSelect: (value: T) => void,
  ) => {
    const isSelected = selected === item.value;
    return (
      <Pressable
        key={item.value}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onSelect(item.value);
        }}
        style={[
          styles.chip,
          isSelected ? dynamicStyles.chipSelected : dynamicStyles.chipDefault,
        ]}
      >
        <Text
          style={[
            styles.chipText,
            isSelected ? dynamicStyles.chipTextSelected : dynamicStyles.chipTextDefault,
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(400)} style={styles.content}>
          <View style={styles.titleRow}>
            <Sparkles size={22} color={colors.primary} strokeWidth={2} />
            <Text style={dynamicStyles.title}>Create Custom Exercise</Text>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionLabel}>Name *</Text>
            <TextInput
              style={dynamicStyles.nameInput}
              placeholder="Exercise name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          {/* Primary Muscle */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionLabel}>Primary Muscle Group *</Text>
            <View style={styles.chipWrap}>
              {MUSCLE_GROUP_OPTIONS.map((item) =>
                renderChip(item, primaryMuscle, setPrimaryMuscle),
              )}
            </View>
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionLabel}>Equipment *</Text>
            <View style={styles.chipWrap}>
              {EQUIPMENT_OPTIONS.map((item) =>
                renderChip(item, equipment, setEquipment),
              )}
            </View>
          </View>

          {/* Difficulty */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionLabel}>Difficulty *</Text>
            <View style={styles.chipWrap}>
              {DIFFICULTY_OPTIONS.map((item) =>
                renderChip(item, difficulty, setDifficulty),
              )}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionLabel}>Notes (optional)</Text>
            <TextInput
              style={dynamicStyles.notesInput}
              placeholder="Form cues, tips..."
              placeholderTextColor={colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            label="Create Exercise"
            onPress={handleCreate}
            disabled={!isValid}
            icon={<Sparkles size={18} color={colors.background} strokeWidth={2} />}
            style={styles.createButton}
          />
        </Animated.View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  chipText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  createButton: {
    marginTop: spacing.sm,
  },
});
