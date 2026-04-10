import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dumbbell, Clock } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MonoText } from '@/components/ui/MonoText';
import { Tag } from '@/components/ui/Tag';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { VolumeTrendChart } from '@/components/workout/VolumeTrendChart';
import { MuscleGroupChart } from '@/components/workout/MuscleGroupChart';
import { PRTimeline } from '@/components/workout/PRTimeline';
import { WorkoutStreak } from '@/components/workout/WorkoutStreak';
import { WorkoutHeatmap } from '@/components/workout/WorkoutHeatmap';
import {
  getWeeklyVolume,
  getMuscleGroupDistribution,
  getRecentPRs,
  getWorkoutStreak,
  getWorkoutHeatmapData,
} from '@/utils/workoutAnalytics';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import type { CompletedWorkout } from '@/types';

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const SEGMENTS = ['History', 'Analytics'];

export default function WorkoutTabScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const history = useWorkoutStore((s) => s.history);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const [activeSegment, setActiveSegment] = useState(0);

  const handleStartWorkout = () => {
    router.push('/workout/new');
  };

  // Analytics data (memoized)
  const weeklyVolume = useMemo(() => getWeeklyVolume(history), [history]);
  const muscleGroups = useMemo(() => getMuscleGroupDistribution(history), [history]);
  const recentPRs = useMemo(() => getRecentPRs(personalRecords), [personalRecords]);
  const streak = useMemo(() => getWorkoutStreak(history), [history]);
  const heatmapData = useMemo(() => getWorkoutHeatmapData(history), [history]);

  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 28,
      color: colors.textPrimary,
    },
    historyName: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 16,
      color: colors.textPrimary,
      flex: 1,
      marginRight: spacing.md,
    },
    historyDate: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      color: colors.textTertiary,
    },
    sectionTitle: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 13,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.md,
    },
  }), [colors]);

  const renderHistoryItem = ({
    item,
    index,
  }: {
    item: CompletedWorkout;
    index: number;
  }) => (
    <Pressable onPress={() => router.push(`/workout/history/${item.id}`)}>
      <Card variant="default" animationIndex={index} style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={dynamicStyles.historyName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={dynamicStyles.historyDate}>{formatDate(item.startTime)}</Text>
        </View>
        <View style={styles.historyMeta}>
          <View style={styles.historyStatRow}>
            <Clock size={14} color={colors.textTertiary} strokeWidth={2} />
            <MonoText size={13} color={colors.textSecondary}>
              {formatDuration(item.durationSec)}
            </MonoText>
          </View>
          <MonoText size={13} color={colors.textSecondary}>
            {item.totalVolume.toLocaleString()} vol
          </MonoText>
          <MonoText size={13} color={colors.textSecondary}>
            {item.totalSets} sets
          </MonoText>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={dynamicStyles.title}>Workout</Text>
      </View>

      <View style={styles.ctaContainer}>
        <Button
          variant="primary"
          label="Start Workout"
          onPress={handleStartWorkout}
          icon={<Dumbbell size={20} color={colors.background} strokeWidth={2} />}
        />
      </View>

      <View style={styles.segmentContainer}>
        <SegmentedControl
          segments={SEGMENTS}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />
      </View>

      {activeSegment === 0 ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={Dumbbell}
              message="Complete your first workout to see history"
              actionLabel="Start Workout"
              onAction={handleStartWorkout}
            />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.analyticsContent}
          showsVerticalScrollIndicator={false}
        >
          {history.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              message="Complete workouts to see analytics"
              actionLabel="Start Workout"
              onAction={handleStartWorkout}
            />
          ) : (
            <>
              <WorkoutHeatmap data={heatmapData} />
              <WorkoutStreak
                currentStreak={streak.currentStreak}
                longestStreak={streak.longestStreak}
              />
              <Card variant="glass" style={styles.chartCard}>
                <VolumeTrendChart data={weeklyVolume} />
              </Card>
              <Card variant="glass" style={styles.chartCard}>
                <MuscleGroupChart data={muscleGroups} />
              </Card>
              <Card variant="glass" style={styles.chartCard}>
                <PRTimeline records={recentPRs} />
              </Card>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ctaContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  segmentContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  analyticsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  historyCard: {
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  historyStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chartCard: {
    // No extra spacing needed, gap handles it
  },
});
