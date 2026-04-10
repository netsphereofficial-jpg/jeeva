import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

interface HeatmapEntry {
  date: string;
  status: 'taken' | 'missed' | 'future';
}

interface CalendarHeatmapProps {
  data: HeatmapEntry[];
}

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

function getTodayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const { colors, isDark } = useAppTheme();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const todayStr = getTodayStr();

  // Calculate leading empty cells based on the first date's day of week
  const firstDate = data.length > 0 ? new Date(data[0].date + 'T00:00:00') : new Date();
  const leadingBlanks = firstDate.getDay();

  const handleCellPress = (entry: HeatmapEntry) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDate((prev) => (prev === entry.date ? null : entry.date));
  };

  const STATUS_COLORS: Record<HeatmapEntry['status'], string> = useMemo(() => ({
    taken: colors.health,
    missed: colors.heart,
    future: colors.surfaceGlass,
  }), [colors]);

  const dynamicStyles = useMemo(() => StyleSheet.create({
    headerText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 12,
      color: colors.textTertiary,
      textTransform: 'uppercase',
    },
    todayBorder: {
      borderWidth: 2,
      borderColor: colors.textPrimary,
    },
    selectedBorder: {
      borderWidth: 2,
      borderColor: colors.textPrimary,
    },
  }), [colors]);

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Day headers */}
      <View style={styles.headerRow}>
        {DAY_HEADERS.map((day, i) => (
          <View key={`header-${i}`} style={styles.headerCell}>
            <Text style={dynamicStyles.headerText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {/* Leading blank cells */}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <View key={`blank-${i}`} style={styles.cell} />
        ))}

        {/* Data cells */}
        {data.map((entry) => {
          const isToday = entry.date === todayStr;
          const isSelected = entry.date === selectedDate;
          return (
            <Pressable
              key={entry.date}
              onPress={() => handleCellPress(entry)}
              style={styles.cell}
              hitSlop={8}
              accessibilityLabel={`${entry.date}: ${entry.status}`}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.cellInner,
                  { backgroundColor: STATUS_COLORS[entry.status] },
                  isToday && dynamicStyles.todayBorder,
                  isSelected && dynamicStyles.selectedBorder,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const CELL_SIZE = 32;
const CELL_GAP = 4;

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  headerCell: {
    width: CELL_SIZE,
    marginRight: CELL_GAP,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    marginRight: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  cellInner: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
  },
});
