import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { onDark, radii } from '@/design-system/tokens';
import { Clock, Flame } from '@/lib/icons';
import { Chip } from '@/design-system/primitives/Chip';

/** An outline chip for information. Chips are never actions. */
const meta = {
  title: 'Primitives/Chip',
  component: Chip,
  args: { label: '7 exercises', tone: 'default', onDark: false },
  argTypes: { tone: { control: 'select', options: ['default', 'good', 'warn', 'live'] }, icon: { control: false } },
} satisfies Meta<typeof Chip>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
export const WithIcon: S = { args: { label: '~50 min', icon: <Clock size={14} /> } };
export const Good: S = { args: { tone: 'good', label: 'On plan' } };
export const Warn: S = { args: { tone: 'warn', label: 'Needs a weigh-in' } };
export const Live: S = { args: { tone: 'live', label: 'Now', icon: <Flame size={14} /> } };
export const OnDark: S = { args: { onDark: true, label: 'Leg day' }, decorators: [(St) => <View style={{ backgroundColor: onDark.card, padding: 16, borderRadius: radii.card }}><St /></View>] };
