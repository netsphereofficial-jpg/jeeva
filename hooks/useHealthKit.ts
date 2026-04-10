import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useHealthStore } from '@/stores/healthStore';
import { getHealthService } from '@/services/healthkit';
import { getRelativeTime } from '@/utils/formatters';
import type { HealthData } from '@/types';

interface UseHealthKitReturn {
  data: HealthData;
  isConnected: boolean;
  lastSynced: string | null;
  sync: () => Promise<void>;
  requestPermissions: () => Promise<void>;
  isLoading: boolean;
}

export function useHealthKit(): UseHealthKitReturn {
  const [isLoading, setIsLoading] = useState(false);
  const serviceRef = useRef(getHealthService());

  const data = useHealthStore((s) => s.data);
  const updateSteps = useHealthStore((s) => s.updateSteps);
  const updateHeartRate = useHealthStore((s) => s.updateHeartRate);
  const updateSleep = useHealthStore((s) => s.updateSleep);
  const setConnected = useHealthStore((s) => s.setConnected);
  const setLastSynced = useHealthStore((s) => s.setLastSynced);

  const isConnected = data.connected;
  const lastSynced = data.lastSynced ? getRelativeTime(data.lastSynced) : null;

  const sync = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const service = serviceRef.current;
      const today = new Date().toISOString().split('T')[0];

      const [stepData, heartRateData, sleepData] = await Promise.all([
        service.getSteps(today),
        service.getHeartRate(),
        service.getSleep(today),
      ]);

      if (stepData) updateSteps(stepData);
      if (heartRateData) updateHeartRate(heartRateData);
      if (sleepData) updateSleep(sleepData);

      setLastSynced(Date.now());
    } catch {
      // Silently fail — health data is non-critical
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, updateSteps, updateHeartRate, updateSleep, setLastSynced]);

  const requestPermissions = useCallback(async () => {
    try {
      const service = serviceRef.current;
      const granted = await service.requestPermissions();
      if (granted) {
        setConnected(true);
        // Sync data immediately after connecting
        setIsLoading(true);
        try {
          const today = new Date().toISOString().split('T')[0];
          const [stepData, heartRateData, sleepData] = await Promise.all([
            service.getSteps(today),
            service.getHeartRate(),
            service.getSleep(today),
          ]);
          if (stepData) updateSteps(stepData);
          if (heartRateData) updateHeartRate(heartRateData);
          if (sleepData) updateSleep(sleepData);
          setLastSynced(Date.now());
        } finally {
          setIsLoading(false);
        }
      }
    } catch {
      // Permission denied or unavailable
    }
  }, [setConnected, updateSteps, updateHeartRate, updateSleep, setLastSynced]);

  // Auto-sync on mount
  useEffect(() => {
    if (isConnected) {
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when app returns to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isConnected) {
        sync();
      }
    });

    return () => subscription.remove();
  }, [isConnected, sync]);

  return {
    data,
    isConnected,
    lastSynced,
    sync,
    requestPermissions,
    isLoading,
  };
}

export function getPlatformName(): string {
  if (Platform.OS === 'ios') return 'Apple Health';
  if (Platform.OS === 'android') return 'Health Connect';
  return 'Health Service';
}
