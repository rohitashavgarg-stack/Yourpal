// Assessments, as the app shows them. The trainer does the assessment at the gym and records it; the member only sees the result here (view only).
// There is no assessment the member can start or fill in.
import { useState } from 'react';

export type NumKey = 'height' | 'weight' | 'chest' | 'waist' | 'hip' | 'arms' | 'legs' | 'calves' | 'sleep' | 'fat' | 'bench' | 'legpress' | 'breath' | 'sys' | 'dia' | 'pulse' | 'sugar';
export type AssessEntry = { id: string; at: string; answers: Record<string, string>; tests: Partial<Record<NumKey, number>> };

// dir: which way is better (none: it is just a size, so there is no better or worse)
export const NUMS: Record<NumKey, { label: string; unit: string; dir: 'down' | 'up' | 'none'; dp: number }> = {
  height: { label: 'Height', unit: 'cm', dir: 'none', dp: 0 },
  weight: { label: 'Weight', unit: 'kg', dir: 'down', dp: 1 },
  chest: { label: 'Chest', unit: 'cm', dir: 'none', dp: 0 },
  waist: { label: 'Waist', unit: 'cm', dir: 'down', dp: 0 },
  hip: { label: 'Hip', unit: 'cm', dir: 'none', dp: 0 },
  arms: { label: 'Arms', unit: 'cm', dir: 'none', dp: 0 },
  legs: { label: 'Legs', unit: 'cm', dir: 'none', dp: 0 },
  calves: { label: 'Calves', unit: 'cm', dir: 'none', dp: 0 },
  fat: { label: 'Body fat', unit: '%', dir: 'down', dp: 0 },
  sleep: { label: 'Sleep', unit: 'h', dir: 'up', dp: 1 },
  bench: { label: 'Bench press', unit: 'kg', dir: 'up', dp: 0 },
  legpress: { label: 'Leg press', unit: 'kg', dir: 'up', dp: 0 },
  breath: { label: 'Breath-hold', unit: 's', dir: 'up', dp: 0 },
  sys: { label: 'Systolic', unit: 'mm/hg', dir: 'down', dp: 0 },
  dia: { label: 'Diastolic', unit: 'mm/hg', dir: 'down', dp: 0 },
  pulse: { label: 'Pulse rate', unit: 'bpm', dir: 'down', dp: 0 },
  sugar: { label: 'Blood sugar', unit: 'mg/dl', dir: 'down', dp: 0 },
};

export const habitLabel: Record<string, string> = { fat: 'Body fat', activity: 'Activity', freq: 'Workouts a week', water: 'Water', level: 'Level', flex: 'Flexibility', injuries: 'Injuries' };

// Sample data: the assessment Coach Vikram did on 30 Sep. The newest comes first.
export const ASSESSMENTS: AssessEntry[] = [
  {
    id: 'coach-1', at: '2026-09-30T10:00:00.000Z',
    answers: { activity: 'Moderately active', freq: '3', water: '1-2 l', level: 'Beginner', flex: 'Moderate', injuries: 'None' },
    tests: { weight: 72.4, chest: 98, waist: 89, hip: 99, arms: 31, legs: 56, calves: 36, sleep: 7, bench: 40, legpress: 120, breath: 35, sys: 124, dia: 82, pulse: 72 },
  },
];

const DAY = 86400000;
const NEXT_IN_DAYS = 6; // sample: the gym books the next one a few days ahead; the real date comes from the gym

/** The assessments the trainer recorded (newest first), and when the next one is booked. */
export function useAssessments() {
  const [now] = useState(() => Date.now()); // the time this screen opened
  const nextAt = now + NEXT_IN_DAYS * DAY;
  return { entries: ASSESSMENTS, nextAt, daysLeft: Math.ceil((nextAt - now) / DAY) };
}

export const fmtAt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Each measurement the entry has, with the change since the other one and whether it is an improvement (sizes have no better or worse). */
export function compare(now: AssessEntry, prev: AssessEntry | undefined) {
  return (Object.keys(NUMS) as NumKey[]).flatMap((k) => {
    const a = now.tests[k];
    if (a == null) return [];
    const n = NUMS[k];
    const b = prev?.tests[k];
    if (b == null) return [{ k, n, now: a, prev: undefined as number | undefined, diff: 0, good: false }];
    const diff = Math.round((a - b) * 10 ** n.dp) / 10 ** n.dp;
    return [{ k, n, now: a, prev: b, diff, good: n.dir === 'down' ? diff < 0 : n.dir === 'up' ? diff > 0 : false }];
  });
}

/** The one line that says how an assessment went next to the one before it. */
export function headlineOf(e: AssessEntry, prev: AssessEntry | undefined) {
  const judged = compare(e, prev).filter((r) => r.prev != null && r.n.dir !== 'none');
  const better = judged.filter((r) => r.good).length;
  return { text: !prev ? 'Your baseline' : judged.length ? `${better} of ${judged.length} improved` : 'Saved', good: !!prev && judged.length > 0 && better > 0 };
}
