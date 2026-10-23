import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { fontSizes } from '@/design-system/tokens';
import { Callout, calloutInk } from '@/design-system/primitives/Callout';

/** A soft block inside a page or sheet: a notice (warn), a tip (accent) or a quiet panel (plain). Draws only the fill, corners and padding. */
function Body(a: React.ComponentProps<typeof Callout>) {
  const { c } = useTheme();
  const ink = calloutInk(a.tone ?? 'plain', c);
  return (
    <Callout {...a}>
      <Txt style={{ fontSize: fontSizes.md, color: ink }}>Coach Vikram is away until Mon 10:00 am, so replies will be slower.</Txt>
    </Callout>
  );
}
const meta = {
  title: 'Primitives/Callout',
  component: Callout,
  args: { tone: 'plain', size: 'md' },
  argTypes: { tone: { control: 'select', options: ['warn', 'accent', 'plain'] }, size: { control: 'select', options: ['compact', 'sm', 'md', 'lg', 'xl'] }, gap: { control: 'number' }, children: { control: false } },
  render: (a) => <Body {...a} />,
} satisfies Meta<typeof Callout>;
export default meta;
type S = StoryObj<typeof meta>;

export const Plain: S = {};
export const Warn: S = { args: { tone: 'warn' } };
export const Accent: S = { args: { tone: 'accent' } };
export const Compact: S = { args: { tone: 'warn', size: 'compact' } };
export const Small: S = { args: { size: 'sm' } };
export const Large: S = { args: { tone: 'warn', size: 'lg' } };
export const ExtraLarge: S = { args: { tone: 'warn', size: 'xl' } };
export const AllSizes: S = { render: () => <View style={{ gap: 10 }}>{(['compact', 'sm', 'md', 'lg', 'xl'] as const).map((z) => <Body key={z} size={z} tone="accent" />)}</View> };
export const AllTones: S = { render: () => <View style={{ gap: 10 }}>{(['warn', 'accent', 'plain'] as const).map((t) => <Body key={t} tone={t} />)}</View> };
/** A panel holding a stat instead of a sentence. */
export const StatTile: S = { render: () => <Callout size="sm" style={{ width: 160 }}><Txt v="label">Sets</Txt><Txt v="title">12</Txt></Callout> };
