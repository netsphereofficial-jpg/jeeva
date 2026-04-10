import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  TrendingUp,
  Hash,
  Trophy,
} from 'lucide-react-native';
import type { CompletedWorkout, MuscleGroup } from '@/types';
import { spacing, radius } from '@/theme/spacing';

// ── Fixed dark-theme palette (share cards always render dark) ────

const CARD_COLORS = {
  bgStart: '#0A0A0F',
  bgEnd: '#111118',
  orange: '#FF6B35',
  orangeDim: 'rgba(255, 107, 53, 0.25)',
  textPrimary: '#E8E4DE',
  textSecondary: '#9B9B9B',
  textTertiary: '#666666',
  borderGlow: 'rgba(255, 107, 53, 0.15)',
  noiseOverlay: 'rgba(255, 255, 255, 0.015)',
  statBg: 'rgba(255, 255, 255, 0.04)',
  statBorder: 'rgba(255, 255, 255, 0.06)',
} as const;

const MUSCLE_TAG_COLORS: Record<string, string> = {
  chest: '#FF6B35',
  back: '#38BDF8',
  shoulders: '#8B5CF6',
  biceps: '#10B981',
  triceps: '#F59E0B',
  forearms: '#EC4899',
  quads: '#EF4444',
  hamstrings: '#F97316',
  glutes: '#D946EF',
  calves: '#06B6D4',
  abs: '#F59E0B',
  traps: '#8B5CF6',
  lats: '#38BDF8',
  full_body: '#10B981',
} as const;

// ── Helpers ──────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getUniqueMuscleGroups(workout: CompletedWorkout): MuscleGroup[] {
  const groups = new Set<MuscleGroup>();
  for (const ex of workout.exercises) {
    if (ex.exercise) {
      groups.add(ex.exercise.primaryMuscle);
      for (const sec of ex.exercise.secondaryMuscles) {
        groups.add(sec);
      }
    }
  }
  return Array.from(groups);
}

// ── Props ────────────────────────────────────────────────────────

interface ShareCardProps {
  workout: CompletedWorkout;
  prCount: number;
}

// ── Stat Item ────────────────────────────────────────────────────

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Muscle Tag ───────────────────────────────────────────────────

function MuscleTag({ group }: { group: MuscleGroup }) {
  const color = MUSCLE_TAG_COLORS[group] ?? CARD_COLORS.orange;
  const displayName = group.replace('_', ' ');

  return (
    <View style={[styles.muscleTag, { backgroundColor: `${color}26` }]}>
      <Text style={[styles.muscleTagText, { color }]}>
        {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
      </Text>
    </View>
  );
}

// ── ShareCard ────────────────────────────────────────────────────

export const ShareCard = React.forwardRef<View, ShareCardProps>(
  function ShareCard({ workout, prCount }, ref) {
    const muscleGroups = useMemo(
      () => getUniqueMuscleGroups(workout),
      [workout],
    );

    const stats: { icon: React.ReactNode; value: string; label: string }[] = [
      {
        icon: <Clock size={18} color={CARD_COLORS.orange} strokeWidth={2} />,
        value: formatDuration(workout.durationSec),
        label: 'Duration',
      },
      {
        icon: (
          <TrendingUp size={18} color="#10B981" strokeWidth={2} />
        ),
        value: workout.totalVolume.toLocaleString(),
        label: 'Volume',
      },
      {
        icon: <Hash size={18} color="#38BDF8" strokeWidth={2} />,
        value: String(workout.totalSets),
        label: 'Sets',
      },
      {
        icon: (
          <Trophy
            size={18}
            color={prCount > 0 ? '#F59E0B' : CARD_COLORS.textTertiary}
            strokeWidth={2}
          />
        ),
        value: String(prCount),
        label: 'PRs',
      },
    ];

    return (
      <View ref={ref} style={styles.outerWrapper} collapsable={false}>
        {/* Orange border glow */}
        <LinearGradient
          colors={[CARD_COLORS.borderGlow, 'transparent', CARD_COLORS.borderGlow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glowBorder}
        />

        <LinearGradient
          colors={[CARD_COLORS.bgStart, CARD_COLORS.bgEnd]}
          style={styles.cardContainer}
        >
          {/* Noise texture overlay */}
          <View style={styles.noiseOverlay} />

          {/* Branding */}
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>JEEVA</Text>
            <View style={styles.brandAccent} />
          </View>

          {/* Workout name & date */}
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.dateText}>{formatDate(workout.endTime)}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <StatItem
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </View>

          {/* Muscle groups */}
          {muscleGroups.length > 0 && (
            <View style={styles.muscleSection}>
              <Text style={styles.muscleSectionLabel}>Muscles Hit</Text>
              <View style={styles.muscleTags}>
                {muscleGroups.map((group) => (
                  <MuscleTag key={group} group={group} />
                ))}
              </View>
            </View>
          )}

          {/* Tagline */}
          <Text style={styles.tagline}>
            Powered by dedication {'\uD83D\uDCAA'}
          </Text>
        </LinearGradient>
      </View>
    );
  },
);

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outerWrapper: {
    width: 360,
    padding: 2,
    borderRadius: radius.xl + 2,
    overflow: 'hidden',
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl + 2,
  },
  cardContainer: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    overflow: 'hidden',
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CARD_COLORS.noiseOverlay,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  brandText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: CARD_COLORS.textPrimary,
    letterSpacing: 6,
  },
  brandAccent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CARD_COLORS.orange,
  },
  workoutName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: CARD_COLORS.textPrimary,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    color: CARD_COLORS.textSecondary,
    marginBottom: spacing['2xl'],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: CARD_COLORS.statBg,
    borderWidth: 1,
    borderColor: CARD_COLORS.statBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  statValue: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 18,
    color: CARD_COLORS.textPrimary,
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: CARD_COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  muscleSection: {
    marginBottom: spacing.xl,
  },
  muscleSectionLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: CARD_COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  muscleTag: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  muscleTagText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontStyle: 'italic',
    fontSize: 14,
    color: CARD_COLORS.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
