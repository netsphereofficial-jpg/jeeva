import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Dumbbell, CalendarCheck, Play } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useTemplateStore } from '@/stores/templateStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

interface GoalProgressProps {
  animationIndex?: number;
}

export function GoalProgress({ animationIndex = 0 }: GoalProgressProps) {
  const { colors } = useAppTheme();
  const getTodaysTemplate = useTemplateStore((s) => s.getTodaysTemplate);
  const template = getTodaysTemplate();
  const router = useRouter();

  const handleStartWorkout = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/workout/new');
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
    headerLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 15,
      color: colors.textPrimary,
    },
    templateName: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 20,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    description: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    noTemplateText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
  }), [colors]);

  if (!template) {
    return (
      <Card
        variant="tinted"
        tintColor={colors.primary}
        animationIndex={animationIndex}
        style={styles.card}
      >
        <View style={styles.header}>
          <Dumbbell size={18} color={colors.primary} strokeWidth={2} />
          <Text style={dynamicStyles.headerLabel}>Today's Workout</Text>
        </View>
        <Text style={dynamicStyles.noTemplateText}>
          No workout scheduled for today
        </Text>
        <Button
          variant="primary"
          label="Start Workout"
          onPress={handleStartWorkout}
          icon={<Play size={18} color={colors.background} fill={colors.background} strokeWidth={0} />}
          style={styles.ctaButton}
        />
      </Card>
    );
  }

  const exerciseCount = template.exercises.length;
  const muscleGroups = [
    ...new Set(template.exercises.map((e) => e.exercise.primaryMuscle)),
  ];
  const muscleText = muscleGroups.slice(0, 3).join(', ');

  return (
    <Card
      variant="tinted"
      tintColor={colors.primary}
      animationIndex={animationIndex}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <Dumbbell size={18} color={colors.primary} strokeWidth={2} />
        <Text style={dynamicStyles.headerLabel}>Today's Workout</Text>
      </View>

      {/* Template name */}
      <Text style={dynamicStyles.templateName}>{template.name}</Text>

      {/* Description */}
      <Text style={dynamicStyles.description}>
        {muscleText} \u00B7 {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
      </Text>

      {/* Scheduled badge */}
      <View style={styles.badgeRow}>
        <Tag label="Scheduled" color={colors.primary} />
        <View style={styles.calendarBadge}>
          <CalendarCheck size={14} color={colors.primary} strokeWidth={2} />
        </View>
      </View>

      {/* CTA Button */}
      <Button
        variant="primary"
        label="Start Workout \u2192"
        onPress={handleStartWorkout}
        icon={<Play size={18} color={colors.background} fill={colors.background} strokeWidth={0} />}
        style={styles.ctaButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  calendarBadge: {
    padding: spacing.xs,
  },
  ctaButton: {
    marginTop: spacing.xs,
  },
});
