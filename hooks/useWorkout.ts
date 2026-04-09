import { useState, useEffect, useCallback } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useRestTimer } from '@/hooks/useRestTimer';
import type { WorkoutExercise, WorkoutSet } from '@/types';

export function useWorkout() {
  const store = useWorkoutStore();
  const restTimer = useRestTimer(90);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Elapsed time tracker
  useEffect(() => {
    if (!store.activeWorkout || store.activeWorkout.status === 'completed') {
      return;
    }

    const interval = setInterval(() => {
      if (store.activeWorkout && store.activeWorkout.status !== 'paused') {
        setElapsedTime(
          Math.floor((Date.now() - store.activeWorkout.startTime) / 1000),
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [store.activeWorkout?.id, store.activeWorkout?.status]);

  const completeSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      store.completeSet(exerciseIndex, setIndex);
      const workout = useWorkoutStore.getState().activeWorkout;
      if (workout) {
        const exercise = workout.exercises[exerciseIndex];
        if (exercise) {
          restTimer.start(exercise.restTimerSec || restTimer.duration);
        }
      }
    },
    [store, restTimer],
  );

  const skipRest = useCallback(() => {
    restTimer.skip();
    store.skipRest();
  }, [restTimer, store]);

  const addSet = useCallback(
    (exerciseIndex: number) => {
      store.addSet(exerciseIndex);
    },
    [store],
  );

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
      store.updateSet(exerciseIndex, setIndex, updates);
    },
    [store],
  );

  const addExercise = useCallback(
    (exercise: WorkoutExercise) => {
      store.addExercise(exercise);
    },
    [store],
  );

  const startWorkout = useCallback(
    (name: string, exercises: WorkoutExercise[]) => {
      store.startWorkout(name, exercises);
    },
    [store],
  );

  const finishWorkout = useCallback(() => {
    restTimer.skip();
    store.finishWorkout();
  }, [store, restTimer]);

  const pause = useCallback(() => {
    store.pause();
  }, [store]);

  const resume = useCallback(() => {
    store.resume();
  }, [store]);

  return {
    workout: store.activeWorkout,
    elapsedTime,
    restTimer,
    startWorkout,
    completeSet,
    addSet,
    updateSet,
    addExercise,
    skipRest,
    finishWorkout,
    pause,
    resume,
  };
}
