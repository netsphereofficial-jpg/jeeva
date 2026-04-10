import type {
  CompletedWorkout,
  PersonalRecord,
  WorkoutTemplate,
  WaterEntry,
} from '@/types';
import { PROGRAMS } from '@/data/programs';

interface AchievementStoreApi {
  isUnlocked: (id: string) => boolean;
  checkAndUnlock: (id: string) => boolean;
}

/**
 * Returns the date string (YYYY-MM-DD) for a timestamp.
 */
function toDateStr(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Computes the longest streak of consecutive days with a workout.
 */
function computeWorkoutStreak(history: CompletedWorkout[]): number {
  if (history.length === 0) return 0;

  const uniqueDays = new Set<string>();
  for (const w of history) {
    uniqueDays.add(toDateStr(w.startTime));
  }

  const sortedDays = Array.from(uniqueDays).sort();
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Computes how many consecutive days the user hit their water goal,
 * counting backwards from today.
 */
function computeWaterStreak(
  waterEntries: WaterEntry[],
  waterGoal: number,
): number {
  if (waterEntries.length === 0 || waterGoal <= 0) return 0;

  // Group entries by date
  const dailyTotals: Record<string, number> = {};
  for (const entry of waterEntries) {
    const dateStr = toDateStr(entry.timestamp);
    dailyTotals[dateStr] = (dailyTotals[dateStr] ?? 0) + entry.amountMl;
  }

  // Walk backwards from today
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = toDateStr(checkDate.getTime());
    const total = dailyTotals[dateStr] ?? 0;

    if (total >= waterGoal) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Checks if user had a "perfect week" — 5+ unique workout days in any
 * calendar week (Mon-Sun).
 */
function hasPerfectWeek(history: CompletedWorkout[]): boolean {
  if (history.length < 5) return false;

  // Group workout dates by ISO week
  const weekMap: Record<string, Set<string>> = {};

  for (const w of history) {
    const d = new Date(w.startTime);
    // Get ISO week key: year-week
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const daysSinceJan1 = Math.floor(
      (d.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24),
    );
    const weekNum = Math.ceil((daysSinceJan1 + jan1.getDay() + 1) / 7);
    const weekKey = `${d.getFullYear()}-W${weekNum}`;
    const dateStr = toDateStr(w.startTime);

    if (!weekMap[weekKey]) {
      weekMap[weekKey] = new Set();
    }
    weekMap[weekKey].add(dateStr);
  }

  return Object.values(weekMap).some((days) => days.size >= 5);
}

/**
 * Gets the set of unique program IDs the user has started workouts from.
 * A workout is from a program if its templateId matches a template that
 * originated from one of the preset programs.
 */
function getUsedProgramIds(
  history: CompletedWorkout[],
  templates: WorkoutTemplate[],
): Set<string> {
  const programIds = new Set<string>();
  const allProgramIds = new Set(PROGRAMS.map((p) => p.id));

  // Check workout names against program day names
  for (const w of history) {
    for (const program of PROGRAMS) {
      for (const day of program.days) {
        if (
          w.name.toLowerCase().includes(program.name.toLowerCase()) ||
          w.name.toLowerCase().includes(day.name.toLowerCase())
        ) {
          programIds.add(program.id);
        }
      }
    }
  }

  // Also check templates
  for (const t of templates) {
    for (const program of PROGRAMS) {
      if (
        t.name.toLowerCase().includes(program.name.toLowerCase()) &&
        allProgramIds.has(program.id)
      ) {
        programIds.add(program.id);
      }
    }
  }

  return programIds;
}

/**
 * Main achievement checker.
 * Call after every workout completion, water log, and template creation.
 */
export function checkAchievements(
  history: CompletedWorkout[],
  personalRecords: PersonalRecord[],
  templates: WorkoutTemplate[],
  waterEntries: WaterEntry[],
  waterGoal: number,
  achievementStore: AchievementStoreApi,
): void {
  const { isUnlocked, checkAndUnlock } = achievementStore;

  // ── Workout Milestones ────────────────────────────────────
  if (!isUnlocked('first-workout') && history.length >= 1) {
    checkAndUnlock('first-workout');
  }
  if (!isUnlocked('ten-workouts') && history.length >= 10) {
    checkAndUnlock('ten-workouts');
  }
  if (!isUnlocked('fifty-workouts') && history.length >= 50) {
    checkAndUnlock('fifty-workouts');
  }
  if (!isUnlocked('hundred-workouts') && history.length >= 100) {
    checkAndUnlock('hundred-workouts');
  }

  // ── Streak Achievements ───────────────────────────────────
  const streak = computeWorkoutStreak(history);
  if (!isUnlocked('streak-7') && streak >= 7) {
    checkAndUnlock('streak-7');
  }
  if (!isUnlocked('streak-30') && streak >= 30) {
    checkAndUnlock('streak-30');
  }
  if (!isUnlocked('streak-90') && streak >= 90) {
    checkAndUnlock('streak-90');
  }

  // ── PR Achievements ───────────────────────────────────────
  if (!isUnlocked('first-pr') && personalRecords.length >= 1) {
    checkAndUnlock('first-pr');
  }
  if (!isUnlocked('ten-prs') && personalRecords.length >= 10) {
    checkAndUnlock('ten-prs');
  }
  if (!isUnlocked('fifty-prs') && personalRecords.length >= 50) {
    checkAndUnlock('fifty-prs');
  }

  // ── Volume Achievements ───────────────────────────────────
  const totalVolume = history.reduce((sum, w) => sum + w.totalVolume, 0);
  if (!isUnlocked('volume-10k') && totalVolume >= 10_000) {
    checkAndUnlock('volume-10k');
  }
  if (!isUnlocked('volume-100k') && totalVolume >= 100_000) {
    checkAndUnlock('volume-100k');
  }
  if (!isUnlocked('volume-1m') && totalVolume >= 1_000_000) {
    checkAndUnlock('volume-1m');
  }

  // ── Hydration Achievements ────────────────────────────────
  const waterStreak = computeWaterStreak(waterEntries, waterGoal);
  if (!isUnlocked('water-goal-7') && waterStreak >= 7) {
    checkAndUnlock('water-goal-7');
  }
  if (!isUnlocked('water-goal-30') && waterStreak >= 30) {
    checkAndUnlock('water-goal-30');
  }

  // ── Consistency Achievements ──────────────────────────────
  if (!isUnlocked('early-bird')) {
    const earlyWorkout = history.some((w) => {
      const hour = new Date(w.startTime).getHours();
      return hour < 7;
    });
    if (earlyWorkout) checkAndUnlock('early-bird');
  }

  if (!isUnlocked('night-owl')) {
    const lateWorkout = history.some((w) => {
      const hour = new Date(w.endTime).getHours();
      return hour >= 21;
    });
    if (lateWorkout) checkAndUnlock('night-owl');
  }

  if (!isUnlocked('perfect-week') && hasPerfectWeek(history)) {
    checkAndUnlock('perfect-week');
  }

  // ── Special Achievements ──────────────────────────────────
  if (!isUnlocked('first-template') && templates.length >= 1) {
    checkAndUnlock('first-template');
  }

  if (!isUnlocked('five-programs')) {
    const usedPrograms = getUsedProgramIds(history, templates);
    if (usedPrograms.size >= 5) {
      checkAndUnlock('five-programs');
    }
  }
}
