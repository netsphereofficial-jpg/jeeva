import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, spacing } from '@/theme/spacing';

type TagSize = 'sm' | 'md';

interface TagProps {
  label: string;
  color: string;
  size?: TagSize;
  icon?: React.ReactNode;
}

export function Tag({ label, color, size = 'md', icon }: TagProps) {
  const { isDark } = useAppTheme();

  const dynamicStyles = useMemo(() => {
    const bgOpacity = isDark ? '26' : '1A'; // 0.15 dark, 0.10 light
    return {
      container: {
        backgroundColor: `${color}${bgOpacity}`,
        paddingHorizontal: size === 'sm' ? 8 : spacing.md,
        paddingVertical: size === 'sm' ? 4 : spacing.xs,
      },
      label: {
        color,
        fontSize: 12,
      },
    };
  }, [color, size, isDark]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    marginRight: 2,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    includeFontPadding: false,
  },
});
