import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useTheme } from '@/theme/ThemeProvider';
import { fixed } from '@/design-system/tokens';
import { Tag } from '@/design-system/primitives/Tag';

/** A small filled pill. A fact or a status, never an action. */
const meta = { title: 'Primitives/Tag', component: Tag, args: { label: 'Coach Vikram', bg: fixed.blue, fg: fixed.white } } satisfies Meta<typeof Tag>;
export default meta;
type S = StoryObj<typeof meta>;
function Soft({ warn }: { warn?: boolean }) { const { c } = useTheme(); return warn ? <Tag label="Needs a weigh-in" bg={c.warnSoft} fg={c.warn} /> : <Tag label="On plan" bg={c.goodSoft} fg={c.good} />; }
export const Default: S = {};
export const Good: S = { render: () => <Soft /> };
export const Warn: S = { render: () => <Soft warn /> };
