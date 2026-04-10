import type { WithSpringConfig } from 'react-native-reanimated';

export const springs = {
  snappy: { damping: 15, stiffness: 300 } as WithSpringConfig,
  gentle: { damping: 20, stiffness: 90 } as WithSpringConfig,
  bouncy: { damping: 8, stiffness: 200 } as WithSpringConfig,
  stiff: { damping: 20, stiffness: 400 } as WithSpringConfig,
} as const;

export const durations = {
  fast: 200,
  normal: 300,
  slow: 500,
  entrance: 400,
} as const;

export const STAGGER_DELAY = 60;
