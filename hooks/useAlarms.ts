import { useMemo, useCallback } from 'react';
import { useAlarmStore } from '@/stores/alarmStore';
import {
  scheduleAlarmNotifications,
  scheduleOneTimeAlarm,
  cancelAlarmNotifications,
  requestNotificationPermissions,
} from '@/services/notifications';
import type { Alarm, AlarmType } from '@/types';

interface GroupedAlarms {
  wakeup: Alarm[];
  workout: Alarm[];
  medication: Alarm[];
}

export function useAlarms() {
  const alarms = useAlarmStore((s) => s.alarms);
  const addAlarmStore = useAlarmStore((s) => s.addAlarm);
  const toggleAlarmStore = useAlarmStore((s) => s.toggleAlarm);
  const deleteAlarmStore = useAlarmStore((s) => s.deleteAlarm);
  const setNotificationIds = useAlarmStore((s) => s.setNotificationIds);

  const groupedAlarms = useMemo<GroupedAlarms>(() => {
    const groups: GroupedAlarms = { wakeup: [], workout: [], medication: [] };
    for (const alarm of alarms) {
      groups[alarm.type].push(alarm);
    }
    const sortByTime = (a: Alarm, b: Alarm) =>
      a.hour * 60 + a.minute - (b.hour * 60 + b.minute);
    groups.wakeup.sort(sortByTime);
    groups.workout.sort(sortByTime);
    groups.medication.sort(sortByTime);
    return groups;
  }, [alarms]);

  const scheduleAlarm = useCallback(
    async (alarm: Alarm) => {
      try {
        await requestNotificationPermissions();
        let ids: string[];
        if (alarm.daysOfWeek.length > 0) {
          ids = await scheduleAlarmNotifications(alarm);
        } else {
          ids = await scheduleOneTimeAlarm(alarm);
        }
        if (ids.length > 0) {
          setNotificationIds(alarm.id, ids);
        }
      } catch (err) {
        console.warn('Failed to schedule alarm notification:', err);
      }
    },
    [setNotificationIds],
  );

  const addAlarm = useCallback(
    async (data: Omit<Alarm, 'id'>) => {
      addAlarmStore(data);
      // Get the newly created alarm (last one added)
      const newAlarms = useAlarmStore.getState().alarms;
      const newAlarm = newAlarms[newAlarms.length - 1];
      if (newAlarm && data.enabled) {
        await scheduleAlarm(newAlarm);
      }
    },
    [addAlarmStore, scheduleAlarm],
  );

  const toggleAlarm = useCallback(
    async (id: string) => {
      const alarm = alarms.find((a) => a.id === id);
      if (!alarm) return;

      toggleAlarmStore(id);

      if (alarm.enabled) {
        // Was enabled → now disabling — cancel all notifications
        if (alarm.notificationIds) {
          await cancelAlarmNotifications(alarm.notificationIds);
          setNotificationIds(id, []);
        }
      } else {
        // Was disabled → now enabling — schedule notifications
        const updatedAlarm = { ...alarm, enabled: true };
        await scheduleAlarm(updatedAlarm);
      }
    },
    [alarms, toggleAlarmStore, scheduleAlarm, setNotificationIds],
  );

  const deleteAlarm = useCallback(
    async (id: string) => {
      const alarm = alarms.find((a) => a.id === id);
      if (alarm?.notificationIds) {
        await cancelAlarmNotifications(alarm.notificationIds);
      }
      deleteAlarmStore(id);
    },
    [alarms, deleteAlarmStore],
  );

  return {
    alarms,
    groupedAlarms,
    addAlarm,
    toggleAlarm,
    deleteAlarm,
  };
}
