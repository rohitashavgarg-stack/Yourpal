import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fixed } from '@/design-system/tokens';
import { Txt } from '@/components/ui';
import { SubPage } from '@/design-system/primitives/SubPage';

/** The shell of a pushed page: back (or close) button, title, optional right action, scrolling content. */
const meta = {
  title: 'Primitives/SubPage',
  component: SubPage,
  args: { title: 'Your goal', fallback: '/progress', children: <Txt>Page content</Txt> },
  argTypes: { variant: { control: 'select', options: ['shell', 'progress'] }, children: { control: false }, right: { control: false }, backdrop: { control: false }, footer: { control: false } },
  decorators: [(St) => <View style={{ height: 520 }}><St /></View>],
} satisfies Meta<typeof SubPage>;
export default meta;
type S = StoryObj<typeof meta>;
export const Shell: S = {};
export const Close: S = { args: { close: true, title: 'What did you eat?' } };
export const WithRight: S = { args: { right: <Txt style={{ paddingHorizontal: 14, color: fixed.blue }}>Change</Txt> } };
export const Progress: S = { args: { variant: 'progress', title: 'Weight' } };
