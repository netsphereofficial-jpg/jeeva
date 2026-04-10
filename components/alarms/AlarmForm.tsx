import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sun, Dumbbell, Pill } from 'lucide-react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';
import { MonoText } from '@/components/ui/MonoText';
import { AlarmSoundPicker } from '@/components/alarms/AlarmSoundPicker';
import { useAppTheme } from '@/hooks/useAppTheme';
import { opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { DEFAULT_ALARM_SOUND } from '@/data/alarmSounds';
import { stopPreview } from '@/services/alarmSound';
import type { Alarm, AlarmType } from '@/types';

interface AlarmFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alarm: Omit<Alarm, 'id'>) => void;
  editAlarm?: Alarm;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const SNOOZE_OPTIONS = [5, 10] as const;

/** hex to rgba helper */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function AlarmForm({ isOpen, onClose, onSave, editAlarm }: AlarmFormProps) {
  const { colors, isDark } = useAppTheme();
  const [hour, setHour] = useState(6); // 24hr internally
  const [minute, setMinute] = useState(30);
  const [isPM, setIsPM] = useState(false);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<AlarmType>('wakeup');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [snoozeDuration, setSnoozeDuration] = useState<5 | 10>(5);
  const [soundId, setSoundId] = useState(DEFAULT_ALARM_SOUND);

  const TYPE_OPTIONS: { type: AlarmType; icon: typeof Sun; color: string; label: string }[] = useMemo(() => [
    { type: 'wakeup', icon: Sun, color: colors.alarmWakeup, label: 'Wake-Up' },
    { type: 'workout', icon: Dumbbell, color: colors.alarmWorkout, label: 'Workout' },
    { type: 'medication', icon: Pill, color: colors.alarmMedication, label: 'Medication' },
  ], [colors]);

  // Convert 24hr to 12hr display
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  const handleHourChange = (newDisplayHour: number) => {
    // Convert 12hr display back to 24hr
    let h24 = newDisplayHour;
    if (isPM && newDisplayHour !== 12) h24 = newDisplayHour + 12;
    if (!isPM && newDisplayHour === 12) h24 = 0;
    setHour(h24);
  };

  const handleToggleAMPM = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newIsPM = !isPM;
    setIsPM(newIsPM);
    // Adjust hour accordingly
    if (newIsPM && hour < 12) setHour(hour + 12);
    if (!newIsPM && hour >= 12) setHour(hour - 12);
  };

  useEffect(() => {
    if (editAlarm) {
      setHour(editAlarm.hour);
      setMinute(editAlarm.minute);
      setIsPM(editAlarm.hour >= 12);
      setLabel(editAlarm.label);
      setType(editAlarm.type);
      setDaysOfWeek(editAlarm.daysOfWeek);
      setSnoozeDuration(editAlarm.snoozeDurationMin as 5 | 10);
      setSoundId(editAlarm.sound ?? DEFAULT_ALARM_SOUND);
    } else {
      setHour(6);
      setMinute(30);
      setIsPM(false);
      setLabel('');
      setType('wakeup');
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setSnoozeDuration(5);
      setSoundId(DEFAULT_ALARM_SOUND);
    }

    // Stop any playing preview when form opens/closes
    return () => { stopPreview(); };
  }, [editAlarm, isOpen]);

  const toggleDay = (dayIndex: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDaysOfWeek((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex],
    );
  };

  const selectType = (t: AlarmType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setType(t);
  };

  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    stopPreview(); // Stop any preview before saving
    onSave({
      type,
      label,
      hour,
      minute,
      enabled: true,
      daysOfWeek,
      sound: soundId,
      vibrate: true,
      snoozeEnabled: true,
      snoozeDurationMin: snoozeDuration,
    });
    onClose();
  };

  const selectedTypeColor = TYPE_OPTIONS.find((t) => t.type === type)?.color ?? colors.primary;

  const dynamicStyles = useMemo(() => StyleSheet.create({
    title: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 20,
      color: colors.textPrimary,
      marginBottom: spacing.xl,
    },
    sectionLabel: {
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
    typeCard: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceGlass,
    },
    typeLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 11,
      color: colors.textTertiary,
    },
    dayCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaceGlassBorder,
    },
    dayText: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 13,
      color: colors.textTertiary,
    },
    dayTextActive: {
      color: isDark ? '#0A0A0F' : '#FFFFFF',
    },
    snoozeOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceGlass,
    },
  }), [colors, isDark]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} snapPoints={['85%']}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={dynamicStyles.title}>{editAlarm ? 'Edit Alarm' : 'New Alarm'}</Text>

        {/* Time Picker — 12hr with AM/PM */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionLabel}>Time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <NumberInput value={displayHour} onChange={handleHourChange} min={1} max={12} unit="hr" />
            </View>
            <MonoText size={24} color={colors.textSecondary}>:</MonoText>
            <View style={styles.timeInput}>
              <NumberInput value={minute} onChange={setMinute} min={0} max={59} step={1} unit="min" />
            </View>
            <Pressable
              onPress={handleToggleAMPM}
              style={[
                styles.ampmToggle,
                {
                  backgroundColor: colors.surfaceGlass,
                  borderColor: colors.primary,
                  borderWidth: 1,
                },
              ]}
            >
              <MonoText size={14} weight="bold" color={colors.primary}>
                {isPM ? 'PM' : 'AM'}
              </MonoText>
            </Pressable>
          </View>
        </View>

        {/* Label */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionLabel}>Label</Text>
          <TextInput
            style={dynamicStyles.textInput}
            value={label}
            onChangeText={setLabel}
            placeholder="Alarm Label"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Type Selector */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionLabel}>Type</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((option) => {
              const isSelected = type === option.type;
              const IconComp = option.icon;
              return (
                <Pressable
                  key={option.type}
                  onPress={() => selectType(option.type)}
                  style={[
                    dynamicStyles.typeCard,
                    isSelected && { borderColor: option.color, backgroundColor: hexToRgba(option.color, opacity['10']) },
                  ]}
                >
                  <IconComp size={20} color={isSelected ? option.color : colors.textTertiary} strokeWidth={2} />
                  <Text style={[dynamicStyles.typeLabel, isSelected && { color: option.color }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Day Toggles */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionLabel}>Repeat</Text>
          <View style={styles.daysRow}>
            {DAY_LABELS.map((dayLabel, index) => {
              const isActive = daysOfWeek.includes(index);
              return (
                <Pressable
                  key={`${dayLabel}-${index}`}
                  onPress={() => toggleDay(index)}
                  style={[
                    dynamicStyles.dayCircle,
                    isActive && { backgroundColor: selectedTypeColor },
                  ]}
                >
                  <Text style={[dynamicStyles.dayText, isActive && dynamicStyles.dayTextActive]}>
                    {dayLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Alarm Sound */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionLabel}>Alarm Sound</Text>
          <AlarmSoundPicker
            selectedSoundId={soundId}
            onSelect={setSoundId}
          />
        </View>

        {/* Snooze */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionLabel}>Snooze Duration</Text>
          <View style={styles.snoozeRow}>
            {SNOOZE_OPTIONS.map((mins) => (
              <Pressable
                key={mins}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSnoozeDuration(mins);
                }}
                style={[
                  dynamicStyles.snoozeOption,
                  snoozeDuration === mins && { borderColor: selectedTypeColor, backgroundColor: hexToRgba(selectedTypeColor, opacity['10']) },
                ]}
              >
                <MonoText
                  size={14}
                  color={snoozeDuration === mins ? selectedTypeColor : colors.textSecondary}
                >
                  {mins} min
                </MonoText>
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          variant="accent"
          accentColor={selectedTypeColor}
          label="Save Alarm"
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  ampmToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
    minHeight: 48,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  snoozeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  saveBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing['4xl'],
  },
});
