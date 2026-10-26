import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { HeartIcon } from '@/design-system/primitives/HeartIcon';
import { onDark } from '@/design-system/tokens';
import { Beat } from '@/design-system/primitives/Beat';

/** Wraps an icon and pulses it like a heartbeat. For a value from the watch that is live. */
const meta = { title: 'Primitives/Beat', component: Beat, args: { children: <HeartIcon size={20} color={onDark.heart} /> } } satisfies Meta<typeof Beat>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
