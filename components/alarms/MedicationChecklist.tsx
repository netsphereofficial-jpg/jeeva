import React from 'react';
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
import { colors } from '@/theme/colors';
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
  const isChecked = item.status === 'taken';
  const checkScale = useSharedValue(isChecked ? 1 : 0);
  const checkColor = useSharedValue(isChecked ? 1 : 0);

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
      ['rgba(255,255,255,0.06)', colors.alarmMedication],
    ),
    borderColor: interpolateColor(
      checkColor.value,
      [0, 1],
      [colors.borderLight, colors.alarmMedication],
    ),
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(400)}
      style={[styles.item, isChecked && styles.itemChecked]}
    >
      <View style={styles.itemInfo}>
        <Text style={[styles.medName, isChecked && styles.textDimmed]}>
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
          {isChecked && <Check size={16} color="#0A0A0F" strokeWidth={3} />}
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  itemChecked: {
    opacity: 0.6,
  },
  itemInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  medName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: colors.textPrimary,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textDimmed: {
    color: colors.textSecondary,
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
