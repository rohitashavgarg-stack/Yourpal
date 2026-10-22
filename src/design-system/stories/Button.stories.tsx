import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { onDark, fixed, radii } from '@/design-system/tokens';
import { Plus, X, MoreHorizontal } from '@/lib/icons';
import { Button, IconButton } from '@/design-system/primitives/Button';

/** One Button with a kind (colour) and a size (shape). Old names (PillBtn, StepBtn...) are wrappers around it. IconButton is below. */
const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { label: 'Confirm', kind: 'primary', size: 'large', disabled: false, onPress: () => {} },
  argTypes: {
    kind: { control: 'select', options: ['primary', 'accent', 'secondary', 'ghost', 'white', 'outline', 'glass'] },
    size: { control: 'select', options: ['large', 'medium', 'small', 'tight', 'compact'] },
    height: { control: 'number', description: 'compact only' },
    icon: { control: false },
  },
} satisfies Meta<typeof Button>;
export default meta;
type S = StoryObj<typeof meta>;

export const Primary: S = {};
export const Accent: S = { args: { kind: 'accent', label: 'Save' } };
export const Secondary: S = { args: { kind: 'secondary', label: 'Edit log' } };
export const Ghost: S = { args: { kind: 'ghost', label: 'Choose a photo instead' } };
export const Outline: S = { args: { kind: 'outline', label: 'Skip meal' } };
export const White: S = { args: { kind: 'white', size: 'medium', label: 'Start workout' }, decorators: [(St) => <View style={{ backgroundColor: onDark.card, padding: 16, borderRadius: radii.card }}><St /></View>] };
export const Glass: S = { args: { kind: 'glass', size: 'tight', label: 'Skip' }, decorators: [(St) => <View style={{ backgroundColor: onDark.card, padding: 16, borderRadius: radii.card }}><St /></View>] };
export const Medium: S = { args: { size: 'medium' } };
export const Small: S = { args: { size: 'small', kind: 'secondary', label: 'Add set', icon: <Plus size={16} /> } };
export const Tight: S = { args: { size: 'tight', label: 'Log lunch' } };
export const Compact: S = { args: { size: 'compact', kind: 'secondary', label: 'Try again' } };
export const Disabled: S = { args: { disabled: true, label: 'Pick what you ate' } };

/** IconButton: a square or round button with one icon. Size, radius, fill and border are props. */
export const IconButtons: S = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      <IconButton label="Close" onPress={() => {}}><X size={20} /></IconButton>
      <IconButton label="Plan menu" onPress={() => {}} size={52} radius={26} bg="transparent" borderWidth={1} borderColor="rgba(127,127,127,0.3)"><MoreHorizontal size={22} /></IconButton>
      <IconButton label="Add" onPress={() => {}} size={56} radius={28} bg={fixed.blue}><Plus size={22} color={fixed.white} /></IconButton>
      <IconButton label="Disabled" onPress={() => {}} disabled style={{ opacity: 0.35 }}><Plus size={20} /></IconButton>
      <IconButton label="Glass close" onPress={() => {}} glass><X size={20} /></IconButton>
    </View>
  ),
};
