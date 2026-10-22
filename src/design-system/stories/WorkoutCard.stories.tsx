import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { WorkoutCard } from '@/design-system/patterns/WorkoutCard';

/** Today's workout. One look per state. The Full / Quick / Low energy choice lives only in the Start sheet, never on this card. */
const meta = {
  title: 'Patterns/WorkoutCard',
  component: WorkoutCard,
  args: { state: 'upcoming', name: 'Leg day', time: '6:30 pm', when: 'in 2 h', meta: [{ kind: 'exercises', text: '7 exercises' }, { kind: 'time', text: '~50 min' }], coachUnread: false },
  argTypes: { state: { control: 'select', options: ['upcoming', 'due', 'live', 'missed', 'moved', 'skipped', 'done', 'rest', 'paused', 'comeback'] } },
} satisfies Meta<typeof WorkoutCard>;
export default meta;
type S = StoryObj<typeof meta>;
export const Upcoming: S = {};
export const Due: S = { args: { state: 'due', coachUnread: true } };
export const Live: S = { args: { state: 'live', live: { elapsed: '18:42', done: 3, total: 7, next: 'Romanian deadlift' } } };
export const Missed: S = { args: { state: 'missed' } };
export const Moved: S = { args: { state: 'moved' } };
export const Skipped: S = { args: { state: 'skipped' } };
export const Done: S = { args: { state: 'done', burned: 380, done: { at: '7:28 pm', stats: [['46', ' min', 'Time'], ['7', '', 'Exercises'], ['380', ' kcal', 'Burned']] } } };
export const Rest: S = { args: { state: 'rest', restNext: 'Next: Pull, Thu 6:30 pm' } };
export const Paused: S = { args: { state: 'paused' } };
export const Comeback: S = { args: { state: 'comeback' } };
