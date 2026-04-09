import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Footprints,
  HeartPulse,
  Moon,
  Flame,
  Scale,
  Activity,
} from 'lucide-react-native';
import { useHealthKit, getPlatformName } from '@/hooks/useHealthKit';
import { ConnectionBanner } from '@/components/health/ConnectionBanner';
import { MetricCard } from '@/components/health/MetricCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MonoText } from '@/components/ui/MonoText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatNumber } from '@/utils/formatters';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HealthScreen() {
  const {
    data,
    isConnected,
    lastSynced,
    sync,
    requestPermissions,
    isLoading,
  } = useHealthKit();

  const platformName = getPlatformName();

  const onRefresh = useCallback(() => {
    sync();
  }, [sync]);

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todaySteps = data.steps.find((s) => s.date === today);
  const todaySleep = data.sleep.find((s) => s.date === today);
  const latestHR = data.heartRate.length > 0
    ? data.heartRate[data.heartRate.length - 1]
    : null;

  // Build weekly step trend from stored data (last 7 days)
  const stepTrend = buildWeeklyTrend(data.steps.map((s) => ({
    date: s.date,
    value: s.steps,
  })));

  // Build weekly sleep trend
  const sleepTrend = buildWeeklyTrend(data.sleep.map((s) => ({
    date: s.date,
    value: Math.round(s.durationMin / 60 * 10) / 10, // hours with 1 decimal
  })));

  // Build weekly HR trend from stored data
  const hrTrend = buildHRTrend(data.heartRate);

  const stepsValue = todaySteps ? formatNumber(todaySteps.steps) : '--';
  const hrValue = latestHR ? latestHR.bpm : '--';
  const sleepValue = todaySleep
    ? `${Math.floor(todaySleep.durationMin / 60)}h ${todaySleep.durationMin % 60}m`
    : '--';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Text style={styles.header}>Health</Text>

        {/* Connection Banner */}
        <ConnectionBanner
          isConnected={isConnected}
          lastSynced={lastSynced}
          onConnect={requestPermissions}
          platformName={platformName}
        />

        {/* Connect Prompt for first-time users */}
        {!isConnected && data.steps.length === 0 && (
          <Card variant="tinted" tintColor={colors.health} animationIndex={1}>
            <View style={styles.connectPrompt}>
              <Activity size={32} color={colors.health} strokeWidth={1.5} />
              <Text style={styles.connectTitle}>
                Connect to {platformName}
              </Text>
              <Text style={styles.connectSubtitle}>
                Sync your steps, heart rate, and sleep data automatically
              </Text>
              <Button
                variant="accent"
                accentColor={colors.health}
                label={`Connect ${platformName}`}
                onPress={requestPermissions}
                icon={<Activity size={16} color="#0A0A0F" strokeWidth={2} />}
                style={styles.connectButtonFull}
              />
            </View>
          </Card>
        )}

        {/* Metric Cards Grid */}
        <View style={styles.grid}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <MetricCard
                title="Steps"
                value={stepsValue}
                icon={Footprints}
                color={colors.primary}
                trend={stepTrend}
                animationIndex={2}
              />
            </View>
            <View style={styles.gridItem}>
              <MetricCard
                title="Heart Rate"
                value={hrValue}
                unit="bpm"
                icon={HeartPulse}
                color={colors.heart}
                trend={hrTrend}
                animationIndex={3}
              />
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <MetricCard
                title="Sleep"
                value={sleepValue}
                icon={Moon}
                color={colors.sleep}
                trend={sleepTrend}
                animationIndex={4}
              />
            </View>
            <View style={styles.gridItem}>
              {/* Placeholder — keeps grid alignment */}
              <View style={styles.placeholder}>
                <MonoText size={11} color={colors.textTertiary}>
                  More metrics soon
                </MonoText>
              </View>
            </View>
          </View>

          {/* Row 3 — Coming Soon */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <MetricCard
                title="Calories"
                value="--"
                unit="kcal"
                icon={Flame}
                color={colors.primary}
                comingSoon
                animationIndex={5}
              />
            </View>
            <View style={styles.gridItem}>
              <MetricCard
                title="Weight"
                value="--"
                unit="kg"
                icon={Scale}
                color={colors.health}
                comingSoon
                animationIndex={6}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function buildWeeklyTrend(
  entries: { date: string; value: number }[],
): { data: number[]; labels: string[] } | undefined {
  if (entries.length === 0) return undefined;

  const result: number[] = [];
  const labels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];

    const entry = entries.find((e) => e.date === dateStr);
    result.push(entry?.value ?? 0);
    labels.push(dayName);
  }

  return { data: result, labels };
}

function buildHRTrend(
  heartRateEntries: { timestamp: number; bpm: number }[],
): { data: number[]; labels: string[] } | undefined {
  if (heartRateEntries.length === 0) return undefined;

  // Group heart rate readings by day and take the average
  const byDay = new Map<string, number[]>();

  for (const entry of heartRateEntries) {
    const dateStr = new Date(entry.timestamp).toISOString().split('T')[0];
    const existing = byDay.get(dateStr) ?? [];
    existing.push(entry.bpm);
    byDay.set(dateStr, existing);
  }

  const result: number[] = [];
  const labels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];

    const readings = byDay.get(dateStr);
    const avg = readings
      ? Math.round(readings.reduce((a, b) => a + b, 0) / readings.length)
      : 0;

    result.push(avg);
    labels.push(dayName);
  }

  return { data: result, labels };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  header: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  connectPrompt: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  connectTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  connectSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  connectButtonFull: {
    marginTop: spacing.sm,
    width: '100%',
  },
  grid: {
    gap: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridItem: {
    flex: 1,
  },
  placeholder: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
});
