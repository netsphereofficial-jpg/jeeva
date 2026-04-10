import React, { useEffect, useMemo } from 'react';
import { AccessibilityInfo, View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Trophy } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

interface PRBadgeProps {
  weight: number;
  reps: number;
  volume: number;
  previousVolume: number;
}

export function PRBadge({ weight, reps, volume, previousVolume }: PRBadgeProps) {
  const { colors } = useAppTheme();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 250 }),
    );
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    AccessibilityInfo.announceForAccessibility('New personal record!');
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formattedVolume = volume.toLocaleString();

  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: `rgba(245, 158, 11, ${opacity['8']})`,
      borderWidth: 1,
      borderColor: `rgba(245, 158, 11, ${opacity['20']})`,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    title: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 16,
      color: colors.pr,
    },
    previousText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      color: colors.textTertiary,
    },
  }), [colors]);

  return (
    <Animated.View style={[dynamicStyles.container, animatedStyle]}>
      <View style={styles.row}>
        <Trophy size={22} color={colors.pr} strokeWidth={2} />
        <Text style={dynamicStyles.title}>New PR!</Text>
      </View>
      <MonoText size={14} color={colors.textPrimary}>
        {weight}kg x {reps} = {formattedVolume} vol
      </MonoText>
      {previousVolume > 0 && (
        <Text style={dynamicStyles.previousText}>
          Previous best: {previousVolume.toLocaleString()} vol
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
