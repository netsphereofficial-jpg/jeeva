import type { CompletedWorkout } from '@/types';

export interface ExerciseHistoryEntry {
  date: string;
  sets: { weight: number; reps: number; completed: boolean }[];
  maxWeight: number;
  totalVolume: number;
}

/**
 * Get the last N workout sessions where a specific exercise was performed.
 */
export function getExerciseHistory(
  exerciseId: string,
  history: CompletedWorkout[],
  limit: number = 3,
): ExerciseHistoryEntry[] {
  const entries: ExerciseHistoryEntry[] = [];

  for (const workout of history) {
    if (entries.length >= limit) break;

    const exercise = workout.exercises.find(
      (ex) => ex.exerciseId === exerciseId,
    );

    if (exercise) {
      const completedSets = exercise.sets.filter((s) => s.completed);
      const maxWeight = completedSets.length > 0
        ? Math.max(...completedSets.map((s) => s.weight))
        : 0;
      const totalVolume = completedSets.reduce(
        (sum, s) => sum + s.weight * s.reps,
        0,
      );

      const date = new Date(workout.startTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      entries.push({
        date,
        sets: exercise.sets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
        })),
        maxWeight,
        totalVolume,
      });
    }
  }

  return entries;
}

/**
 * Get estimated 1RM using Epley formula: weight × (1 + reps/30)
 */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Get all-time best for an exercise across all workouts.
 */
export function getExerciseBest(
  exerciseId: string,
  history: CompletedWorkout[],
): { maxWeight: number; maxVolume: number; estimated1RM: number } | null {
  let maxWeight = 0;
  let maxVolume = 0;
  let estimated1RM = 0;

  for (const workout of history) {
    const exercise = workout.exercises.find(
      (ex) => ex.exerciseId === exerciseId,
    );
    if (!exercise) continue;

    for (const set of exercise.sets) {
      if (!set.completed) continue;
      if (set.weight > maxWeight) maxWeight = set.weight;
      const vol = set.weight * set.reps;
      if (vol > maxVolume) maxVolume = vol;
      const e1rm = estimateOneRepMax(set.weight, set.reps);
      if (e1rm > estimated1RM) estimated1RM = e1rm;
    }
  }

  if (maxWeight === 0) return null;
  return { maxWeight, maxVolume, estimated1RM };
}
