import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { CheckCircle } from '@/design-system/primitives/CheckCircle';

/** A round check. The tick is drawn when it turns on. The tap area is 44 px even when the circle is smaller. */
const meta = { title: 'Primitives/CheckCircle', component: CheckCircle, args: { on: false, label: 'Oats, done', size: 28, tone: 'good' }, argTypes: { tone: { control: 'select', options: ['accent', 'good'] } } } satisfies Meta<typeof CheckCircle>;
export default meta;
type S = StoryObj<typeof meta>;
function Toggle(a: React.ComponentProps<typeof CheckCircle>) { const [on, setOn] = useState(false); return <CheckCircle {...a} on={on} onPress={() => setOn(!on)} />; }
export const Off: S = {};
export const On: S = { args: { on: true } };
export const Accent: S = { args: { tone: 'accent', size: 40, label: 'Exercise done' } };
export const Interactive: S = { render: (a) => <Toggle {...a} /> };
