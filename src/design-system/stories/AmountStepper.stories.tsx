import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AmountStepper } from '@/design-system/primitives/AmountStepper';

/** The amount on a food: an outlined pill with a small round minus and plus. */
const meta = {
  title: 'Primitives/AmountStepper',
  component: AmountStepper,
  args: { text: '1 katori', unit: 'katori', onLess: () => {}, onMore: () => {}, lessDisabled: false, moreDisabled: false },
} satisfies Meta<typeof AmountStepper>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
export const AtMinimum: S = { args: { lessDisabled: true, text: '½ katori' } };
export const AtMaximum: S = { args: { moreDisabled: true, text: '4 katori' } };
export const WithHold: S = { args: { onLongPress: () => {}, accessibilityLabel: 'Amount 1 katori. Hold for units and reset' } };
function Live() {
  const [n, setN] = React.useState(2);
  return <AmountStepper text={n + ' pcs'} unit="pcs" onLess={() => setN((v) => v - 1)} onMore={() => setN((v) => v + 1)} lessDisabled={n <= 1} moreDisabled={n >= 8} />;
}
export const Interactive: S = { render: () => <Live /> };
