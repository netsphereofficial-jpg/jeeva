import { AVPlaybackSource } from 'expo-av';

export interface AlarmSoundOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  source: AVPlaybackSource;
  isCustom?: boolean;        // true if user-uploaded
  filePath?: string;         // local file path for custom sounds
}

/**
 * Built-in alarm sounds bundled with the app.
 */
export const BUILTIN_SOUNDS: AlarmSoundOption[] = [
  {
    id: 'gentle',
    name: 'Gentle Rise',
    description: 'Soft, soothing wake-up',
    icon: '🌅',
    source: require('../assets/sounds/alarm-gentle.mp3'),
  },
  {
    id: 'morning',
    name: 'Morning Light',
    description: 'Bright and energetic',
    icon: '☀️',
    source: require('../assets/sounds/alarm-morning.mp3'),
  },
  {
    id: 'digital',
    name: 'Digital Pulse',
    description: 'Modern, clean beeps',
    icon: '⚡',
    source: require('../assets/sounds/alarm-digital.mp3'),
  },
  {
    id: 'classic',
    name: 'Classic Ring',
    description: 'Traditional alarm tone',
    icon: '🔔',
    source: require('../assets/sounds/alarm-classic.mp3'),
  },
  {
    id: 'bell',
    name: 'Temple Bell',
    description: 'Peaceful bell chime',
    icon: '🛎️',
    source: require('../assets/sounds/alarm-bell.mp3'),
  },
  {
    id: 'chime',
    name: 'Wind Chime',
    description: 'Ambient, relaxing melody',
    icon: '🎐',
    source: require('../assets/sounds/alarm-chime.mp3'),
  },
];

/** Backward compat alias */
export const ALARM_SOUNDS = BUILTIN_SOUNDS;

/**
 * Get a sound by ID from builtins OR custom sounds.
 * For custom sounds, create an AVPlaybackSource from the filePath.
 */
export function getAlarmSoundById(
  id: string,
  customSounds?: AlarmSoundOption[],
): AlarmSoundOption {
  // Check custom sounds first
  if (customSounds) {
    const custom = customSounds.find((s) => s.id === id);
    if (custom) return custom;
  }
  // Then check builtins
  return BUILTIN_SOUNDS.find((s) => s.id === id) ?? BUILTIN_SOUNDS[0];
}

/**
 * Create an AlarmSoundOption from a user-uploaded file.
 */
export function createCustomSound(
  name: string,
  filePath: string,
): AlarmSoundOption {
  const id = `custom_${Date.now().toString(36)}`;
  return {
    id,
    name,
    description: 'Custom upload',
    icon: '🎵',
    source: { uri: filePath },
    isCustom: true,
    filePath,
  };
}

export const DEFAULT_ALARM_SOUND = 'gentle';
