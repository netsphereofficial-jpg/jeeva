import type { CompletedWorkout, PersonalRecord } from '@/types';

export interface WorkoutInsight {
  type: 'volume_comparison' | 'pr_count' | 'streak' | 'recovery' | 'muscle_hit';
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'primary' | 'health' | 'pr' | 'water' | 'sleep' | 'heart';
}

/**
 * Generate smart insights for a completed workout by comparing to history.
 */
export function generateWorkoutInsights(
  workout: CompletedWorkout,
  history: CompletedWorkout[],
  personalRecords: PersonalRecord[],
): WorkoutInsight[] {
  const insights: WorkoutInsight[] = [];

  // 1. Volume comparison — compare to last similar workout (same name or muscle groups)
  const previousSimilar = history.find(
    (w) => w.id !== workout.id && w.name === workout.name,
  );
  if (previousSimilar) {
    const volumeDiff = workout.totalVolume - previousSimilar.totalVolume;
    const volumePct = previousSimilar.totalVolume > 0
      ? Math.round((volumeDiff / previousSimilar.totalVolume) * 100)
      : 0;

    if (volumePct !== 0) {
      insights.push({
        type: 'volume_comparison',
        title: volumePct > 0 ? 'Volume Up!' : 'Volume Down',
        value: `${volumePct > 0 ? '+' : ''}${volumePct}%`,
        description: volumePct > 0
          ? `${Math.abs(volumeDiff).toLocaleString()} more kg than last ${workout.name}`
          : `${Math.abs(volumeDiff).toLocaleString()} less kg than last ${workout.name}`,
        trend: volumePct > 0 ? 'up' : 'down',
        color: volumePct > 0 ? 'health' : 'heart',
      });
    }
  }

  // 2. PR count
  const workoutPRs = personalRecords.filter((pr) => pr.workoutId === workout.id);
  if (workoutPRs.length > 0) {
    insights.push({
      type: 'pr_count',
      title: workoutPRs.length === 1 ? 'New PR!' : `${workoutPRs.length} New PRs!`,
      value: String(workoutPRs.length),
      description: workoutPRs.length === 1
        ? `${workoutPRs[0].exerciseName} — ${workoutPRs[0].weight}kg × ${workoutPRs[0].reps}`
        : `Personal records smashed across ${workoutPRs.length} exercises`,
      trend: 'up',
      color: 'pr',
    });
  }

  // 3. Recovery suggestion based on volume
  const avgVolume = history.length > 0
    ? history.reduce((sum, w) => sum + w.totalVolume, 0) / history.length
    : workout.totalVolume;

  const volumeRatio = avgVolume > 0 ? workout.totalVolume / avgVolume : 1;
  let recoveryLevel: string;
  let restDays: string;

  if (volumeRatio > 1.3) {
    recoveryLevel = 'Heavy Session';
    restDays = '48-72 hours';
  } else if (volumeRatio > 0.8) {
    recoveryLevel = 'Moderate Session';
    restDays = '24-48 hours';
  } else {
    recoveryLevel = 'Light Session';
    restDays = '24 hours';
  }

  insights.push({
    type: 'recovery',
    title: recoveryLevel,
    value: restDays,
    description: `Suggested recovery time before training the same muscles`,
    trend: 'neutral',
    color: 'sleep',
  });

  // 4. Muscle groups hit
  const muscleGroups = new Set<string>();
  for (const ex of workout.exercises) {
    if (ex.exercise?.primaryMuscle) {
      muscleGroups.add(ex.exercise.primaryMuscle);
    }
  }

  if (muscleGroups.size > 0) {
    insights.push({
      type: 'muscle_hit',
      title: 'Muscles Targeted',
      value: String(muscleGroups.size),
      description: Array.from(muscleGroups)
        .map((g) => g.charAt(0).toUpperCase() + g.slice(1))
        .join(', '),
      trend: 'neutral',
      color: 'water',
    });
  }

  // 5. Workout streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const dayMs = 86400000;

  for (let d = 0; d < 365; d++) {
    const checkDate = new Date(today.getTime() - d * dayMs);
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasWorkout = history.some((w) => {
      const wDate = new Date(w.startTime).toISOString().split('T')[0];
      return wDate === dateStr;
    });
    if (hasWorkout) {
      streak++;
    } else if (d > 0) {
      break;
    }
  }

  if (streak >= 2) {
    insights.push({
      type: 'streak',
      title: 'On Fire!',
      value: `${streak} days`,
      description: `You've worked out ${streak} days in a row. Keep it up!`,
      trend: 'up',
      color: 'primary',
    });
  }

  return insights;
}
