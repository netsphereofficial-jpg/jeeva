import React, { useEffect } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import { MonoText } from './MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  size?: number;
  color?: string;
  weight?: 'regular' | 'medium' | 'bold';
  style?: TextStyle;
}

// We use a wrapper approach since Reanimated animated text
// requires animatedProps on the native text component.
const AnimatedMonoText = Animated.createAnimatedComponent(
  React.forwardRef<
    React.ComponentRef<typeof MonoText>,
    React.ComponentProps<typeof MonoText>
  >(function ForwardedMonoText(props, ref) {
    return <MonoText {...props} />;
  }),
);

export function AnimatedNumber({
  value,
  format,
  size = 16,
  color,
  weight = 'regular',
  style,
}: AnimatedNumberProps) {
  const { colors } = useAppTheme();
  const resolvedColor = color ?? colors.textPrimary;
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withSpring(value, {
      damping: 20,
      stiffness: 90,
    });
  }, [value, animatedValue]);

  // Use derived value to get display text
  const displayText = useDerivedValue(() => {
    const current = Math.round(animatedValue.value);
    return format ? format(current) : String(current);
  });

  // Since we can't easily animate text content with MonoText directly,
  // we use a simple approach: render the text with the animated value.
  // For smooth counting, we use Reanimated's animated text.
  const animatedProps = useAnimatedProps(() => {
    return {
      children: displayText.value,
    } as { children: string };
  });

  return (
    <AnimatedMonoText
      size={size}
      color={resolvedColor}
      weight={weight}
      style={style}
      animatedProps={animatedProps}
    >
      {format ? format(value) : String(value)}
    </AnimatedMonoText>
  );
}
