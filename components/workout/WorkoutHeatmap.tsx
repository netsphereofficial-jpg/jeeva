import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

interface HeatmapDataPoint {
  date: string;
  volume: number;
  count: number;
}

interface WorkoutHeatmapProps {
  data: HeatmapDataPoint[];
}

const WEEKS = 13;
const DAYS = 7;
const CELL_SIZE = 12;
const CELL_GAP = 2;
const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

function getOpacity(
  volume: number,
  maxVolume: number,
): number {
  if (volume === 0) return 0;
  const ratio = volume / maxVolume;
  if (ratio <= 0.25) return 0.2;
  if (ratio <= 0.5) return 0.5;
  if (ratio <= 0.75) return 0.8;
  return 1;
}

/**
 * GitHub-style 13x7 heatmap grid, aligned right to today.
 * Rows = days of week (Sun=0 .. Sat=6), Columns = weeks.
 */
export function WorkoutHeatmap({ data }: WorkoutHeatmapProps) {
  const { colors } = useAppTheme();

  const { grid, maxVolume } = useMemo(() => {
    // Build a lookup from date string to volume
    const lookup: Record<string, number> = {};
    let max = 1;
    for (const point of data) {
      lookup[point.date] = point.volume;
      if (point.volume > max) max = point.volume;
    }

    // Build the grid: 13 weeks x 7 days, ending at today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDay = today.getDay(); // 0=Sun

    // End of grid is today's position in its week column
    // Start date is (WEEKS * 7 - 1) days before the start of the current week column,
    // plus the day offset
    const endOfLastFullWeek = new Date(today);
    endOfLastFullWeek.setDate(today.getDate() - todayDay); // Sunday of current week

    const gridStartDate = new Date(endOfLastFullWeek);
    gridStartDate.setDate(gridStartDate.getDate() - (WEEKS - 1) * 7);

    const result: (number | null)[][] = [];
    for (let week = 0; week < WEEKS; week++) {
      const weekCol: (number | null)[] = [];
      for (let day = 0; day < DAYS; day++) {
        const cellDate = new Date(gridStartDate);
        cellDate.setDate(gridStartDate.getDate() + week * 7 + day);

        // Don't show future dates
        if (cellDate > today) {
          weekCol.push(null);
        } else {
          const dateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
          weekCol.push(lookup[dateStr] ?? 0);
        }
      }
      result.push(weekCol);
    }

    return { grid: result, maxVolume: max };
  }, [data]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 15,
          color: colors.textPrimary,
          marginBottom: spacing.md,
        },
        dayLabel: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 9,
          color: colors.textTertiary,
          width: 14,
          textAlign: 'right',
        },
      }),
    [colors],
  );

  return (
    <View>
      <Text style={dynamicStyles.title}>Activity</Text>
      <View style={styles.gridContainer}>
        {/* Day labels column */}
        <View style={styles.dayLabelsCol}>
          {DAY_LABELS.map((label, i) => (
            <Text
              key={`dl-${i}`}
              style={[
                dynamicStyles.dayLabel,
                { height: CELL_SIZE, lineHeight: CELL_SIZE },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>

        {/* Week columns */}
        <View style={styles.weeksRow}>
          {grid.map((week, weekIdx) => (
            <View key={`w-${weekIdx}`} style={styles.weekCol}>
              {week.map((volume, dayIdx) => {
                if (volume === null) {
                  return (
                    <View
                      key={`c-${weekIdx}-${dayIdx}`}
                      style={[styles.cell, { backgroundColor: 'transparent' }]}
                    />
                  );
                }
                const op = getOpacity(volume, maxVolume);
                const bgColor =
                  volume === 0
                    ? colors.surfaceGlass
                    : op === 1
                      ? colors.primary
                      : `${colors.primary}${Math.round(op * 255)
                          .toString(16)
                          .padStart(2, '0')}`;
                return (
                  <View
                    key={`c-${weekIdx}-${dayIdx}`}
                    style={[styles.cell, { backgroundColor: bgColor }]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    gap: CELL_GAP + 2,
  },
  dayLabelsCol: {
    gap: CELL_GAP,
  },
  weeksRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  weekCol: {
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
});
