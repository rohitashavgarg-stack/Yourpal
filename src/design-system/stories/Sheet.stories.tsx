import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fixed, radii } from '@/design-system/tokens';
import { Txt, Button } from '@/components/ui';
import { Sheet, SheetFooter } from '@/design-system/primitives/Sheet';

/** The bottom sheet. In the app: useOverlay().openSheet(<Content />, { label }). SheetFooter pins the main button under the scroll. */
const meta = { title: 'Primitives/Sheet', component: Sheet, args: { label: 'Sheet', children: null, onClosed: () => {}, registerClose: () => {} }, argTypes: { children: { control: false } } } satisfies Meta<typeof Sheet>;
export default meta;
type S = StoryObj<typeof meta>;
const Frame = ({ children }: { children: React.ReactNode }) => <View style={{ height: 620, position: 'relative', overflow: 'hidden', borderRadius: radii.card }}>{children}</View>;
export const Default: S = { render: () => <Frame><Sheet label="Add steps" onClosed={() => {}} registerClose={() => {}}><Txt v="headline">Add steps</Txt><Txt muted>Drag the handle down to close.</Txt><Button label="Save" onPress={() => {}} /></Sheet></Frame> };
export const WithGlow: S = { render: () => <Frame><Sheet label="Coach" glow={fixed.blue} onClosed={() => {}} registerClose={() => {}}><Txt v="headline">From Coach Vikram</Txt><Txt muted>A soft glow from the top right corner.</Txt></Sheet></Frame> };
export const WithFooter: S = {
  render: () => (
    <Frame>
      <Sheet label="Library" onClosed={() => {}} registerClose={() => {}}>
        <Txt v="headline">Add to lunch</Txt>
        {Array.from({ length: 14 }, (_, i) => <View key={i} style={{ minHeight: 54, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(127,127,127,0.2)' }}><Txt>Food {i + 1}</Txt></View>)}
        <SheetFooter><Button label="Add 250 kcal" onPress={() => {}} /></SheetFooter>
      </Sheet>
    </Frame>
  ),
};
