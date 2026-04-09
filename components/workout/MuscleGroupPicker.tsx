import React from 'react';
import { FlatList, Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Dumbbell,
  ArrowUpFromLine,
  ArrowUpDown,
  Footprints,
  Target,
  Zap,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { getExercisesByGroup } from '@/data/exercises';
import type { MuscleGroupCategory } from '@/types';

interface MuscleGroupPickerProps {
  onSelect: (group: MuscleGroupCategory) => void;
}

const GROUPS: {
  key: MuscleGroupCategory;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
}[] = [
  { key: 'chest', label: 'Chest', icon: Dumbbell },
  { key: 'back', label: 'Back', icon: ArrowUpFromLine },
  { key: 'shoulders', label: 'Shoulders', icon: ArrowUpDown },
  { key: 'biceps', label: 'Biceps', icon: Dumbbell },
  { key: 'triceps', label: 'Triceps', icon: Dumbbell },
  { key: 'legs', label: 'Legs', icon: Footprints },
  { key: 'core', label: 'Core', icon: Target },
  { key: 'fullbody', label: 'Full Body', icon: Zap },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function GroupCard({
  group,
  onSelect,
}: {
  group: (typeof GROUPS)[number];
  onSelect: (g: MuscleGroupCategory) => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const count = getExercisesByGroup(group.key).length;
  const Icon = group.icon;

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(group.key);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
      <Icon size={28} color={colors.primary} strokeWidth={1.8} />
      <Text style={styles.groupName}>{group.label}</Text>
      <Text style={styles.exerciseCount}>{count} exercises</Text>
    </AnimatedPressable>
  );
}

export function MuscleGroupPicker({ onSelect }: MuscleGroupPickerProps) {
  return (
    <FlatList
      data={GROUPS}
      numColumns={2}
      keyExtractor={(item) => item.key}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <GroupCard group={item} onSelect={onSelect} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    gap: spacing.sm,
  },
  groupName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  exerciseCount: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: colors.textTertiary,
  },
});
