import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Plus,
  Bell,
  Moon,
  Sun,
  Dumbbell,
  Pill,
  Flame,
} from 'lucide-react-native';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { MonoText } from '@/components/ui/MonoText';
import { Card } from '@/components/ui/Card';
import { AlarmCard } from '@/components/alarms/AlarmCard';
import { AlarmForm } from '@/components/alarms/AlarmForm';
import { MedicationChecklist } from '@/components/alarms/MedicationChecklist';
import { CalendarHeatmap } from '@/components/alarms/CalendarHeatmap';
import { useAlarms } from '@/hooks/useAlarms';
import { useMedications } from '@/hooks/useMedications';
import { useAppTheme } from '@/hooks/useAppTheme';
import { opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { AlarmType, MedFrequency } from '@/types';

const SEGMENTS = ['Alarms', 'Medications'] as const;

const FREQ_SEGMENTS = ['Daily', 'Twice', 'Weekly'] as const;
const FREQ_MAP: Record<number, MedFrequency> = {
  0: 'daily',
  1: 'twice_daily',
  2: 'weekly',
};

export default function AlarmsScreen() {
  const { colors } = useAppTheme();
  const [activeSegment, setActiveSegment] = useState(0);
  const [showAlarmForm, setShowAlarmForm] = useState(false);
  const [showMedForm, setShowMedForm] = useState(false);

  const { alarms, groupedAlarms, addAlarm, toggleAlarm, deleteAlarm } = useAlarms();
  const { todaysMeds, streak, calendarData, logDose, addMedication, medications } = useMedications();

  // Medication form state
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreqIndex, setMedFreqIndex] = useState(0);
  const [medTimes, setMedTimes] = useState<string[]>(['08:00']);

  const SECTION_CONFIG: Record<AlarmType, { icon: typeof Sun; color: string; label: string }> = useMemo(() => ({
    wakeup: { icon: Sun, color: colors.alarmWakeup, label: 'Wake-Up' },
    workout: { icon: Dumbbell, color: colors.alarmWorkout, label: 'Workout' },
    medication: { icon: Pill, color: colors.alarmMedication, label: 'Medication' },
  }), [colors]);

  const resetMedForm = () => {
    setMedName('');
    setMedDosage('');
    setMedFreqIndex(0);
    setMedTimes(['08:00']);
  };

  const handleAddMed = () => {
    if (!medName.trim() || !medDosage.trim()) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    addMedication({
      name: medName.trim(),
      dosage: medDosage.trim(),
      frequency: FREQ_MAP[medFreqIndex],
      times: medTimes,
      active: true,
    });
    resetMedForm();
    setShowMedForm(false);
  };

  const handleFreqChange = (index: number) => {
    setMedFreqIndex(index);
    // Set default time slots based on frequency
    if (index === 0) setMedTimes(['08:00']);
    else if (index === 1) setMedTimes(['08:00', '20:00']);
    else setMedTimes(['08:00']);
  };

  const handleOpenAlarmForm = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAlarmForm(true);
  };

  const handleOpenMedForm = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowMedForm(true);
  };

  const hasAlarms = alarms.length > 0;
  const activeMeds = medications.filter((m) => m.active);
  const hasMeds = activeMeds.length > 0;

  const sectionOrder: AlarmType[] = ['wakeup', 'workout', 'medication'];

  /** Helper: hex to rgba for streak icon background */
  const streakIconBg = useMemo(() => {
    const hex = colors.alarmMedication;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity['10']})`;
  }, [colors]);

  // Floating + rotation animation for alarms empty state (Moon)
  const alarmFloatY = useSharedValue(0);
  const alarmRotate = useSharedValue(0);
  React.useEffect(() => {
    alarmFloatY.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 2000 }),
        withTiming(-8, { duration: 2000 }),
      ),
      -1,
      true,
    );
    alarmRotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2500 }),
        withTiming(-5, { duration: 2500 }),
      ),
      -1,
      true,
    );
  }, [alarmFloatY, alarmRotate]);

  const alarmFloatingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: alarmFloatY.value },
      { rotate: `${alarmRotate.value}deg` },
    ],
  }));

  // Pulse animation for medications empty state (Pill)
  const medPulse = useSharedValue(1);
  React.useEffect(() => {
    medPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, [medPulse]);

  const medPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: medPulse.value }],
  }));

  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 28,
      color: colors.textPrimary,
    },
    addBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surfaceGlassBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitlePlain: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    streakLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 14,
      color: colors.textSecondary,
    },
    streakMotivation: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 2,
    },
    formTitle: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 20,
      color: colors.textPrimary,
      marginBottom: spacing.xl,
    },
    formLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    textInput: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 15,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 48,
    },
    timeSlotRow: {
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
  }), [colors]);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={dynamicStyles.title}>Alarms</Text>
        <Pressable
          onPress={activeSegment === 0 ? handleOpenAlarmForm : handleOpenMedForm}
          style={dynamicStyles.addBtn}
          hitSlop={8}
          accessibilityLabel={activeSegment === 0 ? 'Add alarm' : 'Add medication'}
          accessibilityRole="button"
        >
          <Plus size={22} color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          segments={[...SEGMENTS]}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeSegment === 0 ? (
          /* ── Alarms Segment ────────────────────── */
          hasAlarms ? (
            sectionOrder.map((type) => {
              const alarmsForType = groupedAlarms[type];
              if (alarmsForType.length === 0) return null;
              const config = SECTION_CONFIG[type];
              const IconComp = config.icon;
              return (
                <View key={type} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconComp size={16} color={config.color} strokeWidth={2} />
                    <Text style={[styles.sectionTitle, { color: config.color }]}>
                      {config.label}
                    </Text>
                  </View>
                  {alarmsForType.map((alarm, index) => (
                    <AlarmCard
                      key={alarm.id}
                      alarm={alarm}
                      onToggle={toggleAlarm}
                      onDelete={deleteAlarm}
                      animationIndex={index}
                    />
                  ))}
                </View>
              );
            })
          ) : (
            <Animated.View entering={FadeInDown.delay(200).springify()} style={emptyStyles.emptyContainer}>
              <Animated.View style={alarmFloatingStyle}>
                <View style={[emptyStyles.emptyIconCircle, { backgroundColor: colors.surfaceGlass }]}>
                  <Moon size={48} color={colors.primary} strokeWidth={1.5} />
                </View>
              </Animated.View>
              <Text style={[emptyStyles.emptyTitle, { color: colors.textPrimary }]}>
                Sweet dreams await
              </Text>
              <Text style={[emptyStyles.emptySubtitle, { color: colors.textSecondary }]}>
                Set your first alarm to start your routine
              </Text>
              <Button variant="primary" label="Add Alarm" onPress={handleOpenAlarmForm} style={emptyStyles.emptyCTA} />
            </Animated.View>
          )
        ) : (
          /* ── Medications Segment ───────────────── */
          hasMeds ? (
            <>
              {/* Streak Card */}
              <Card variant="tinted" tintColor={colors.alarmMedication} style={styles.streakCard}>
                <View style={styles.streakRow}>
                  <View style={[styles.streakIconWrap, { backgroundColor: streakIconBg }]}>
                    <Flame size={28} color={colors.alarmMedication} strokeWidth={2} />
                  </View>
                  <View style={styles.streakInfo}>
                    <View style={styles.streakNumberRow}>
                      <MonoText size={36} weight="bold" color={colors.textPrimary}>
                        {streak}
                      </MonoText>
                      <Text style={dynamicStyles.streakLabel}>day streak</Text>
                    </View>
                    <Text style={dynamicStyles.streakMotivation}>
                      {streak === 0
                        ? 'Take all your meds today to start a streak!'
                        : streak < 7
                          ? 'Keep it up! Build that habit.'
                          : 'Amazing consistency!'}
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Today's Medications */}
              {todaysMeds.length > 0 && (
                <View style={styles.section}>
                  <Text style={dynamicStyles.sectionTitlePlain}>Today</Text>
                  <MedicationChecklist medications={todaysMeds} onLogDose={logDose} />
                </View>
              )}

              {/* Calendar Heatmap */}
              <View style={styles.section}>
                <Text style={dynamicStyles.sectionTitlePlain}>Adherence</Text>
                <CalendarHeatmap data={calendarData} />
              </View>
            </>
          ) : (
            <Animated.View entering={FadeInDown.delay(200).springify()} style={emptyStyles.emptyContainer}>
              <Animated.View style={medPulseStyle}>
                <View style={[emptyStyles.emptyIconCircle, { backgroundColor: colors.surfaceGlass }]}>
                  <Pill size={48} color={colors.primary} strokeWidth={1.5} />
                </View>
              </Animated.View>
              <Text style={[emptyStyles.emptyTitle, { color: colors.textPrimary }]}>
                Stay on track
              </Text>
              <Text style={[emptyStyles.emptySubtitle, { color: colors.textSecondary }]}>
                Add your medications to never miss a dose
              </Text>
              <Button variant="primary" label="Add Medication" onPress={handleOpenMedForm} style={emptyStyles.emptyCTA} />
            </Animated.View>
          )
        )}
      </ScrollView>

      {/* Alarm Form Bottom Sheet */}
      <AlarmForm
        isOpen={showAlarmForm}
        onClose={() => setShowAlarmForm(false)}
        onSave={addAlarm}
      />

      {/* Medication Form Bottom Sheet */}
      <BottomSheet isOpen={showMedForm} onClose={() => setShowMedForm(false)} snapPoints={['70%']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={dynamicStyles.formTitle}>New Medication</Text>

          <View style={styles.formSection}>
            <Text style={dynamicStyles.formLabel}>Name</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={medName}
              onChangeText={setMedName}
              placeholder="Medication Name"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={dynamicStyles.formLabel}>Dosage</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={medDosage}
              onChangeText={setMedDosage}
              placeholder="e.g. 500mg"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={dynamicStyles.formLabel}>Frequency</Text>
            <SegmentedControl
              segments={[...FREQ_SEGMENTS]}
              activeIndex={medFreqIndex}
              onChange={handleFreqChange}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={dynamicStyles.formLabel}>Time Slots</Text>
            {medTimes.map((time, idx) => (
              <View key={idx} style={dynamicStyles.timeSlotRow}>
                <MonoText size={14} color={colors.textPrimary}>{time}</MonoText>
              </View>
            ))}
          </View>

          <Button
            variant="accent"
            accentColor={colors.alarmMedication}
            label="Add Medication"
            onPress={handleAddMed}
            disabled={!medName.trim() || !medDosage.trim()}
            style={styles.formSaveBtn}
          />
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  segmentWrapper: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streakCard: {
    marginBottom: spacing['2xl'],
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  streakIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  // Medication Form
  formSection: {
    marginBottom: spacing['2xl'],
  },
  formSaveBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing['4xl'],
  },
});

const emptyStyles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 24,
  },
  emptySubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  emptyCTA: {
    marginTop: 24,
    minWidth: 200,
  },
});
