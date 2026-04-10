import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BodyMeasurement } from '@/types';

interface BodyState {
  measurements: BodyMeasurement[];
  _hasHydrated: boolean;
  addMeasurement: (data: Omit<BodyMeasurement, 'id'>) => void;
  getLatest: () => BodyMeasurement | undefined;
  getHistory: (
    field: keyof BodyMeasurement,
    limit?: number,
  ) => { date: string; value: number }[];
  deleteMeasurement: (id: string) => void;
}

function generateId(): string {
  return `body_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set, get) => ({
      measurements: [],
      _hasHydrated: false,

      addMeasurement: (data) => {
        const measurement: BodyMeasurement = {
          ...data,
          id: generateId(),
        };
        set((state) => ({
          measurements: [measurement, ...state.measurements],
        }));
      },

      getLatest: () => {
        const { measurements } = get();
        if (measurements.length === 0) return undefined;
        // Sort by date descending and return first
        const sorted = [...measurements].sort(
          (a, b) => b.date.localeCompare(a.date),
        );
        return sorted[0];
      },

      getHistory: (field, limit) => {
        const { measurements } = get();
        const sorted = [...measurements].sort(
          (a, b) => a.date.localeCompare(b.date),
        );

        const result: { date: string; value: number }[] = [];
        for (const m of sorted) {
          const val = m[field];
          if (typeof val === 'number') {
            result.push({ date: m.date, value: val });
          }
        }

        if (limit !== undefined && limit > 0) {
          return result.slice(-limit);
        }
        return result;
      },

      deleteMeasurement: (id) => {
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
        }));
      },
    }),
    {
      name: 'jeeva-body',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useBodyStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
