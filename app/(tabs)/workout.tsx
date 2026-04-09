import React from 'react';
import { View, Text, FlatList, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dumbbell, Clock } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MonoText } from '@/components/ui/MonoText';
import { Tag } from '@/components/ui/Tag';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWorkoutStore } from '@/stores/workoutStore';
import { colors } from '@/theme/colors';
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

export default function WorkoutTabScreen() {
  const router = useRouter();
  const history = useWorkoutStore((s) => s.history);

  const handleStartWorkout = () => {
    router.push('/workout/new');
  };

  const renderHistoryItem = ({
    item,
    index,
  }: {
    item: CompletedWorkout;
    index: number;
  }) => (
    <Card variant="default" animationIndex={index} style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.historyDate}>{formatDate(item.startTime)}</Text>
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
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout</Text>
      </View>

      <View style={styles.ctaContainer}>
        <Button
          variant="primary"
          label="Start Workout"
          onPress={handleStartWorkout}
          icon={<Dumbbell size={20} color="#0A0A0F" strokeWidth={2} />}
        />
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: colors.textPrimary,
  },
  ctaContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
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
});
