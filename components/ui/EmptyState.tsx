import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  message: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: IconComponent,
  message,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useAppTheme();

  const dynamicStyles = useMemo(
    () => ({
      message: {
        color: colors.textSecondary,
      },
      subtitle: {
        color: colors.textTertiary,
      },
      iconBadge: {
        backgroundColor: colors.surfaceGlass,
      },
    }),
    [colors],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.iconBadge, dynamicStyles.iconBadge]}>
        <IconComponent
          size={48}
          color={colors.textTertiary}
          strokeWidth={1.5}
        />
      </View>
      <Text style={[styles.message, dynamicStyles.message]}>{message}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <Button
          variant="secondary"
          label={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },
  iconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -8,
  },
  button: {
    marginTop: spacing.sm,
  },
});
