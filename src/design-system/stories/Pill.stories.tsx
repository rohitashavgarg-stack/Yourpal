import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Pill } from '@/design-system/primitives/Pill';

/** A selectable pill, one of a set. */
const meta = { title: 'Primitives/Pill', component: Pill, args: { label: 'As shown', on: false, onPress: () => {} } } satisfies Meta<typeof Pill>;
export default meta;
type S = StoryObj<typeof meta>;
export const Off: S = {};
export const On: S = { args: { on: true } };
function GroupDemo() {
  const [v, setV] = React.useState('As shown');
  return <View style={{ flexDirection: 'row', gap: 8 }}>{['Less', 'As shown', 'More'].map((l) => <Pill key={l} label={l} on={v === l} onPress={() => setV(l)} style={{ flex: 1 }} />)}</View>;
}
export const Group: S = { render: () => <GroupDemo /> };
