import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { onDark, radii } from '@/design-system/tokens';
import { ScanBracket } from '@/design-system/primitives/ScanBracket';

/** One corner of the plate-photo viewfinder. Draw four. */
const meta = { title: 'Primitives/ScanBracket', component: ScanBracket, args: { pos: 'tl', size: 'small' }, argTypes: { pos: { control: 'select', options: ['tl', 'tr', 'bl', 'br'] }, size: { control: 'select', options: ['small', 'large'] } } } satisfies Meta<typeof ScanBracket>;
export default meta;
type S = StoryObj<typeof meta>;
const Frame = ({ size }: { size: 'small' | 'large' }) => <View style={{ height: 220, borderRadius: radii.card, backgroundColor: onDark.card }}>{(['tl', 'tr', 'bl', 'br'] as const).map((p) => <ScanBracket key={p} pos={p} size={size} />)}</View>;
export const Small: S = { render: () => <Frame size="small" /> };
export const Large: S = { render: () => <Frame size="large" /> };
