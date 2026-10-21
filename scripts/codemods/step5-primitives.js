#!/usr/bin/env node
/* Phase 3 part 2b. Moves Pressy, Chip, Pill, Field/NoteField (Input), Sheet and Toast (Snackbar) out of components/ui.tsx and
 * components/Overlay.tsx into src/design-system/primitives/, verbatim, and leaves re-exports behind. Button is written by hand. */
const fs = require('fs');
const rd = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const wr = (p, s) => fs.writeFileSync(p, s);
const ui = rd('src/components/ui.tsx'); const ov = rd('src/components/Overlay.tsx');
const between = (s, a, b) => { const i = s.indexOf(a); if (i < 0) throw new Error('missing ' + a); const j = b ? s.indexOf(b, i) : s.length; if (j < 0) throw new Error('missing ' + b); return s.slice(i, j); };
const P = 'src/design-system/primitives/';
const BT = '`';

// ---- Pressy
const pressy = between(ui, 'const APressable', '// ---------- Buttons');
wr(P + 'Pressy.tsx', [
  "import React from 'react';",
  "import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';",
  "import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';",
  "import { spring } from '@/design-system/tokens';",
  "import { haptic } from '@/lib/haptics';",
  '',
  '/** A pressable with the iOS press scale and a tap haptic. Every tappable thing in the app is one of these. */',
  pressy.trimEnd(), ''].join('\n'));

// ---- Chip
const chip = between(ui, 'export function Chip(', '// ---------- Selectable pill');
const chipSig = "export function Chip({ label, icon, tone = 'default', onDark, style }: { label: string; icon?: React.ReactNode; tone?: 'default' | 'good' | 'warn' | 'live'; onDark?: boolean; style?: StyleProp<ViewStyle> })";
if (!chip.includes(chipSig)) throw new Error('chip signature');
wr(P + 'Chip.tsx', [
  "import React from 'react';",
  "import { StyleProp, Text, View, ViewStyle } from 'react-native';",
  "import { useTheme } from '@/theme/ThemeProvider';",
  "import { font, fontSizes, fixed } from '@/design-system/tokens';",
  '',
  "export type ChipTone = 'default' | 'good' | 'warn' | 'live';",
  'export type ChipProps = { label: string; icon?: React.ReactNode; tone?: ChipTone; onDark?: boolean; style?: StyleProp<ViewStyle> };',
  '',
  '/** Outline chip: information, never an action. */',
  chip.trimEnd().replace(chipSig, "export function Chip({ label, icon, tone = 'default', onDark, style }: ChipProps)"), ''].join('\n'));

// ---- Pill
const pill = between(ui, 'export function Pill(', '// ---------- Segmented control');
const pillSig = 'export function Pill({ label, on, onPress, style }: { label: string; on: boolean; onPress: () => void; style?: StyleProp<ViewStyle> })';
if (!pill.includes(pillSig)) throw new Error('pill signature');
wr(P + 'Pill.tsx', [
  "import React, { useEffect } from 'react';",
  "import { StyleProp, Text, ViewStyle } from 'react-native';",
  "import { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';",
  "import { useTheme } from '@/theme/ThemeProvider';",
  "import { radii, fontSizes, font } from '@/design-system/tokens';",
  "import { Pressy } from './Pressy';",
  '',
  'export type PillProps = { label: string; on: boolean; onPress: () => void; style?: StyleProp<ViewStyle> };',
  '',
  '/** A selectable pill for filters and options. ' + BT + 'on' + BT + ' fills it with ink over 220 ms. */',
  pill.trimEnd().replace(pillSig, 'export function Pill({ label, on, onPress, style }: PillProps)'), ''].join('\n'));

// ---- Input
const input = between(ui, 'export const Field', 'export function Row(');
wr(P + 'Input.tsx', [
  "import React from 'react';",
  "import { Text, TextInput, TextInputProps, View } from 'react-native';",
  "import { useTheme } from '@/theme/ThemeProvider';",
  "import { font, fontSizes, radii } from '@/design-system/tokens';",
  '',
  '/**',
  ' * Text inputs. Field is the one-line field (56 px, optional prefix), NoteField the multi-line note with a character count.',
  ' * Both draw a 1 px line that becomes a 1.5 px accent line on focus and a 1.5 px amber line when ' + BT + 'error' + BT + ' is set.',
  ' */',
  input.trimEnd(), ''].join('\n'));

