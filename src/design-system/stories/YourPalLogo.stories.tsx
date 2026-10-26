import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fixed } from '@/design-system/tokens';
import { YourPalLogo } from '@/design-system/primitives/YourPalLogo';

/** The logo. Brand blue on light screens, white on dark ones. */
const meta = { title: 'Primitives/YourPalLogo', component: YourPalLogo, args: { height: 40 } } satisfies Meta<typeof YourPalLogo>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
export const White: S = { args: { color: fixed.white }, decorators: [(St) => <View style={{ backgroundColor: fixed.dark, padding: 16 }}><St /></View>] };
