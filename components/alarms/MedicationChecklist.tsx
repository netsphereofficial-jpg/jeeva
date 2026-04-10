import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { Tag } from '@/components/ui/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, spacing } from '@/theme/spacing';
import type { MedLogStatus } from '@/types';

interface MedicationChecklistItem {
  medication: { id: string; name: string; dosage: string };
  timeSlot: string;
  status: MedLogStatus | 'pending';
}

interface MedicationChecklistProps {
  medications: MedicationChecklistItem[];
  onLogDose: (medId: string, timeSlot: string) => void;
}

function ChecklistItem({
  item,
  onLogDose,
  index,
}: {
  item: MedicationChecklistItem;
  onLogDose: (medId: string, timeSlot: string) => void;
  index: number;
}) {
  const { colors, isDark } = useAppTheme();
  const isChecked = item.status === 'taken';
  const checkScale = useSharedValue(isChecked ? 1 : 0);
  const checkColor = useSharedValue(isChecked ? 1 : 0);

  const uncheckedBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  const handleCheck = () => {
    if (isChecked) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    checkScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
    checkColor.value = withSpring(1, { damping: 15, stiffness: 200 });
    onLogDose(item.medication.id, item.timeSlot);
  };

  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value || 1 }],
    backgroundColor: interpolateColor(
      checkColor.value,
      [0, 1],
      [uncheckedBg, colors.alarmMedication],
    ),
    borderColor: interpolateColor(
      checkColor.value,
      [0, 1],
      [colors.borderLight, colors.alarmMedication],
    ),
  }));

  const dynamicStyles = useMemo(() => StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    medName: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 15,
      color: colors.textPrimary,
    },
    textDimmed: {
      color: colors.textSecondary,
    },
  }), [colors]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(400)}
      style={[dynamicStyles.item, isChecked && styles.itemChecked]}
    >
      <View style={styles.itemInfo}>
        <Text style={[dynamicStyles.medName, isChecked && dynamicStyles.textDimmed]}>
          {item.medication.name}
        </Text>
        <View style={styles.itemMeta}>
          <Tag label={item.medication.dosage} color={colors.alarmMedication} />
          <MonoText size={12} color={isChecked ? colors.textTertiary : colors.textSecondary}>
            {item.timeSlot}
          </MonoText>
        </View>
      </View>
      <Pressable onPress={handleCheck}>
        <Animated.View style={[styles.checkbox, checkboxAnimatedStyle]}>
          {isChecked && <Check size={16} color={isDark ? '#0A0A0F' : '#FFFFFF'} strokeWidth={3} />}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function MedicationChecklist({ medications, onLogDose }: MedicationChecklistProps) {
  return (
    <View style={styles.container}>
      {medications.map((item, index) => (
        <ChecklistItem
          key={`${item.medication.id}-${item.timeSlot}`}
          item={item}
          onLogDose={onLogDose}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  itemChecked: {
    opacity: 0.6,
  },
  itemInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
});
