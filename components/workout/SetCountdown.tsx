import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { MonoText } from '@/components/ui/MonoText';

interface SetCountdownProps {
  isVisible: boolean;
  onComplete: () => void;
  duration?: number; // seconds, default 3
}

/**
 * 3-2-1 countdown overlay before starting a heavy set.
 * Each number scales in dramatically with haptic feedback.
 */
export function SetCountdown({
  isVisible,
  onComplete,
  duration = 3,
}: SetCountdownProps) {
  const { colors } = useAppTheme();
  const [count, setCount] = useState(duration);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!isVisible) {
      setCount(duration);
      return;
    }

    setCount(duration);

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Final "GO" moment
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
          setTimeout(onComplete, 500);
          return 0;
        }
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, duration, onComplete]);

  useEffect(() => {
    // Pulse animation on each count change
    scale.value = withSequence(
      withSpring(1.5, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
  }, [count, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}
    >
      <Animated.View style={animatedStyle}>
        {count > 0 ? (
          <MonoText size={96} weight="bold" color={colors.primary}>
            {count}
          </MonoText>
        ) : (
          <Text style={[styles.goText, { color: colors.primary }]}>GO!</Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  goText: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 72,
    letterSpacing: 4,
  },
});
