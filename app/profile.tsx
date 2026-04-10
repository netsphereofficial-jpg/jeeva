import React, { useMemo } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Settings,
  Dumbbell,
  TrendingUp,
  Flame,
  Trophy,
  Droplets,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Scale,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { useWaterStore } from '@/stores/waterStore';
import { getWorkoutStreak } from '@/utils/workoutAnalytics';
import { formatVolume, getWaterStreak } from '@/utils/formatters';
import { ACHIEVEMENTS, TIER_COLORS } from '@/data/achievements';
import { MonoText } from '@/components/ui/MonoText';
import { spacing, radius } from '@/theme/spacing';
import { STAGGER_DELAY } from '@/theme/animations';
import type { Achievement, AchievementTier, CompletedWorkout } from '@/types';

// ── Icon Mapping (reused from achievements screen) ─────────────

import {
  Lock,
  Zap,
  Target,
  Crown,
  CalendarCheck,
  Shield,
  Infinity,
  Mountain,
  Gem,
  Waves,
  Sunrise,
  Moon,
  Star,
  LayoutTemplate,
  BookOpen,
} from 'lucide-react-native';

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

function getAchievementIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Trophy;
}

// ── Perfect Weeks Calculator ───────────────────────────────────

function getPerfectWeeksCount(history: CompletedWorkout[]): number {
  if (history.length === 0) return 0;

  // Group workout dates by ISO week
  const weekDays: Record<string, Set<string>> = {};

  for (const workout of history) {
    const d = new Date(workout.startTime);
    // Get Monday-based ISO week key
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (!weekDays[weekKey]) {
      weekDays[weekKey] = new Set<string>();
    }
    weekDays[weekKey].add(dateStr);
  }

  // Count weeks with 5+ unique workout days
  let count = 0;
  for (const days of Object.values(weekDays)) {
    if (days.size >= 5) count++;
  }
  return count;
}

// ── Member Since ───────────────────────────────────────────────

function getMemberSinceDate(history: CompletedWorkout[]): string {
  if (history.length === 0) return 'Today';
  const earliest = history.reduce(
    (min, w) => (w.startTime < min ? w.startTime : min),
    history[0].startTime,
  );
  const d = new Date(earliest);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ] as const;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ── Stat Card Data ─────────────────────────────────────────────

interface StatCardData {
  icon: LucideIcon;
  value: string;
  label: string;
  iconColor: string;
}

