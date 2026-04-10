import type { Achievement, AchievementTier } from '@/types';

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#B9F2FF',
} as const;

export const ACHIEVEMENTS: Achievement[] = [
  // ── Workout Milestones ──────────────────────────────────────
  {
    id: 'first-workout',
    title: 'First Steps',
    description: 'Every journey starts with one rep.',
    icon: 'dumbbell',
    tier: 'bronze',
    requirement: 'Complete your first workout',
  },
  {
    id: 'ten-workouts',
    title: 'Committed',
    description: 'Double digits. You mean business.',
    icon: 'flame',
    tier: 'silver',
    requirement: 'Complete 10 workouts',
  },
  {
    id: 'fifty-workouts',
    title: 'Dedicated',
    description: 'Fifty sessions of pure discipline.',
    icon: 'target',
    tier: 'gold',
    requirement: 'Complete 50 workouts',
  },
  {
    id: 'hundred-workouts',
    title: 'Iron Will',
    description: 'A century of sweat. Unstoppable.',
    icon: 'crown',
    tier: 'diamond',
    requirement: 'Complete 100 workouts',
  },

  // ── Streak Achievements ─────────────────────────────────────
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Seven days, zero excuses.',
    icon: 'zap',
    tier: 'bronze',
    requirement: '7-day workout streak',
  },
  {
    id: 'streak-30',
    title: 'Monthly Machine',
    description: 'A full month without breaking the chain.',
    icon: 'calendar-check',
    tier: 'silver',
    requirement: '30-day workout streak',
  },
  {
    id: 'streak-90',
    title: 'Quarterly Beast',
    description: 'Ninety days of relentless consistency.',
    icon: 'shield',
    tier: 'gold',
    requirement: '90-day workout streak',
  },

  // ── PR Achievements ─────────────────────────────────────────
  {
    id: 'first-pr',
    title: 'Record Breaker',
    description: 'Your first personal record. Many more to come.',
    icon: 'trophy',
    tier: 'bronze',
    requirement: 'Hit your first Personal Record',
  },
  {
    id: 'ten-prs',
    title: 'PR Machine',
    description: 'Ten records shattered.',
    icon: 'trending-up',
    tier: 'silver',
    requirement: 'Hit 10 Personal Records',
  },
  {
    id: 'fifty-prs',
    title: 'Limitless',
    description: 'Fifty PRs. The ceiling keeps rising.',
    icon: 'infinity',
    tier: 'gold',
    requirement: 'Hit 50 Personal Records',
  },

  // ── Volume Achievements ─────────────────────────────────────
  {
    id: 'volume-10k',
    title: 'Ten Thousand',
    description: '10,000 units of total lifetime volume.',
    icon: 'weight',
    tier: 'bronze',
    requirement: '10,000 total lifetime volume',
  },
  {
    id: 'volume-100k',
    title: 'Heavy Hitter',
    description: 'Six figures of raw volume.',
    icon: 'mountain',
    tier: 'silver',
    requirement: '100,000 total lifetime volume',
  },
  {
    id: 'volume-1m',
    title: 'Million Club',
    description: 'One million. Legendary status.',
    icon: 'gem',
    tier: 'diamond',
    requirement: '1,000,000 total lifetime volume',
  },

  // ── Hydration Achievements ──────────────────────────────────
  {
    id: 'water-goal-7',
    title: 'Hydration Hero',
    description: 'A full week of hitting your water goal.',
    icon: 'droplets',
    tier: 'bronze',
    requirement: 'Hit water goal 7 days in a row',
  },
  {
    id: 'water-goal-30',
    title: 'Ocean Master',
    description: 'Thirty days of peak hydration.',
    icon: 'waves',
    tier: 'silver',
    requirement: 'Hit water goal 30 days in a row',
  },

  // ── Consistency Achievements ────────────────────────────────
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Up and lifting before the sun.',
    icon: 'sunrise',
    tier: 'bronze',
    requirement: 'Complete a workout before 7am',
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'The iron never sleeps, and neither do you.',
    icon: 'moon',
    tier: 'bronze',
    requirement: 'Complete a workout after 9pm',
  },
  {
    id: 'perfect-week',
    title: 'Perfect Week',
    description: 'Five out of seven days. Exceptional.',
    icon: 'star',
    tier: 'silver',
    requirement: 'Work out at least 5 days in a week',
  },

  // ── Special Achievements ────────────────────────────────────
  {
    id: 'first-template',
    title: 'Architect',
    description: 'Designed your first workout blueprint.',
    icon: 'layout-template',
    tier: 'bronze',
    requirement: 'Create your first workout template',
  },
  {
    id: 'five-programs',
    title: 'Program Pro',
    description: 'Explored every preset program.',
    icon: 'book-open',
    tier: 'gold',
    requirement: 'Try all 5 preset programs',
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
