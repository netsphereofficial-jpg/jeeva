import React, { useMemo } from 'react';
import { Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { colorGlow } from '@/theme/shadows';

interface ToggleProps {
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const THUMB_MARGIN = 3;

export function Toggle({ value, onToggle, disabled = false }: ToggleProps) {
  const { colors } = useAppTheme();
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [value, progress]);

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(!value);
  };

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.surface, colors.primary],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          progress.value *
          (TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2),
      },
    ],
  }));

  const activeGlow = useMemo((): ViewStyle | undefined => {
    if (!value) return undefined;
    return colorGlow(colors.primary, 0.2);
  }, [value, colors.primary]);

  const dynamicTrack = useMemo(
    () => ({
      borderColor: colors.borderLight,
    }),
    [colors.borderLight],
  );

  const dynamicThumb = useMemo(
    () => ({
      backgroundColor: colors.textPrimary,
    }),
    [colors.textPrimary],
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <Animated.View
        style={[
          styles.track,
          dynamicTrack,
          trackStyle,
          activeGlow,
          disabled && styles.disabled,
        ]}
      >
        <Animated.View style={[styles.thumb, dynamicThumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: 1,
    padding: THUMB_MARGIN,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  disabled: {
    opacity: 0.5,
  },
});
