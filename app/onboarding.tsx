import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, HeartPulse, Pill, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { textPresets } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';
import { colorGlow } from '@/theme/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ────────────────────────────────────────────
// Page data
// ────────────────────────────────────────────

interface PageData {
  icon: 'dumbbell' | 'heartPulse' | 'pill' | 'zap';
  title: string;
  body: string;
  accentKey: 'primary' | 'heart' | 'health';
}

const PAGES: PageData[] = [
  {
    icon: 'dumbbell',
    title: 'Track Every Rep',
    body: 'Log sets, reps, and weight with one tap. Smart PR detection celebrates your progress.',
    accentKey: 'primary',
  },
  {
    icon: 'heartPulse',
    title: 'Know Your Body',
    body: 'Sync with Apple Health & Health Connect. Steps, heart rate, sleep \u2014 all in one place.',
    accentKey: 'heart',
  },
  {
    icon: 'pill',
    title: 'Never Miss a Dose',
    body: 'Smart alarms and medication reminders with streak tracking. Stay consistent, stay healthy.',
    accentKey: 'health',
  },
  {
    icon: 'zap',
    title: 'Your Journey Starts Now',
    body: 'Push/Pull/Legs programs, analytics dashboard, and 84+ exercises ready for you.',
    accentKey: 'primary',
  },
];

// ────────────────────────────────────────────
// Animated icon components
// ────────────────────────────────────────────

const ICON_SIZE = 80;
const ICON_CONTAINER = 140;

function PulsingDumbbell({ color }: { color: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Dumbbell size={ICON_SIZE} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
}

function HeartbeatIcon({ color }: { color: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) }),
        withTiming(1.1, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      false,
    );
  }, [scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <HeartPulse size={ICON_SIZE} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
}

function BouncingPill({ color }: { color: string }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={style}>
      <Pill size={ICON_SIZE} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
}

function GlowingZap({ color }: { color: string }) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={style}>
      <Zap size={ICON_SIZE} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
}

function AnimatedIcon({ icon, color }: { icon: PageData['icon']; color: string }) {
  switch (icon) {
    case 'dumbbell':
      return <PulsingDumbbell color={color} />;
    case 'heartPulse':
      return <HeartbeatIcon color={color} />;
    case 'pill':
      return <BouncingPill color={color} />;
    case 'zap':
      return <GlowingZap color={color} />;
  }
}

// ────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────

export default function OnboardingScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const setOnboarded = useOnboardingStore((s) => s.setOnboarded);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const currentPage = useSharedValue(0);
  const [activePage, setActivePage] = React.useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const page = Math.round(x / SCREEN_WIDTH);
      currentPage.value = page;
      setActivePage(page);
    },
    [currentPage],
  );

  const finishOnboarding = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOnboarded();
    router.replace('/(tabs)');
  }, [setOnboarded, router]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOnboarded();
    router.replace('/(tabs)');
  }, [setOnboarded, router]);

  const resolveAccent = (key: PageData['accentKey']): string => {
    return colors[key];
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Skip button */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.skipContainer}>
        <Pressable onPress={handleSkip} hitSlop={16}>
          <Text style={[styles.skipText, { color: colors.textTertiary }]}>Skip</Text>
        </Pressable>
      </Animated.View>

      {/* Pages */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        bounces={false}
        style={styles.scrollView}
      >
        {PAGES.map((page, index) => {
          const accent = resolveAccent(page.accentKey);
          const isLast = index === PAGES.length - 1;

          return (
            <View key={page.title} style={styles.page}>
              {/* Radial glow background */}
              <View style={[styles.glowCircle, { backgroundColor: accent, opacity: 0.1 }]} />

              {/* Icon container */}
              <Animated.View
                entering={FadeInUp.delay(200).duration(500)}
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: colors.surfaceGlass,
                    borderColor: colors.surfaceGlassBorder,
                  },
                ]}
              >
                <AnimatedIcon icon={page.icon} color={accent} />
              </Animated.View>

              {/* Title */}
              <Animated.Text
                entering={FadeInUp.delay(400).duration(500)}
                style={[styles.title, { color: colors.textPrimary }]}
              >
                {page.title}
              </Animated.Text>

              {/* Body */}
              <Animated.Text
                entering={FadeInUp.delay(600).duration(500)}
                style={[styles.body, { color: colors.textSecondary }]}
              >
                {page.body}
              </Animated.Text>

              {/* CTA on last page */}
              {isLast && (
                <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.ctaContainer}>
                  <Pressable
                    onPress={finishOnboarding}
                    style={({ pressed }) => [
                      styles.ctaButton,
                      colorGlow(colors.primary, 0.5),
                      pressed && styles.ctaPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.ember, colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.ctaGradient}
                    >
                      <Text style={[styles.ctaText, { color: isDark ? '#0A0A0F' : '#FFFFFF' }]}>
                        Get Started
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              )}
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Dot indicators */}
      <Animated.View entering={FadeInUp.delay(600).duration(400)} style={styles.dotsContainer}>
        {PAGES.map((page, index) => {
          const accent = resolveAccent(page.accentKey);
          const isActive = activePage === index;
          return (
            <View
              key={page.title}
              style={[
                styles.dot,
                isActive
                  ? [styles.dotActive, { backgroundColor: accent }]
                  : { backgroundColor: colors.textTertiary },
              ]}
            />
          );
        })}
      </Animated.View>
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: spacing.screenPadding,
    zIndex: 10,
  },
  skipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  glowCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: '20%',
  },
  iconContainer: {
    width: ICON_CONTAINER,
    height: ICON_CONTAINER,
    borderRadius: ICON_CONTAINER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing['4xl'],
  },
  title: {
    ...textPresets.h1,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 16 * 1.5,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  ctaContainer: {
    marginTop: spacing['4xl'],
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing.lg,
    borderRadius: radius.full,
    gap: spacing.sm,
  },
  ctaText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing['3xl'],
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
