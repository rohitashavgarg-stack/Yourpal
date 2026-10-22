import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { WeekCard } from '@/design-system/patterns/WeekCard';

/** This week: workouts and meals on plan, then seven days with a workout mark and a 2 x 2 meals grid. */
const days = [
  { num: 22, letter: 'M', name: 'Mon', workout: 'done', mealsOnPlan: 4 },
  { num: 23, letter: 'T', name: 'Tue', workout: 'rest', mealsOnPlan: 3 },
  { num: 24, letter: 'W', name: 'Wed', workout: '', mealsOnPlan: 1, today: true },
  { num: 25, letter: 'T', name: 'Thu', workout: '', mealsOnPlan: 0, future: true },
  { num: 26, letter: 'F', name: 'Fri', workout: 'rest', mealsOnPlan: 0, future: true },
  { num: 27, letter: 'S', name: 'Sat', workout: '', mealsOnPlan: 0, future: true },
  { num: 28, letter: 'S', name: 'Sun', workout: 'rest', mealsOnPlan: 0, future: true },
] as const;
const meta = {
  title: 'Patterns/WeekCard',
  component: WeekCard,
  args: { days: days as any, workouts: { done: 1, target: 4 }, meals: { onPlan: 8, total: 12 }, summary: 'This week: 1 of 4 workouts, 8 of 12 meals on plan.', onDayPress: () => {} },
} satisfies Meta<typeof WeekCard>;
export default meta;
type S = StoryObj<typeof meta>;
export const MidWeek: S = {};
export const TodayDone: S = { args: { days: days.map((d) => (d.name === 'Wed' ? { ...d, workout: 'done', mealsOnPlan: 4 } : d)) as any, workouts: { done: 2, target: 4 }, meals: { onPlan: 11, total: 12 } } };
