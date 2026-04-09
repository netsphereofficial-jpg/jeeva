import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { MonoText } from '@/components/ui/MonoText';
import { Tag } from '@/components/ui/Tag';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface TrendData {
  data: number[];
  labels: string[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  color: string;
  trend?: TrendData;
  comingSoon?: boolean;
  animationIndex?: number;
}

export function MetricCard({
  title,
  value,
  unit,
  icon: IconComponent,
  color,
  trend,
  comingSoon = false,
  animationIndex = 0,
}: MetricCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    if (comingSoon || !trend) return;
    setExpanded((prev) => !prev);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(animationIndex * 80).duration(400)}
      layout={LinearTransition.duration(300)}
    >
      <Pressable
        onPress={handlePress}
        disabled={comingSoon}
        style={({ pressed }) => [
          styles.container,
          {
            borderColor: `${color}14`,
            backgroundColor: `${color}08`,
          },
          pressed && !comingSoon && styles.pressed,
          comingSoon && styles.comingSoon,
        ]}
      >
        {/* Header Row */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: `${color}1A` }]}>
            <IconComponent
              size={18}
              color={comingSoon ? colors.textTertiary : color}
              strokeWidth={2}
            />
          </View>
          {comingSoon && <Tag label="Coming Soon" color={colors.textTertiary} />}
        </View>

        {/* Value */}
        <View style={styles.valueRow}>
          <MonoText
            size={28}
            weight="bold"
            color={comingSoon ? colors.textTertiary : colors.textPrimary}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </MonoText>
          {unit && (
            <Text
              style={[
                styles.unit,
                comingSoon && { color: colors.textTertiary },
              ]}
            >
              {unit}
            </Text>
          )}
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            comingSoon && { color: colors.textTertiary },
          ]}
        >
          {title}
        </Text>

        {/* Expanded Trend */}
        {expanded && trend && trend.data.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(250)}
            style={styles.trendContainer}
          >
            <TrendBars data={trend.data} labels={trend.labels} color={color} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── Trend Bar Chart ─────────────────────────────────────────────

function TrendBars({
  data,
  labels,
  color,
}: {
  data: number[];
  labels: string[];
  color: string;
}) {
  const maxVal = Math.max(...data, 1);

  return (
    <View style={styles.barsRow}>
      {data.map((val, i) => {
        const heightPercent = (val / maxVal) * 100;
        return (
          <View key={i} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${Math.max(heightPercent, 4)}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>
              {labels[i] ?? ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  comingSoon: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 2,
  },
  unit: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },
  trendContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 3,
    minHeight: 3,
  },
  barLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: colors.textTertiary,
    marginTop: 4,
  },
});
