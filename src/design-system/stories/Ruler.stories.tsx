import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Ruler } from '@/design-system/primitives/Ruler';

/** A ruler: drag to change the value. One tick per step, a heavier tick on every major mark. */
const meta = { title: 'Primitives/Ruler', component: Ruler, args: { value: 72, min: 30, max: 200, step: 0.5, decimals: 1, majorEvery: 10, label: (v: number) => String(Math.round(v)), accessibilityLabel: 'Weight', onChange: () => {} } } satisfies Meta<typeof Ruler>;
export default meta;
type S = StoryObj<typeof meta>;
function Live(a: React.ComponentProps<typeof Ruler>) { const [v, setV] = useState(a.value); return <Ruler {...a} value={v} onChange={setV} />; }
export const Horizontal: S = { render: (a) => <Live {...a} /> };
export const Vertical: S = { render: (a) => <Live {...a} vertical value={170} min={100} max={220} step={1} decimals={0} majorEvery={10} accessibilityLabel="Height" /> };
