import { kgToLbs } from './calculations';

// ─── Duration Formatting ───────────────────────────────────────

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

// ─── Date Formatting ───────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = DAY_NAMES[d.getDay()];
  const month = MONTH_NAMES[d.getMonth()];
  const date = d.getDate();
  return `${day}, ${month} ${date}`;
}

export function formatDateShort(dateStr: string): string {
  // YYYY-MM-DD to "Apr 9"
  const parts = dateStr.split('-');
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${MONTH_NAMES[monthIndex]} ${day}`;
}

// ─── Number Formatting ─────────────────────────────────────────

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

// ─── Weight Formatting ─────────────────────────────────────────

export function formatWeight(
  kg: number,
  unitSystem: 'metric' | 'imperial',
): string {
  if (unitSystem === 'imperial') {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg} kg`;
}

// ─── Greeting ──────────────────────────────────────────────────

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

// ─── Relative Time ─────────────────────────────────────────────

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} wk ago`;
  return `${Math.floor(diffDay / 30)} mo ago`;
}

// ─── Volume Formatting ────────────────────────────────────────

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    const val = volume / 1_000_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    const val = volume / 1_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}k`;
  }
  return volume.toFixed(0);
}

// ─── Water Streak ─────────────────────────────────────────────

import type { WaterEntry } from '@/types';

function getDateStr(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWaterStreak(entries: WaterEntry[], goal: number): number {
  if (entries.length === 0 || goal <= 0) return 0;

  // Aggregate daily totals
  const dailyTotals: Record<string, number> = {};
  for (const entry of entries) {
    const dateKey = getDateStr(entry.timestamp);
    dailyTotals[dateKey] = (dailyTotals[dateKey] ?? 0) + entry.amountMl;
  }

  // Walk backwards from today counting consecutive days where total >= goal
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const ONE_DAY = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today.getTime() - i * ONE_DAY);
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const total = dailyTotals[key] ?? 0;
    if (total >= goal) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
