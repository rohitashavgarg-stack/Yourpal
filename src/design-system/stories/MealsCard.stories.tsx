import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MealsCard } from '@/design-system/patterns/MealsCard';

/** Today's meals: the meal for right now with its foods, the logged and skipped looks, the missed-meal question, all done, and paused. */
const lunch = {
  name: 'Lunch', meta: { time: '1:00 pm', kcal: '650 kcal planned', protein: '22 g protein' }, status: 'todo' as const, skipped: false,
  items: [{ name: 'Dal tadka', amount: '1 katori', type: 'veg' as const, eaten: false }, { name: 'Roti', amount: '2', type: 'veg' as const, eaten: false }, { name: 'Curd', amount: '1 katori', type: 'veg' as const, eaten: false }],
  extras: [],
};
const meta = {
  title: 'Patterns/MealsCard',
  component: MealsCard,
  args: { state: 'now', done: 1, total: 4, meal: lunch, onLogMeal: () => {} },
  argTypes: { state: { control: 'select', options: ['now', 'complete', 'paused'] } },
} satisfies Meta<typeof MealsCard>;
export default meta;
type S = StoryObj<typeof meta>;
export const Now: S = {};
export const Logged: S = { args: { meal: { ...lunch, status: 'logged', loggedAt: '1:10 pm', meta: { ...lunch.meta, kcal: '520 kcal eaten' }, items: lunch.items.map((x, i) => ({ ...x, eaten: i !== 2 })) } } };
export const WithExtra: S = { args: { meal: { ...lunch, status: 'logged', loggedAt: '1:10 pm', extras: [{ name: 'Poha, 1 plate', type: 'veg' }] } } };
export const Skipped: S = { args: { meal: { ...lunch, status: 'skipped', skipped: true } } };
export const MissedAsk: S = { args: { ask: { name: 'Breakfast', planned: '8:00 am', more: 0 }, onAskLog: () => {} } };
export const Complete: S = { args: { state: 'complete', done: 4, completeLine: 'All four meals logged', rows: [{ id: 'bf', name: 'Breakfast', skipped: false, sub: '420 kcal' }, { id: 'lu', name: 'Lunch', skipped: false, sub: '650 kcal' }, { id: 'sn', name: 'Evening snack', skipped: true, sub: 'Skipped' }, { id: 'dn', name: 'Dinner', skipped: false, sub: '560 kcal' }], onOpenMeal: () => {} } };
export const Paused: S = { args: { state: 'paused', pausedLine: 'Logging is paused while your membership is inactive' } };
