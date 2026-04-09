import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface UseRestTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  progress: number;
  duration: number;
  start: (customDuration?: number) => void;
  skip: () => void;
  extend: (seconds?: number) => void;
  setDuration: (seconds: number) => void;
}

export function useRestTimer(defaultDuration = 90): UseRestTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDurationState] = useState(defaultDuration);
  const activeDuration = useRef(defaultDuration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [isRunning, timeRemaining > 0, clearTimer]);

  const start = useCallback(
    (customDuration?: number) => {
      const dur = customDuration ?? duration;
      activeDuration.current = dur;
      setTimeRemaining(dur);
      setIsRunning(true);
    },
    [duration],
  );

  const skip = useCallback(() => {
    clearTimer();
    setTimeRemaining(0);
    setIsRunning(false);
  }, [clearTimer]);

  const extend = useCallback((seconds = 30) => {
    setTimeRemaining((prev) => prev + seconds);
    activeDuration.current += seconds;
  }, []);

  const setDuration = useCallback((seconds: number) => {
    setDurationState(seconds);
  }, []);

  const progress =
    activeDuration.current > 0
      ? 1 - timeRemaining / activeDuration.current
      : 0;

  return {
    timeRemaining,
    isRunning,
    progress,
    duration,
    start,
    skip,
    extend,
    setDuration,
  };
}
