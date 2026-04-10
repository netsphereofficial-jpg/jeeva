import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Exercise } from '@/types';

function generateId(): string {
  return (
    'custom-' +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
}

interface CustomExerciseState {
  exercises: Exercise[];
  favoriteIds: string[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  deleteExercise: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useCustomExerciseStore = create<CustomExerciseState>()(
  persist(
    (set, get) => ({
      exercises: [],
      favoriteIds: [],

      addExercise: (exercise) => {
        const newExercise: Exercise = {
          ...exercise,
          id: generateId(),
          isCustom: true,
        };
        set((state) => ({
          exercises: [newExercise, ...state.exercises],
        }));
      },

      deleteExercise: (id) => {
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
          favoriteIds: state.favoriteIds.filter((fid) => fid !== id),
        }));
      },

      toggleFavorite: (id) => {
        set((state) => {
          const isFav = state.favoriteIds.includes(id);
          return {
            favoriteIds: isFav
              ? state.favoriteIds.filter((fid) => fid !== id)
              : [...state.favoriteIds, id],
          };
        });
      },

      isFavorite: (id) => {
        return get().favoriteIds.includes(id);
      },
    }),
    {
      name: 'jeeva-custom-exercises',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
