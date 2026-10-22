import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { onDark, fixed, light } from '@/design-system/tokens';
import { StatusDot } from '@/design-system/primitives/StatusDot';

/** A small solid dot: a status, a legend key, an unread mark. */
const meta = { title: 'Primitives/StatusDot', component: StatusDot, args: { size: 10, color: light.danger } } satisfies Meta<typeof StatusDot>;
export default meta;
type S = StoryObj<typeof meta>;
export const Unread: S = {};
export const Good: S = { args: { color: light.good, size: 8 } };
export const Warn: S = { args: { color: onDark.amber, size: 8 } };
export const Legend: S = { args: { color: fixed.blue, size: 12 } };
