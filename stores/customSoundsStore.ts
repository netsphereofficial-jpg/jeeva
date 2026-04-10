import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AlarmSoundOption } from '@/data/alarmSounds';

interface CustomSoundsState {
  sounds: AlarmSoundOption[];
  addSound: (sound: AlarmSoundOption) => void;
  removeSound: (id: string) => void;
}

export const useCustomSoundsStore = create<CustomSoundsState>()(
  persist(
    (set) => ({
      sounds: [],

      addSound: (sound) => {
        set((state) => ({
          sounds: [...state.sounds, sound],
        }));
      },

      removeSound: (id) => {
        set((state) => ({
          sounds: state.sounds.filter((s) => s.id !== id),
        }));
      },
    }),
    {
      name: 'jeeva-custom-sounds',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
