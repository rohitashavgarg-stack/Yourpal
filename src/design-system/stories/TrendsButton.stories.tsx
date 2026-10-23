import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { TrendsButton } from '@/design-system/primitives/TrendsButton';

/** The glass pill with a bar-chart icon and "Trends". Opens the trend page of a tracker. */
const meta = { title: 'Primitives/TrendsButton', component: TrendsButton, args: { label: 'Water trends', onPress: () => {} } } satisfies Meta<typeof TrendsButton>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
