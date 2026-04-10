import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/theme/spacing';

interface RPESelectorProps {
  value?: number;
  onChange: (rpe: number) => void;
  compact?: boolean;
}

const RPE_LABELS: Record<number, string> = {
  6: 'Very Light',
  7: 'Light',
  7.5: 'Moderate',
  8: 'Hard',
  8.5: 'Very Hard',
  9: 'Near Max',
  9.5: 'Max Effort',
  10: 'Failure',
};

const RPE_COLORS: Record<number, string> = {
  6: '#10B981',
  7: '#34D399',
  7.5: '#F59E0B',
  8: '#F59E0B',
  8.5: '#FF6B35',
  9: '#EF4444',
  9.5: '#DC2626',
  10: '#991B1B',
};

const RPE_VALUES = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10];

/**
 * RPE (Rate of Perceived Exertion) selector.
 * Scale from 6 (very light) to 10 (failure).
 * Color-coded from green to red.
 */
export function RPESelector({ value, onChange, compact = false }: RPESelectorProps) {
  const { colors, isDark } = useAppTheme();

  const handleSelect = (rpe: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(rpe);
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
    label: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 12,
      color: colors.textTertiary,
      marginBottom: spacing.sm,
      letterSpacing: 0.5,
    },
    chip: {
      paddingHorizontal: compact ? spacing.sm : spacing.md,
      paddingVertical: compact ? spacing.xs : spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceGlass,
      minWidth: compact ? 36 : 42,
      alignItems: 'center',
    },
    description: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.textTertiary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
  }), [colors, compact]);

  return (
    <View>
      {!compact && <Text style={dynamicStyles.label}>RPE</Text>}
      <View style={styles.row}>
        {RPE_VALUES.map((rpe) => {
          const isActive = value === rpe;
          const chipColor = RPE_COLORS[rpe] ?? colors.textTertiary;

          return (
            <Pressable
              key={rpe}
              onPress={() => handleSelect(rpe)}
              style={[
                dynamicStyles.chip,
                isActive && {
                  borderColor: chipColor,
                  backgroundColor: isDark
                    ? `${chipColor}20`
                    : `${chipColor}15`,
                },
              ]}
            >
              <MonoText
                size={compact ? 11 : 13}
                weight={isActive ? 'bold' : 'regular'}
                color={isActive ? chipColor : colors.textSecondary}
              >
                {rpe}
              </MonoText>
            </Pressable>
          );
        })}
      </View>
      {value && (
        <Text style={dynamicStyles.description}>
          {RPE_LABELS[value] ?? ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
});
