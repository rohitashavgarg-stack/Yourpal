import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Field, NoteField } from '@/design-system/primitives/Input';

/** Text input (Field) and the multi-line NoteField. */
const meta = { title: 'Primitives/Input', component: Field, args: { placeholder: 'Search poha, dal, curd…', accessibilityLabel: 'Search' } } satisfies Meta<typeof Field>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
export const WithPrefix: S = { args: { prefix: '+91', placeholder: 'Phone number', keyboardType: 'phone-pad' } };
export const Error: S = { args: { error: true, value: '12', placeholder: 'Code' } };
function NoteDemo({ error }: { error?: boolean }) {
  const [v, setV] = React.useState('');
  return <NoteField value={v} onChangeText={setV} placeholder="Anything for your coach?" accessibilityLabel="Note" error={error} />;
}
export const Note: S = { render: () => <NoteDemo /> };
export const NoteError: S = { render: () => <NoteDemo error /> };
