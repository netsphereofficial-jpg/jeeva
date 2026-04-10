import type { CompletedWorkout, PersonalRecord } from '@/types';

// ── Color mapping for muscle groups ─────────────────────────────
// Maps to theme color token names used elsewhere in the app
const MUSCLE_GROUP_COLORS: Record<string, string> = {
  chest: 'primary',
  back: 'water',
  shoulders: 'sleep',
  biceps: 'health',
  triceps: 'amber',
  legs: 'heart',
  core: 'pr',
};

// ── Helpers ─────────────────────────────────────────────────────

function getWeekLabel(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMuscleGroupCategory(primaryMuscle: string): string {
  const map: Record<string, string> = {
    chest: 'chest',
    back: 'back',
    lats: 'back',
    traps: 'shoulders',
    shoulders: 'shoulders',
    biceps: 'biceps',
    forearms: 'biceps',
    triceps: 'triceps',
    quads: 'legs',
    hamstrings: 'legs',
    glutes: 'legs',
    calves: 'legs',
    abs: 'core',
    full_body: 'core',
  };
  return map[primaryMuscle] ?? 'core';
}

// ── Public analytics functions ──────────────────────────────────

export function getWeeklyVolume(
  history: CompletedWorkout[],
  weeks = 4,
): { weekLabel: string; volume: number }[] {
  const now = new Date();
  const result: { weekLabel: string; volume: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = getStartOfWeek(new Date(now));
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const volume = history
      .filter((w) => w.startTime >= weekStart.getTime() && w.startTime < weekEnd.getTime())
      .reduce((sum, w) => sum + w.totalVolume, 0);

    result.push({ weekLabel: getWeekLabel(weekStart), volume });
  }

  return result;
}

export function getMuscleGroupDistribution(
  history: CompletedWorkout[],
  days = 30,
): { group: string; sets: number; color: string }[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentWorkouts = history.filter((w) => w.startTime >= cutoff);

  const groupSets: Record<string, number> = {};

  for (const workout of recentWorkouts) {
    for (const ex of workout.exercises) {
      const group = getMuscleGroupCategory(ex.exercise.primaryMuscle);
      const completedSets = ex.sets.filter((s) => s.completed).length;
      groupSets[group] = (groupSets[group] ?? 0) + completedSets;
    }
  }

  return Object.entries(groupSets)
    .map(([group, sets]) => ({
      group,
      sets,
      color: MUSCLE_GROUP_COLORS[group] ?? 'primary',
    }))
    .sort((a, b) => b.sets - a.sets);
}

export function getWorkoutFrequency(
  history: CompletedWorkout[],
  weeks = 4,
): { weekLabel: string; count: number }[] {
  const now = new Date();
  const result: { weekLabel: string; count: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = getStartOfWeek(new Date(now));
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = history.filter(
      (w) => w.startTime >= weekStart.getTime() && w.startTime < weekEnd.getTime(),
    ).length;

    result.push({ weekLabel: getWeekLabel(weekStart), count });
  }

  return result;
}

export function getRecentPRs(
  records: PersonalRecord[],
  limit = 10,
): PersonalRecord[] {
  return [...records].sort((a, b) => b.date - a.date).slice(0, limit);
}

export function getBestLifts(
  history: CompletedWorkout[],
  limit = 5,
): { exerciseName: string; maxWeight: number; maxVolume: number }[] {
  const liftMap: Record<string, { exerciseName: string; maxWeight: number; maxVolume: number }> = {};

  for (const workout of history) {
    for (const ex of workout.exercises) {
      const name = ex.exercise?.name ?? ex.exerciseId;
      if (!liftMap[name]) {
        liftMap[name] = { exerciseName: name, maxWeight: 0, maxVolume: 0 };
      }

      for (const set of ex.sets) {
        if (!set.completed) continue;
        if (set.weight > liftMap[name].maxWeight) {
          liftMap[name].maxWeight = set.weight;
        }
        const volume = set.weight * set.reps;
        if (volume > liftMap[name].maxVolume) {
          liftMap[name].maxVolume = volume;
        }
      }
    }
  }

  return Object.values(liftMap)
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .slice(0, limit);
}

export function getWorkoutStreak(
  history: CompletedWorkout[],
): { currentStreak: number; longestStreak: number } {
  if (history.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Get unique workout dates (YYYY-MM-DD), sorted desc
  const dates = [...new Set(
    history.map((w) => {
      const d = new Date(w.startTime);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }),
  )].sort().reverse();

  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Calculate current streak (from today or most recent workout day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = new Date(dates[0]);
  mostRecent.setHours(0, 0, 0, 0);

  const daysSinceLast = Math.floor((today.getTime() - mostRecent.getTime()) / ONE_DAY);

  let currentStreak = 0;
  if (daysSinceLast <= 1) {
    currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);
      const diff = Math.floor((prev.getTime() - curr.getTime()) / ONE_DAY);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let streak = 1;
  const sortedAsc = [...dates].sort();
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1]);
    const curr = new Date(sortedAsc[i]);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diff = Math.floor((curr.getTime() - prev.getTime()) / ONE_DAY);
    if (diff === 1) {
      streak++;
      if (streak > longestStreak) longestStreak = streak;
    } else {
      streak = 1;
    }
  }

  return { currentStreak, longestStreak };
}

export function getWorkoutHeatmapData(
  history: CompletedWorkout[],
  days = 90,
): { date: string; volume: number; count: number }[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentWorkouts = history.filter((w) => w.startTime >= cutoff);

  const dateMap: Record<string, { volume: number; count: number }> = {};

  for (const workout of recentWorkouts) {
    const d = new Date(workout.startTime);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (!dateMap[dateKey]) {
      dateMap[dateKey] = { volume: 0, count: 0 };
    }
    dateMap[dateKey].volume += workout.totalVolume;
    dateMap[dateKey].count += 1;
  }

  return Object.entries(dateMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
