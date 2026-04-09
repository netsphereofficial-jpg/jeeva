import { useMemo, useCallback } from 'react';
import { useMedicationStore } from '@/stores/medicationStore';
import { scheduleMedicationReminder } from '@/services/notifications';
import { calculateMedStreak, getCalendarHeatmap } from '@/utils/calculations';
import type { Medication, MedLogStatus } from '@/types';

interface TodaysMedItem {
  medication: { id: string; name: string; dosage: string };
  timeSlot: string;
  status: MedLogStatus | 'pending';
}

export function useMedications() {
  const medications = useMedicationStore((s) => s.medications);
  const logs = useMedicationStore((s) => s.logs);
  const addMedStore = useMedicationStore((s) => s.addMed);
  const logDoseStore = useMedicationStore((s) => s.logDose);
  const getTodaysMedsStore = useMedicationStore((s) => s.getTodaysMeds);

  const todaysMeds = useMemo<TodaysMedItem[]>(() => {
    const checklist = getTodaysMedsStore();
    return checklist.map((item) => ({
      medication: {
        id: item.medicationId,
        name: item.medicationName,
        dosage: item.dosage,
      },
      timeSlot: item.timeSlot,
      status: item.status,
    }));
  }, [getTodaysMedsStore, medications, logs]);

  const streak = useMemo(() => {
    return calculateMedStreak(logs, medications);
  }, [logs, medications]);

  const calendarData = useMemo(() => {
    return getCalendarHeatmap(logs, medications, 30);
  }, [logs, medications]);

  const logDose = useCallback(
    (medId: string, timeSlot: string) => {
      logDoseStore(medId, timeSlot, 'taken');
    },
    [logDoseStore],
  );

  const addMedication = useCallback(
    async (data: Omit<Medication, 'id'>) => {
      addMedStore(data);
      // Schedule notifications for each time slot
      if (data.active) {
        for (const timeSlot of data.times) {
          try {
            await scheduleMedicationReminder(data as Medication, timeSlot);
          } catch {
            // Notification scheduling may fail silently
          }
        }
      }
    },
    [addMedStore],
  );

  return {
    medications,
    todaysMeds,
    streak,
    calendarData,
    logDose,
    addMedication,
  };
}
