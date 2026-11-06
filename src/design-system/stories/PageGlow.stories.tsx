import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { PageGlow } from '@/design-system/primitives/PageGlow';
import { Txt } from '@/components/ui';
import { radii } from '@/design-system/tokens';

/** A very faint blue light in the top left corner of the screen, mounted once over the whole app. */
const meta = { title: 'Primitives/PageGlow', component: PageGlow } satisfies Meta<typeof PageGlow>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {
  render: () => (
    <View style={{ width: 360, height: 520, overflow: 'hidden', borderRadius: radii.xl }}>
      <PageGlow />
      <View style={{ padding: 24 }}><Txt v="title">Gym</Txt></View>
    </View>
  ),
};
