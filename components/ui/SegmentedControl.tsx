import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, spacing } from '@/theme/spacing';

interface SegmentedControlProps {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({
  segments,
  activeIndex,
  onChange,
}: SegmentedControlProps) {
  const { colors, isDark } = useAppTheme();
  const translateX = useSharedValue(0);
  const segmentWidth = useSharedValue(0);

  useEffect(() => {
    if (segmentWidth.value > 0) {
      translateX.value = withSpring(activeIndex * segmentWidth.value, {
        damping: 18,
        stiffness: 200,
      });
    }
  }, [activeIndex, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth.value,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    const w = width / segments.length;
    segmentWidth.value = w;
    translateX.value = activeIndex * w;
  };

  const handlePress = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(index);
  };

  const contrastColor = isDark ? colors.background : '#FFFFFF';

  const dynamicStyles = useMemo(
    () => ({
      container: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
      indicator: {
        backgroundColor: colors.surfaceGlass,
        borderColor: colors.surfaceGlassBorder,
        borderWidth: 1,
      },
      activeLabel: {
        color: colors.textPrimary,
      },
      inactiveLabel: {
        color: colors.textSecondary,
      },
    }),
    [colors, contrastColor],
  );

  return (
    <View
      style={[styles.container, dynamicStyles.container]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[styles.indicator, dynamicStyles.indicator, indicatorStyle]}
      />
      {segments.map((segment, index) => (
        <Pressable
          key={segment}
          style={styles.segment}
          onPress={() => handlePress(index)}
        >
          <Text
            style={[
              styles.label,
              index === activeIndex
                ? dynamicStyles.activeLabel
                : dynamicStyles.inactiveLabel,
            ]}
          >
            {segment}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 2,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    borderRadius: radius.md - 2,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
});
