import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Row } from '@/design-system/primitives/Row';
import { Txt } from '@/design-system/primitives/Txt';
import { fixed } from '@/design-system/tokens';
import { StatusDot } from '@/design-system/primitives/StatusDot';

/** A horizontal row, children centred vertically. Add gap and justify with style. */
const meta = { title: 'Primitives/Row', component: Row, args: { style: { gap: 8 }, children: null } } satisfies Meta<typeof Row>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = { render: (a) => <Row {...a}><StatusDot color={fixed.blue} size={8} /><Txt>Leg day</Txt></Row> };
export const SpaceBetween: S = { render: () => <Row style={{ justifyContent: 'space-between' }}><Txt>Protein</Txt><Txt muted>86 g</Txt></Row> };
