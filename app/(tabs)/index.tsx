import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sun, Sunset, Moon, Settings, Dumbbell, Play } from 'lucide-react-native';
import { Pressable, Platform } from 'react-native';
import { colorGlow } from '@/theme/shadows';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { SleepCard } from '@/components/dashboard/SleepCard';
import { WeeklySteps } from '@/components/dashboard/WeeklySteps';
import { QuoteCard } from '@/components/dashboard/QuoteCard';
import { useSettingsStore } from '@/stores/settingsStore';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { useAppTheme } from '@/hooks/useAppTheme';
import { textPresets } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { getTimeOfDayGreeting } from '@/utils/formatters';
import { useCallback, useState } from 'react';

function getFormattedDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('en-US', options);
}

export default function DashboardScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const userName = useSettingsStore((s) => s.settings.userName);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Placeholder: health sync will be wired in a later phase
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const greeting = getTimeOfDayGreeting();
  const dateStr = getFormattedDate();

  const getGreetingIcon = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return <Sun size={24} color={colors.primary} strokeWidth={2} />;
    }
    if (hour >= 12 && hour < 17) {
      return <Sunset size={24} color={colors.primary} strokeWidth={2} />;
    }
    return <Moon size={24} color={colors.sleep} strokeWidth={2} />;
  }, [colors]);

  const dynamicStyles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    greetingText: {
      ...textPresets.h2,
      color: colors.textPrimary,
    },
    dateText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 36,
    },
  }), [colors]);

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        {/* Greeting Header */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(400)}
          style={styles.greetingContainer}
        >
          <View style={styles.greetingTopRow}>
            <View style={styles.greetingRow}>
              {getGreetingIcon()}
              <Text style={dynamicStyles.greetingText}>
                {greeting}{userName ? `, ${userName}` : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/settings');
              }}
              hitSlop={12}
              style={[styles.settingsButton, { backgroundColor: colors.surfaceGlass }]}
            >
              <Settings size={20} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>
          <Text style={dynamicStyles.dateText}>{dateStr}</Text>
        </Animated.View>

        {/* QuickStats */}
        <QuickStats animationIndex={1} />

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* WaterTracker */}
        <WaterTracker animationIndex={4} />

        <View style={styles.spacer} />

        {/* SleepCard */}
        <SleepCard animationIndex={5} />

        <View style={styles.spacer} />

        {/* WeeklySteps */}
        <WeeklySteps animationIndex={6} />

        <View style={styles.spacer} />

        {/* Daily Quote */}
        <QuoteCard animationIndex={7} />

        <View style={styles.spacer} />

        {/* GoalProgress */}
        <GoalProgress animationIndex={8} />

        {/* Bottom padding to clear tab bar + FAB */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Start Workout Button — Premium FAB */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(400).springify().damping(12)}
        style={styles.fabContainer}
      >
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/workout/new');
          }}
          style={[styles.fab, colorGlow(colors.primary, 0.5)]}
        >
          <LinearGradient
            colors={[colors.primary, '#FF8C42', colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Dumbbell size={20} color={isDark ? '#0A0A0F' : '#FFFFFF'} strokeWidth={2.5} />
            <Text style={[styles.fabText, { color: isDark ? '#0A0A0F' : '#FFFFFF' }]}>
              Start Workout
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  greetingContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  greetingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: spacing.lg,
  },
  bottomPadding: {
    height: 180,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  fab: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
    height: 56,
    borderRadius: 28,
  },
  fabText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
