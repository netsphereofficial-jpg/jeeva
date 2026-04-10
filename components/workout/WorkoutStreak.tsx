import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Trophy } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

interface WorkoutStreakProps {
  currentStreak: number;
  longestStreak: number;
}

export function WorkoutStreak({ currentStreak, longestStreak }: WorkoutStreakProps) {
  const { colors } = useAppTheme();

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        label: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 12,
          color: colors.textTertiary,
          marginTop: spacing.xs,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      <Card variant="glass" style={styles.card}>
        <View style={styles.cardContent}>
          <Flame size={20} color={colors.primary} strokeWidth={2} />
          <MonoText size={28} weight="bold" color={colors.textPrimary}>
            {currentStreak}
          </MonoText>
          <Text style={dynamicStyles.label}>Current Streak</Text>
        </View>
      </Card>
      <Card variant="glass" style={styles.card}>
        <View style={styles.cardContent}>
          <Trophy size={20} color={colors.pr} strokeWidth={2} />
          <MonoText size={28} weight="bold" color={colors.textPrimary}>
            {longestStreak}
          </MonoText>
          <Text style={dynamicStyles.label}>Longest Streak</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    flex: 1,
  },
  cardContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});
