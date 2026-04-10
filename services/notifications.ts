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
 * Calculate seconds until the next occurrence of a given hour:minute
 * on any of the specified weekdays.
 */
function getSecondsUntilNextOccurrence(
  hour: number,
  minute: number,
  daysOfWeek: number[], // 0=Sunday, 6=Saturday
): number {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday

  // Try each day, starting from today, up to 7 days ahead
  for (let offset = 0; offset < 7; offset++) {
    const candidateDay = (currentDay + offset) % 7;
    if (!daysOfWeek.includes(candidateDay)) continue;

    const target = new Date();
    target.setDate(now.getDate() + offset);
    target.setHours(hour, minute, 0, 0);

    const diff = Math.floor((target.getTime() - now.getTime()) / 1000);
    if (diff > 5) {
      // At least 5 seconds in the future
      return diff;
    }
  }

  // Fallback: schedule for next week on the first matching day
  for (let offset = 1; offset <= 7; offset++) {
    const candidateDay = (currentDay + offset) % 7;
    if (!daysOfWeek.includes(candidateDay)) continue;

    const target = new Date();
    target.setDate(now.getDate() + offset);
    target.setHours(hour, minute, 0, 0);

    return Math.max(1, Math.floor((target.getTime() - now.getTime()) / 1000));
  }

  // Should never reach here, but schedule for 24hrs as failsafe
  return 86400;
}

/**
 * Schedule alarm notification using TIME_INTERVAL trigger.
 * This works reliably in both Expo Go and development builds.
 *
 * Since TIME_INTERVAL can't repeat on specific weekdays, we schedule
 * for the NEXT matching occurrence. The app should reschedule after each fire.
 */
export async function scheduleAlarmNotifications(
  alarm: Alarm,
): Promise<string[]> {
  // Cancel any existing notifications for this alarm first
  if (alarm.notificationIds) {
    for (const id of alarm.notificationIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {
        // Ignore
      }
    }
  }

  if (!alarm.enabled || alarm.daysOfWeek.length === 0) {
    return [];
  }

  const timeStr = formatTime12h(alarm.hour, alarm.minute);
  const seconds = getSecondsUntilNextOccurrence(
    alarm.hour,
    alarm.minute,
    alarm.daysOfWeek,
  );

  console.log(
    `[JEEVA Alarm] Scheduling "${alarm.label || alarm.type}" for ${timeStr} — fires in ${seconds}s (${Math.round(seconds / 60)} min)`,
  );

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${alarm.label || getAlarmTypeLabel(alarm.type)}`,
        body: `It's ${timeStr}!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false, // We'll reschedule on next app open
      },
    });

    console.log(`[JEEVA Alarm] Scheduled notification ID: ${id}`);

    // Also list all scheduled notifications for debugging
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`[JEEVA Alarm] Total scheduled notifications: ${scheduled.length}`);

    return [id];
  } catch (err) {
    console.error('[JEEVA Alarm] Failed to schedule:', err);
    return [];
  }
}

/**
 * Schedule a one-time alarm (no days selected).
 */
export async function scheduleOneTimeAlarm(alarm: Alarm): Promise<string[]> {
  const now = new Date();
  const targetDate = new Date();
  targetDate.setHours(alarm.hour, alarm.minute, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const seconds = Math.max(1, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
  const timeStr = formatTime12h(alarm.hour, alarm.minute);

  console.log(
    `[JEEVA Alarm] One-time alarm "${alarm.label}" for ${timeStr} — fires in ${seconds}s`,
  );

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${alarm.label || getAlarmTypeLabel(alarm.type)}`,
        body: `It's ${timeStr}!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });
    console.log(`[JEEVA Alarm] One-time notification ID: ${id}`);
    return [id];
  } catch (err) {
    console.error('[JEEVA Alarm] Failed to schedule one-time:', err);
    return [];
  }
}

// ─── Cancel Notification(s) ───────────────────────────────────

export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Ignore
  }
}

export async function cancelAlarmNotifications(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    await cancelNotification(id);
  }
}

// ─── Debug: List all scheduled notifications ──────────────────

export async function debugListScheduledNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log(`[JEEVA Debug] === Scheduled Notifications (${scheduled.length}) ===`);
  for (const n of scheduled) {
    console.log(`  ID: ${n.identifier}`);
    console.log(`  Title: ${n.content.title}`);
    console.log(`  Trigger:`, JSON.stringify(n.trigger));
    console.log('  ---');
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

  // Calculate seconds until next occurrence
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const seconds = Math.max(1, Math.floor((target.getTime() - now.getTime()) / 1000));

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💊 Medication Reminder',
      body: `Time to take ${medication.name} (${medication.dosage})`,
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
