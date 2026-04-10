import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Moon } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { MonoText } from '@/components/ui/MonoText';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHealthStore } from '@/stores/healthStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { sleepStageColors, sleepStageColorsLight, opacity } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { SleepStage } from '@/types';

interface SleepCardProps {
  animationIndex?: number;
}

const STAGE_LABELS: Record<SleepStage, string> = {
  deep: 'Deep',
  rem: 'REM',
  light: 'Light',
  awake: 'Awake',
};

export function SleepCard({ animationIndex = 0 }: SleepCardProps) {
  const { colors, isDark } = useAppTheme();
  const healthData = useHealthStore((s) => s.data);

  const stageColors = isDark ? sleepStageColors : sleepStageColorsLight;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const sleepData = healthData.sleep.find((s) => s.date === todayStr)
    ?? (healthData.sleep.length > 0 ? healthData.sleep[healthData.sleep.length - 1] : null);

  const dynamicStyles = useMemo(() => StyleSheet.create({
    headerLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 15,
      color: colors.textPrimary,
    },
    qualityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: `rgba(139, 92, 246, ${opacity['12']})`,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 8,
    },
    qualityLabel: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.textSecondary,
    },
    legendText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.textSecondary,
    },
  }), [colors]);

  if (!sleepData) {
    return (
      <Card
        variant="tinted"
        tintColor={colors.sleep}
        animationIndex={animationIndex}
        style={styles.card}
      >
        <View style={styles.header}>
          <Moon size={18} color={colors.sleep} strokeWidth={2} />
          <Text style={dynamicStyles.headerLabel}>Sleep</Text>
        </View>
        <EmptyState icon={Moon} message="No sleep data yet" />
      </Card>
    );
  }

  const hours = Math.floor(sleepData.durationMin / 60);
  const mins = sleepData.durationMin % 60;
  const durationText = `${hours}h ${String(mins).padStart(2, '0')}m`;

  // Calculate stage durations
  const totalMin = sleepData.durationMin;
  const stageDurations: Record<SleepStage, number> = {
    deep: 0,
    rem: 0,
    light: 0,
    awake: 0,
  };

  for (const stage of sleepData.stages) {
    const duration = stage.endMin - stage.startMin;
    stageDurations[stage.stage] += duration;
  }

  const stageOrder: SleepStage[] = ['deep', 'rem', 'light', 'awake'];

  return (
    <Card
      variant="tinted"
      tintColor={colors.sleep}
      animationIndex={animationIndex}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <Moon size={18} color={colors.sleep} strokeWidth={2} />
        <Text style={dynamicStyles.headerLabel}>Sleep</Text>
      </View>

      {/* Duration + Quality */}
      <View style={styles.durationRow}>
        <MonoText size={28} weight="bold">
          {durationText}
        </MonoText>
        <View style={dynamicStyles.qualityBadge}>
          <MonoText size={14} weight="bold" color={colors.sleep}>
            {sleepData.quality}%
          </MonoText>
          <Text style={dynamicStyles.qualityLabel}>quality</Text>
        </View>
      </View>

      {/* Stage breakdown bar */}
      <View style={styles.stageBar}>
        {stageOrder.map((stage) => {
          const fraction = totalMin > 0 ? stageDurations[stage] / totalMin : 0;
          if (fraction <= 0) return null;
          return (
            <View
              key={stage}
              style={[
                styles.stageSegment,
                {
                  flex: fraction,
                  backgroundColor: stageColors[stage],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {stageOrder.map((stage) => {
          const mins = stageDurations[stage];
          if (mins <= 0) return null;
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          const durationLabel = h > 0 ? `${h}h ${m}m` : `${m}m`;
          return (
            <View key={stage} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: stageColors[stage] }]}
              />
              <Text style={dynamicStyles.legendText}>
                {STAGE_LABELS[stage]}
              </Text>
              <MonoText size={11} color={colors.textSecondary}>
                {durationLabel}
              </MonoText>
            </View>
          );
        })}
      </View>
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
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  stageBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
    marginBottom: spacing.md,
  },
  stageSegment: {
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
