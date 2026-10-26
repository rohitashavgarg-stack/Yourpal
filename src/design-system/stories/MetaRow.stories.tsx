import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { light } from '@/design-system/tokens';
import { Clock, Dumbbell } from '@/lib/icons';
import { MetaRow } from '@/design-system/primitives/MetaRow';

/** Facts in one line, each with an icon, with a thin line between them (instead of dot separators). */
const meta = {
  title: 'Primitives/MetaRow',
  component: MetaRow,
  args: { color: light.muted, dividerColor: 'rgba(127,127,127,0.3)', items: [{ icon: <Dumbbell size={14} color={light.muted} />, text: '7 exercises' }, { icon: <Clock size={14} color={light.muted} />, text: '~50 min' }] },
  argTypes: { items: { control: false } },
} satisfies Meta<typeof MetaRow>;
export default meta;
type S = StoryObj<typeof meta>;
export const TwoItems: S = {};
export const OneItem: S = { args: { items: [{ icon: <Clock size={14} color={light.muted} />, text: '1:00 pm' }] } };
