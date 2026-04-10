import * as Notifications from 'expo-notifications';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useWaterStore } from '@/stores/waterStore';
import { useTemplateStore } from '@/stores/templateStore';
import { getWorkoutStreak } from '@/utils/workoutAnalytics';

/**
 * Schedule smart contextual notifications based on user's data.
 * Called on app foreground or after completing an action.
 */
export async function scheduleSmartNotifications(): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // Cancel previously scheduled smart notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.type === 'smart') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }

    await scheduleWaterReminder();
    await scheduleStreakProtection();
    await schedulePreWorkoutReminder();
  } catch {
    // Silently fail — smart notifications are non-critical
  }
}

/**
 * Water reminder: every 2 hours if behind pace.
 */
async function scheduleWaterReminder(): Promise<void> {
  const { entries, goal } = useWaterStore.getState();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const todayTotal = entries
    .filter((e) => {
      const d = new Date(e.timestamp);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === todayStr;
    })
    .reduce((sum, e) => sum + e.amountMl, 0);

  const hoursLeft = 24 - now.getHours();
  const paceNeeded = goal > 0 ? (goal - todayTotal) / Math.max(hoursLeft, 1) : 0;

  // If behind pace (need >250ml/hour to catch up), remind in 2 hours
  if (paceNeeded > 250 && todayTotal < goal) {
    const pct = Math.round((todayTotal / goal) * 100);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Stay Hydrated!',
        body: `You're at ${pct}% of your water goal. Drink up!`,
        data: { type: 'smart', action: 'water' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 7200, // 2 hours
        repeats: false,
      },
    });
  }
}

/**
 * Streak protection: if user has a streak and hasn't worked out today.
 */
async function scheduleStreakProtection(): Promise<void> {
  const { history } = useWorkoutStore.getState();
  const streak = getWorkoutStreak(history);

  if (streak.currentStreak < 2) return;

  // Check if there's a workout today
  const today = new Date().toISOString().split('T')[0];
  const hasWorkoutToday = history.some(
    (w) => new Date(w.startTime).toISOString().split('T')[0] === today,
  );

  if (!hasWorkoutToday) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔥 Don't break your ${streak.currentStreak}-day streak!`,
        body: 'A quick workout takes just 20 minutes. Keep the momentum going!',
        data: { type: 'smart', action: 'workout' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 14400, // 4 hours
        repeats: false,
      },
    });
  }
}

/**
 * Pre-workout reminder: if a template is scheduled for today.
 */
async function schedulePreWorkoutReminder(): Promise<void> {
  const { templates } = useTemplateStore.getState();
  const { history } = useWorkoutStore.getState();
  const today = new Date().getDay();

  const todayTemplate = templates.find((t) =>
    t.scheduledDays?.includes(today),
  );

  if (!todayTemplate) return;

  // Check if already worked out today
  const todayStr = new Date().toISOString().split('T')[0];
  const hasWorkoutToday = history.some(
    (w) => new Date(w.startTime).toISOString().split('T')[0] === todayStr,
  );

  if (!hasWorkoutToday) {
    // Find last similar workout for volume comparison
    const lastSimilar = history.find((w) => w.name === todayTemplate.name);
    const volumeText = lastSimilar
      ? ` You crushed ${lastSimilar.totalVolume.toLocaleString()} volume last time!`
      : '';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💪 ${todayTemplate.name} Today`,
        body: `Your scheduled workout is waiting.${volumeText}`,
        data: { type: 'smart', action: 'workout' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3600, // 1 hour
        repeats: false,
      },
    });
  }
}

/**
 * Weekly summary notification — schedule for Sunday evening.
 */
export async function scheduleWeeklySummary(): Promise<void> {
  const { history } = useWorkoutStore.getState();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const thisWeekWorkouts = history.filter(
    (w) => w.startTime >= weekAgo.getTime(),
  );
  const totalVolume = thisWeekWorkouts.reduce((s, w) => s + w.totalVolume, 0);
  const totalSets = thisWeekWorkouts.reduce((s, w) => s + w.totalSets, 0);

  if (thisWeekWorkouts.length === 0) return;

  // Schedule for next Sunday at 7pm
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const sundayEvening = new Date(now);
  sundayEvening.setDate(now.getDate() + daysUntilSunday);
  sundayEvening.setHours(19, 0, 0, 0);

  const seconds = Math.max(
    1,
    Math.floor((sundayEvening.getTime() - now.getTime()) / 1000),
  );

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Your Week in Review',
      body: `${thisWeekWorkouts.length} workouts, ${totalVolume.toLocaleString()} total volume, ${totalSets} sets. Keep it up!`,
      data: { type: 'smart', action: 'analytics' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
}
