import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sun, Dumbbell, Pill } from 'lucide-react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';
import { MonoText } from '@/components/ui/MonoText';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { Alarm, AlarmType } from '@/types';

interface AlarmFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alarm: Omit<Alarm, 'id'>) => void;
  editAlarm?: Alarm;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

const TYPE_OPTIONS: { type: AlarmType; icon: typeof Sun; color: string; label: string }[] = [
  { type: 'wakeup', icon: Sun, color: colors.alarmWakeup, label: 'Wake-Up' },
  { type: 'workout', icon: Dumbbell, color: colors.alarmWorkout, label: 'Workout' },
  { type: 'medication', icon: Pill, color: colors.alarmMedication, label: 'Medication' },
];

const SNOOZE_OPTIONS = [5, 10] as const;

export function AlarmForm({ isOpen, onClose, onSave, editAlarm }: AlarmFormProps) {
  const [hour, setHour] = useState(6);
  const [minute, setMinute] = useState(30);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<AlarmType>('wakeup');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [snoozeDuration, setSnoozeDuration] = useState<5 | 10>(5);

  useEffect(() => {
    if (editAlarm) {
      setHour(editAlarm.hour);
      setMinute(editAlarm.minute);
      setLabel(editAlarm.label);
      setType(editAlarm.type);
      setDaysOfWeek(editAlarm.daysOfWeek);
      setSnoozeDuration(editAlarm.snoozeDurationMin as 5 | 10);
    } else {
      setHour(6);
      setMinute(30);
      setLabel('');
      setType('wakeup');
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setSnoozeDuration(5);
    }
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
    onSave({
      type,
      label,
      hour,
      minute,
      enabled: true,
      daysOfWeek,
      vibrate: true,
      snoozeEnabled: true,
      snoozeDurationMin: snoozeDuration,
    });
    onClose();
  };

  const selectedTypeColor = TYPE_OPTIONS.find((t) => t.type === type)?.color ?? colors.primary;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} snapPoints={['85%']}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.title}>{editAlarm ? 'Edit Alarm' : 'New Alarm'}</Text>

        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <NumberInput value={hour} onChange={setHour} min={0} max={23} unit="hr" />
            </View>
            <MonoText size={24} color={colors.textSecondary}>:</MonoText>
            <View style={styles.timeInput}>
              <NumberInput value={minute} onChange={setMinute} min={0} max={59} step={5} unit="min" />
            </View>
          </View>
        </View>

        {/* Label */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Label</Text>
          <TextInput
            style={styles.textInput}
            value={label}
            onChangeText={setLabel}
            placeholder="Alarm Label"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Type</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((option) => {
              const isSelected = type === option.type;
              const IconComp = option.icon;
              return (
                <Pressable
                  key={option.type}
                  onPress={() => selectType(option.type)}
                  style={[
                    styles.typeCard,
                    isSelected && { borderColor: option.color, backgroundColor: `${option.color}1A` },
                  ]}
                >
                  <IconComp size={20} color={isSelected ? option.color : colors.textTertiary} strokeWidth={2} />
                  <Text style={[styles.typeLabel, isSelected && { color: option.color }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Day Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Repeat</Text>
          <View style={styles.daysRow}>
            {DAY_LABELS.map((dayLabel, index) => {
              const isActive = daysOfWeek.includes(index);
              return (
                <Pressable
                  key={`${dayLabel}-${index}`}
                  onPress={() => toggleDay(index)}
                  style={[
                    styles.dayCircle,
                    isActive && { backgroundColor: selectedTypeColor },
                  ]}
                >
                  <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
                    {dayLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Snooze */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Snooze Duration</Text>
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
                  styles.snoozeOption,
                  snoozeDuration === mins && { borderColor: selectedTypeColor, backgroundColor: `${selectedTypeColor}1A` },
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
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
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
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  typeLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    color: colors.textTertiary,
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dayText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.textTertiary,
  },
  dayTextActive: {
    color: '#0A0A0F',
  },
  snoozeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  snoozeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  saveBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing['4xl'],
  },
});
