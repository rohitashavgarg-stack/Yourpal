import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Snackbar } from '@/design-system/primitives/Snackbar';

/** The toast. In the app: useOverlay().toast(msg, { undo }). Only one at a time. */
const meta = {
  title: 'Primitives/Snackbar',
  component: Snackbar,
  args: { msg: 'Lunch saved', raised: false, lift: 0, onGone: () => {} },
  decorators: [(St) => <View style={{ height: 300, position: 'relative' }}><St /></View>],
} satisfies Meta<typeof Snackbar>;
export default meta;
type S = StoryObj<typeof meta>;
export const Plain: S = {};
export const WithUndo: S = { args: { msg: 'Lunch skipped', undo: () => {} } };
export const Raised: S = { args: { raised: true, msg: 'Shown at the top while a sheet is open' } };
