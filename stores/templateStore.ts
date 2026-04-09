import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutTemplate } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

interface TemplateState {
  templates: WorkoutTemplate[];
  createTemplate: (
    template: Omit<WorkoutTemplate, 'id' | 'timesPerformed' | 'estimatedDurationMin'>,
  ) => void;
  updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTodaysTemplate: () => WorkoutTemplate | undefined;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],

      createTemplate: (template) => {
        const newTemplate: WorkoutTemplate = {
          ...template,
          id: generateId(),
          timesPerformed: 0,
          estimatedDurationMin: template.exercises.length * 10,
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        }));
      },

      deleteTemplate: (id: string) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      getTodaysTemplate: (): WorkoutTemplate | undefined => {
        const today = new Date().getDay(); // 0=Sun
        // Templates don't have scheduledDays in Phase 1 types, so we check
        // if the template has a color matching the day (workaround) or just
        // return undefined. We'll add scheduledDays support:
        return get().templates.find((t) => {
          // Use optional property access for scheduledDays
          const scheduled = (t as WorkoutTemplate & { scheduledDays?: number[] })
            .scheduledDays;
          return scheduled?.includes(today);
        });
      },
    }),
    {
      name: 'jeeva-templates',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
