import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';

let alarmSound: Audio.Sound | null = null;
let vibrationInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start playing the alarm sound in a loop + vibration pattern.
 * Call stopAlarmSound() to stop both.
 */
export async function startAlarmSound(): Promise<void> {
  try {
    // Configure audio for alarm behavior
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    // Load alarm sound from local assets
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const alarmAsset = require('../assets/sounds/alarm-gentle.mp3');
    const { sound } = await Audio.Sound.createAsync(
      alarmAsset,
      {
        isLooping: true,
        volume: 1.0,
        shouldPlay: true,
      },
    );
    alarmSound = sound;

    // Start vibration pattern: vibrate 1s, pause 0.5s, repeat
    if (Platform.OS !== 'web') {
      const pattern = [0, 1000, 500, 1000, 500, 1000];
      Vibration.vibrate(pattern, true); // true = repeat
    }

    // Also start interval-based vibration as backup (some devices need this)
    vibrationInterval = setInterval(() => {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(800);
      }
    }, 2000);
  } catch (err) {
    console.warn('[AlarmSound] Failed to start alarm sound:', err);
    // At minimum, vibrate even if sound fails
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 1000, 500, 1000], true);
    }
  }
}

/**
 * Stop the alarm sound and vibration.
 */
export async function stopAlarmSound(): Promise<void> {
  try {
    if (alarmSound) {
      await alarmSound.stopAsync();
      await alarmSound.unloadAsync();
      alarmSound = null;
    }
  } catch {
    // Ignore unload errors
  }

  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }

  Vibration.cancel();
}

/**
 * Check if alarm is currently playing.
 */
export function isAlarmPlaying(): boolean {
  return alarmSound !== null;
}
