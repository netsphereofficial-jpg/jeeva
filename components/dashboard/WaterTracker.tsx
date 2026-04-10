import React, { useEffect, useMemo } from 'react';
import { AccessibilityInfo, View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Droplets, Undo2, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { MonoText } from '@/components/ui/MonoText';
import { useWaterStore } from '@/stores/waterStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { opacity } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatNumber } from '@/utils/formatters';

interface WaterTrackerProps {
  animationIndex?: number;
}

const QUICK_AMOUNTS = [150, 250, 500] as const;

export function WaterTracker({ animationIndex = 0 }: WaterTrackerProps) {
  const { colors } = useAppTheme();
  const addWater = useWaterStore((s) => s.addWater);
  const undoLast = useWaterStore((s) => s.undoLast);
  const entries = useWaterStore((s) => s.entries);
  const goal = useWaterStore((s) => s.goal);

  // Compute today's total reactively from entries
  const total = React.useMemo(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return entries
      .filter((e) => {
        const d = new Date(e.timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === today;
      })
      .reduce((sum, e) => sum + e.amountMl, 0);
  }, [entries]);
  const progress = goal > 0 ? Math.min(total / goal, 1) : 0;
  const isComplete = total >= goal;

  const ringScale = useSharedValue(1);

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  useEffect(() => {
    if (isComplete) {
      ringScale.value = withSequence(
        withSpring(1.12, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      );
    }
  }, [isComplete, ringScale]);

  const handleAdd = (amount: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    addWater(amount);
    const newTotal = total + amount;
    AccessibilityInfo.announceForAccessibility(
      `Added ${amount} milliliters. Total: ${newTotal} of ${goal} milliliters`,
    );
  };

  const handleUndo = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    undoLast();
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
    headerLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 15,
      color: colors.textPrimary,
    },
    goalText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      color: colors.textSecondary,
    },
    progressBarBg: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: colors.water,
    },
    quickButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      borderRadius: 12,
      backgroundColor: `rgba(56, 189, 248, ${opacity['8']})`,
      borderWidth: 1,
      borderColor: `rgba(56, 189, 248, ${opacity['12']})`,
    },
  }), [colors]);

  return (
    <Card
      variant="tinted"
      tintColor={colors.water}
      animationIndex={animationIndex}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Droplets size={18} color={colors.water} strokeWidth={2} />
          <Text style={dynamicStyles.headerLabel}>Hydration</Text>
        </View>
        <Pressable
          onPress={handleUndo}
          hitSlop={12}
          accessibilityLabel="Undo last water entry"
          accessibilityRole="button"
        >
          <Undo2 size={18} color={colors.textTertiary} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Left: Ring */}
        <Animated.View style={ringAnimatedStyle}>
          <CircularProgress
            progress={progress}
            size={88}
            color={colors.water}
            strokeWidth={7}
            gradientColors={['#38BDF8', '#0EA5E9']}
          >
            <MonoText size={16} weight="bold" color={colors.water}>
              {Math.round(progress * 100)}%
            </MonoText>
          </CircularProgress>
        </Animated.View>

        {/* Right: Stats */}
        <View style={styles.stats}>
          <MonoText size={28} weight="bold">
            {formatNumber(total)}
          </MonoText>
          <Text style={dynamicStyles.goalText}>
            of {formatNumber(goal)} ml
          </Text>
          {/* Thin progress bar */}
          <View style={dynamicStyles.progressBarBg}>
            <View
              style={[
                dynamicStyles.progressBarFill,
                { width: `${Math.min(progress * 100, 100)}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Quick add buttons */}
      <View style={styles.quickButtons}>
        {QUICK_AMOUNTS.map((amount) => (
          <Pressable
            key={amount}
            style={dynamicStyles.quickButton}
            onPress={() => handleAdd(amount)}
            accessibilityLabel={`Add ${amount} milliliters`}
            accessibilityRole="button"
          >
            <Plus size={14} color={colors.water} strokeWidth={2.5} />
            <MonoText size={13} color={colors.water}>
              {amount}ml
            </MonoText>
          </Pressable>
        ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  stats: {
    flex: 1,
    gap: spacing.xs,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