// ── Component ──────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const userName = useSettingsStore((s) => s.settings.userName);
  const history = useWorkoutStore((s) => s.history);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const unlockedIds = useAchievementStore((s) => s.unlockedIds);
  const unlockTimestamps = useAchievementStore((s) => s.unlockTimestamps);
  const waterEntries = useWaterStore((s) => s.entries);
  const waterGoal = useWaterStore((s) => s.goal);

  const haptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // ── Computed data ──────────────────────────────────────────────

  const streakData = useMemo(() => getWorkoutStreak(history), [history]);
  const totalVolume = useMemo(
    () => history.reduce((sum, w) => sum + w.totalVolume, 0),
    [history],
  );
  const waterStreak = useMemo(
    () => getWaterStreak(waterEntries, waterGoal),
    [waterEntries, waterGoal],
  );
  const perfectWeeks = useMemo(
    () => getPerfectWeeksCount(history),
    [history],
  );
  const memberSince = useMemo(() => getMemberSinceDate(history), [history]);

  const statCards: StatCardData[] = useMemo(
    () => [
      {
        icon: Dumbbell,
        value: String(history.length),
        label: 'Total Workouts',
        iconColor: colors.primary,
      },
      {
        icon: TrendingUp,
        value: formatVolume(totalVolume),
        label: 'Total Volume',
        iconColor: colors.health,
      },
      {
        icon: Flame,
        value: String(streakData.currentStreak),
        label: 'Active Streak',
        iconColor: colors.ember,
      },
      {
        icon: Trophy,
        value: String(personalRecords.length),
        label: 'Personal Records',
        iconColor: colors.pr,
      },
      {
        icon: Droplets,
        value: String(waterStreak),
        label: 'Water Streak',
        iconColor: colors.water,
      },
      {
        icon: Calendar,
        value: String(perfectWeeks),
        label: 'Perfect Weeks',
        iconColor: colors.sleep,
      },
    ],
    [history, totalVolume, streakData, personalRecords, waterStreak, perfectWeeks, colors],
  );

  // Top 6 most recent unlocked achievements
  const recentAchievements = useMemo(() => {
    const unlocked: (Achievement & { unlockedAt: number })[] = [];
    for (const a of ACHIEVEMENTS) {
      if (unlockedIds.includes(a.id)) {
        unlocked.push({
          ...a,
          unlockedAt: unlockTimestamps[a.id] ?? 0,
        });
      }
    }
    unlocked.sort((b, c) => c.unlockedAt - b.unlockedAt);
    return unlocked.slice(0, 6);
  }, [unlockedIds, unlockTimestamps]);

  // ── Quick Actions ──────────────────────────────────────────────

  interface QuickAction {
    icon: LucideIcon;
    label: string;
    route: string | null;
    detail?: string;
  }

  const quickActions: QuickAction[] = [
    { icon: Trophy, label: 'Achievements & Badges', route: '/achievements' },
    { icon: Scale, label: 'Body Tracker', route: '/body' },
    { icon: Settings, label: 'Settings', route: '/settings' },
    { icon: Dumbbell, label: 'App Version', route: null, detail: 'JEEVA v1.0.0' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header Bar ──────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(400)}
          style={styles.headerBar}
        >
          <Pressable
            onPress={() => { haptic(); router.back(); }}
            hitSlop={12}
            style={[styles.headerIconBtn, { backgroundColor: colors.surfaceGlass }]}
          >
            <ChevronLeft size={20} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Profile
          </Text>
          <Pressable
            onPress={() => { haptic(); router.push('/settings'); }}
            hitSlop={12}
            style={[styles.headerIconBtn, { backgroundColor: colors.surfaceGlass }]}
          >
            <Settings size={20} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </Animated.View>

        {/* ── Section 1: User Header ──────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(STAGGER_DELAY).duration(400)}
          style={styles.userHeaderSection}
        >
          {/* Avatar with gradient border */}
          <View style={styles.avatarOuter}>
            <LinearGradient
              colors={[colors.primary, colors.ember, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradientBorder}
            >
              <View
                style={[
                  styles.avatarInner,
                  { backgroundColor: colors.surface },
                ]}
              >
                <User size={36} color={colors.primary} strokeWidth={1.5} />
              </View>
            </LinearGradient>
          </View>

          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {userName ?? 'Gym Warrior'}
          </Text>
          <MonoText size={13} color={colors.textSecondary}>
            Member since {memberSince}
          </MonoText>
        </Animated.View>

        {/* ── Section 2: Stats Grid ───────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(STAGGER_DELAY * 2).duration(400)}
          style={styles.sectionContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Your Stats
          </Text>
          <View style={styles.statsGrid}>
            {statCards.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <Animated.View
                  key={card.label}
                  entering={FadeInDown.delay(STAGGER_DELAY * 2 + idx * 40).duration(350)}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surfaceGlass,
                      borderColor: colors.surfaceGlassBorder,
                    },
                  ]}
                >
                  <IconComp size={18} color={card.iconColor} strokeWidth={2} />
                  <MonoText size={22} weight="bold" color={colors.primary}>
                    {card.value}
                  </MonoText>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {card.label}
                  </Text>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Section 3: Top Achievements ─────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(STAGGER_DELAY * 3).duration(400)}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Achievements
            </Text>
            {recentAchievements.length > 0 && (
              <Pressable
                onPress={() => { haptic(); router.push('/achievements'); }}
                hitSlop={8}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
              </Pressable>
            )}
          </View>

          {recentAchievements.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsRow}
            >
              {recentAchievements.map((achievement) => {
                const AchIcon = getAchievementIcon(achievement.icon);
                const tierColor = TIER_COLORS[achievement.tier];
                return (
                  <Pressable
                    key={achievement.id}
                    onPress={() => { haptic(); router.push('/achievements'); }}
                    style={styles.achievementBadge}
                  >
                    <View
                      style={[
                        styles.achievementCircle,
                        {
                          backgroundColor: `${tierColor}20`,
                          borderColor: tierColor,
                        },
                      ]}
                    >
                      <AchIcon size={20} color={tierColor} strokeWidth={2} />
                    </View>
                    <Text
                      style={[
                        styles.achievementTitle,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {achievement.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={[styles.emptyAchievements, { color: colors.textTertiary }]}>
              Complete workouts to earn badges
            </Text>
          )}
        </Animated.View>

        {/* ── Section 4: Quick Actions ────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(STAGGER_DELAY * 4).duration(400)}
          style={styles.sectionContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quick Actions
          </Text>
          <View
            style={[
              styles.quickActionsCard,
              {
                backgroundColor: colors.surfaceGlass,
                borderColor: colors.surfaceGlassBorder,
              },
            ]}
          >
            {quickActions.map((action, idx) => {
              const ActionIcon = action.icon;
              const isLast = idx === quickActions.length - 1;
              const isTappable = action.route !== null;

              return (
                <Pressable
                  key={action.label}
                  onPress={
                    isTappable
                      ? () => {
                          haptic();
                          router.push(action.route as '/achievements' | '/body' | '/settings');
                        }
                      : undefined
                  }
                  disabled={!isTappable}
                  style={[
                    styles.quickActionRow,
                    !isLast && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.quickActionLeft}>
                    <ActionIcon
                      size={18}
                      color={isTappable ? colors.textSecondary : colors.textTertiary}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.quickActionLabel,
                        {
                          color: isTappable
                            ? colors.textPrimary
                            : colors.textTertiary,
                        },
                      ]}
                    >
                      {action.label}
                    </Text>
                  </View>
                  {isTappable ? (
                    <ChevronRight
                      size={16}
                      color={colors.textTertiary}
                      strokeWidth={2}
                    />
                  ) : (
                    <MonoText size={12} color={colors.textTertiary}>
                      {action.detail}
                    </MonoText>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Section 5: Branding Footer ──────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(STAGGER_DELAY * 5).duration(400)}
          style={styles.brandingFooter}
        >
          <Text style={[styles.brandName, { color: colors.textTertiary }]}>
            JEEVA
          </Text>
          <MonoText size={11} color={colors.textTertiary}>
            v1.0.0
          </MonoText>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Header Bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
  },

  // User Header
  userHeaderSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  avatarOuter: {
    marginBottom: spacing.sm,
  },
  avatarGradientBorder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    lineHeight: 24 * 1.1,
  },

  // Sections
  sectionContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 17,
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    marginBottom: spacing.md,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%' as unknown as number,
    flexGrow: 1,
    flexBasis: '45%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 12 * 1.4,
  },

  // Achievements
  achievementsRow: {
    gap: spacing.lg,
    paddingRight: spacing.lg,
  },
  achievementBadge: {
    alignItems: 'center',
    width: 72,
    gap: spacing.xs,
  },
  achievementCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementTitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  emptyAchievements: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },

  // Quick Actions
  quickActionsCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quickActionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
  },

  // Branding Footer
  brandingFooter: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    gap: spacing.xs,
  },
  brandName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    letterSpacing: 6,
  },
});
