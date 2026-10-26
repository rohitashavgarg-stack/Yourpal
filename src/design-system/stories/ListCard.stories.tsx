import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fixed } from '@/design-system/tokens';
import { Txt } from '@/components/ui';
import { ListCard } from '@/design-system/primitives/ListCard';

/** A card of rows. Three shapes: rows (label and value), a plain container, and a titled list with a coloured dot. */
const meta = { title: 'Primitives/ListCard', component: ListCard } satisfies Meta<typeof ListCard>;
export default meta;
type S = StoryObj<typeof meta>;
export const Rows: S = { args: { rows: [{ l: 'Plan', v: 'Gold, 12 months' }, { l: 'Renews', v: '30 Nov', sub: 'Paid at the front desk' }, { l: 'Freeze days left', v: '12', warn: true }, { l: 'Coach', v: 'Vikram', onPress: () => {} }] } as any };
export const Mono: S = { args: { mono: true, rows: [{ l: 'Squat', v: '60 kg' }, { l: 'Deadlift', v: '80 kg' }] } as any };
export const Container: S = { args: { children: <Txt style={{ padding: 16 }}>Any content</Txt> } as any };
export const Titled: S = { args: { title: 'Warm-up', dot: fixed.blue, rows: [{ n: 'Bike', s: '5 min easy' }, { n: 'Leg swings', s: '10 each side' }] } as any };
