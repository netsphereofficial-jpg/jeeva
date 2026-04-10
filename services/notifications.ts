import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Alarm, Medication } from '@/types';

// ─── Configure notification handling (MUST be called at app startup) ─────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Permission Request ────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Alarm Notification ────────────────────────────────────────

/**
 * Schedule alarm notifications for each active day of the week.
 * Returns an array of notification IDs (one per day).
 * Uses CALENDAR trigger with weekday for proper day-of-week support.
 */
export async function scheduleAlarmNotifications(
  alarm: Alarm,
): Promise<string[]> {
  const notificationIds: string[] = [];

  // Cancel any existing notifications for this alarm first
  if (alarm.notificationIds) {
    for (const id of alarm.notificationIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {
        // Ignore — notification may already be cancelled
      }
    }
  }

  if (!alarm.enabled || alarm.daysOfWeek.length === 0) {
    return [];
  }

  const timeStr = formatTime12h(alarm.hour, alarm.minute);

  for (const dayOfWeek of alarm.daysOfWeek) {
    try {
      // expo-notifications weekday: 1 = Sunday, 7 = Saturday
      // Our daysOfWeek: 0 = Sunday, 6 = Saturday
      // So we add 1 to convert
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: alarm.label || getAlarmTypeLabel(alarm.type),
          body: `${timeStr} — ${alarm.label || getAlarmTypeLabel(alarm.type)}`,
          sound: true,
          ...(Platform.OS === 'ios' && { interruptionLevel: 'timeSensitive' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: alarm.hour,
          minute: alarm.minute,
          weekday: dayOfWeek + 1, // Convert 0-6 to 1-7
          repeats: true,
        },
      });
      notificationIds.push(id);
    } catch {
      // Scheduling may fail in Expo Go — log but don't crash
      console.warn(`Failed to schedule alarm for day ${dayOfWeek}`);
    }
  }

  return notificationIds;
}

/**
 * Schedule a one-time alarm for today or tomorrow at the exact time.
 * Used when no days are selected (one-time alarm).
 */
export async function scheduleOneTimeAlarm(alarm: Alarm): Promise<string[]> {
  const now = new Date();
  const targetDate = new Date();
  targetDate.setHours(alarm.hour, alarm.minute, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const secondsUntil = Math.max(1, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
  const timeStr = formatTime12h(alarm.hour, alarm.minute);

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || getAlarmTypeLabel(alarm.type),
        body: `${timeStr} — ${alarm.label || getAlarmTypeLabel(alarm.type)}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntil,
        repeats: false,
      },
    });
    return [id];
  } catch {
    console.warn('Failed to schedule one-time alarm');
    return [];
  }
}

// ─── Cancel Notification(s) ───────────────────────────────────

export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Ignore — may already be cancelled
  }
}

export async function cancelAlarmNotifications(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    await cancelNotification(id);
  }
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
  const [hourStr, minuteStr] = timeSlot.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

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

// ─── Helpers ──────────────────────────────────────────────────

function getAlarmTypeLabel(type: string): string {
  switch (type) {
    case 'wakeup': return 'Wake-Up Alarm';
    case 'workout': return 'Workout Alarm';
    case 'medication': return 'Medication Reminder';
    default: return 'Alarm';
  }
}

export function formatTime12h(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}
