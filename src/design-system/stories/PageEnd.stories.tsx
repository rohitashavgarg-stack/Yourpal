import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { PageEnd } from '@/design-system/patterns/PageEnd';

/** The end of a long page: an illustration, a big quiet line and the YourPal mark. Nothing to tap. */
const meta = {
  title: 'Patterns/PageEnd',
  component: PageEnd,
  args: { line: 'Your pace.\nYour pal.' },
  argTypes: { line: { control: 'text' } },
} satisfies Meta<typeof PageEnd>;
export default meta;
type S = StoryObj<typeof meta>;
export const Today: S = {};
