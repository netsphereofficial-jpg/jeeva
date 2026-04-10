import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Sun, Dumbbell, Pill, Trash2 } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { Toggle } from '@/components/ui/Toggle';
import { useAppTheme } from '@/hooks/useAppTheme';
import { opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { Alarm, AlarmType } from '@/types';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  animationIndex?: number;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const AlarmCard = React.memo(function AlarmCard({ alarm, onToggle, onDelete, animationIndex = 0 }: AlarmCardProps) {
  const { colors, isDark } = useAppTheme();

  const TYPE_CONFIG: Record<AlarmType, { icon: typeof Sun; color: string; label: string }> = useMemo(() => ({
    wakeup: { icon: Sun, color: colors.alarmWakeup, label: 'Wake-Up' },
    workout: { icon: Dumbbell, color: colors.alarmWorkout, label: 'Workout' },
    medication: { icon: Pill, color: colors.alarmMedication, label: 'Medication' },
  }), [colors]);

  const config = TYPE_CONFIG[alarm.type];
  const IconComponent = config.icon;

  // 12-hour format with AM/PM
  const period = alarm.hour >= 12 ? 'PM' : 'AM';
  const displayHour = alarm.hour === 0 ? 12 : alarm.hour > 12 ? alarm.hour - 12 : alarm.hour;
  const timeStr = `${displayHour}:${String(alarm.minute).padStart(2, '0')}`;


  const handleToggle = () => {
    onToggle(alarm.id);
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete(alarm.id);
  };

  /** hex to rgba helper */
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
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
    dayCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaceGlassBorder,
    },
    dayText: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 12,
      color: colors.textTertiary,
    },
    dayTextActive: {
      color: isDark ? '#0A0A0F' : '#FFFFFF',
    },
  }), [colors, isDark]);

  return (
    <Animated.View
      entering={FadeInDown.delay(animationIndex * 60).duration(400)}
      style={dynamicStyles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.timeSection}>
          <View style={[dynamicStyles.iconBadge, { backgroundColor: hexToRgba(config.color, opacity['10']) }]}>
            <IconComponent size={16} color={config.color} strokeWidth={2} />
          </View>
          <View>
            <View style={styles.timeDisplay}>
              <MonoText size={32} weight="bold">{timeStr}</MonoText>
              <MonoText size={14} color={colors.textSecondary}>{period}</MonoText>
            </View>
            {alarm.label ? (
              <Text style={dynamicStyles.label}>{alarm.label}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.rightControls}>
          <Toggle value={alarm.enabled} onToggle={handleToggle} />
          <Pressable
            onPress={handleDelete}
            hitSlop={8}
            style={styles.deleteBtn}
            accessibilityLabel="Delete alarm"
            accessibilityRole="button"
          >
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
                dynamicStyles.dayCircle,
                isActive && { backgroundColor: config.color },
              ]}
            >
              <Text
                style={[
                  dynamicStyles.dayText,
                  isActive && dynamicStyles.dayTextActive,
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
});

const styles = StyleSheet.create({
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
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  deleteBtn: {
    padding: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
