import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TrendingUp, Flame, Trophy, Hash } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useWorkoutStore } from '@/stores/workoutStore';
import { spacing } from '@/theme/spacing';

interface WeeklySummaryProps {
  animationIndex?: number;
}

export function WeeklySummary({ animationIndex = 0 }: WeeklySummaryProps) {
  const { colors } = useAppTheme();
  const history = useWorkoutStore((s) => s.history);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    const thisWeek = history.filter((w) => w.startTime >= weekAgo.getTime());
    const totalVolume = thisWeek.reduce((s, w) => s + w.totalVolume, 0);
    const totalSets = thisWeek.reduce((s, w) => s + w.totalSets, 0);
    const weekPRs = personalRecords.filter((pr) => pr.date >= weekAgo.getTime());

    return {
      workouts: thisWeek.length,
      volume: totalVolume,
      sets: totalSets,
      prs: weekPRs.length,
    };
  }, [history, personalRecords]);

  // Don't show if no workouts this week
  if (stats.workouts === 0) return null;

  const formatVolume = (v: number): string => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return String(v);
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
    title: {
      fontFamily: 'Outfit_700Bold',
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    statValue: {
      fontFamily: 'JetBrainsMono_700Bold',
      fontSize: 20,
    },
    statLabel: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.textTertiary,
      marginTop: 2,
    },
  }), [colors]);

  const items = [
    { icon: Flame, value: String(stats.workouts), label: 'Workouts', color: colors.primary },
    { icon: TrendingUp, value: formatVolume(stats.volume), label: 'Volume', color: colors.health },
    { icon: Hash, value: String(stats.sets), label: 'Sets', color: colors.water },
    { icon: Trophy, value: String(stats.prs), label: 'PRs', color: stats.prs > 0 ? colors.pr : colors.textTertiary },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(animationIndex * 60).duration(400)}
      style={styles.container}
    >
      <Card variant="default">
        <Text style={dynamicStyles.title}>This Week</Text>
        <View style={styles.statsRow}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <View key={item.label} style={styles.statItem}>
                <Icon size={16} color={item.color} strokeWidth={2} />
                <MonoText size={20} weight="bold" color={item.color}>
                  {item.value}
                </MonoText>
                <Text style={dynamicStyles.statLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
});
