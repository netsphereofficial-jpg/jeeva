import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TrendingUp, TrendingDown, Minus, Trophy, Flame, Heart, Droplets, Moon, Zap } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/theme/spacing';
import type { WorkoutInsight } from '@/utils/workoutInsights';

interface InsightCardProps {
  insight: WorkoutInsight;
  index: number;
}

const COLOR_MAP: Record<string, (colors: Record<string, string>) => string> = {
  primary: (c) => c.primary,
  health: (c) => c.health,
  pr: (c) => c.pr,
  water: (c) => c.water,
  sleep: (c) => c.sleep,
  heart: (c) => c.heart,
};

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const TYPE_ICONS: Record<string, typeof Trophy> = {
  volume_comparison: Zap,
  pr_count: Trophy,
  streak: Flame,
  recovery: Moon,
  muscle_hit: Heart,
};

export function InsightCard({ insight, index }: InsightCardProps) {
  const { colors, isDark } = useAppTheme();
  const accentColor = COLOR_MAP[insight.color]?.(colors) ?? colors.primary;
  const TrendIcon = TREND_ICONS[insight.trend];
  const TypeIcon = TYPE_ICONS[insight.type] ?? Zap;

  const dynamicStyles = useMemo(() => StyleSheet.create({
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark
        ? `${accentColor}15`
        : `${accentColor}10`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: 'Outfit_600SemiBold',
      fontSize: 15,
      color: colors.textPrimary,
    },
    description: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 16,
    },
  }), [colors, isDark, accentColor]);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify().damping(14)}>
      <Card variant="default" style={styles.card}>
        <View style={styles.row}>
          <View style={dynamicStyles.iconCircle}>
            <TypeIcon size={18} color={accentColor} strokeWidth={2} />
          </View>

          <View style={styles.textSection}>
            <View style={styles.titleRow}>
              <Text style={dynamicStyles.title}>{insight.title}</Text>
              <View style={styles.valueRow}>
                <TrendIcon
                  size={14}
                  color={accentColor}
                  strokeWidth={2}
                />
                <MonoText size={16} weight="bold" color={accentColor}>
                  {insight.value}
                </MonoText>
              </View>
            </View>
            <Text style={dynamicStyles.description} numberOfLines={2}>
              {insight.description}
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  textSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
