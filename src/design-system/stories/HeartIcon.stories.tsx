import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { onDark } from '@/design-system/tokens';
import { HeartIcon } from '@/design-system/primitives/HeartIcon';

/** A solid heart. The icon set has only an outline heart, so this one is drawn. */
const meta = { title: 'Primitives/HeartIcon', component: HeartIcon, args: { size: 24, color: onDark.heart } } satisfies Meta<typeof HeartIcon>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
export const Small: S = { args: { size: 14 } };
