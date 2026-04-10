import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Footprints, Flame, HeartPulse } from 'lucide-react-native';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { MonoText } from '@/components/ui/MonoText';
import { useHealthStore } from '@/stores/healthStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import { formatNumber } from '@/utils/formatters';

interface QuickStatsProps {
  animationIndex?: number;
}

export function QuickStats({ animationIndex = 0 }: QuickStatsProps) {
  const { colors } = useAppTheme();
  const healthData = useHealthStore((s) => s.data);
  const stepGoal = useSettingsStore((s) => s.settings.dailyStepGoal);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const todaySteps = healthData.steps.find((s) => s.date === todayStr);
  const stepCount = todaySteps?.steps ?? 0;
  const stepProgress = stepGoal > 0 ? Math.min(stepCount / stepGoal, 1) : 0;

  const calories = todaySteps?.caloriesBurned ?? 0;
  const caloriesGoal = 500;
  const caloriesProgress = caloriesGoal > 0 ? Math.min(calories / caloriesGoal, 1) : 0;

  const latestHr = healthData.heartRate.length > 0
    ? healthData.heartRate[healthData.heartRate.length - 1].bpm
    : 0;
  const hrProgress = latestHr > 0 ? Math.min(latestHr / 200, 1) : 0;

  const cards = [
    {
      icon: Footprints,
      color: colors.primary,
      value: stepCount > 0 ? formatNumber(stepCount) : '\u2014',
      label: 'Steps',
      progress: stepProgress,
    },
    {
      icon: Flame,
      color: colors.primary,
      value: calories > 0 ? formatNumber(calories) : '\u2014',
      label: 'Calories',
      progress: caloriesProgress,
    },
    {
      icon: HeartPulse,
      color: colors.heart,
      value: latestHr > 0 ? `${latestHr}` : '\u2014',
      label: 'Heart Rate',
      progress: hrProgress,
    },
  ];

  const dynamicStyles = useMemo(() => StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.surfaceGlassBorder,
      borderRadius: 16,
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.sm,
      gap: spacing.sm,
    },
    label: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  }), [colors]);

  return (
    <View style={styles.row}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Animated.View
            key={card.label}
            entering={FadeInDown.delay((animationIndex + index) * 80).duration(400)}
            style={dynamicStyles.card}
          >
            <CircularProgress
              progress={card.progress}
              size={64}
              color={card.color}
              strokeWidth={5}
            >
              <Icon size={22} color={card.color} strokeWidth={2} />
            </CircularProgress>
            <MonoText size={18} weight="bold" style={styles.value}>
              {card.value}
            </MonoText>
            <Text style={dynamicStyles.label}>{card.label}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  value: {
    marginTop: spacing.xs,
  },
});
