import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WaterEntry } from '@/types';

function getTodayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

interface WaterState {
  entries: WaterEntry[];
  goal: number;
  addWater: (amount: number) => void;
  undoLast: () => void;
  getTodayTotal: () => number;
  getTodayEntries: () => WaterEntry[];
  getHourlyBreakdown: () => { hour: number; amount: number }[];
  setGoal: (ml: number) => void;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      entries: [],
      goal: 3000,

      addWater: (amount: number) => {
        const entry: WaterEntry = {
          id: generateId(),
          amountMl: amount,
          timestamp: Date.now(),
        };
        set((state) => ({ entries: [...state.entries, entry] }));
      },

      undoLast: () => {
        const today = getTodayStr();
        set((state) => {
          const todayEntries = state.entries.filter((e) => {
            const d = new Date(e.timestamp);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return dateStr === today;
          });
          if (todayEntries.length === 0) return state;
          const lastEntry = todayEntries[todayEntries.length - 1];
          return {
            entries: state.entries.filter((e) => e.id !== lastEntry.id),
          };
        });
      },

      getTodayTotal: (): number => {
        const entries = get().getTodayEntries();
        return entries.reduce((sum, e) => sum + e.amountMl, 0);
      },

      getTodayEntries: (): WaterEntry[] => {
        const today = getTodayStr();
        return get().entries.filter((e) => {
          const d = new Date(e.timestamp);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return dateStr === today;
        });
      },

      getHourlyBreakdown: (): { hour: number; amount: number }[] => {
        const todayEntries = get().getTodayEntries();
        const hourly: Record<number, number> = {};
        for (let h = 0; h < 24; h++) {
          hourly[h] = 0;
        }
        for (const entry of todayEntries) {
          const hour = new Date(entry.timestamp).getHours();
          hourly[hour] += entry.amountMl;
        }
        return Array.from({ length: 24 }, (_, h) => ({
          hour: h,
          amount: hourly[h],
        }));
      },

      setGoal: (ml: number) => set({ goal: ml }),
    }),
    {
      name: 'jeeva-water',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
