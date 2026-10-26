import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { light, radii } from '@/design-system/tokens';
import { TrackerRow, WaterTile, WeightTile, HealthTile, ConnectTile } from '@/design-system/patterns/TrackerRow';

/** The trackers slider on Today and its tiles. Watch tiles show only when a wearable is connected; otherwise a Connect tile. */
const tiles = {
  weight: <WeightTile kg={72.4} delta={-0.5} series={[74.5, 74.1, 73.6, 73.4, 73.0, 72.9, 72.4]} onPress={() => {}} />,
  steps: <View style={{ width: 150, height: 150, borderRadius: radii.card, backgroundColor: light.good }} />,
  connect: <ConnectTile name="Health Connect" onPress={() => {}} />,
  water: <WaterTile litres={1.25} onPress={() => {}} onAdd={() => {}} />,
  health: <><HealthTile kind="hr" onPress={() => {}} /><HealthTile kind="sleep" onPress={() => {}} /><HealthTile kind="kcal" onPress={() => {}} /></>,
};
const meta = {
  title: 'Patterns/TrackerRow',
  component: TrackerRow,
  args: { connected: false, wearable: false, ...tiles },
  argTypes: { weight: { control: false }, steps: { control: false }, connect: { control: false }, water: { control: false }, health: { control: false } },
} satisfies Meta<typeof TrackerRow>;
export default meta;
type S = StoryObj<typeof meta>;
export const NotConnected: S = {};
export const Connected: S = { args: { connected: true } };
export const WithWatch: S = { args: { connected: true, wearable: true } };
export const Water: S = { render: () => <WaterTile litres={1.25} hit={0} onPress={() => {}} onAdd={() => {}} /> };
export const Weight: S = { render: () => tiles.weight };
export const HeartRate: S = { render: () => <HealthTile kind="hr" onPress={() => {}} /> };
export const Sleep: S = { render: () => <HealthTile kind="sleep" onPress={() => {}} /> };
export const ActiveEnergy: S = { render: () => <HealthTile kind="kcal" onPress={() => {}} /> };
export const Connect: S = { render: () => <ConnectTile name="Apple Health" onPress={() => {}} /> };
