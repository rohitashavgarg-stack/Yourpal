import { createStore } from '@/lib/createStore';
import { STEPS_DESIGNS } from '@/features/today/StepsCards';

export type TrackerKey = 'steps' | 'energy' | 'water' | 'weight' | 'hr' | 'sleep';

// The widgets shown on Profile → Tracker designs, by category. The first design of each tracker is the one the app already has.
export const CATALOG: { category: string; trackers: { key: TrackerKey; title: string; designs: string[] }[] }[] = [
  { category: 'Activity', trackers: [
    { key: 'steps', title: 'Steps', designs: STEPS_DESIGNS as string[] },
    { key: 'energy', title: 'Active energy', designs: ['Current', 'Dot matrix', 'Stack'] },
  ] },
  { category: 'Hydration and body', trackers: [
    { key: 'water', title: 'Water', designs: ['Current', 'Dot matrix', 'Glasses'] },
    { key: 'weight', title: 'Weight', designs: ['Current', 'Dot matrix', 'Ruler'] },
  ] },
  { category: 'Heart and recovery', trackers: [
    { key: 'hr', title: 'Heart rate', designs: ['Current', 'Dot matrix'] },
    { key: 'sleep', title: 'Sleep', designs: ['Current', 'Stages', 'Dot matrix'] },
  ] },
];

// The chosen design for each tracker except steps (steps keep their own store, shared with the edge-case panel).
export const designStore = createStore(() => ({
  energy: 'Current', water: 'Current', weight: 'Current', hr: 'Current', sleep: 'Current',
} as Record<Exclude<TrackerKey, 'steps'>, string>));