// ---- Sheet and Snackbar
const kb = between(ov, '// How much of the screen the on-screen keyboard', 'function Sheet(');
const sheet = between(ov, 'function Sheet(', 'function Toast(');
const toast = between(ov, 'function Toast(', null);
const sheetSig = 'function Sheet({ children, label, glow, onClosed, registerClose }: { children: React.ReactNode; label?: string; glow?: string; onClosed: () => void; registerClose: (fn: (after?: () => void) => void) => void })';
const toastSig = 'function Toast({ msg, undo, onGone, raised, lift }: { msg: string; undo?: () => void; onGone: () => void; raised: boolean; lift: number })';
if (!sheet.includes(sheetSig) || !toast.includes(toastSig)) throw new Error('sheet/toast signature');
wr(P + 'Sheet.tsx', [
  "import React, { useCallback, useEffect, useRef, useState } from 'react';",
  "import { Dimensions, Keyboard, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';",
  "import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';",
  "import { Gesture, GestureDetector } from 'react-native-gesture-handler';",
  "import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';",
  "import { scheduleOnRN } from 'react-native-worklets';",
  "import { useSafeAreaInsets } from 'react-native-safe-area-context';",
  "import { useTheme } from '@/theme/ThemeProvider';",
  "import { radii, spring } from '@/design-system/tokens';",
  '',
  'export type SheetProps = {',
  '  children: React.ReactNode;',
  '  /** Spoken label of the sheet. */',
  '  label?: string;',
  '  /** A colour that bleeds in from the top right corner as a soft radial glow. */',
  '  glow?: string;',
  '  onClosed: () => void;',
  '  /** The sheet hands its animated close function to this callback so the host can close it. */',
  '  registerClose: (fn: (after?: () => void) => void) => void;',
  '};',
  '',
  kb.trimEnd(), '',
  '/** The bottom sheet: springs in, drags down to close, lifts above the keyboard. Open it with ' + BT + 'useOverlay().openSheet' + BT + '. */',
  sheet.trimEnd().replace(sheetSig, 'export function Sheet({ children, label, glow, onClosed, registerClose }: SheetProps)'), ''].join('\n'));
wr(P + 'Snackbar.tsx', [
  "import React, { useEffect } from 'react';",
  "import { Pressable, Text } from 'react-native';",
  "import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';",
  "import { scheduleOnRN } from 'react-native-worklets';",
  "import { useTheme } from '@/theme/ThemeProvider';",
  "import { haptic } from '@/lib/haptics';",
  "import { font, fontSizes, radii, spring } from '@/design-system/tokens';",
  '',
  'export type SnackbarProps = {',
  '  msg: string;',
  '  /** Shows an Undo button that runs this and dismisses the snackbar. */',
  '  undo?: () => void;',
  '  onGone: () => void;',
  '  /** true while a sheet is open: the snackbar moves to the top so it does not sit behind the sheet. */',
  '  raised: boolean;',
  '  /** Bottom offset in px while screen chrome (check-in bar, rest panel) is showing. 0 means the default 104. */',
  '  lift: number;',
  '};',
  '',
  '/** The toast at the foot of the screen. It shows for 3.6 s. Show one with ' + BT + 'useOverlay().toast(msg, { undo })' + BT + '. */',
  toast.trimEnd().replace(toastSig, 'export function Snackbar({ msg, undo, onGone, raised, lift }: SnackbarProps)'), ''].join('\n'));

// ---- strip the moved code from the old files
let u = ui.replace(chip, '').replace(pill, '').replace(input, '').replace(pressy, '');
u = u.replace('// ---------- Buttons', [
  '// Pressy, Chip, Pill and the text inputs moved to src/design-system/primitives/. Re-exported so these import paths keep working.',
  "export { Pressy } from '@/design-system/primitives/Pressy';",
  "export { Chip } from '@/design-system/primitives/Chip';",
  "export { Pill } from '@/design-system/primitives/Pill';",
  "export { Field, NoteField } from '@/design-system/primitives/Input';",
  '',
  '// ---------- Buttons'].join('\n'));
wr('src/components/ui.tsx', u);
let o = ov.replace(kb, '').replace(sheet, '').replace(toast, '').replace(/\n+$/, '\n');
o = o.replace('<Toast key=', '<Snackbar key=');
o = o.replace("import { radii, fontSizes, fixed } from '@/design-system/tokens';", "import { Sheet } from '@/design-system/primitives/Sheet';\nimport { Snackbar } from '@/design-system/primitives/Snackbar';");
wr('src/components/Overlay.tsx', o);
console.log('ok');
