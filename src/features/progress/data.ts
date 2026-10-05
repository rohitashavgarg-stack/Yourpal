import type { LiftName } from './store';
import type { MetricKey } from './trends';
export type { MetricKey } from './trends';

export type CardKey = 'weight' | 'cons' | 'diet' | 'lifts' | 'steps' | 'meas' | 'assess' | 'photos' | 'water' | 'hr' | 'sleep';

export const ORDER: Record<string, CardKey[]> = {
  'Weight loss': ['weight', 'assess', 'cons', 'diet', 'lifts', 'steps', 'hr', 'sleep', 'meas', 'photos', 'water'],
  Strength: ['lifts', 'assess', 'cons', 'weight', 'diet', 'meas', 'hr', 'sleep', 'steps', 'photos', 'water'],
  'Muscle gain': ['meas', 'assess', 'lifts', 'weight', 'diet', 'cons', 'sleep', 'hr', 'steps', 'photos', 'water'],
};

ORDER['Lean body'] = ORDER['Weight loss'];
ORDER.Flexibility = ['assess', 'cons', 'meas', 'diet', 'weight', 'lifts', 'sleep', 'hr', 'steps', 'photos', 'water'];
ORDER.Agility = ['assess', 'cons', 'lifts', 'diet', 'weight', 'meas', 'sleep', 'hr', 'steps', 'photos', 'water'];
ORDER['General fitness'] = ['cons', 'steps', 'diet', 'weight', 'assess', 'lifts', 'meas', 'sleep', 'hr', 'photos', 'water'];
ORDER['Not sure yet'] = ORDER['General fitness'];

export const NEW_EMPTY: Partial<Record<CardKey, string>> = {
  weight: 'Log your weight a few times this week to see a trend.',
  lifts: 'Your first logged workout starts your PR history.',
  meas: 'Measurements are added at your assessment.',
  photos: 'Add a starting photo. Only you can see it.',
  diet: 'Mark a few meals to see how you are doing.',
  cons: 'Your first workout starts the streak.',
};

export const LIFT_DATA: Record<LiftName, { pr: string; prd: string; last: string; v: number[][]; stall?: boolean }> = {
  'Bench press': { pr: 'PR 62.5 kg', prd: '12 Sep', last: 'Last: 4 × 8 · 57.5 kg', stall: true, v: [[50, 52, 54, 55, 57, 58, 60, 61, 62, 62, 62, 62], [45, 47.5, 50, 50, 52.5, 55, 55, 57.5, 57.5, 57.5, 57.5, 57.5], [1.4, 1.5, 1.6, 1.6, 1.7, 1.8, 1.8, 1.9, 1.8, 1.8, 1.8, 1.8]] },
  Squat: { pr: 'PR 62.5 kg', prd: '20 Sep', last: 'Last: 4 × 8 · 57.5 kg', v: [[48, 50, 53, 55, 57, 60, 62, 64, 66, 68, 70, 72], [40, 42.5, 45, 47.5, 50, 52.5, 55, 55, 57.5, 60, 60, 62.5], [1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.0, 2.1, 2.2, 2.3]] },
  'Leg press': { pr: 'PR 130 kg', prd: '24 Sep', last: 'Last: 3 × 12 · 125 kg', v: [[120, 124, 128, 132, 136, 140, 142, 146, 150, 152, 156, 160], [100, 105, 105, 110, 110, 115, 117.5, 120, 120, 125, 125, 130], [3.6, 3.8, 3.8, 4.0, 4.0, 4.1, 4.2, 4.3, 4.3, 4.5, 4.5, 4.7]] },
};
export const LIFT_METRICS = ['Est. 1RM', 'Top weight', 'Volume'] as const;
export const LIFT_TITLES = ['Estimated 1-rep max', 'Top weight', 'Weekly volume'];

export const ASSESS_ROWS = [
  { l: 'Weight', v: '74.5 → 72.4 kg' }, { l: 'Waist', v: '92 → 89 cm' }, { l: 'Body fat', v: 'Starting point → −1.5%' },
  { l: 'Squat', v: '40 → 60 kg' }, { l: 'Deep squat hold', v: '30 → 45 s' },
];

export const GOALS = ['Weight loss', 'Muscle gain', 'Lean body', 'Strength', 'Flexibility', 'Agility', 'General fitness'];
export const NUMERIC_GOALS = ['Weight loss', 'Muscle gain', 'Lean body', 'Strength', 'General fitness'];
export const GOAL_VERB: Record<string, string> = { 'Weight loss': 'Lose (kg)', 'Muscle gain': 'Gain (kg)', 'Lean body': 'Lower body fat (%)', Strength: 'Squat target (kg)', 'General fitness': 'Train (days a week)' };
export const GOAL_DEFAULT: Record<string, number> = { 'Weight loss': 6, 'Muscle gain': 3, 'Lean body': 3, Strength: 80, 'General fitness': 4 };

export function goalTitle(g0: { type: string; target: number; by: string }) {
  // a numeric goal with no target would read "Train 0× a week": fall back to the default target, or to the goal's own name
  const g = NUMERIC_GOALS.includes(g0.type) && !g0.target ? { ...g0, target: GOAL_DEFAULT[g0.type] ?? 0 } : g0;
  let t = g.type === 'Weight loss' ? `Lose ${g.target} kg` : g.type === 'Muscle gain' ? `Gain ${g.target} kg` : g.type === 'Strength' ? `Squat ${g.target} kg`
    : g.type === 'General fitness' ? `Train ${g.target}× a week` : g.type === 'Lean body' ? `Body fat −${g.target}%` : g.type;
  if (g.by && g.by !== '—') t += ` by ${g.by}`;
  return t;
}

export const METRIC_TITLES: Record<MetricKey, string> = { weight: 'Weight', cons: 'Consistency', diet: 'Diet', steps: 'Steps', meas: 'Measurements', water: 'Water', hr: 'Heart rate', sleep: 'Sleep' };

