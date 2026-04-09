import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alarm } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

interface AlarmState {
  alarms: Alarm[];
  addAlarm: (alarm: Omit<Alarm, 'id'>) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  toggleAlarm: (id: string) => void;
  deleteAlarm: (id: string) => void;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set) => ({
      alarms: [],

      addAlarm: (alarm) => {
        const newAlarm: Alarm = {
          ...alarm,
          id: generateId(),
        };
        set((state) => ({ alarms: [...state.alarms, newAlarm] }));
      },

      updateAlarm: (id: string, updates: Partial<Alarm>) => {
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        }));
      },

      toggleAlarm: (id: string) => {
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a,
          ),
        }));
      },

      deleteAlarm: (id: string) => {
        set((state) => ({
          alarms: state.alarms.filter((a) => a.id !== id),
        }));
      },
    }),
    {
      name: 'jeeva-alarms',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
