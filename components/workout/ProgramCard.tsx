import React, { useMemo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import {
  Dumbbell,
  Repeat,
  Layers,
  User,
  Zap,
  Flame,
  Trophy,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import type { Program } from '@/types';

interface ProgramCardProps {
  program: Program;
  onSelect: (program: Program) => void;
  animationIndex?: number;
}

type IconComponent = React.ComponentType<{
  size: number;
  color: string;
  strokeWidth?: number;
}>;

const ICON_MAP: Record<string, IconComponent> = {
  dumbbell: Dumbbell,
  repeat: Repeat,
  layers: Layers,
  user: User,
  zap: Zap,
  flame: Flame,
  trophy: Trophy,
};

function getIcon(iconName: string): IconComponent {
  return ICON_MAP[iconName] ?? Dumbbell;
}

export function ProgramCard({
  program,
  onSelect,
  animationIndex = 0,
}: ProgramCardProps) {
  const { colors } = useAppTheme();
  const Icon = getIcon(program.icon);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        name: {
          fontFamily: 'Outfit_700Bold',
          fontSize: 18,
          color: colors.textPrimary,
        },
        description: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 13,
          color: colors.textSecondary,
          lineHeight: 18,
        },
      }),
    [colors],
  );

  return (
    <Pressable onPress={() => onSelect(program)} style={styles.pressable}>
      <Card variant="default" animationIndex={animationIndex} style={styles.card}>
        <View style={styles.header}>
          <Icon size={22} color={colors.primary} strokeWidth={1.8} />
          <Text style={dynamicStyles.name}>{program.name}</Text>
        </View>
        <Text style={dynamicStyles.description}>{program.description}</Text>
        <View style={styles.tags}>
          <Tag label={`${program.days.length}-day`} color={colors.primary} />
          <Tag label={program.splitType} color={colors.textSecondary} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
