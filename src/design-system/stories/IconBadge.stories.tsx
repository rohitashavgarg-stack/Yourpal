import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fixed, light } from '@/design-system/tokens';
import { Dumbbell, Check } from '@/lib/icons';
import { IconBadge } from '@/design-system/primitives/IconBadge';

/** A filled circle or rounded square holding one icon or letter. Not pressable. */
const meta = {
  title: 'Primitives/IconBadge',
  component: IconBadge,
  args: { size: 40, bg: 'rgba(47,107,234,0.14)', children: <Dumbbell size={20} color={fixed.blue} />, accessibilityLabel: 'Workout' },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof IconBadge>;
export default meta;
type S = StoryObj<typeof meta>;
export const Circle: S = {};
export const RoundedSquare: S = { args: { radius: 12 } };
export const Tick: S = { args: { size: 18, bg: light.good, children: <Check size={12} strokeWidth={3} color={fixed.white} />, accessibilityLabel: 'Eaten' } };
export const BorderOnly: S = { args: { bg: undefined, borderColor: 'rgba(127,127,127,0.4)', borderWidth: 1.5, size: 24, children: null } };
