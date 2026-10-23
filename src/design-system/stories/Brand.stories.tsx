import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { GymLogoMark, PersonAvatar, PremiumBadge } from '@/design-system/primitives/Brand';

/** The gym logo mark, the gold premium badge, and the avatar of the member or the coach. */
const meta = { title: 'Primitives/Brand', component: PersonAvatar, args: { who: 'me', size: 44 }, argTypes: { who: { control: 'select', options: ['me', 'coach'] } } } satisfies Meta<typeof PersonAvatar>;
export default meta;
type S = StoryObj<typeof meta>;
export const Me: S = {};
export const Coach: S = { args: { who: 'coach' } };
export const WithRing: S = { args: { ring: true } };
export const Square: S = { args: { square: true } };
export const GymLogo: S = { render: () => <GymLogoMark size={56} /> };
export const Premium: S = { render: () => <PremiumBadge size={24} /> };
export const All: S = { render: () => <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><GymLogoMark size={40} /><PersonAvatar who="coach" /><PersonAvatar who="me" /><PremiumBadge /></View> };
