import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { radii } from '@/design-system/tokens';
import { Txt } from '@/components/ui';
import { FadeIn } from '@/design-system/primitives/FadeIn';

/** The one entrance animation: a short fade with a tiny rise, staggered by index. No springs or overshoot. */
const meta = { title: 'Primitives/FadeIn', component: FadeIn } satisfies Meta<typeof FadeIn>;
export default meta;
type S = StoryObj<typeof meta>;
export const Staggered: S = { render: () => <View style={{ gap: 8 }}>{[0, 1, 2, 3].map((i) => <FadeIn key={i} i={i} step={50}><View style={{ padding: 16, borderRadius: radii.tile, backgroundColor: 'rgba(127,127,127,0.15)' }}><Txt>Card {i + 1}</Txt></View></FadeIn>)}</View> };
export const Delayed: S = { render: () => <FadeIn delay={350}><Txt>Shown after 350 ms</Txt></FadeIn> };
