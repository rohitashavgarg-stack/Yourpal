import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fixed } from '@/design-system/tokens';
import { Txt } from '@/components/ui';
import { Card } from '@/design-system/primitives/Card';

/** The card surface. Looks: default, roomy, compact, tight, dark; and flat, border, clip, per-side padding. Add a variant rather than restyling one. */
const meta = {
  title: 'Primitives/Card',
  component: Card,
  args: { variant: 'default', children: <><Txt v="headline">Card title</Txt><Txt muted>One sentence of body text.</Txt></> },
  argTypes: { variant: { control: 'select', options: ['default', 'roomy', 'compact', 'tight', 'dark'] }, gap: { control: 'number' }, flat: { control: 'boolean' }, clip: { control: 'boolean' }, border: { control: 'object' }, padding: { control: 'object' }, children: { control: false } },
} satisfies Meta<typeof Card>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
export const Compact: S = { args: { variant: 'compact' } };
export const Roomy: S = { args: { variant: 'roomy' } };
export const Tight: S = { args: { variant: 'tight' } };
/** No shadow: a card on a sheet or inside another surface. */
export const Flat: S = { args: { variant: 'tight', flat: true } };
/** A line around it: the selected plan on the break page uses a 1.5 px accent line. */
export const Border: S = { args: { variant: 'tight', border: { color: fixed.blue, width: 1.5 } } };
/** Clips a chart or image to the corners. */
export const Clip: S = { args: { variant: 'roomy', clip: true, children: <View style={{ height: 120, marginHorizontal: -18, marginBottom: -18, backgroundColor: fixed.blue }} /> } };
/** Per-side padding for list cards whose rows bring their own vertical space. */
export const ListPadding: S = { args: { padding: { top: 4, bottom: 4, horizontal: 16 }, children: <><View style={{ minHeight: 56, justifyContent: 'center' }}><Txt>Row one</Txt></View><View style={{ minHeight: 56, justifyContent: 'center' }}><Txt>Row two</Txt></View></> } };
export const Dark: S = { args: { variant: 'dark', children: <><Txt v="headline" color={fixed.white}>Dark card</Txt><Txt color="rgba(255,255,255,0.7)">Never a shadow.</Txt></> } };
