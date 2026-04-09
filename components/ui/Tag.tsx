import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, spacing } from '@/theme/spacing';

interface TagProps {
  label: string;
  color: string;
}

export function Tag({ label, color }: TagProps) {
  return (
    <View style={[styles.container, { backgroundColor: `${color}26` }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    includeFontPadding: false,
  },
});
