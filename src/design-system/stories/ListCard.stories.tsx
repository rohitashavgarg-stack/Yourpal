import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Snowflake } from '@/lib/icons';
import { fixed } from '@/design-system/tokens';
import StretchIcon from '@/lib/StretchIcon';
import { Txt } from '@/components/ui';
import { ListCard } from '@/design-system/primitives/ListCard';

/** A card of rows. Three shapes: rows (label and value), a plain container, and a titled list: a section heading with an icon and how many moves, then numbered rows with the amount on the right. On a logged day the numbers go and a green check sits at the right of each row. */
const meta = { title: 'Primitives/ListCard', component: ListCard } satisfies Meta<typeof ListCard>;
export default meta;
type S = StoryObj<typeof meta>;
export const Rows: S = { args: { rows: [{ l: 'Plan', v: 'Gold, 12 months' }, { l: 'Renews', v: '30 Nov', sub: 'Paid at the front desk' }, { l: 'Freeze days left', v: '12', warn: true }, { l: 'Coach', v: 'Vikram', onPress: () => {} }] } as any };
export const Mono: S = { args: { mono: true, rows: [{ l: 'Squat', v: '60 kg' }, { l: 'Deadlift', v: '80 kg' }] } as any };
export const Container: S = { args: { children: <Txt style={{ padding: 16 }}>Any content</Txt> } as any };
export const Titled: S = { args: { title: 'Warm-up', icon: <StretchIcon size={22} color={fixed.white} />, rows: [{ n: 'Jumping jacks', s: '20 reps' }, { n: 'Leg swings', s: '10 each side' }, { n: 'Hip circles', s: '30 s' }] } as any };
export const TitledLogged: S = { args: { title: 'Cool-down', icon: <Snowflake size={22} color={fixed.white} />, done: true, rows: [{ n: 'Quad stretch', s: '30 s each side' }, { n: 'Child\'s pose', s: '45 s' }] } as any };
