import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useBodyStore } from '@/stores/bodyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { NumberInput } from '@/components/ui/NumberInput';
import { MonoText } from '@/components/ui/MonoText';
import { spacing, radius } from '@/theme/spacing';
import { formatDateShort } from '@/utils/formatters';
import type { BodyMeasurement } from '@/types';

// ── Helpers ────────────────────────────────────────────────────

function getTodayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

type NumericMeasurementKey = Exclude<
  {
    [K in keyof BodyMeasurement]: BodyMeasurement[K] extends number | undefined
      ? K
      : never;
  }[keyof BodyMeasurement],
  undefined
>;

// ── Main Screen ────────────────────────────────────────────────

export default function BodyScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const measurements = useBodyStore((s) => s.measurements);
  const addMeasurement = useBodyStore((s) => s.addMeasurement);
  const getLatest = useBodyStore((s) => s.getLatest);
  const getHistory = useBodyStore((s) => s.getHistory);
  const unitSystem = useSettingsStore((s) => s.settings.unitSystem);
  const getDisplayWeight = useSettingsStore((s) => s.getDisplayWeight);
  const getStorageWeight = useSettingsStore((s) => s.getStorageWeight);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedMeasurements, setExpandedMeasurements] = useState(false);

  // Form state
  const [formWeight, setFormWeight] = useState(70);
  const [formBodyFat, setFormBodyFat] = useState(15);
  const [formChest, setFormChest] = useState(0);
  const [formWaist, setFormWaist] = useState(0);
  const [formHips, setFormHips] = useState(0);
  const [formBicepsLeft, setFormBicepsLeft] = useState(0);
  const [formBicepsRight, setFormBicepsRight] = useState(0);
  const [formThighs, setFormThighs] = useState(0);
  const [formCalves, setFormCalves] = useState(0);
  const [formNotes, setFormNotes] = useState('');

  const latest = getLatest();
  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';

  // Get previous measurement (second most recent) for trend
  const sortedMeasurements = useMemo(
    () =>
      [...measurements].sort((a, b) => b.date.localeCompare(a.date)),
    [measurements],
  );
  const previous = sortedMeasurements.length > 1 ? sortedMeasurements[1] : undefined;

  // Weight chart data (last 30 entries)
  const weightHistory = useMemo(
    () => getHistory('weight', 30),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [measurements],
  );

  // Recent measurements (last 10)
  const recentMeasurements = useMemo(
    () => sortedMeasurements.slice(0, 10),
    [sortedMeasurements],
  );

  const openForm = useCallback(() => {
    // Pre-populate with latest values
    if (latest) {
      setFormWeight(
        latest.weight !== undefined
          ? getDisplayWeight(latest.weight)
          : 70,
      );
      setFormBodyFat(latest.bodyFat ?? 15);
      setFormChest(latest.chest ?? 0);
      setFormWaist(latest.waist ?? 0);
      setFormHips(latest.hips ?? 0);
      setFormBicepsLeft(latest.bicepsLeft ?? 0);
      setFormBicepsRight(latest.bicepsRight ?? 0);
      setFormThighs(latest.thighs ?? 0);
      setFormCalves(latest.calves ?? 0);
      setFormNotes('');
    }
    setExpandedMeasurements(false);
    setSheetOpen(true);
  }, [latest, getDisplayWeight]);

  const handleSave = useCallback(() => {
    const measurement: Omit<BodyMeasurement, 'id'> = {
      date: getTodayStr(),
      weight: formWeight > 0 ? getStorageWeight(formWeight) : undefined,
      bodyFat: formBodyFat > 0 ? formBodyFat : undefined,
      chest: formChest > 0 ? formChest : undefined,
      waist: formWaist > 0 ? formWaist : undefined,
      hips: formHips > 0 ? formHips : undefined,
      bicepsLeft: formBicepsLeft > 0 ? formBicepsLeft : undefined,
      bicepsRight: formBicepsRight > 0 ? formBicepsRight : undefined,
      thighs: formThighs > 0 ? formThighs : undefined,
      calves: formCalves > 0 ? formCalves : undefined,
      notes: formNotes.trim() || undefined,
    };

    addMeasurement(measurement);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setSheetOpen(false);
  }, [
    formWeight, formBodyFat, formChest, formWaist, formHips,
    formBicepsLeft, formBicepsRight, formThighs, formCalves, formNotes,
    addMeasurement, getStorageWeight,
  ]);

  // Trend arrows
  const weightTrend = useMemo(() => {
    if (!latest?.weight || !previous?.weight) return 'none';
    if (latest.weight > previous.weight) return 'up';
    if (latest.weight < previous.weight) return 'down';
    return 'none';
  }, [latest, previous]);

  const bodyFatTrend = useMemo(() => {
    if (!latest?.bodyFat || !previous?.bodyFat) return 'none';
    if (latest.bodyFat > previous.bodyFat) return 'up';
    if (latest.bodyFat < previous.bodyFat) return 'down';
    return 'none';
  }, [latest, previous]);

  const displayLatestWeight = latest?.weight !== undefined
    ? getDisplayWeight(latest.weight)
    : undefined;

  // ── Chart computation ──────────────────────────────────────────

  const chartData = useMemo(() => {
    if (weightHistory.length === 0) return null;

    const values = weightHistory.map((h) =>
      unitSystem === 'imperial'
        ? getDisplayWeight(h.value)
        : h.value,
    );
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    return { values, dates: weightHistory.map((h) => h.date), minVal, maxVal, range };
  }, [weightHistory, unitSystem, getDisplayWeight]);

  // Dynamic styles
  const ds = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        headerText: {
          fontFamily: 'Outfit_700Bold',
          fontSize: 24,
          color: colors.textPrimary,
        },
        sectionTitle: {
          fontFamily: 'Outfit_600SemiBold',
          fontSize: 18,
          color: colors.textPrimary,
        },
        labelText: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 14,
          color: colors.textSecondary,
        },
        valueSecondary: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 13,
          color: colors.textTertiary,
        },
        formLabel: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 14,
          color: colors.textPrimary,
        },
        formSectionTitle: {
          fontFamily: 'Outfit_600SemiBold',
          fontSize: 16,
          color: colors.textPrimary,
        },
        notesInput: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 14,
          color: colors.textPrimary,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderLight,
          borderRadius: radius.md,
          padding: spacing.md,
          minHeight: 80,
          textAlignVertical: 'top' as const,
        },
        chartLabel: {
          fontFamily: 'JetBrainsMono_400Regular',
          fontSize: 10,
          color: colors.textTertiary,
        },
        historyDate: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 14,
          color: colors.textPrimary,
        },
        historyValue: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 13,
          color: colors.textSecondary,
        },
        emptyText: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 14,
          color: colors.textTertiary,
          textAlign: 'center' as const,
        },
        sheetTitle: {
          fontFamily: 'Outfit_700Bold',
          fontSize: 20,
          color: colors.textPrimary,
        },
        divider: {
          height: 1,
          backgroundColor: colors.border,
        },
      }),
    [colors],
  );

  function renderTrendIcon(trend: string, color: string) {
    if (trend === 'up')
      return <TrendingUp size={16} color={color} strokeWidth={2} />;
    if (trend === 'down')
      return <TrendingDown size={16} color={color} strokeWidth={2} />;
    return <Minus size={16} color={colors.textTertiary} strokeWidth={2} />;
  }

  return (
    <SafeAreaView style={ds.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={ds.headerText}>Body Tracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Latest Stats Card */}
        <Card variant="default" animationIndex={0}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={ds.labelText}>Weight</Text>
              <View style={styles.statValueRow}>
                <MonoText size={28} weight="bold">
                  {displayLatestWeight !== undefined
                    ? String(displayLatestWeight)
                    : '--'}
                </MonoText>
                <MonoText size={14} color={colors.textTertiary}>
                  {weightUnit}
                </MonoText>
                {renderTrendIcon(weightTrend, colors.primary)}
              </View>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={ds.labelText}>Body Fat</Text>
              <View style={styles.statValueRow}>
                <MonoText size={28} weight="bold">
                  {latest?.bodyFat !== undefined ? String(latest.bodyFat) : '--'}
                </MonoText>
                <MonoText size={14} color={colors.textTertiary}>
                  %
                </MonoText>
                {renderTrendIcon(bodyFatTrend, colors.health)}
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Log Button */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Button
            variant="primary"
            size="lg"
            label="Log Measurement"
            onPress={openForm}
            icon={<Plus size={18} color={colors.background} strokeWidth={2.5} />}
            style={styles.logButton}
          />
        </Animated.View>

        {/* Weight Chart */}
        {chartData && chartData.values.length >= 2 && (
          <Card variant="default" animationIndex={2}>
            <Text style={ds.sectionTitle}>Weight Trend</Text>
            <View style={styles.chartContainer}>
              {/* Y-axis labels */}
              <View style={styles.yAxis}>
                <Text style={ds.chartLabel}>
                  {Math.round(chartData.maxVal)}
                </Text>
                <Text style={ds.chartLabel}>
                  {Math.round((chartData.maxVal + chartData.minVal) / 2)}
                </Text>
                <Text style={ds.chartLabel}>
                  {Math.round(chartData.minVal)}
                </Text>
              </View>
              {/* Chart area */}
              <View style={styles.chartArea}>
                {/* Grid lines */}
                <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
                <View style={[styles.gridLineMiddle, { backgroundColor: colors.border }]} />
                <View style={[styles.gridLineBottom, { backgroundColor: colors.border }]} />

                {/* Data points and lines */}
                <View style={styles.chartPoints}>
                  {chartData.values.map((val, idx) => {
                    const normalised =
                      (val - chartData.minVal) / chartData.range;
                    const height = Math.max(4, normalised * 100);

                    return (
                      <View key={`${chartData.dates[idx]}-${idx}`} style={styles.chartBarWrapper}>
                        <View
                          style={[
                            styles.chartDot,
                            {
                              backgroundColor: colors.primary,
                              bottom: `${height}%`,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.chartBar,
                            {
                              backgroundColor: `${colors.primary}20`,
                              height: `${height}%`,
                            },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
            {/* X-axis dates */}
            <View style={styles.xAxis}>
              {chartData.dates.length > 0 && (
                <Text style={ds.chartLabel}>
                  {formatDateShort(chartData.dates[0])}
                </Text>
              )}
              <View style={{ flex: 1 }} />
              {chartData.dates.length > 1 && (
                <Text style={ds.chartLabel}>
                  {formatDateShort(chartData.dates[chartData.dates.length - 1])}
                </Text>
              )}
            </View>
          </Card>
        )}

        {/* History List */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <Text style={[ds.sectionTitle, styles.sectionHeader]}>Recent Entries</Text>
        </Animated.View>

        {recentMeasurements.length === 0 ? (
          <Card variant="default" animationIndex={4}>
            <Text style={ds.emptyText}>
              No measurements yet. Tap "Log Measurement" to get started.
            </Text>
          </Card>
        ) : (
          recentMeasurements.map((m, idx) => (
            <Card key={m.id} variant="default" animationIndex={4 + idx}>
              <View style={styles.historyRow}>
                <Text style={ds.historyDate}>{formatDateShort(m.date)}</Text>
                <View style={styles.historyValues}>
                  {m.weight !== undefined && (
                    <MonoText size={14} color={colors.textPrimary}>
                      {getDisplayWeight(m.weight)} {weightUnit}
                    </MonoText>
                  )}
                  {m.bodyFat !== undefined && (
                    <Text style={ds.historyValue}>{m.bodyFat}% BF</Text>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Measurement Form BottomSheet ─────────────────────────── */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={ds.sheetTitle}>Log Measurement</Text>
          <View style={{ height: spacing.lg }} />

          {/* Weight */}
          <View style={styles.formField}>
            <Text style={ds.formLabel}>Weight ({weightUnit})</Text>
            <NumberInput
              value={formWeight}
              onChange={setFormWeight}
              unit={weightUnit}
              min={0}
              max={500}
              step={0.5}
            />
          </View>

          {/* Body Fat */}
          <View style={styles.formField}>
            <Text style={ds.formLabel}>Body Fat %</Text>
            <NumberInput
              value={formBodyFat}
              onChange={setFormBodyFat}
              unit="%"
              min={0}
              max={70}
              step={0.5}
            />
          </View>

          {/* Expandable Body Measurements */}
          <Pressable
            style={styles.expandHeader}
            onPress={() => setExpandedMeasurements((v) => !v)}
          >
            <Text style={ds.formSectionTitle}>Body Measurements</Text>
            {expandedMeasurements ? (
              <ChevronUp size={20} color={colors.textSecondary} strokeWidth={2} />
            ) : (
              <ChevronDown size={20} color={colors.textSecondary} strokeWidth={2} />
            )}
          </Pressable>

          {expandedMeasurements && (
            <View style={styles.expandedFields}>
              <FormRow label="Chest (cm)" value={formChest} onChange={setFormChest} unit="cm" />
              <FormRow label="Waist (cm)" value={formWaist} onChange={setFormWaist} unit="cm" />
              <FormRow label="Hips (cm)" value={formHips} onChange={setFormHips} unit="cm" />
              <FormRow label="Biceps L (cm)" value={formBicepsLeft} onChange={setFormBicepsLeft} unit="cm" />
              <FormRow label="Biceps R (cm)" value={formBicepsRight} onChange={setFormBicepsRight} unit="cm" />
              <FormRow label="Thighs (cm)" value={formThighs} onChange={setFormThighs} unit="cm" />
              <FormRow label="Calves (cm)" value={formCalves} onChange={setFormCalves} unit="cm" />
            </View>
          )}

          <View style={[ds.divider, { marginVertical: spacing.md }]} />

          {/* Notes */}
          <View style={styles.formField}>
            <Text style={ds.formLabel}>Notes</Text>
            <TextInput
              style={ds.notesInput}
              value={formNotes}
              onChangeText={setFormNotes}
              placeholder="Optional notes..."
              placeholderTextColor={colors.textTertiary}
              multiline
            />
          </View>

          {/* Save */}
          <Button
            variant="primary"
            size="lg"
            label="Save"
            onPress={handleSave}
            style={{ marginTop: spacing.lg }}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

// ── FormRow Component ──────────────────────────────────────────

interface FormRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
}

function FormRow({ label, value, onChange, unit }: FormRowProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.formField}>
      <Text
        style={{
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 14,
          color: colors.textPrimary,
        }}
      >
        {label}
      </Text>
      <NumberInput value={value} onChange={onChange} unit={unit} min={0} max={300} step={0.5} />
    </View>
  );
}

// ── Static Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    gap: spacing.xs,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 48,
    marginHorizontal: spacing.md,
  },
  logButton: {
    width: '100%',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 140,
    marginTop: spacing.md,
  },
  yAxis: {
    width: 36,
    justifyContent: 'space-between',
    paddingRight: spacing.xs,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineMiddle: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  chartPoints: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  chartBarWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    zIndex: 1,
  },
  chartBar: {
    width: '80%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  xAxis: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    paddingLeft: 36,
  },
  sectionHeader: {
    marginTop: spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyValues: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  formField: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  expandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  expandedFields: {
    gap: spacing.xs,
  },
});
