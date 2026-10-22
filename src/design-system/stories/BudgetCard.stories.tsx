import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { BudgetCard } from '@/design-system/patterns/BudgetCard';

/** Daily budget on Today: the goal row (ring, name, state pill, one line), then Eat today and Burn today. */
const meta = {
  title: 'Patterns/BudgetCard',
  component: BudgetCard,
  args: { eaten: 0, eatTarget: 1800, burned: 0, burnTarget: 350, burnSource: 'plan', goalState: 'onTrack' },
  argTypes: { burnSource: { control: 'select', options: ['plan', 'done', 'watch'] }, goalState: { control: 'select', options: ['onTrack', 'behind', 'almost', 'complete', 'comeback', 'backOn', 'noGoal'] } },
} satisfies Meta<typeof BudgetCard>;
export default meta;
type S = StoryObj<typeof meta>;
export const NothingYet: S = {};
export const PartDay: S = { args: { eaten: 920, burned: 120 } };
export const WorkoutDone: S = { args: { eaten: 1240, burned: 380, burnSource: 'done' } };
export const Watch: S = { args: { eaten: 1240, burned: 214, burnSource: 'watch' } };
export const OverTarget: S = { args: { eaten: 2050, burned: 380, burnSource: 'done' } };
export const GoalBehind: S = { args: { goalState: 'behind' } };
export const GoalAlmost: S = { args: { goalState: 'almost' } };
export const GoalComplete: S = { args: { goalState: 'complete' } };
export const NoGoal: S = { args: { goalState: 'noGoal' } };
