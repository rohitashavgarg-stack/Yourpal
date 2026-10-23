import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useTheme } from '@/theme/ThemeProvider';
import { fixed } from '@/design-system/tokens';
import { ProgressBar, ProgressSegments } from '@/design-system/primitives/ProgressBar';

/** A thin track with a fill, in the heights the app uses (3, 4, 6, 8 px). */
const meta = {
  title: 'Primitives/ProgressBar',
  component: ProgressBar,
  args: { height: 6, track: 'surface2', percent: 60, color: fixed.blue },
  argTypes: { height: { control: 'select', options: [3, 4, 6, 8] }, track: { control: 'select', options: ['surface2', 'surface3'] }, percent: { control: { type: 'range', min: 0, max: 100 } }, fillStyle: { control: false } },
} satisfies Meta<typeof ProgressBar>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const Thin3: S = { args: { height: 3 } };
export const Thin4: S = { args: { height: 4 } };
export const Thick8: S = { args: { height: 8 } };
export const OnSoftPanel: S = { args: { track: 'surface3' } };
export const Empty: S = { args: { percent: 0 } };
export const Full: S = { args: { percent: 100 } };
/** With a value, it is announced as a progress bar. */
export const WithValue: S = { args: { accessibilityValue: { now: 3, min: 0, max: 7 }, percent: 43 } };

function Segs() {
  const { c } = useTheme();
  return (
    <View style={{ gap: 14 }}>
      {/* an exercise stepper: done, current, to come */}
      <ProgressSegments height={4} gap={4} segments={[c.accent, c.accent, c.accent, c.surface3, c.surface3, c.surface3].map((color) => ({ color }))} />
      {/* a week of sessions, with spoken labels */}
      <ProgressSegments height={4} gap={3} segments={[{ color: c.ink, label: 'Logged' }, { color: c.ink, label: 'Logged' }, { color: c.surface3, label: 'Not logged' }, { color: c.ink, label: 'Logged' }]} />
      {/* story progress */}
      <ProgressSegments height={3} gap={4} segments={[fixed.blue, fixed.blue, c.ink, c.surface3, c.surface3].map((color) => ({ color }))} />
    </View>
  );
}
/** ProgressSegments: one segment per step, each with its own colour. */
export const Segments: S = { render: () => <Segs /> };
