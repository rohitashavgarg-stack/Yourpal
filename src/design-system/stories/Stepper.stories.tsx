import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stepper } from '@/design-system/primitives/Stepper';

/** Minus, value, plus. Three variants: card (onboarding), row (plans), inline (workout set row). */
const meta = { title: 'Primitives/Stepper', component: Stepper } satisfies Meta<typeof Stepper>;
export default meta;
type S = StoryObj<typeof meta>;
export const CardVariant: S = { name: 'card', args: { variant: 'card', value: 72, step: 0.5, unit: 'kg', label: 'Weight', onChange: () => {} } as any };
export const RowVariant: S = { name: 'row', args: { variant: 'row', label: 'Sets', value: '3', onMinus: () => {}, onPlus: () => {}, minusLabel: 'One set less', plusLabel: 'One set more' } as any };
export const InlineVariant: S = { name: 'inline', args: { variant: 'inline', value: 60, unit: 'kg', step: 2.5, min: 0, label: 'Weight', onChange: () => {} } as any };
