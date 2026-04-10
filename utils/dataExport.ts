import { useWorkoutStore } from '@/stores/workoutStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useWaterStore } from '@/stores/waterStore';
import { useAlarmStore } from '@/stores/alarmStore';
import { useMedicationStore } from '@/stores/medicationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useBodyStore } from '@/stores/bodyStore';
import * as Sharing from 'expo-sharing';
import { Directory, File } from 'expo-file-system';

/**
 * Export all app data as a JSON file and open the share sheet.
 */
export async function exportAllData(): Promise<void> {
  const data = {
    exportDate: new Date().toISOString(),
    appVersion: '1.0.0',
    settings: useSettingsStore.getState().settings,
    workoutHistory: useWorkoutStore.getState().history,
    personalRecords: useWorkoutStore.getState().personalRecords,
    templates: useTemplateStore.getState().templates,
    waterEntries: useWaterStore.getState().entries,
    waterGoal: useWaterStore.getState().goal,
    alarms: useAlarmStore.getState().alarms,
    medications: useMedicationStore.getState().medications,
    medicationLogs: useMedicationStore.getState().logs,
    bodyMeasurements: useBodyStore.getState().measurements,
  };

  const jsonString = JSON.stringify(data, null, 2);

  try {
    // Write to a temporary file using File.write()
    const fileName = `jeeva-backup-${new Date().toISOString().split('T')[0]}.json`;
    const file = new File(`file:///tmp/${fileName}`);
    file.create();
    await file.write(jsonString);

    // Share the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(`file:///tmp/${fileName}`, {
        mimeType: 'application/json',
        dialogTitle: 'Export JEEVA Data',
      });
    }
  } catch (err) {
    console.warn('[DataExport] Failed to export:', err);
    throw err;
  }
}

/**
 * Get a summary of all stored data counts for display.
 */
export function getDataSummary(): {
  workouts: number;
  templates: number;
  personalRecords: number;
  waterEntries: number;
  alarms: number;
  medications: number;
  bodyMeasurements: number;
} {
  return {
    workouts: useWorkoutStore.getState().history.length,
    templates: useTemplateStore.getState().templates.length,
    personalRecords: useWorkoutStore.getState().personalRecords.length,
    waterEntries: useWaterStore.getState().entries.length,
    alarms: useAlarmStore.getState().alarms.length,
    medications: useMedicationStore.getState().medications.length,
    bodyMeasurements: useBodyStore.getState().measurements.length,
  };
}
