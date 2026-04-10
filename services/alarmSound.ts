import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';
import { getAlarmSoundById, DEFAULT_ALARM_SOUND } from '@/data/alarmSounds';

let alarmSound: Audio.Sound | null = null;
let vibrationInterval: ReturnType<typeof setInterval> | null = null;
let previewSound: Audio.Sound | null = null;

/**
 * Start playing the alarm sound in a loop + vibration pattern.
 * @param soundId — which alarm tone to play (from alarmSounds catalog)
 */
export async function startAlarmSound(soundId?: string): Promise<void> {
  try {
    // Stop any existing alarm first
    await stopAlarmSound();

    // Configure audio for alarm behavior
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    // Load the selected alarm sound
    const soundOption = getAlarmSoundById(soundId ?? DEFAULT_ALARM_SOUND);
    const { sound } = await Audio.Sound.createAsync(
      soundOption.source,
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
      Vibration.vibrate(pattern, true);
    }

    // Backup interval vibration
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
    alarmSound = null;
  }

  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }

  Vibration.cancel();
}

/**
 * Preview a sound (plays once, not looped).
 * @param soundId — which alarm tone to preview
 */
export async function previewAlarmSound(soundId: string): Promise<void> {
  try {
    // Stop any existing preview
    await stopPreview();

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const soundOption = getAlarmSoundById(soundId);
    const { sound } = await Audio.Sound.createAsync(
      soundOption.source,
      {
        isLooping: false,
        volume: 0.7,
        shouldPlay: true,
      },
    );
    previewSound = sound;

    // Auto-stop after 4 seconds (just a preview)
    setTimeout(() => {
      stopPreview();
    }, 4000);
  } catch (err) {
    console.warn('[AlarmSound] Failed to preview:', err);
  }
}

/**
 * Stop preview playback.
 */
export async function stopPreview(): Promise<void> {
  try {
    if (previewSound) {
      await previewSound.stopAsync();
      await previewSound.unloadAsync();
      previewSound = null;
    }
  } catch {
    previewSound = null;
  }
}

/**
 * Check if alarm is currently playing.
 */
export function isAlarmPlaying(): boolean {
  return alarmSound !== null;
}
