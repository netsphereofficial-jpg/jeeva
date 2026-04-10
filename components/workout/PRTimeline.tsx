import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import type { PersonalRecord } from '@/types';

interface PRTimelineProps {
  records: PersonalRecord[];
}

function formatPRDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function PRTimeline({ records }: PRTimelineProps) {
  const { colors } = useAppTheme();

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 15,
          color: colors.textPrimary,
          marginBottom: spacing.md,
        },
        exerciseName: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 14,
          color: colors.textPrimary,
          flex: 1,
        },
        date: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 12,
          color: colors.textTertiary,
        },
      }),
    [colors],
  );

  if (records.length === 0) return null;

  return (
    <View>
      <Text style={dynamicStyles.title}>Recent PRs</Text>
      <View style={styles.list}>
        {records.map((pr) => (
          <View key={pr.id} style={styles.row}>
            <Trophy size={16} color={colors.pr} strokeWidth={2} />
            <View style={styles.info}>
              <Text style={dynamicStyles.exerciseName} numberOfLines={1}>
                {pr.exerciseName}
              </Text>
              <MonoText size={12} color={colors.textSecondary}>
                {pr.weight}kg x {pr.reps}
              </MonoText>
            </View>
            <Text style={dynamicStyles.date}>{formatPRDate(pr.date)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
