import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import type { ThemeColors } from '@/theme/colors';

interface MuscleGroupChartProps {
  data: { group: string; sets: number; color: string }[];
}

function resolveColor(colorToken: string, colors: ThemeColors): string {
  // colorToken is a key like 'primary', 'water', 'sleep' etc.
  return (colors as Record<string, string>)[colorToken] ?? colors.primary;
}

export function MuscleGroupChart({ data }: MuscleGroupChartProps) {
  const { colors } = useAppTheme();

  const maxSets = useMemo(
    () => Math.max(...data.map((d) => d.sets), 1),
    [data],
  );

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 15,
          color: colors.textPrimary,
          marginBottom: spacing.md,
        },
        groupLabel: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 13,
          color: colors.textSecondary,
          width: 72,
          textTransform: 'capitalize',
        },
      }),
    [colors],
  );

  if (data.length === 0) return null;

  return (
    <View>
      <Text style={dynamicStyles.title}>Muscle Groups (30d)</Text>
      <View style={styles.rows}>
        {data.map((item) => {
          const barWidth = Math.max((item.sets / maxSets) * 100, 4);
          const barColor = resolveColor(item.color, colors);
          return (
            <View key={item.group} style={styles.row}>
              <Text style={dynamicStyles.groupLabel}>{item.group}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${barWidth}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <MonoText size={12} color={colors.textSecondary} style={styles.setCount}>
                {item.sets}
              </MonoText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  setCount: {
    width: 28,
    textAlign: 'right',
  },
});
