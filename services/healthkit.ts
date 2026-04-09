import { Platform } from 'react-native';
import type { StepData, HeartRateData, SleepData, SleepStage } from '@/types';

// ── Health Service Interface ────────────────────────────────────

export interface HealthService {
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  getSteps(date: string): Promise<StepData | null>;
  getHeartRate(): Promise<HeartRateData | null>;
  getSleep(date: string): Promise<SleepData | null>;
}

// ── Mock Data Helpers ───────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

function getDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function generateHourlySteps(totalSteps: number): number[] {
  // Distribute steps across waking hours (6am-11pm) with a realistic pattern
  const hourly = new Array(24).fill(0);
  const wakingHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  // Assign weights for realistic distribution: morning commute, lunch, evening walk
  const weights = [0.03, 0.08, 0.1, 0.06, 0.04, 0.05, 0.1, 0.08, 0.05, 0.04, 0.05, 0.08, 0.1, 0.06, 0.04, 0.03, 0.01];
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  wakingHours.forEach((hour, i) => {
    const fraction = weights[i] / totalWeight;
    hourly[hour] = Math.round(totalSteps * fraction + randomInt(-50, 50));
    if (hourly[hour] < 0) hourly[hour] = 0;
  });

  return hourly;
}

function generateSleepStages(durationMin: number): { stage: SleepStage; startMin: number; endMin: number }[] {
  const stages: { stage: SleepStage; startMin: number; endMin: number }[] = [];
  let current = 0;
  const stageTypes: SleepStage[] = ['light', 'deep', 'light', 'rem', 'light', 'deep', 'rem', 'light'];

  for (const stage of stageTypes) {
    if (current >= durationMin) break;
    const len = stage === 'deep'
      ? randomInt(30, 60)
      : stage === 'rem'
        ? randomInt(15, 40)
        : randomInt(20, 50);
    const end = Math.min(current + len, durationMin);
    stages.push({ stage, startMin: current, endMin: end });
    current = end;

    // Occasional brief awakening
    if (Math.random() < 0.15 && current < durationMin - 10) {
      const awakeLen = randomInt(2, 8);
      stages.push({ stage: 'awake', startMin: current, endMin: current + awakeLen });
      current += awakeLen;
    }
  }

  return stages;
}

// ── Mock Health Service ─────────────────────────────────────────

export class MockHealthService implements HealthService {
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async getSteps(date: string): Promise<StepData | null> {
    const steps = randomInt(5000, 12000);
    const distanceKm = randomFloat(3.2, 9.5);
    const caloriesBurned = randomInt(180, 550);
    const hourlySteps = generateHourlySteps(steps);

    return {
      date,
      steps,
      distanceKm,
      caloriesBurned,
      hourlySteps,
    };
  }

  async getHeartRate(): Promise<HeartRateData | null> {
    const bpm = randomInt(58, 80);
    return {
      timestamp: Date.now(),
      bpm,
      context: 'resting',
    };
  }

  async getSleep(date: string): Promise<SleepData | null> {
    const durationMin = randomInt(360, 510); // 6-8.5 hours
    const quality = randomInt(70, 95);

    // Bed time: previous night 10pm-12am
    const bedHour = randomInt(22, 24);
    const bedDate = new Date(date);
    bedDate.setDate(bedDate.getDate() - 1);
    bedDate.setHours(bedHour === 24 ? 0 : bedHour, randomInt(0, 59), 0, 0);
    if (bedHour === 24) bedDate.setDate(bedDate.getDate() + 1);
    const bedTime = bedDate.getTime();

    const wakeTime = bedTime + durationMin * 60 * 1000;
    const stages = generateSleepStages(durationMin);

    return {
      id: `sleep-${date}`,
      date,
      bedTime,
      wakeTime,
      durationMin,
      stages,
      quality,
    };
  }
}

// ── iOS Health Service ──────────────────────────────────────────

export class IOSHealthService implements HealthService {
  private fallback = new MockHealthService();

  async isAvailable(): Promise<boolean> {
    try {
      // react-native-health would be imported here
      // Since the native module may not be linked, catch the error
      return false;
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Would call AppleHealthKit.initHealthKit with permissions
      return false;
    } catch {
      return this.fallback.requestPermissions();
    }
  }

  async getSteps(date: string): Promise<StepData | null> {
    try {
      // Would call AppleHealthKit.getStepCount
      return this.fallback.getSteps(date);
    } catch {
      return this.fallback.getSteps(date);
    }
  }

  async getHeartRate(): Promise<HeartRateData | null> {
    try {
      // Would call AppleHealthKit.getHeartRateSamples
      return this.fallback.getHeartRate();
    } catch {
      return this.fallback.getHeartRate();
    }
  }

  async getSleep(date: string): Promise<SleepData | null> {
    try {
      // Would call AppleHealthKit.getSleepSamples
      return this.fallback.getSleep(date);
    } catch {
      return this.fallback.getSleep(date);
    }
  }
}

// ── Android Health Service ──────────────────────────────────────

export class AndroidHealthService implements HealthService {
  private fallback = new MockHealthService();

  async isAvailable(): Promise<boolean> {
    try {
      // expo-health-connect would be checked here
      return false;
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Would call HealthConnect.requestPermissions
      return false;
    } catch {
      return this.fallback.requestPermissions();
    }
  }

  async getSteps(date: string): Promise<StepData | null> {
    try {
      // Would call HealthConnect.readRecords for steps
      return this.fallback.getSteps(date);
    } catch {
      return this.fallback.getSteps(date);
    }
  }

  async getHeartRate(): Promise<HeartRateData | null> {
    try {
      // Would call HealthConnect.readRecords for heart rate
      return this.fallback.getHeartRate();
    } catch {
      return this.fallback.getHeartRate();
    }
  }

  async getSleep(date: string): Promise<SleepData | null> {
    try {
      // Would call HealthConnect.readRecords for sleep
      return this.fallback.getSleep(date);
    } catch {
      return this.fallback.getSleep(date);
    }
  }
}

// ── Factory ─────────────────────────────────────────────────────

let _service: HealthService | null = null;

export function getHealthService(): HealthService {
  if (_service) return _service;

  if (Platform.OS === 'ios') {
    try {
      _service = new IOSHealthService();
    } catch {
      _service = new MockHealthService();
    }
  } else if (Platform.OS === 'android') {
    try {
      _service = new AndroidHealthService();
    } catch {
      _service = new MockHealthService();
    }
  } else {
    _service = new MockHealthService();
  }

  return _service;
}
