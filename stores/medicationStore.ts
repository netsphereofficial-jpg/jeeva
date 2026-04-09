import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Medication,
  MedicationLog,
  MedLogStatus,
  MedicationChecklist,
} from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface MedicationState {
  medications: Medication[];
  logs: MedicationLog[];
  addMed: (med: Omit<Medication, 'id'>) => void;
  updateMed: (id: string, updates: Partial<Medication>) => void;
  deleteMed: (id: string) => void;
  logDose: (
    medicationId: string,
    timeSlot: string,
    status: MedLogStatus,
  ) => void;
  getTodaysMeds: () => MedicationChecklist[];
}

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      medications: [],
      logs: [],

      addMed: (med) => {
        const newMed: Medication = {
          ...med,
          id: generateId(),
        };
        set((state) => ({
          medications: [...state.medications, newMed],
        }));
      },

      updateMed: (id: string, updates: Partial<Medication>) => {
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, ...updates } : m,
          ),
        }));
      },

      deleteMed: (id: string) => {
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        }));
      },

      logDose: (
        medicationId: string,
        timeSlot: string,
        status: MedLogStatus,
      ) => {
        const today = getTodayStr();
        const log: MedicationLog = {
          id: generateId(),
          medicationId,
          scheduledTime: timeSlot,
          status,
          date: today,
        };
        set((state) => {
          // Remove existing log for same med/date/timeSlot, then add new
          const filtered = state.logs.filter(
            (l) =>
              !(
                l.medicationId === medicationId &&
                l.date === today &&
                l.scheduledTime === timeSlot
              ),
          );
          return { logs: [...filtered, log] };
        });
      },

      getTodaysMeds: (): MedicationChecklist[] => {
        const state = get();
        const today = getTodayStr();
        const checklist: MedicationChecklist[] = [];

        const activeMeds = state.medications.filter((m) => m.active);

        for (const med of activeMeds) {
          for (const timeSlot of med.times) {
            const log = state.logs.find(
              (l) =>
                l.medicationId === med.id &&
                l.date === today &&
                l.scheduledTime === timeSlot,
            );
            checklist.push({
              medicationId: med.id,
              medicationName: med.name,
              dosage: med.dosage,
              timeSlot,
              status: log?.status ?? 'pending',
            });
          }
        }

        return checklist;
      },
    }),
    {
      name: 'jeeva-medications',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
