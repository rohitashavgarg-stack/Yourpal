import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';

/** The small heading above a group. Announced as a header by screen readers. */
const meta = {
  title: 'Primitives/SectionLabel',
  component: SectionLabel,
  args: { children: 'Ask about', variant: 'label' },
  argTypes: { variant: { control: 'select', options: ['overline', 'quiet', 'label'] }, inset: { control: 'number' } },
} satisfies Meta<typeof SectionLabel>;
export default meta;
type S = StoryObj<typeof meta>;
export const Label: S = {};
export const Overline: S = { args: { variant: 'overline', children: 'This week from coach' } };
export const Quiet: S = { args: { variant: 'quiet', children: 'Recent' } };
