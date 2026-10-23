import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Wheel } from '@/design-system/primitives/Wheel';

/** A vertical wheel: scroll to a number, one light tick per step, a heavier tick every fifth. */
const meta = { title: 'Primitives/Wheel', component: Wheel, args: { value: 28, min: 14, max: 80, unit: 'years', accessibilityLabel: 'Age', onChange: () => {} } } satisfies Meta<typeof Wheel>;
export default meta;
type S = StoryObj<typeof meta>;
function Live(a: React.ComponentProps<typeof Wheel>) { const [v, setV] = useState(a.value); return <Wheel {...a} value={v} onChange={setV} />; }
export const Default: S = { render: (a) => <Live {...a} /> };
export const Formatted: S = { render: (a) => <Live {...a} value={70} min={30} max={200} unit="kg" accessibilityLabel="Weight" fmt={(n) => n.toFixed(0)} /> };
