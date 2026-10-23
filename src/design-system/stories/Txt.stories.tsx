import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Txt } from '@/design-system/primitives/Txt';

/** The text primitive. Eight variants; the line height is always at least 1.3 times the size. */
const meta = {
  title: 'Primitives/Txt',
  component: Txt,
  args: { v: 'body', children: 'You ate 1,240 kcal today', muted: false },
  argTypes: { v: { control: 'select', options: ['display', 'title', 'headline', 'body', 'label', 'caption', 'mono', 'number'] } },
} satisfies Meta<typeof Txt>;
export default meta;
type S = StoryObj<typeof meta>;
export const Body: S = {};
export const Display: S = { args: { v: 'display', children: 'Today' } };
export const Title: S = { args: { v: 'title', children: 'Your goal' } };
export const Headline: S = { args: { v: 'headline', children: 'Leg day' } };
export const Label: S = { args: { v: 'label', children: 'Protein' } };
export const Caption: S = { args: { v: 'caption', children: 'From your watch' } };
export const Mono: S = { args: { v: 'mono', children: '12:30' } };
export const Number: S = { args: { v: 'number', children: '1,240' } };
export const Muted: S = { args: { muted: true, children: 'A quiet line under a title' } };
export const AllVariants: S = {
  render: () => (
    <View style={{ gap: 8 }}>
      {(['display', 'title', 'headline', 'body', 'label', 'caption', 'mono', 'number'] as const).map((v) => <Txt key={v} v={v}>{v}</Txt>)}
    </View>
  ),
};
