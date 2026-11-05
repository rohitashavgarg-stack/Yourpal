import type { MuscleGroup } from '@/design-system/primitives/MuscleRings';

// Hard sets per muscle group against the target Coach Vikram set in the plan. Sample numbers until workouts are logged against real muscles.
export type MusclePeriod = 'day' | 'week' | 'month' | 'year';
const DAY: MuscleGroup[] = [
  { name: 'Chest', done: 3, target: 4 },
  { name: 'Arms', done: 2, target: 2 },
  { name: 'Shoulders', done: 2, target: 2 },
  { name: 'Core', done: 0, target: 2 },
  { name: 'Legs', done: 0, target: 4 },
  { name: 'Back', done: 0, target: 4 },
];
const WEEK: MuscleGroup[] = [
  { name: 'Chest', done: 9, target: 12 },
  { name: 'Arms', done: 4, target: 8 },
  { name: 'Shoulders', done: 5, target: 8 },
  { name: 'Core', done: 3, target: 6 },
  { name: 'Legs', done: 0, target: 10 },
  { name: 'Back', done: 0, target: 10 },
];
const MONTH: MuscleGroup[] = [
  { name: 'Chest', done: 34, target: 48 },
  { name: 'Arms', done: 22, target: 32 },
  { name: 'Shoulders', done: 24, target: 32 },
  { name: 'Core', done: 15, target: 24 },
  { name: 'Legs', done: 20, target: 40 },
  { name: 'Back', done: 12, target: 40 },
];
const YEAR: MuscleGroup[] = MONTH.map((g) => ({ ...g, done: g.done * 11, target: g.target * 12 }));
export const musclesFor = (p: MusclePeriod) => (p === 'day' ? DAY : p === 'week' ? WEEK : p === 'month' ? MONTH : YEAR);
export const musclesTrained = (g: MuscleGroup[]) => g.filter((x) => x.done > 0).length;
export const musclesOpen = (g: MuscleGroup[]) => g.filter((x) => x.done === 0).map((x) => x.name);
