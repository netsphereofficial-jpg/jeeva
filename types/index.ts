// ── Unit & Settings ──────────────────────────────────────────────

export type UnitSystem = 'metric' | 'imperial';

export interface UserSettings {
  unitSystem: UnitSystem;
  dailyWaterGoalMl: number;
  dailyStepGoal: number;
  restTimerDefaultSec: number;
}

// ── Exercise Catalog ─────────────────────────────────────────────

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'traps'
  | 'lats'
  | 'full_body';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'other';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  instructions?: string;
  imageUrl?: string;
}

// ── Workout Tracking ─────────────────────────────────────────────

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  isWarmup: boolean;
  rpe?: number;
  completed: boolean;
  timestamp?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
  restTimerSec: number;
}

export type WorkoutStatus = 'active' | 'paused' | 'completed';

export interface ActiveWorkout {
  id: string;
  templateId?: string;
  name: string;
  startTime: number;
  exercises: WorkoutExercise[];
  status: WorkoutStatus;
  currentExerciseIndex: number;
  currentSetIndex: number;
}

export interface CompletedWorkout {
  id: string;
  templateId?: string;
  name: string;
  startTime: number;
  endTime: number;
  durationSec: number;
  exercises: WorkoutExercise[];
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  notes?: string;
}

// ── Templates ────────────────────────────────────────────────────

export interface TemplateExercise {
  exerciseId: string;
  exercise: Exercise;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  restTimerSec: number;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  lastPerformed?: number;
  timesPerformed: number;
  estimatedDurationMin: number;
  color?: string;
}

// ── Progression ──────────────────────────────────────────────────

export interface ProgressionSuggestion {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  suggestedWeight: number;
  currentReps: number;
  suggestedReps: number;
  reason: string;
}

// ── Personal Records ─────────────────────────────────────────────

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  oneRepMax: number;
  date: number;
  workoutId: string;
}

// ── Alarms ───────────────────────────────────────────────────────

export type AlarmType = 'wakeup' | 'workout' | 'medication';

export interface Alarm {
  id: string;
  type: AlarmType;
  label: string;
  hour: number;
  minute: number;
  enabled: boolean;
  daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday
  sound?: string;
  vibrate: boolean;
  snoozeEnabled: boolean;
  snoozeDurationMin: number;
}

// ── Medication ───────────────────────────────────────────────────

export type MedFrequency = 'daily' | 'twice_daily' | 'weekly' | 'as_needed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: MedFrequency;
  times: string[]; // HH:MM format
  notes?: string;
  color?: string;
  active: boolean;
}

export type MedLogStatus = 'taken' | 'skipped' | 'missed';

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: string;
  actualTime?: string;
  status: MedLogStatus;
  date: string; // YYYY-MM-DD
}

// ── Water Tracking ───────────────────────────────────────────────

export interface WaterEntry {
  id: string;
  amountMl: number;
  timestamp: number;
}

// ── Health & Sleep ───────────────────────────────────────────────

export type SleepStage = 'awake' | 'light' | 'deep' | 'rem';

export interface SleepData {
  id: string;
  date: string; // YYYY-MM-DD
  bedTime: number;
  wakeTime: number;
  durationMin: number;
  stages: { stage: SleepStage; startMin: number; endMin: number }[];
  quality: number; // 0-100
}

export interface HeartRateData {
  timestamp: number;
  bpm: number;
  context?: 'resting' | 'active' | 'workout' | 'sleep';
}

export interface StepData {
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm: number;
  caloriesBurned: number;
  hourlySteps: number[]; // 24 entries, one per hour
}

export interface HealthData {
  sleep: SleepData[];
  heartRate: HeartRateData[];
  steps: StepData[];
  waterEntries: WaterEntry[];
  connected: boolean;
  lastSynced: number | null;
}

// ── Phase 2 Additions ───────────────────────────────────────────

/** Muscle group categories used by Phase 2 calculations */
export type MuscleGroupCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core'
  | 'fullbody';

/** Medication time slots for Phase 2 medication tracking */
export type MedicationTimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface MedicationChecklist {
  medicationId: string;
  medicationName: string;
  dosage: string;
  timeSlot: string;
  status: MedLogStatus | 'pending';
}

/** Progression suggestion for Phase 2 engine */
export interface ProgressionSuggestionV2 {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  suggestedWeight: number;
  reason: 'increase' | 'decrease' | 'maintain';
}
