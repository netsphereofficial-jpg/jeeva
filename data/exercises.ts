import type { Exercise, SplitCategory } from '@/types';

export const EXERCISES: Exercise[] = [
  // ── Chest (~10) ───────────────────────────────────────────────
  { id: 'chest-01', name: 'Flat Barbell Bench Press', primaryMuscle: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'barbell', difficulty: 'intermediate', split: 'push' },
  { id: 'chest-02', name: 'Incline Dumbbell Press', primaryMuscle: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: 'dumbbell', difficulty: 'intermediate', split: 'push' },
  { id: 'chest-03', name: 'Decline Bench Press', primaryMuscle: 'chest', secondaryMuscles: ['triceps'], equipment: 'barbell', difficulty: 'intermediate', split: 'push' },
  { id: 'chest-04', name: 'Cable Fly', primaryMuscle: 'chest', secondaryMuscles: [], equipment: 'cable', difficulty: 'beginner', split: 'push' },
  { id: 'chest-05', name: 'Dumbbell Fly', primaryMuscle: 'chest', secondaryMuscles: [], equipment: 'dumbbell', difficulty: 'beginner', split: 'push' },
  { id: 'chest-06', name: 'Push-Ups', primaryMuscle: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'bodyweight', difficulty: 'beginner', split: 'push' },
  { id: 'chest-07', name: 'Machine Chest Press', primaryMuscle: 'chest', secondaryMuscles: ['triceps'], equipment: 'machine', difficulty: 'beginner', split: 'push' },
  { id: 'chest-08', name: 'Chest Dips', primaryMuscle: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'bodyweight', difficulty: 'intermediate', split: 'push' },
  { id: 'chest-09', name: 'Incline Barbell Press', primaryMuscle: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: 'barbell', difficulty: 'intermediate', split: 'push' },
  { id: 'chest-10', name: 'Pec Deck Machine', primaryMuscle: 'chest', secondaryMuscles: [], equipment: 'machine', difficulty: 'beginner', split: 'push' },

  // ── Back (~10) ────────────────────────────────────────────────
  { id: 'back-01', name: 'Barbell Deadlift', primaryMuscle: 'back', secondaryMuscles: ['hamstrings', 'glutes', 'traps'], equipment: 'barbell', difficulty: 'advanced', split: 'pull' },
  { id: 'back-02', name: 'Pull-Ups', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'bodyweight', difficulty: 'intermediate', split: 'pull' },
  { id: 'back-03', name: 'Bent Over Barbell Row', primaryMuscle: 'back', secondaryMuscles: ['biceps', 'traps'], equipment: 'barbell', difficulty: 'intermediate', split: 'pull' },
  { id: 'back-04', name: 'Lat Pulldown', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'cable', difficulty: 'beginner', split: 'pull' },
  { id: 'back-05', name: 'Seated Cable Row', primaryMuscle: 'back', secondaryMuscles: ['biceps', 'traps'], equipment: 'cable', difficulty: 'beginner', split: 'pull' },
  { id: 'back-06', name: 'T-Bar Row', primaryMuscle: 'back', secondaryMuscles: ['biceps', 'traps'], equipment: 'barbell', difficulty: 'intermediate', split: 'pull' },
  { id: 'back-07', name: 'Dumbbell Row', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'dumbbell', difficulty: 'beginner', split: 'pull' },
  { id: 'back-08', name: 'Face Pulls', primaryMuscle: 'back', secondaryMuscles: ['shoulders'], equipment: 'cable', difficulty: 'beginner', split: 'pull' },
  { id: 'back-09', name: 'Cable Pullover', primaryMuscle: 'back', secondaryMuscles: ['chest'], equipment: 'cable', difficulty: 'intermediate', split: 'pull' },
  { id: 'back-10', name: 'Straight Arm Pulldown', primaryMuscle: 'back', secondaryMuscles: [], equipment: 'cable', difficulty: 'beginner', split: 'pull' },

  // ── Shoulders (~10) ───────────────────────────────────────────
  { id: 'shoulders-01', name: 'Overhead Press', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps', 'traps'], equipment: 'barbell', difficulty: 'intermediate', split: 'push' },
  { id: 'shoulders-02', name: 'Lateral Raise', primaryMuscle: 'shoulders', secondaryMuscles: [], equipment: 'dumbbell', difficulty: 'beginner', split: 'push' },
  { id: 'shoulders-03', name: 'Front Raise', primaryMuscle: 'shoulders', secondaryMuscles: [], equipment: 'dumbbell', difficulty: 'beginner', split: 'push' },
  { id: 'shoulders-04', name: 'Shoulder Face Pulls', primaryMuscle: 'shoulders', secondaryMuscles: ['back'], equipment: 'cable', difficulty: 'beginner', split: 'pull' },
  { id: 'shoulders-05', name: 'Arnold Press', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'dumbbell', difficulty: 'intermediate', split: 'push' },
  { id: 'shoulders-06', name: 'Rear Delt Fly', primaryMuscle: 'shoulders', secondaryMuscles: ['back'], equipment: 'dumbbell', difficulty: 'beginner', split: 'pull' },
  { id: 'shoulders-07', name: 'Upright Row', primaryMuscle: 'shoulders', secondaryMuscles: ['traps'], equipment: 'barbell', difficulty: 'intermediate', split: 'push' },
  { id: 'shoulders-08', name: 'Barbell Shrug', primaryMuscle: 'traps', secondaryMuscles: ['shoulders'], equipment: 'barbell', difficulty: 'beginner', split: 'pull' },
  { id: 'shoulders-09', name: 'Cable Lateral Raise', primaryMuscle: 'shoulders', secondaryMuscles: [], equipment: 'cable', difficulty: 'beginner', split: 'push' },
  { id: 'shoulders-10', name: 'Machine Shoulder Press', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'machine', difficulty: 'beginner', split: 'push' },

  // ── Biceps (~8) ───────────────────────────────────────────────
  { id: 'biceps-01', name: 'Barbell Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'barbell', difficulty: 'beginner', split: 'pull' },
  { id: 'biceps-02', name: 'Dumbbell Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'dumbbell', difficulty: 'beginner', split: 'pull' },
  { id: 'biceps-03', name: 'Hammer Curl', primaryMuscle: 'biceps', secondaryMuscles: ['forearms'], equipment: 'dumbbell', difficulty: 'beginner', split: 'pull' },
  { id: 'biceps-04', name: 'Preacher Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'barbell', difficulty: 'intermediate', split: 'pull' },
  { id: 'biceps-05', name: 'Concentration Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'dumbbell', difficulty: 'beginner', split: 'pull' },
  { id: 'biceps-06', name: 'Cable Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'cable', difficulty: 'beginner', split: 'pull' },
  { id: 'biceps-07', name: 'Incline Dumbbell Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'dumbbell', difficulty: 'intermediate', split: 'pull' },
  { id: 'biceps-08', name: 'EZ Bar Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'barbell', difficulty: 'beginner', split: 'pull' },

  // ── Triceps (~8) ──────────────────────────────────────────────
  { id: 'triceps-01', name: 'Close Grip Bench Press', primaryMuscle: 'triceps', secondaryMuscles: ['chest'], equipment: 'barbell', difficulty: 'intermediate', split: 'push' },
  { id: 'triceps-02', name: 'Tricep Dips', primaryMuscle: 'triceps', secondaryMuscles: ['chest', 'shoulders'], equipment: 'bodyweight', difficulty: 'intermediate', split: 'push' },
  { id: 'triceps-03', name: 'Skull Crushers', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'barbell', difficulty: 'intermediate', split: 'push' },
  { id: 'triceps-04', name: 'Tricep Pushdown', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'cable', difficulty: 'beginner', split: 'push' },
  { id: 'triceps-05', name: 'Overhead Tricep Extension', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'dumbbell', difficulty: 'beginner', split: 'push' },
  { id: 'triceps-06', name: 'Diamond Push-Ups', primaryMuscle: 'triceps', secondaryMuscles: ['chest'], equipment: 'bodyweight', difficulty: 'intermediate', split: 'push' },
  { id: 'triceps-07', name: 'Cable Kickbacks', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'cable', difficulty: 'beginner', split: 'push' },
  { id: 'triceps-08', name: 'Rope Pushdown', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'cable', difficulty: 'beginner', split: 'push' },

  // ── Legs (~10) ────────────────────────────────────────────────
  { id: 'legs-01', name: 'Barbell Squat', primaryMuscle: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'barbell', difficulty: 'intermediate', split: 'legs' },
  { id: 'legs-02', name: 'Leg Press', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine', difficulty: 'beginner', split: 'legs' },
  { id: 'legs-03', name: 'Romanian Deadlift', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'back'], equipment: 'barbell', difficulty: 'intermediate', split: 'legs' },
  { id: 'legs-04', name: 'Leg Curl', primaryMuscle: 'hamstrings', secondaryMuscles: [], equipment: 'machine', difficulty: 'beginner', split: 'legs' },
  { id: 'legs-05', name: 'Leg Extension', primaryMuscle: 'quads', secondaryMuscles: [], equipment: 'machine', difficulty: 'beginner', split: 'legs' },
  { id: 'legs-06', name: 'Bulgarian Split Squat', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'dumbbell', difficulty: 'intermediate', split: 'legs' },
  { id: 'legs-07', name: 'Calf Raises', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'machine', difficulty: 'beginner', split: 'legs' },
  { id: 'legs-08', name: 'Hack Squat', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine', difficulty: 'intermediate', split: 'legs' },
  { id: 'legs-09', name: 'Walking Lunges', primaryMuscle: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'dumbbell', difficulty: 'beginner', split: 'legs' },
  { id: 'legs-10', name: 'Hip Thrust', primaryMuscle: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'barbell', difficulty: 'intermediate', split: 'legs' },

  // ── Core (~8) ─────────────────────────────────────────────────
  { id: 'core-01', name: 'Plank', primaryMuscle: 'abs', secondaryMuscles: [], equipment: 'bodyweight', difficulty: 'beginner', split: null },
  { id: 'core-02', name: 'Hanging Leg Raise', primaryMuscle: 'abs', secondaryMuscles: [], equipment: 'bodyweight', difficulty: 'intermediate', split: null },
  { id: 'core-03', name: 'Cable Crunch', primaryMuscle: 'abs', secondaryMuscles: [], equipment: 'cable', difficulty: 'beginner', split: null },
  { id: 'core-04', name: 'Russian Twist', primaryMuscle: 'abs', secondaryMuscles: [], equipment: 'bodyweight', difficulty: 'beginner', split: null },
  { id: 'core-05', name: 'Ab Wheel Rollout', primaryMuscle: 'abs', secondaryMuscles: [], equipment: 'other', difficulty: 'intermediate', split: null },
  { id: 'core-06', name: 'Mountain Climbers', primaryMuscle: 'abs', secondaryMuscles: ['shoulders'], equipment: 'bodyweight', difficulty: 'beginner', split: null },
  { id: 'core-07', name: 'Dead Bug', primaryMuscle: 'abs', secondaryMuscles: [], equipment: 'bodyweight', difficulty: 'beginner', split: null },
  { id: 'core-08', name: 'Side Plank', primaryMuscle: 'abs', secondaryMuscles: [], equipment: 'bodyweight', difficulty: 'beginner', split: null },

  // ── Full Body (~8) ────────────────────────────────────────────
  { id: 'fullbody-01', name: 'Burpees', primaryMuscle: 'full_body', secondaryMuscles: [], equipment: 'bodyweight', difficulty: 'intermediate', split: null },
  { id: 'fullbody-02', name: 'Clean and Press', primaryMuscle: 'full_body', secondaryMuscles: ['shoulders', 'back'], equipment: 'barbell', difficulty: 'advanced', split: null },
  { id: 'fullbody-03', name: 'Thrusters', primaryMuscle: 'full_body', secondaryMuscles: ['quads', 'shoulders'], equipment: 'barbell', difficulty: 'intermediate', split: null },
  { id: 'fullbody-04', name: 'Turkish Get Up', primaryMuscle: 'full_body', secondaryMuscles: ['shoulders', 'abs'], equipment: 'kettlebell', difficulty: 'advanced', split: null },
  { id: 'fullbody-05', name: 'Kettlebell Swing', primaryMuscle: 'full_body', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'kettlebell', difficulty: 'intermediate', split: null },
  { id: 'fullbody-06', name: 'Man Makers', primaryMuscle: 'full_body', secondaryMuscles: ['chest', 'shoulders', 'back'], equipment: 'dumbbell', difficulty: 'advanced', split: null },
  { id: 'fullbody-07', name: 'Devil Press', primaryMuscle: 'full_body', secondaryMuscles: ['shoulders', 'chest'], equipment: 'dumbbell', difficulty: 'advanced', split: null },
  { id: 'fullbody-08', name: 'Battle Ropes', primaryMuscle: 'full_body', secondaryMuscles: ['shoulders', 'abs'], equipment: 'other', difficulty: 'intermediate', split: null },
];

export function getExercisesByGroup(group: string): Exercise[] {
  // Map Phase 2 group names to Phase 1 primaryMuscle values
  const groupMap: Record<string, string[]> = {
    chest: ['chest'],
    back: ['back', 'lats'],
    shoulders: ['shoulders', 'traps'],
    biceps: ['biceps'],
    triceps: ['triceps'],
    legs: ['quads', 'hamstrings', 'glutes', 'calves'],
    core: ['abs'],
    fullbody: ['full_body'],
  };

  const targets = groupMap[group] ?? [group];
  return EXERCISES.filter((e) => targets.includes(e.primaryMuscle));
}

export function getExercisesBySplit(split: SplitCategory): Exercise[] {
  return EXERCISES.filter((e) => e.split === split);
}
