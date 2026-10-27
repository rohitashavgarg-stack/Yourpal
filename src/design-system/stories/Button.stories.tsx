import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { onDark, fixed, radii } from '@/design-system/tokens';
import { ChevronUp, GlassWater, CirclePlus, Plus, X, MoreHorizontal } from '@/lib/icons';
import { Button, IconButton } from '@/design-system/primitives/Button';

/** One Button with a kind (colour) and a size (shape). Old names (PillBtn, StepBtn...) are wrappers around it. IconButton is below. */
const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { label: 'Confirm', kind: 'primary', size: 'large', disabled: false, onPress: () => {} },
  argTypes: {
    kind: { control: 'select', options: ['primary', 'accent', 'secondary', 'ghost', 'white', 'outline', 'glass', 'dashed', 'line', 'quiet', 'soft', 'whiteLine', 'surface', 'glassAccent', 'glassPrimary'] },
    size: { control: 'select', options: ['large', 'medium', 'small', 'chip', 'fill', 'tight', 'compact', 'xs'] },
    weight: { control: 'select', options: [undefined, 'medium', 'semibold'] },
    muted: { control: 'boolean' },
    scaleTo: { control: 'number' },
    iconAfter: { control: false },
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

// ---- kinds and sizes added for the near-matches (Phase B) ----
/** Dashed line: add something to a list ("Ate something else?", "+ Add exercise", "Add set"). */
export const Dashed: S = { args: { kind: 'dashed', size: 'small', label: 'Ate something else?', icon: <Plus size={16} /> } };
/** Size fill: no side padding, for buttons that share a row (flex) so a long label gets all the width. */
export const DashedFillInRow: S = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Button kind="dashed" size="fill" label="Ate something else?" icon={<Plus size={16} />} onPress={() => {}} style={{ flex: 1.5 }} />
      <Button kind="quiet" size="fill" muted label="Skip meal" onPress={() => {}} style={{ flex: 1 }} />
    </View>
  ),
};
export const DashedMedium: S = { args: { kind: 'dashed', size: 'medium', label: 'Add set', icon: <Plus size={17} /> } };
/** Chip line: one of a row of choices (Ask your coach about...). */
export const Line: S = { args: { kind: 'line', size: 'chip', label: 'Check my form' } };
/** Quiet line, muted label: the action that is not the main one. */
export const QuietMuted: S = { args: { kind: 'quiet', size: 'small', label: 'Skip meal', muted: true } };
export const QuietInk: S = { args: { kind: 'quiet', size: 'small', label: 'Undo skip' } };
/** Accent-soft pill: a small way back ("This week"). */
export const SoftXs: S = { args: { kind: 'soft', size: 'xs', label: 'This week' } };
/** Removable context pill: label then an X. */
export const SoftWithIconAfter: S = { args: { kind: 'soft', size: 'xs', weight: 'medium', label: 'About: Squat depth', iconAfter: <X size={14} color={fixed.blue} /> } };
/** On the white clip stage of the workout. */
export const WhiteLine: S = { args: { kind: 'whiteLine', size: 'small', label: 'Finish' } };
export const WhiteLineXs: S = { args: { kind: 'whiteLine', size: 'xs', weight: 'medium', label: 'Hide', icon: <ChevronUp size={15} color={fixed.dark} /> } };
/** White surface fill on the page background (Profile "Edit"). */
export const Surface: S = { args: { kind: 'surface', size: 'small', label: 'Edit' } };
export const GlassPrimary: S = { args: { kind: 'glassPrimary', label: 'Save meal' }, decorators: [(St) => <View style={{ backgroundColor: onDark.card, padding: 16, borderRadius: radii.card }}><St /></View>] };
export const GlassAccent: S = { args: { kind: 'glassAccent', label: 'Start workout' }, decorators: [(St) => <View style={{ backgroundColor: onDark.card, padding: 16, borderRadius: radii.card }}><St /></View>] };
export const Chip: S = { args: { kind: 'line', size: 'chip', label: 'Pain or injury' } };
/** 32 px pill; the tap area still reaches 44 px. */
export const Xs: S = { args: { kind: 'soft', size: 'xs', label: 'This week' } };
export const AllKinds: S = {
  render: () => (
    <View style={{ gap: 10 }}>
      {(['primary', 'accent', 'secondary', 'ghost', 'outline', 'dashed', 'line', 'quiet', 'soft', 'surface', 'whiteLine'] as const).map((k) => <Button key={k} kind={k} size="small" label={k} onPress={() => {}} />)}
    </View>
  ),
};

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
/** IconButton with a width: not square, children in a row (the water pill, the emoji tabs). */
export const IconButtonWide: S = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: onDark.card, padding: 16, borderRadius: radii.card }}>
      <IconButton label="Log water" onPress={() => {}} size={44} width={74} radius={radii.lg} bg="rgba(255,255,255,0.16)" style={{ gap: 6 }}><GlassWater size={18} color={fixed.white} /><CirclePlus size={18} color={fixed.white} /></IconButton>
      <IconButton label="Smileys emoji" onPress={() => {}} size={40} width={44} radius={radii.sm} bg="transparent"><X size={18} color={fixed.white} /></IconButton>
    </View>
  ),
};
/** A small IconButton that keeps a 44 px tap area with hitSlop. */
export const IconButtonHitSlop: S = { render: () => <IconButton label="Remove photo" onPress={() => {}} size={24} radius={radii.sm} hitSlop={10}><X size={14} /></IconButton> };
