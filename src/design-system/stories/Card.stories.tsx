import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fixed } from '@/design-system/tokens';
import { Txt } from '@/components/ui';
import { Card } from '@/design-system/primitives/Card';

/** The card surface. Three looks: default, compact, dark. Add a variant rather than restyling one. */
const meta = {
  title: 'Primitives/Card',
  component: Card,
  args: { variant: 'default', children: <><Txt v="headline">Card title</Txt><Txt muted>One sentence of body text.</Txt></> },
  argTypes: { variant: { control: 'select', options: ['default', 'compact', 'dark'] }, gap: { control: 'number' }, children: { control: false } },
} satisfies Meta<typeof Card>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
export const Compact: S = { args: { variant: 'compact' } };
export const Dark: S = { args: { variant: 'dark', children: <><Txt v="headline" color={fixed.white}>Dark card</Txt><Txt color="rgba(255,255,255,0.7)">Never a shadow.</Txt></> } };
