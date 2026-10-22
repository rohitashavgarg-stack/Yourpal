import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Banner } from '@/design-system/patterns/Banner';

/** The account banner (membership). One at a time. Strip on Today, card on the Gym tab. Never a Pay or Resume button. */
const meta = {
  title: 'Patterns/Banner',
  component: Banner,
  args: { variant: 'strip', icon: 'clock', tone: 'warn', title: 'Membership ends in 12 days', line: 'Renew at the front desk to keep logging.', onPress: () => {}, onDismiss: () => {} },
  argTypes: { variant: { control: 'select', options: ['strip', 'card'] }, icon: { control: 'select', options: ['clock', 'pause', 'ok'] }, tone: { control: 'select', options: ['warn', 'plain'] } },
} satisfies Meta<typeof Banner>;
export default meta;
type S = StoryObj<typeof meta>;
export const StripExpiring: S = {};
export const StripOnce: S = { args: { once: true } };
export const StripPaused: S = { args: { icon: 'pause', tone: 'plain', title: 'Membership on hold', line: 'Logging and other features are paused until it is back.' } };
export const CardExpiring: S = { args: { variant: 'card', act: 'Renew at Wulf Fitness reception.' } };
export const CardActive: S = { args: { variant: 'card', icon: 'ok', tone: 'plain', title: 'Gold, 12 months', line: 'Expires on 14 Oct 2027.', act: 'Renew early at Wulf Fitness reception.' } };
