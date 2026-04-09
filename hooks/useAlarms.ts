import { useMemo, useCallback } from 'react';
import { useAlarmStore } from '@/stores/alarmStore';
import { scheduleAlarmNotification, cancelNotification } from '@/services/notifications';
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

  const groupedAlarms = useMemo<GroupedAlarms>(() => {
    const groups: GroupedAlarms = { wakeup: [], workout: [], medication: [] };
    for (const alarm of alarms) {
      groups[alarm.type].push(alarm);
    }
    // Sort each group by time
    const sortByTime = (a: Alarm, b: Alarm) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute);
    groups.wakeup.sort(sortByTime);
    groups.workout.sort(sortByTime);
    groups.medication.sort(sortByTime);
    return groups;
  }, [alarms]);

  const addAlarm = useCallback(
    async (data: Omit<Alarm, 'id'>) => {
      addAlarmStore(data);
      // Schedule notification if enabled
      if (data.enabled) {
        try {
          await scheduleAlarmNotification(data as Alarm);
        } catch {
          // Notification scheduling may fail silently
        }
      }
    },
    [addAlarmStore],
  );

  const toggleAlarm = useCallback(
    async (id: string) => {
      const alarm = alarms.find((a) => a.id === id);
      if (!alarm) return;
      toggleAlarmStore(id);
      try {
        if (alarm.enabled) {
          // Was enabled, now disabling — cancel notification
          await cancelNotification(id);
        } else {
          // Was disabled, now enabling — schedule notification
          await scheduleAlarmNotification(alarm);
        }
      } catch {
        // Notification operations may fail silently
      }
    },
    [alarms, toggleAlarmStore],
  );

  const deleteAlarm = useCallback(
    async (id: string) => {
      deleteAlarmStore(id);
      try {
        await cancelNotification(id);
      } catch {
        // Notification cancellation may fail silently
      }
    },
    [deleteAlarmStore],
  );

  return {
    alarms,
    groupedAlarms,
    addAlarm,
    toggleAlarm,
    deleteAlarm,
  };
}
