import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { radii } from '@/design-system/tokens';
import { Txt } from '@/components/ui';
import { Pressy } from '@/design-system/primitives/Pressy';

/** The pressable everything is built on: iOS press scale and a light haptic. */
const meta = { title: 'Primitives/Pressy', component: Pressy, args: { scaleTo: 0.97, haptics: true, onPress: () => {} } } satisfies Meta<typeof Pressy>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = { render: (a) => <Pressy {...a} accessibilityRole="button" accessibilityLabel="Press me" style={{ padding: 20, borderRadius: radii.block, backgroundColor: 'rgba(127,127,127,0.15)' }}><Txt>Press and hold</Txt></Pressy> };
export const StrongScale: S = { ...Default, args: { scaleTo: 0.9 } };
