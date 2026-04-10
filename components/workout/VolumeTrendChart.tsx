import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

interface VolumeTrendChartProps {
  data: { weekLabel: string; volume: number }[];
}

const BAR_MAX_HEIGHT = 120;

export function VolumeTrendChart({ data }: VolumeTrendChartProps) {
  const { colors } = useAppTheme();

  const maxVolume = useMemo(
    () => Math.max(...data.map((d) => d.volume), 1),
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
      }),
    [colors],
  );

  return (
    <View>
      <Text style={dynamicStyles.title}>Weekly Volume</Text>
      <View style={styles.chartRow}>
        {data.map((item) => {
          const height = Math.max(
            (item.volume / maxVolume) * BAR_MAX_HEIGHT,
            4,
          );
          return (
            <View key={item.weekLabel} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <MonoText size={10} color={colors.textTertiary} style={styles.label}>
                {item.weekLabel}
              </MonoText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 24,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  label: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
