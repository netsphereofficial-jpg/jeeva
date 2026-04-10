import type {
  WorkoutExercise,
  PersonalRecord,
  WorkoutTemplate,
  CompletedWorkout,
  MedicationLog,
  Medication,
  MuscleGroupCategory,
  ProgressionSuggestionV2,
} from '@/types';

// ─── Unit Conversions ──────────────────────────────────────────

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function getDisplayWeight(
  kg: number,
  unitSystem: 'metric' | 'imperial',
): number {
  return unitSystem === 'imperial' ? kgToLbs(kg) : kg;
}

export function getStorageWeight(
  displayValue: number,
  unitSystem: 'metric' | 'imperial',
): number {
  return unitSystem === 'imperial' ? lbsToKg(displayValue) : displayValue;
}

// ─── Volume Calculations ───────────────────────────────────────

export function calculateVolume(weight: number, reps: number): number {
  return weight * reps;
}

export function calculateTotalVolume(exercises: WorkoutExercise[]): number {
  let total = 0;
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (set.completed && !set.isWarmup) {
        total += calculateVolume(set.weight, set.reps);
      }
    }
  }
  return total;
}

// ─── Muscle Group Classification ───────────────────────────────

const UPPER_BODY_GROUPS: ReadonlySet<string> = new Set([
  'chest',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'abs',
  'traps',
]);

export function isUpperBody(muscleGroup: MuscleGroupCategory | string): boolean {
  return UPPER_BODY_GROUPS.has(muscleGroup);
}

// ─── PR Detection (Task 2.5) ──────────────────────────────────

export function checkPersonalRecord(
  exerciseId: string,
  weight: number,
  reps: number,
  records: PersonalRecord[],
): { isPR: boolean; previousBest: PersonalRecord | null } {
  const volume = weight * reps;

  const exerciseRecords = records.filter((r) => r.exerciseId === exerciseId);

  if (exerciseRecords.length === 0) {
    return { isPR: true, previousBest: null };
  }

  // Find the best record by volume (weight * reps)
  let best: PersonalRecord = exerciseRecords[0];
  for (const record of exerciseRecords) {
    if (record.weight * record.reps > best.weight * best.reps) {
      best = record;
    }
  }

  const bestVolume = best.weight * best.reps;

  // New PR if: volume > best volume, OR same weight with more reps, OR more weight at same reps
  const isPR =
    volume > bestVolume ||
    (weight === best.weight && reps > best.reps) ||
    (weight > best.weight && reps === best.reps);

  return { isPR, previousBest: best };
}

// ─── Progression Engine (Task 2.6) ────────────────────────────

export function getProgressionSuggestions(
  template: WorkoutTemplate,
  history: CompletedWorkout[],
): ProgressionSuggestionV2[] {
  const suggestions: ProgressionSuggestionV2[] = [];

  for (const templateExercise of template.exercises) {
    const exerciseId = templateExercise.exerciseId;

    // Find the most recent workout containing this exercise
    let mostRecentExercise: WorkoutExercise | null = null;
    for (const workout of history) {
      const found = workout.exercises.find((e) => e.exerciseId === exerciseId);
      if (found) {
        mostRecentExercise = found;
        break; // history is assumed newest-first
      }
    }

    if (!mostRecentExercise) {
      continue;
    }

    const completedSets = mostRecentExercise.sets.filter((s) => s.completed);
    if (completedSets.length === 0) {
      continue;
    }

    // Get the max weight used across completed sets
    const maxWeight = Math.max(...completedSets.map((s) => s.weight));

    // Determine upper vs lower body for weight increment
    const isUpper = isUpperBody(
      (template as { muscleGroup?: string }).muscleGroup ?? '',
    );
    const increment = isUpper ? 2.5 : 5;

    // Check rep targets
    const targetMax = templateExercise.targetReps;
    const targetMin = Math.max(1, targetMax - 4); // approximate a range

    const allHitMax = completedSets.every((s) => s.reps >= targetMax);
    const anyBelowMin = completedSets.some((s) => s.reps < targetMin);

    let reason: 'increase' | 'decrease' | 'maintain';
    let suggestedWeight: number;

    if (allHitMax) {
      reason = 'increase';
      suggestedWeight = maxWeight + increment;
    } else if (anyBelowMin) {
      reason = 'decrease';
      suggestedWeight = Math.max(0, maxWeight - increment);
    } else {
      reason = 'maintain';
      suggestedWeight = maxWeight;
    }

    const exerciseName =
      (templateExercise as { exercise?: { name?: string } }).exercise?.name ??
      exerciseId;

    suggestions.push({
      exerciseId,
      exerciseName,
      currentWeight: maxWeight,
      suggestedWeight,
      reason,
    });
  }

  return suggestions;
}

// ─── Streak Calculation (Task 2.7) ─────────────────────────────

function formatDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function calculateMedStreak(
  logs: MedicationLog[],
  medications: Medication[],
): number {
  const activeMeds = medications.filter((m) => m.active);
  if (activeMeds.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  // Start from yesterday
  const checkDate = new Date(today);
  checkDate.setDate(checkDate.getDate() - 1);

  while (true) {
    const dateStr = formatDateStr(checkDate);
    let allTaken = true;

    for (const med of activeMeds) {
      // Each medication has times (time slots)
      for (const timeSlot of med.times) {
        const hasLog = logs.some(
          (log) =>
            log.medicationId === med.id &&
            log.date === dateStr &&
            log.scheduledTime === timeSlot &&
            log.status === 'taken',
        );
        if (!hasLog) {
          allTaken = false;
          break;
        }
      }
      if (!allTaken) break;
    }

    if (!allTaken) break;

    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export function getCalendarHeatmap(
  logs: MedicationLog[],
  medications: Medication[],
  days: number = 30,
): { date: string; status: 'taken' | 'missed' | 'future' }[] {
  const activeMeds = medications.filter((m) => m.active);
  const today = new Date();
  const todayStr = formatDateStr(today);
  const result: { date: string; status: 'taken' | 'missed' | 'future' }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDateStr(d);

    if (dateStr > todayStr) {
      result.push({ date: dateStr, status: 'future' });
      continue;
    }

    if (activeMeds.length === 0) {
      result.push({ date: dateStr, status: 'taken' });
      continue;
    }

    let allTaken = true;
    for (const med of activeMeds) {
      for (const timeSlot of med.times) {
        const hasLog = logs.some(
          (log) =>
            log.medicationId === med.id &&
            log.date === dateStr &&
            log.scheduledTime === timeSlot &&
            log.status === 'taken',
        );
        if (!hasLog) {
          allTaken = false;
          break;
        }
      }
      if (!allTaken) break;
    }

    result.push({ date: dateStr, status: allTaken ? 'taken' : 'missed' });
  }

  return result;
}
