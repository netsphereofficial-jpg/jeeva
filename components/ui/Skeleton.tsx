import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius } from '@/theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Animated skeleton shimmer placeholder.
 * Use while data is loading to show the layout shape.
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: br = radius.sm,
  style,
}: SkeletonProps) {
  const { colors, isDark } = useAppTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  const bgColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <Animated.View
      style={[
        {
          width: width as number | undefined,
          height,
          borderRadius: br,
          backgroundColor: bgColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Skeleton preset: a card with 3 lines of text.
 */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton width={120} height={14} />
      <View style={styles.gap} />
      <Skeleton width="100%" height={12} />
      <View style={styles.smallGap} />
      <Skeleton width="80%" height={12} />
      <View style={styles.smallGap} />
      <Skeleton width="60%" height={12} />
    </View>
  );
}

/**
 * Skeleton preset: a circular avatar.
 */
export function SkeletonCircle({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

/**
 * Skeleton preset: a stats row (3 circles + numbers).
 */
export function SkeletonStatsRow() {
  return (
    <View style={styles.statsRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.statItem}>
          <SkeletonCircle size={64} />
          <View style={styles.smallGap} />
          <Skeleton width={50} height={16} />
          <View style={styles.tinyGap} />
          <Skeleton width={40} height={10} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 4,
  },
  gap: {
    height: 12,
  },
  smallGap: {
    height: 6,
  },
  tinyGap: {
    height: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
});
