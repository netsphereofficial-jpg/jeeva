import { AVPlaybackSource } from 'expo-av';

export interface AlarmSoundOption {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji for visual distinction
  source: AVPlaybackSource;
}

/**
 * Available alarm sounds.
 * Each sound is bundled as a local asset for offline reliability.
 */
export const ALARM_SOUNDS: AlarmSoundOption[] = [
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
    icon: '🔕',
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

/**
 * Get a sound by ID. Falls back to 'gentle' if not found.
 */
export function getAlarmSoundById(id: string): AlarmSoundOption {
  return ALARM_SOUNDS.find((s) => s.id === id) ?? ALARM_SOUNDS[0];
}

/**
 * Default alarm sound ID.
 */
export const DEFAULT_ALARM_SOUND = 'gentle';
