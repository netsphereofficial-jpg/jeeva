import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Trophy,
  Dumbbell,
  Flame,
  Target,
  Crown,
  Zap,
  CalendarCheck,
  Shield,
  TrendingUp,
  Infinity,
  Mountain,
  Gem,
  Droplets,
  Waves,
  Sunrise,
  Moon,
  Star,
  LayoutTemplate,
  BookOpen,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { TIER_COLORS, getAchievementById } from '@/data/achievements';
import { spacing, radius } from '@/theme/spacing';

// ── Icon Mapping ────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
  crown: Crown,
  zap: Zap,
  'calendar-check': CalendarCheck,
  shield: Shield,
  trophy: Trophy,
  'trending-up': TrendingUp,
  infinity: Infinity,
  weight: Dumbbell,
  mountain: Mountain,
  gem: Gem,
  droplets: Droplets,
  waves: Waves,
  sunrise: Sunrise,
  moon: Moon,
  star: Star,
  'layout-template': LayoutTemplate,
  'book-open': BookOpen,
};

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Trophy;
}

// ── Props ───────────────────────────────────────────────────────

interface AchievementPopupProps {
  achievementId: string;
  onDismiss: () => void;
}

// ── Component ───────────────────────────────────────────────────

export function AchievementPopup({
  achievementId,
  onDismiss,
}: AchievementPopupProps) {
  const { colors } = useAppTheme();
  const achievement = getAchievementById(achievementId);

  const overlayOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (!achievement) {
      onDismiss();
      return;
    }

    // Heavy haptic
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Animate in
    overlayOpacity.value = withTiming(1, { duration: 300 });
    iconScale.value = withSequence(
      withTiming(1.3, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) }),
    );
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievementId]);

  const handleDismiss = () => {
    overlayOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
    iconScale.value = withTiming(0, { duration: 250 });
    contentOpacity.value = withTiming(0, { duration: 150 });
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (!achievement) return null;

  const tierColor = TIER_COLORS[achievement.tier];
  const Icon = getIcon(achievement.icon);

  return (
    <Animated.View
      style={[styles.overlay, { backgroundColor: colors.overlay }, overlayStyle]}
    >
      <Pressable style={styles.pressArea} onPress={handleDismiss}>
        <View style={styles.content}>
          {/* Glow circle */}
          <View
            style={[styles.glowCircle, { backgroundColor: `${tierColor}15` }]}
          >
            <View
              style={[
                styles.glowCircleInner,
                { backgroundColor: `${tierColor}25` },
              ]}
            >
              <Animated.View style={iconAnimStyle}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: `${tierColor}30` },
                  ]}
                >
                  <Icon size={48} color={tierColor} strokeWidth={2} />
                </View>
              </Animated.View>
            </View>
          </View>

          {/* Text content */}
          <Animated.View style={[styles.textContent, contentAnimStyle]}>
            <Text style={[styles.label, { color: tierColor }]}>
              ACHIEVEMENT UNLOCKED
            </Text>
            <Text style={[styles.titleText, { color: colors.textPrimary }]}>
              {achievement.title}
            </Text>
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
            >
              {achievement.description}
            </Text>
            <View
              style={[styles.tierBadge, { backgroundColor: `${tierColor}20` }]}
            >
              <Text style={[styles.tierBadgeText, { color: tierColor }]}>
                {achievement.tier.toUpperCase()}
              </Text>
            </View>
          </Animated.View>

          <Text style={[styles.tapHint, { color: colors.textTertiary }]}>
            Tap to dismiss
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: spacing['2xl'],
  },
  glowCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircleInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['2xl'],
  },
  label: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 2,
  },
  titleText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  tierBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  tierBadgeText: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  tapHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    marginTop: spacing.lg,
  },
});
