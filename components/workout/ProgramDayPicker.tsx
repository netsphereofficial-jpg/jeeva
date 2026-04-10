import React, { useMemo } from 'react';
import { Pressable, Text, View, FlatList, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import { EXERCISES } from '@/data/exercises';
import type { Program, ProgramDay } from '@/types';

interface ProgramDayPickerProps {
  program: Program;
  onSelectDay: (dayIndex: number) => void;
  onBack: () => void;
}

const PREVIEW_COUNT = 3;

function getExerciseName(exerciseId: string): string {
  const ex = EXERCISES.find((e) => e.id === exerciseId);
  return ex?.name ?? exerciseId;
}

function DayCard({
  day,
  dayIndex,
  onSelect,
}: {
  day: ProgramDay;
  dayIndex: number;
  onSelect: (index: number) => void;
}) {
  const { colors } = useAppTheme();

  const previewNames = useMemo(() => {
    return day.exerciseIds.slice(0, PREVIEW_COUNT).map(getExerciseName);
  }, [day.exerciseIds]);

  const remaining = day.exerciseIds.length - PREVIEW_COUNT;

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        dayName: {
          fontFamily: 'DMSans_700Bold',
          fontSize: 17,
          color: colors.textPrimary,
        },
        exerciseName: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 13,
          color: colors.textSecondary,
          lineHeight: 19,
        },
        moreText: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 12,
          color: colors.textTertiary,
        },
      }),
    [colors],
  );

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(dayIndex);
  };

  return (
    <Pressable onPress={handlePress} style={styles.dayPressable}>
      <Card variant="default" animationIndex={dayIndex} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <Text style={dynamicStyles.dayName}>{day.name}</Text>
          <Tag
            label={`${day.exerciseIds.length} exercises`}
            color={colors.primary}
            size="sm"
          />
        </View>
        <View style={styles.exerciseList}>
          {previewNames.map((name, i) => (
            <Text key={i} style={dynamicStyles.exerciseName}>
              {name}
            </Text>
          ))}
          {remaining > 0 && (
            <Text style={dynamicStyles.moreText}>+{remaining} more</Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

export function ProgramDayPicker({
  program,
  onSelectDay,
  onBack,
}: ProgramDayPickerProps) {
  const { colors } = useAppTheme();

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        programName: {
          fontFamily: 'DMSans_700Bold',
          fontSize: 20,
          color: colors.textPrimary,
          flex: 1,
        },
        description: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 20,
        },
      }),
    [colors],
  );

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onBack();
  };

  const renderDay = ({ item, index }: { item: ProgramDay; index: number }) => (
    <DayCard day={item} dayIndex={index} onSelect={onSelectDay} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={dynamicStyles.programName} numberOfLines={1}>
          {program.name}
        </Text>
      </View>
      <Text style={[dynamicStyles.description, styles.descriptionSpacing]}>
        {program.description}
      </Text>
      <FlatList
        data={program.days}
        keyExtractor={(_, index) => `day-${index}`}
        renderItem={renderDay}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  descriptionSpacing: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  dayPressable: {
    marginBottom: spacing.md,
  },
  dayCard: {
    gap: spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseList: {
    gap: 2,
  },
});
