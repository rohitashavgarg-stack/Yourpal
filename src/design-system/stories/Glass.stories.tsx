import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { GlassBackdrop, ProgressiveBlur } from '@/design-system/primitives/Glass';
import { Txt } from '@/design-system/primitives/Txt';

/** The glass layer behind a floating pill or bar, and the blur that fades under a header. Put them inside a clipped, positioned View. */
const meta = { title: 'Primitives/Glass', component: GlassBackdrop, args: { radius: 22 } } satisfies Meta<typeof GlassBackdrop>;
export default meta;
type S = StoryObj<typeof meta>;
export const Backdrop: S = { render: (a) => (
  <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ height: 44, paddingHorizontal: 20, borderRadius: a.radius, overflow: 'hidden', justifyContent: 'center' }}><GlassBackdrop {...a} /><Txt>Trends</Txt></View>
  </View>
) };
export const Frosted: S = { args: { frost: 60 }, render: Backdrop.render };
export const Blur: S = { render: () => (
  <View style={{ height: 160, overflow: 'hidden' }}><Txt>Text that scrolls under the header</Txt><ProgressiveBlur height={80} edge="top" /></View>
) };
