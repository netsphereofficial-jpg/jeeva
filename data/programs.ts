import type { Program } from '@/types';

export const PROGRAMS: Program[] = [
  {
    id: 'ppl-3',
    name: 'PPL 3-Day',
    description: 'Classic Push/Pull/Legs split for balanced training in 3 days per week.',
    icon: 'dumbbell',
    splitType: 'Push/Pull/Legs',
    days: [
      {
        name: 'Push',
        description: 'Chest, shoulders, and triceps',
        exerciseIds: ['chest-01', 'chest-02', 'shoulders-01', 'shoulders-02', 'triceps-04', 'triceps-03'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Pull',
        description: 'Back and biceps',
        exerciseIds: ['back-03', 'back-04', 'back-08', 'biceps-01', 'biceps-03', 'biceps-07'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Legs',
        description: 'Quads, hamstrings, glutes, and calves',
        exerciseIds: ['legs-01', 'legs-03', 'legs-05', 'legs-04', 'legs-07', 'legs-10'],
        targetSets: 3,
        targetReps: 10,
      },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper/Lower',
    description: 'Simple upper/lower split, great for intermediates training 4 days per week.',
    icon: 'repeat',
    splitType: 'Upper/Lower',
    days: [
      {
        name: 'Upper',
        description: 'Chest, back, shoulders, and arms',
        exerciseIds: ['chest-01', 'back-03', 'shoulders-01', 'biceps-01', 'triceps-04'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Lower',
        description: 'Quads, hamstrings, glutes, and calves',
        exerciseIds: ['legs-01', 'legs-03', 'legs-05', 'legs-04', 'legs-07'],
        targetSets: 3,
        targetReps: 10,
      },
    ],
  },
  {
    id: 'pplul-5',
    name: 'PPLUL 5-Day',
    description: 'Push/Pull/Legs plus Upper/Lower for high-frequency 5-day training.',
    icon: 'flame',
    splitType: 'PPL + Upper/Lower',
    days: [
      {
        name: 'Push',
        description: 'Chest, shoulders, and triceps',
        exerciseIds: ['chest-01', 'chest-04', 'shoulders-01', 'shoulders-09', 'triceps-04', 'triceps-05'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Pull',
        description: 'Back and biceps',
        exerciseIds: ['back-03', 'back-04', 'back-05', 'biceps-01', 'biceps-03', 'biceps-06'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Legs',
        description: 'Full lower body',
        exerciseIds: ['legs-01', 'legs-03', 'legs-05', 'legs-04', 'legs-07', 'legs-10'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Upper',
        description: 'Chest, back, shoulders, and arms',
        exerciseIds: ['chest-02', 'back-07', 'shoulders-05', 'biceps-02', 'triceps-01'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Lower',
        description: 'Quads, hamstrings, and glutes',
        exerciseIds: ['legs-08', 'legs-06', 'legs-03', 'legs-04', 'legs-07'],
        targetSets: 3,
        targetReps: 10,
      },
    ],
  },
  {
    id: 'bro-5',
    name: 'Bro Split 5-Day',
    description: 'Classic bodybuilding split hitting each muscle group once per week.',
    icon: 'trophy',
    splitType: 'Bro Split',
    days: [
      {
        name: 'Chest Day',
        description: 'All chest exercises',
        exerciseIds: ['chest-01', 'chest-02', 'chest-03', 'chest-04', 'chest-08'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Back Day',
        description: 'All back exercises',
        exerciseIds: ['back-01', 'back-03', 'back-04', 'back-05', 'back-07'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Shoulders Day',
        description: 'All shoulder exercises',
        exerciseIds: ['shoulders-01', 'shoulders-02', 'shoulders-03', 'shoulders-05', 'shoulders-06'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Arms Day',
        description: 'Biceps and triceps',
        exerciseIds: ['biceps-01', 'biceps-03', 'biceps-04', 'triceps-04', 'triceps-03', 'triceps-05'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Legs Day',
        description: 'Full lower body',
        exerciseIds: ['legs-01', 'legs-03', 'legs-05', 'legs-04', 'legs-07', 'legs-10'],
        targetSets: 3,
        targetReps: 10,
      },
    ],
  },
  {
    id: 'fullbody-3',
    name: 'Full Body 3-Day',
    description: 'Hit every major muscle group each session with compound movements.',
    icon: 'zap',
    splitType: 'Full Body',
    days: [
      {
        name: 'Day A',
        description: 'Squat focus full body',
        exerciseIds: ['legs-01', 'chest-01', 'back-03', 'shoulders-01', 'biceps-01', 'core-01'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Day B',
        description: 'Deadlift focus full body',
        exerciseIds: ['back-01', 'chest-02', 'legs-05', 'shoulders-02', 'triceps-04', 'core-02'],
        targetSets: 3,
        targetReps: 10,
      },
      {
        name: 'Day C',
        description: 'Bench focus full body',
        exerciseIds: ['chest-09', 'legs-03', 'back-04', 'shoulders-05', 'biceps-03', 'core-03'],
        targetSets: 3,
        targetReps: 10,
      },
    ],
  },
];

export function getProgramById(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}
