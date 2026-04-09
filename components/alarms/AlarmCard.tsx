import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Sun, Dumbbell, Pill, Trash2 } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { Alarm, AlarmType } from '@/types';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  animationIndex?: number;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

const TYPE_CONFIG: Record<AlarmType, { icon: typeof Sun; color: string; label: string }> = {
  wakeup: { icon: Sun, color: colors.alarmWakeup, label: 'Wake-Up' },
  workout: { icon: Dumbbell, color: colors.alarmWorkout, label: 'Workout' },
  medication: { icon: Pill, color: colors.alarmMedication, label: 'Medication' },
};

export function AlarmCard({ alarm, onToggle, onDelete, animationIndex = 0 }: AlarmCardProps) {
  const config = TYPE_CONFIG[alarm.type];
  const IconComponent = config.icon;
  const timeStr = `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`;

  const handleToggle = () => {
    onToggle(alarm.id);
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete(alarm.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(animationIndex * 60).duration(400)}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.timeSection}>
          <View style={[styles.iconBadge, { backgroundColor: `${config.color}1A` }]}>
            <IconComponent size={16} color={config.color} strokeWidth={2} />
          </View>
          <View>
            <MonoText size={32} weight="bold">{timeStr}</MonoText>
            {alarm.label ? (
              <Text style={styles.label}>{alarm.label}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.rightControls}>
          <Toggle value={alarm.enabled} onToggle={handleToggle} />
          <Pressable onPress={handleDelete} hitSlop={8} style={styles.deleteBtn}>
            <Trash2 size={18} color={colors.textTertiary} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>

      <View style={styles.daysRow}>
        {DAY_LABELS.map((dayLabel, index) => {
          const isActive = alarm.daysOfWeek.includes(index);
          return (
            <View
              key={`${dayLabel}-${index}`}
              style={[
                styles.dayCircle,
                isActive && { backgroundColor: config.color },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isActive && styles.dayTextActive,
                ]}
              >
                {dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dayText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    color: colors.textTertiary,
  },
  dayTextActive: {
    color: '#0A0A0F',
  },
});
