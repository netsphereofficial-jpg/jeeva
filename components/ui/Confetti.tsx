import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiProps {
  isVisible: boolean;
  onComplete?: () => void;
  count?: number;
  colors?: string[];
  duration?: number;
}

const DEFAULT_COLORS = ['#FF6B35', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899'];

interface Particle {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
}

function ParticleView({ particle, duration }: { particle: Particle; duration: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(particle.x);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withTiming(SCREEN_HEIGHT + 50, {
        duration,
        easing: Easing.out(Easing.quad),
      }),
    );

    translateX.value = withDelay(
      particle.delay,
      withTiming(particle.x + (Math.random() - 0.5) * 200, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
    );

    opacity.value = withDelay(
      particle.delay + duration * 0.6,
      withTiming(0, { duration: duration * 0.4 }),
    );

    rotate.value = withDelay(
      particle.delay,
      withTiming(particle.rotation * 360, {
        duration,
        easing: Easing.linear,
      }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.size > 6 ? 2 : particle.size / 2,
        },
        animStyle,
      ]}
    />
  );
}

/**
 * Confetti celebration overlay.
 * Renders falling particles from the top of the screen.
 */
export function Confetti({
  isVisible,
  onComplete,
  count = 40,
  colors = DEFAULT_COLORS,
  duration = 2500,
}: ConfettiProps) {
  const particles = useMemo<Particle[]>(() => {
    if (!isVisible) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 400,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      rotation: 1 + Math.random() * 3,
    }));
  }, [isVisible, count, colors]);

  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, duration + 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete, duration]);

  if (!isVisible || particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <ParticleView key={p.id} particle={p} duration={duration} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
  },
});
