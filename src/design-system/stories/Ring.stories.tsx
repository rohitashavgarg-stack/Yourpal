import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useTheme } from '@/theme/ThemeProvider';
import { fixed } from '@/design-system/tokens';
import { Ring } from '@/design-system/primitives/Ring';

/** A thin ring that fills to a fraction (0 to 1) in 1.3 s. */
const meta = { title: 'Primitives/Ring', component: Ring, args: { size: 96, r: 40, stroke: 8, pct: 0.6, color: fixed.blue, track: 'rgba(127,127,127,0.2)', delay: 0 } } satisfies Meta<typeof Ring>;
export default meta;
type S = StoryObj<typeof meta>;
function ThemedRing() { const { c } = useTheme(); return <Ring size={96} r={40} stroke={8} pct={0.75} color={c.tNutri} track={c.surface3} delay={0} />; }
export const Default: S = {};
export const Full: S = { args: { pct: 1 } };
export const Empty: S = { args: { pct: 0 } };
export const Thin: S = { args: { stroke: 4, r: 44 } };
export const ThemeColours: S = { render: () => <ThemedRing /> };
