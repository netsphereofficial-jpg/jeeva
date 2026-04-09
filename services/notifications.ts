import * as Notifications from 'expo-notifications';
import type { Alarm, Medication } from '@/types';

// ─── Permission Request ────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Alarm Notification ────────────────────────────────────────

export async function scheduleAlarmNotification(
  alarm: Alarm,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: alarm.label || `${alarm.type} Alarm`,
      body: `It's ${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')} - ${alarm.label}`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: alarm.hour,
      minute: alarm.minute,
    },
  });
  return id;
}

// ─── Cancel Notification ───────────────────────────────────────

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

// ─── Rest Timer Notification ───────────────────────────────────

export async function scheduleRestTimerNotification(
  seconds: number,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rest Timer Complete',
      body: 'Time to start your next set!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
  return id;
}

// ─── Medication Reminder ───────────────────────────────────────

export async function scheduleMedicationReminder(
  medication: Medication,
  timeSlot: string,
): Promise<string> {
  // Parse HH:mm time slot
  const parts = timeSlot.split(':');
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Medication Reminder',
      body: `Time to take ${medication.name} (${medication.dosage})`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}
