import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart3 } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { MonoText } from '@/components/ui/MonoText';
import { useHealthStore } from '@/stores/healthStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { opacity } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface WeeklyStepsProps {
  animationIndex?: number;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const BAR_MAX_HEIGHT = 100;

function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  // Monday = 1; if Sunday (0), treat as end of week
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

export function WeeklySteps({ animationIndex = 0 }: WeeklyStepsProps) {
  const { colors } = useAppTheme();
  const stepsData = useHealthStore((s) => s.data.steps);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const weekDates = getWeekDates();
  const weekSteps = weekDates.map((date) => {
    const entry = stepsData.find((s) => s.date === date);
    return entry?.steps ?? 0;
  });

  const maxSteps = Math.max(...weekSteps, 1);

  // Determine today's index in the week (0=Mon)
  const todayIndex = weekDates.indexOf(todayStr);

  const dynamicStyles = useMemo(() => StyleSheet.create({
    headerLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 15,
      color: colors.textPrimary,
    },
    barCurrent: {
      width: 20,
      borderRadius: 6,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    barPast: {
      width: 20,
      borderRadius: 6,
      backgroundColor: `rgba(255, 107, 53, ${opacity['15']})`,
    },
    barFuture: {
      width: 20,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
  }), [colors]);

  return (
    <Card variant="default" animationIndex={animationIndex} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <BarChart3 size={18} color={colors.primary} strokeWidth={2} />
        <Text style={dynamicStyles.headerLabel}>Weekly Steps</Text>
      </View>

      {/* Bars */}
      <View style={styles.barsContainer}>
        {weekSteps.map((steps, index) => {
          const barHeight = maxSteps > 0
            ? Math.max((steps / maxSteps) * BAR_MAX_HEIGHT, 4)
            : 4;

          const isCurrent = index === todayIndex;
          const isFuture = todayIndex >= 0 && index > todayIndex;
          const isPast = todayIndex >= 0 && index < todayIndex;

          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                {isFuture ? (
                  <View
                    style={[
                      dynamicStyles.barFuture,
                      { height: 4 },
                    ]}
                  />
                ) : isCurrent ? (
                  <View
                    style={[
                      dynamicStyles.barCurrent,
                      { height: barHeight },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      dynamicStyles.barPast,
                      { height: barHeight },
                    ]}
                  />
                )}
              </View>
              <MonoText
                size={11}
                color={
                  isCurrent
                    ? colors.primary
                    : isPast
                      ? colors.textSecondary
                      : colors.textTertiary
                }
              >
                {DAY_LABELS[index]}
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
    marginBottom: spacing.xl,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 24,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
});
