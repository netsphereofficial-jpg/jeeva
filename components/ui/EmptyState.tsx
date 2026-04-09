import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: IconComponent,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <IconComponent
        size={48}
        color={colors.textTertiary}
        strokeWidth={1.5}
      />
      <Text style={styles.message}>{message}</Text>
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
  message: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.sm,
  },
});
