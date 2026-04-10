import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Trophy,
  Lock,
  Dumbbell,
  Flame,
  Target,
  Crown,
  Zap,
  CalendarCheck,
  Shield,
  TrendingUp,
  Infinity,
  Mountain,
  Gem,
  Droplets,
  Waves,
  Sunrise,
  Moon,
  Star,
  LayoutTemplate,
  BookOpen,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAchievementStore } from '@/stores/achievementStore';
import { ACHIEVEMENTS, TIER_COLORS } from '@/data/achievements';
import { MonoText } from '@/components/ui/MonoText';
import { spacing, radius } from '@/theme/spacing';
import type { Achievement, AchievementTier } from '@/types';

// ── Icon Mapping ────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
  crown: Crown,
  zap: Zap,
  'calendar-check': CalendarCheck,
  shield: Shield,
  trophy: Trophy,
  'trending-up': TrendingUp,
  infinity: Infinity,
  weight: Dumbbell,
  mountain: Mountain,
  gem: Gem,
  droplets: Droplets,
  waves: Waves,
  sunrise: Sunrise,
  moon: Moon,
  star: Star,
  'layout-template': LayoutTemplate,
  'book-open': BookOpen,
};

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Trophy;
}

// ── Filter Chips ────────────────────────────────────────────────

type FilterOption = 'all' | AchievementTier;

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'bronze', label: 'Bronze' },
  { key: 'silver', label: 'Silver' },
  { key: 'gold', label: 'Gold' },
  { key: 'diamond', label: 'Diamond' },
];

// ── Component ───────────────────────────────────────────────────

export default function AchievementsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [filter, setFilter] = useState<FilterOption>('all');

  const unlockedIds = useAchievementStore((s) => s.unlockedIds);
  const unlockTimestamps = useAchievementStore((s) => s.unlockTimestamps);

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleFilterChange = (option: FilterOption) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFilter(option);
  };

  // Separate and sort achievements
  const { unlocked, locked, unlockedCount, totalCount } = useMemo(() => {
    const filtered =
      filter === 'all'
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter((a) => a.tier === filter);

    const unlockedList: (Achievement & { unlockedAt: number })[] = [];
    const lockedList: Achievement[] = [];

    for (const a of filtered) {
      if (unlockedIds.includes(a.id)) {
        unlockedList.push({
          ...a,
          unlockedAt: unlockTimestamps[a.id] ?? 0,
        });
      } else {
        lockedList.push(a);
      }
    }

    // Sort unlocked by most recent first
    unlockedList.sort((a, b) => b.unlockedAt - a.unlockedAt);

    return {
      unlocked: unlockedList,
      locked: lockedList,
      unlockedCount: unlockedIds.length,
      totalCount: ACHIEVEMENTS.length,
    };
  }, [filter, unlockedIds, unlockTimestamps]);

  const formatDate = (ts: number): string => {
    const d = new Date(ts);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Trophy size={20} color={TIER_COLORS.gold} strokeWidth={2} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Achievements
          </Text>
        </View>
        <View style={styles.headerRight}>
          <MonoText size={13} color={colors.textSecondary}>
            {unlockedCount}/{totalCount}
          </MonoText>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = filter === option.key;
            const chipColor =
              option.key === 'all'
                ? colors.primary
                : TIER_COLORS[option.key];
            return (
              <Pressable
                key={option.key}
                onPress={() => handleFilterChange(option.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? `${chipColor}20`
                      : colors.surfaceGlass,
                    borderColor: isActive
                      ? chipColor
                      : colors.surfaceGlassBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isActive ? chipColor : colors.textSecondary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Achievement List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Unlocked */}
        {unlocked.map((achievement) => {
          const Icon = getIcon(achievement.icon);
          const tierColor = TIER_COLORS[achievement.tier];

          return (
            <View
              key={achievement.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceGlass,
                  borderColor: `${tierColor}40`,
                },
              ]}
            >
              {/* Tier glow */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${tierColor}20` },
                ]}
              >
                <Icon size={24} color={tierColor} strokeWidth={2} />
              </View>
              <View style={styles.cardContent}>
                <Text
                  style={[styles.cardTitle, { color: colors.textPrimary }]}
                >
                  {achievement.title}
                </Text>
                <Text
                  style={[
                    styles.cardDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {achievement.description}
                </Text>
                <MonoText size={11} color={colors.textTertiary}>
                  {formatDate(achievement.unlockedAt)}
                </MonoText>
              </View>
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: `${tierColor}20` },
                ]}
              >
                <Text style={[styles.tierText, { color: tierColor }]}>
                  {achievement.tier.toUpperCase()}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Locked */}
        {locked.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceGlass,
                borderColor: colors.border,
                opacity: 0.5,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.surfaceGlass },
              ]}
            >
              <Lock size={24} color={colors.textTertiary} strokeWidth={2} />
            </View>
            <View style={styles.cardContent}>
              <Text
                style={[styles.cardTitle, { color: colors.textTertiary }]}
              >
                {achievement.title}
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  { color: colors.textTertiary },
                ]}
              >
                {achievement.requirement}
              </Text>
            </View>
            <View
              style={[
                styles.tierBadge,
                {
                  backgroundColor: `${TIER_COLORS[achievement.tier]}10`,
                },
              ]}
            >
              <Text
                style={[
                  styles.tierText,
                  { color: `${TIER_COLORS[achievement.tier]}80` },
                ]}
              >
                {achievement.tier.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}

        {unlocked.length === 0 && locked.length === 0 && (
          <View style={styles.emptyState}>
            <Trophy size={48} color={colors.textTertiary} strokeWidth={1.5} />
            <Text
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              No achievements in this category
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
  },
  headerRight: {
    width: 48,
    alignItems: 'flex-end',
  },
  filterRow: {
    paddingVertical: spacing.sm,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
  },
  cardDescription: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  tierText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 9,
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    gap: spacing.lg,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
  },
});
