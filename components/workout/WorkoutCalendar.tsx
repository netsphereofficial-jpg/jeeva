import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/theme/spacing';
import type { CompletedWorkout } from '@/types';

interface WorkoutCalendarProps {
  history: CompletedWorkout[];
  month: number; // 0-11
  year: number;
  onMonthChange: (month: number, year: number) => void;
  onDayPress?: (date: string, workouts: CompletedWorkout[]) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getWorkoutsByDate(history: CompletedWorkout[]): Map<string, CompletedWorkout[]> {
  const map = new Map<string, CompletedWorkout[]>();
  for (const w of history) {
    const date = new Date(w.startTime).toISOString().split('T')[0];
    const existing = map.get(date) ?? [];
    existing.push(w);
    map.set(date, existing);
  }
  return map;
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month, 1).getDay();
}

export function WorkoutCalendar({
  history,
  month,
  year,
  onMonthChange,
  onDayPress,
}: WorkoutCalendarProps) {
  const { colors, isDark } = useAppTheme();

  const workoutsByDate = useMemo(() => getWorkoutsByDate(history), [history]);
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const handlePrev = () => {
    if (month === 0) onMonthChange(11, year - 1);
    else onMonthChange(month - 1, year);
  };

  const handleNext = () => {
    if (month === 11) onMonthChange(0, year + 1);
    else onMonthChange(month + 1, year);
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
    monthTitle: {
      fontFamily: 'Outfit_700Bold',
      fontSize: 18,
      color: colors.textPrimary,
    },
    yearText: {
      fontFamily: 'JetBrainsMono_400Regular',
      fontSize: 13,
      color: colors.textTertiary,
    },
    dayLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 11,
      color: colors.textTertiary,
      textAlign: 'center',
    },
    dayNumber: {
      fontFamily: 'JetBrainsMono_400Regular',
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    dayNumberToday: {
      color: colors.primary,
      fontFamily: 'JetBrainsMono_700Bold',
    },
    dayNumberWorkout: {
      color: colors.textPrimary,
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 2,
    },
    dayCellToday: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    workoutDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.primary,
      marginTop: 2,
    },
    multipleDots: {
      flexDirection: 'row',
      gap: 2,
      marginTop: 2,
    },
    navButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceGlass,
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [colors]);

  // Build calendar grid
  const cells: (number | null)[] = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) cells.push(null);
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(300)}>
      <Card variant="default" style={styles.card}>
        {/* Month navigation */}
        <View style={styles.monthNav}>
          <Pressable onPress={handlePrev} style={dynamicStyles.navButton}>
            <ChevronLeft size={18} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
          <View style={styles.monthCenter}>
            <Text style={dynamicStyles.monthTitle}>{MONTH_NAMES[month]}</Text>
            <Text style={dynamicStyles.yearText}>{year}</Text>
          </View>
          <Pressable onPress={handleNext} style={dynamicStyles.navButton}>
            <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Day labels */}
        <View style={styles.dayLabelsRow}>
          {DAY_LABELS.map((label) => (
            <View key={label} style={dynamicStyles.dayCell}>
              <Text style={dynamicStyles.dayLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {cells.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={dynamicStyles.dayCell} />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const dayWorkouts = workoutsByDate.get(dateStr) ?? [];
            const hasWorkout = dayWorkouts.length > 0;

            return (
              <Pressable
                key={dateStr}
                style={[
                  dynamicStyles.dayCell,
                  isToday && dynamicStyles.dayCellToday,
                ]}
                onPress={() => onDayPress?.(dateStr, dayWorkouts)}
              >
                <Text
                  style={[
                    dynamicStyles.dayNumber,
                    isToday && dynamicStyles.dayNumberToday,
                    hasWorkout && dynamicStyles.dayNumberWorkout,
                  ]}
                >
                  {day}
                </Text>
                {hasWorkout && (
                  <View style={dynamicStyles.multipleDots}>
                    {dayWorkouts.slice(0, 3).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          dynamicStyles.workoutDot,
                          i > 0 && { backgroundColor: colors.health },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.lg,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  monthCenter: {
    alignItems: 'center',
    gap: 2,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
