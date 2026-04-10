import React, { useEffect, useMemo } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { colorGlow } from '@/theme/shadows';

interface CircularProgressProps {
  progress: number; // 0-1
  size: number;
  color: string;
  strokeWidth?: number;
  gradientColors?: [string, string];
  glow?: boolean;
  children?: React.ReactNode;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CircularProgress({
  progress,
  size,
  color,
  strokeWidth = 6,
  gradientColors,
  glow = false,
  children,
}: CircularProgressProps) {
  const { isDark } = useAppTheme();
  const animatedProgress = useSharedValue(0);

  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const trackColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const glowStyle = useMemo((): ViewStyle | undefined => {
    if (!glow) return undefined;
    return colorGlow(color, 0.3);
  }, [glow, color]);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const strokeColor = gradientColors ? 'url(#gradient)' : color;

  return (
    <View style={[styles.container, { width: size, height: size }, glowStyle]}>
      <Svg width={size} height={size}>
        {gradientColors && (
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradientColors[0]} />
              <Stop offset="1" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
        )}
        {/* Background track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={r}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      {children && (
        <View style={[StyleSheet.absoluteFill, styles.childrenContainer]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  childrenContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
