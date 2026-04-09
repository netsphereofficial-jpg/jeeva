import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ActiveWorkout,
  CompletedWorkout,
  PersonalRecord,
  WorkoutExercise,
  WorkoutSet,
  MuscleGroup,
} from '@/types';
import { calculateTotalVolume, checkPersonalRecord } from '@/utils/calculations';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface WorkoutState {
  activeWorkout: ActiveWorkout | null;
  history: CompletedWorkout[];
  personalRecords: PersonalRecord[];

  startWorkout: (name: string, exercises: WorkoutExercise[]) => void;
  addExercise: (exercise: WorkoutExercise) => void;
  addSet: (exerciseIndex: number) => void;
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<WorkoutSet>,
  ) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  skipRest: () => void;
  pause: () => void;
  resume: () => void;
  finishWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      history: [],
      personalRecords: [],

      startWorkout: (name: string, exercises: WorkoutExercise[]) => {
        const workout: ActiveWorkout = {
          id: generateId(),
          name,
          startTime: Date.now(),
          exercises,
          status: 'active',
          currentExerciseIndex: 0,
          currentSetIndex: 0,
        };
        set({ activeWorkout: workout });
      },

      addExercise: (exercise: WorkoutExercise) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: [...state.activeWorkout.exercises, exercise],
            },
          };
        });
      },

      addSet: (exerciseIndex: number) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          const exercises = [...state.activeWorkout.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          const sets = [...exercise.sets];
          const lastSet = sets[sets.length - 1];
          const newSet: WorkoutSet = {
            id: generateId(),
            weight: lastSet?.weight ?? 0,
            reps: lastSet?.reps ?? 0,
            isWarmup: false,
            completed: false,
          };
          sets.push(newSet);
          exercise.sets = sets;
          exercises[exerciseIndex] = exercise;
          return {
            activeWorkout: { ...state.activeWorkout, exercises },
          };
        });
      },

      updateSet: (
        exerciseIndex: number,
        setIndex: number,
        updates: Partial<WorkoutSet>,
      ) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          const exercises = [...state.activeWorkout.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          const sets = [...exercise.sets];
          sets[setIndex] = { ...sets[setIndex], ...updates };
          exercise.sets = sets;
          exercises[exerciseIndex] = exercise;
          return {
            activeWorkout: { ...state.activeWorkout, exercises },
          };
        });
      },

      completeSet: (exerciseIndex: number, setIndex: number) => {
        const state = get();
        if (!state.activeWorkout) return;

        const exercises = [...state.activeWorkout.exercises];
        const exercise = { ...exercises[exerciseIndex] };
        const sets = [...exercise.sets];
        const completedSet = { ...sets[setIndex], completed: true, timestamp: Date.now() };
        sets[setIndex] = completedSet;
        exercise.sets = sets;
        exercises[exerciseIndex] = exercise;

        // PR check
        const { isPR } = checkPersonalRecord(
          exercise.exerciseId,
          completedSet.weight,
          completedSet.reps,
          state.personalRecords,
        );

        let newRecords = state.personalRecords;
        if (isPR && completedSet.weight > 0) {
          const pr: PersonalRecord = {
            id: generateId(),
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exercise?.name ?? exercise.exerciseId,
            weight: completedSet.weight,
            reps: completedSet.reps,
            oneRepMax: completedSet.weight * (1 + completedSet.reps / 30),
            date: Date.now(),
            workoutId: state.activeWorkout.id,
          };
          newRecords = [...state.personalRecords, pr];
        }

        set({
          activeWorkout: {
            ...state.activeWorkout,
            exercises,
            status: 'active', // could be 'resting' if you want rest timer
          },
          personalRecords: newRecords,
        });
      },

      skipRest: () => {
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: { ...state.activeWorkout, status: 'active' },
          };
        });
      },

      pause: () => {
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: { ...state.activeWorkout, status: 'paused' },
          };
        });
      },

      resume: () => {
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: { ...state.activeWorkout, status: 'active' },
          };
        });
      },

      finishWorkout: () => {
        const state = get();
        if (!state.activeWorkout) return;

        const endTime = Date.now();
        const totalVolume = calculateTotalVolume(state.activeWorkout.exercises);
        const totalSets = state.activeWorkout.exercises.reduce(
          (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
          0,
        );
        const totalReps = state.activeWorkout.exercises.reduce(
          (sum, ex) =>
            sum +
            ex.sets
              .filter((s) => s.completed)
              .reduce((r, s) => r + s.reps, 0),
          0,
        );
        const durationSec = Math.floor(
          (endTime - state.activeWorkout.startTime) / 1000,
        );

        // Count PRs set during this workout
        const prCount = state.personalRecords.filter(
          (pr) => pr.workoutId === state.activeWorkout?.id,
        ).length;

        const completed: CompletedWorkout = {
          id: state.activeWorkout.id,
          templateId: state.activeWorkout.templateId,
          name: state.activeWorkout.name,
          startTime: state.activeWorkout.startTime,
          endTime,
          durationSec,
          exercises: state.activeWorkout.exercises,
          totalVolume,
          totalSets,
          totalReps,
        };

        set({
          activeWorkout: null,
          history: [completed, ...state.history],
        });
      },
    }),
    {
      name: 'jeeva-workout',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
