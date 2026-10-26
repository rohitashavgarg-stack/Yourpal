import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { onDark, radii } from '@/design-system/tokens';
import { GoalCard } from '@/design-system/patterns/GoalCard';

/** The programme goal. Variants: card (Progress), flat (goal page header), strip (the goal row in the Daily budget card). Every state is a prop. A goal is never frozen or paused. */
const STATES = ['onTrack', 'behind', 'almost', 'complete', 'comeback', 'backOn', 'noGoal'] as const;
const meta = {
  title: 'Patterns/GoalCard',
  component: GoalCard,
  args: { variant: 'card', state: 'onTrack', weighDays: 2 },
  argTypes: { variant: { control: 'select', options: ['card', 'flat', 'strip'] }, state: { control: 'select', options: STATES }, weighDays: { control: 'number', description: '10 or more shows the stale weigh-in look' } },
} satisfies Meta<typeof GoalCard>;
export default meta;
type S = StoryObj<typeof meta>;
export const OnTrack: S = {};
export const Behind: S = { args: { state: 'behind' } };
export const Almost: S = { args: { state: 'almost' } };
export const Complete: S = { args: { state: 'complete' } };
export const Comeback: S = { args: { state: 'comeback' } };
export const BackOn: S = { args: { state: 'backOn' } };
export const NoGoal: S = { args: { state: 'noGoal' } };
export const StaleWeighIn: S = { args: { weighDays: 12 } };
export const Flat: S = { args: { variant: 'flat' } };
export const Strip: S = { args: { variant: 'strip' }, decorators: [(St) => <View style={{ backgroundColor: onDark.card, borderRadius: radii.card, overflow: 'hidden' }}><St /></View>] };
export const StripAllStates: S = { render: () => <View style={{ gap: 8 }}>{STATES.map((s) => <View key={s} style={{ backgroundColor: onDark.card, borderRadius: radii.card, overflow: 'hidden' }}><GoalCard variant="strip" state={s} /></View>)}</View> };
export const CardAllStates: S = { render: () => <View style={{ gap: 12 }}>{STATES.map((s) => <GoalCard key={s} state={s} />)}</View> };
