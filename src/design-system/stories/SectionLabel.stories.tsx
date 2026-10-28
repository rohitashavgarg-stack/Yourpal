import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Dumbbell } from '@/lib/icons';
import { Txt } from '@/components/ui';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';

/** The small heading above a group. Announced as a header by screen readers. */
const meta = {
  title: 'Primitives/SectionLabel',
  component: SectionLabel,
  args: { children: 'Ask about', variant: 'label' },
  argTypes: { variant: { control: 'select', options: ['overline', 'quiet', 'label', 'section'] }, inset: { control: 'number' } },
} satisfies Meta<typeof SectionLabel>;
export default meta;
type S = StoryObj<typeof meta>;
export const Label: S = {};
export const Overline: S = { args: { variant: 'overline', children: 'This week from coach' } };
export const Quiet: S = { args: { variant: 'quiet', children: 'Recent' } };
export const Section: S = { args: { variant: 'section', children: 'Main workout', icon: <Dumbbell size={20} color="#F3F4F6" />, right: <Txt v="caption">7 exercises</Txt> } };
