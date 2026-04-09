import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HealthData, StepData, HeartRateData, SleepData } from '@/types';

const DEFAULT_HEALTH_DATA: HealthData = {
  sleep: [],
  heartRate: [],
  steps: [],
  waterEntries: [],
  connected: false,
  lastSynced: null,
};

interface HealthState {
  data: HealthData;
  _hasHydrated: boolean;
  updateSteps: (stepData: StepData) => void;
  updateHeartRate: (hrData: HeartRateData) => void;
  updateSleep: (sleepData: SleepData) => void;
  setConnected: (connected: boolean) => void;
  setLastSynced: (timestamp: number) => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      data: DEFAULT_HEALTH_DATA,
      _hasHydrated: false,

      updateSteps: (stepData: StepData) => {
        set((state) => {
          // Replace existing entry for the same date, or add new
          const existing = state.data.steps.findIndex(
            (s) => s.date === stepData.date,
          );
          const steps = [...state.data.steps];
          if (existing >= 0) {
            steps[existing] = stepData;
          } else {
            steps.push(stepData);
          }
          return { data: { ...state.data, steps } };
        });
      },

      updateHeartRate: (hrData: HeartRateData) => {
        set((state) => ({
          data: {
            ...state.data,
            heartRate: [...state.data.heartRate, hrData],
          },
        }));
      },

      updateSleep: (sleepData: SleepData) => {
        set((state) => {
          const existing = state.data.sleep.findIndex(
            (s) => s.date === sleepData.date,
          );
          const sleep = [...state.data.sleep];
          if (existing >= 0) {
            sleep[existing] = sleepData;
          } else {
            sleep.push(sleepData);
          }
          return { data: { ...state.data, sleep } };
        });
      },

      setConnected: (connected: boolean) => {
        set((state) => ({
          data: { ...state.data, connected },
        }));
      },

      setLastSynced: (timestamp: number) => {
        set((state) => ({
          data: { ...state.data, lastSynced: timestamp },
        }));
      },
    }),
    {
      name: 'jeeva-health',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useHealthStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
