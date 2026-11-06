import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { EffortSlider } from '@/design-system/primitives/EffortSlider';

/** A drag slider from easy (blue) to max (red). */
const meta = { title: 'Primitives/EffortSlider', component: EffortSlider, args: { value: 0.55, onChange: () => {} } } satisfies Meta<typeof EffortSlider>;
export default meta;
type S = StoryObj<typeof meta>;
function Live() { const [v, setV] = useState(0.55); return <View style={{ width: 320 }}><EffortSlider value={v} onChange={setV} /></View>; }
export const Default: S = { render: () => <Live /> };
export const Easy: S = { render: () => <View style={{ width: 320 }}><EffortSlider value={0.05} onChange={() => {}} /></View> };
export const Max: S = { render: () => <View style={{ width: 320 }}><EffortSlider value={1} onChange={() => {}} /></View> };
