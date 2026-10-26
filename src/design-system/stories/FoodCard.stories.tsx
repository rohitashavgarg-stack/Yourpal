import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { FoodCard } from '@/design-system/patterns/FoodCard';
import { AmountStepper } from '@/design-system/primitives/AmountStepper';

/** One food as its own card: dashed when not eaten, solid when eaten, faded when skipped. Swipe left on a not-eaten card for Swap and Skip. Hold for the food page. */
const meta = {
  title: 'Patterns/FoodCard',
  component: FoodCard,
  args: { state: 'todo', name: 'Curd', type: 'veg', kcal: '100 kcal', macros: 'P 6 · C 7 · F 5 g', amountText: '1 katori', note: 'Skipped for today', skipLabel: 'Skip' },
  argTypes: { state: { control: 'select', options: ['todo', 'eaten', 'skipped'] }, type: { control: 'select', options: ['veg', 'egg', 'nv'] }, amount: { control: false } },
  decorators: [(St) => <View style={{ width: '100%', gap: 8 }}><St /></View>],
} satisfies Meta<typeof FoodCard>;
export default meta;
type S = StoryObj<typeof meta>;
const stepper = <AmountStepper text="1 katori" unit="katori" onLess={() => {}} onMore={() => {}} />;
export const NotEaten: S = { args: { amount: stepper, onCheck: () => {}, onSwap: () => {}, onSkip: () => {}, onHold: () => {} } };
export const Eaten: S = { args: { state: 'eaten', onMenu: () => {}, onHold: () => {} } };
export const Skipped: S = { args: { state: 'skipped', onCheck: () => {} } };
export const NonVeg: S = { args: { type: 'nv', name: 'Chicken curry', kcal: '210 kcal', macros: 'P 24 · C 6 · F 10 g', amount: stepper, onCheck: () => {} } };
export const AddedByYou: S = { args: { state: 'eaten', tag: 'Yours', name: 'Poha', amountText: '1 plate', kcal: '180 kcal', macros: undefined } };
export const DeleteInsteadOfSkip: S = { args: { amount: stepper, tag: 'Yours', skipLabel: 'Delete', onCheck: () => {}, onSwap: () => {}, onSkip: () => {} } };
export const PickList: S = {
  render: () => (
    <View style={{ gap: 8 }}>
      <FoodCard state="eaten" name="Curd, 1 katori" type="veg" kcal="≈100 kcal" macros="P 6 g · Coach-approved" onPress={() => {}} />
      <FoodCard state="todo" name="Paneer, 50 g" type="veg" kcal="≈140 kcal" macros="P 9 g" onPress={() => {}} onCheck={() => {}} />
    </View>
  ),
};
