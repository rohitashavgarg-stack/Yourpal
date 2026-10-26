import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Chevron } from '@/design-system/primitives/Chevron';

/** A down chevron that turns over when a row opens. */
const meta = { title: 'Primitives/Chevron', component: Chevron, args: { open: false, motion: 'timing', size: 18 }, argTypes: { motion: { control: 'select', options: ['timing', 'spring'] } } } satisfies Meta<typeof Chevron>;
export default meta;
type S = StoryObj<typeof meta>;
export const Closed: S = {};
export const Open: S = { args: { open: true } };
export const Spring: S = { args: { motion: 'spring', open: true } };
