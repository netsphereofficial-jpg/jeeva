import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sun, Sunset, Moon } from 'lucide-react-native';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { SleepCard } from '@/components/dashboard/SleepCard';
import { WeeklySteps } from '@/components/dashboard/WeeklySteps';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getTimeOfDayGreeting } from '@/utils/formatters';

function getGreetingIcon() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return <Sun size={24} color={colors.primary} strokeWidth={2} />;
  }
  if (hour >= 12 && hour < 17) {
    return <Sunset size={24} color={colors.primary} strokeWidth={2} />;
  }
  return <Moon size={24} color={colors.sleep} strokeWidth={2} />;
}

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          <View style={styles.greetingRow}>
            {getGreetingIcon()}
            <Text style={styles.greetingText}>{greeting}</Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
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

        {/* GoalProgress */}
        <GoalProgress animationIndex={7} />

        {/* Bottom padding to clear tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  greetingText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24,
    color: colors.textPrimary,
  },
  dateText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 36,
  },
  spacer: {
    height: spacing.lg,
  },
  bottomPadding: {
    height: 100,
  },
});
