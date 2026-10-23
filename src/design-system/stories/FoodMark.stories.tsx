import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { FoodMark } from '@/design-system/primitives/FoodMark';

/** The veg, egg or non-veg mark: a square outline with a dot (veg, egg) or a triangle (non-veg). */
const meta = { title: 'Primitives/FoodMark', component: FoodMark, args: { type: 'veg', size: 14 }, argTypes: { type: { control: 'select', options: ['veg', 'egg', 'nv'] } } } satisfies Meta<typeof FoodMark>;
export default meta;
type S = StoryObj<typeof meta>;
export const Veg: S = {};
export const Egg: S = { args: { type: 'egg' } };
export const NonVeg: S = { args: { type: 'nv' } };
export const Large: S = { args: { size: 28 } };
