import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Heart, Sparkles, X } from 'lucide-react-native';
import { Tag } from '@/components/ui/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCustomExerciseStore } from '@/stores/customExerciseStore';
import { equipmentColors, difficultyColors, opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { shadows } from '@/theme/shadows';
import type { Exercise } from '@/types';

interface ExerciseDetailTooltipProps {
  exercise: Exercise;
  visible: boolean;
  onClose: () => void;
}

export function ExerciseDetailTooltip({
  exercise,
  visible,
  onClose,
}: ExerciseDetailTooltipProps) {
  const { colors } = useAppTheme();
  const toggleFavorite = useCustomExerciseStore((s) => s.toggleFavorite);
  const isFavorite = useCustomExerciseStore((s) => s.favoriteIds.includes(exercise.id));

  const handleToggleFavorite = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(exercise.id);
  }, [exercise.id, toggleFavorite]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.lg,
        },
        name: {
          fontFamily: 'Outfit_700Bold',
          fontSize: 18,
          color: colors.textPrimary,
        },
        label: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 11,
          color: colors.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        closeButton: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        favButton: {
          backgroundColor: isFavorite
            ? `rgba(239, 68, 68, ${opacity['12']})`
            : colors.surface,
          borderWidth: 1,
          borderColor: isFavorite ? '#EF4444' : colors.borderLight,
        },
        favText: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 13,
          color: isFavorite ? '#EF4444' : colors.textSecondary,
        },
      }),
    [colors, isFavorite],
  );

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[styles.container, dynamicStyles.container]}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={dynamicStyles.name} numberOfLines={2}>
            {exercise.name}
          </Text>
          {exercise.isCustom && (
            <Tag
              label="Custom"
              color={colors.primary}
              size="sm"
              icon={<Sparkles size={10} color={colors.primary} strokeWidth={2} />}
            />
          )}
        </View>
        <Pressable onPress={onClose} style={[styles.closeBtn, dynamicStyles.closeButton]}>
          <X size={16} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={styles.tagsRow}>
        <View style={styles.tagGroup}>
          <Text style={dynamicStyles.label}>Muscle</Text>
          <Tag
            label={exercise.primaryMuscle}
            color={colors.primary}
          />
        </View>
        <View style={styles.tagGroup}>
          <Text style={dynamicStyles.label}>Equipment</Text>
          <Tag
            label={exercise.equipment}
            color={
              equipmentColors[exercise.equipment as keyof typeof equipmentColors] ??
              colors.textSecondary
            }
          />
        </View>
        <View style={styles.tagGroup}>
          <Text style={dynamicStyles.label}>Level</Text>
          <Tag
            label={exercise.difficulty}
            color={
              difficultyColors[exercise.difficulty as keyof typeof difficultyColors] ??
              colors.textSecondary
            }
          />
        </View>
      </View>

      <Pressable
        onPress={handleToggleFavorite}
        style={[styles.favButton, dynamicStyles.favButton]}
      >
        <Heart
          size={16}
          color={isFavorite ? '#EF4444' : colors.textSecondary}
          fill={isFavorite ? '#EF4444' : 'none'}
          strokeWidth={2}
        />
        <Text style={dynamicStyles.favText}>
          {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  tagGroup: {
    gap: spacing.xs,
  },
  favButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
});
