import React from 'react';
import { Platform, StyleProp, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBackdrop } from '@/components/Glass';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, fixed, radii } from '@/design-system/tokens';
import { Pressy } from './Pressy';

/**
 * Buttons. One Button with a kind (colour) and a size (shape), and an IconButton for the icon-only ones.
 * Every look here existed before; the old names (PillBtn, RoundBtn, StepBtn, and the two buttons on the workout card)
 * are now thin wrappers that pick a kind and a size.
 */
export type ButtonKind = 'primary' | 'accent' | 'secondary' | 'ghost' | 'white' | 'outline' | 'glass' | 'dashed' | 'line' | 'quiet' | 'soft' | 'whiteLine' | 'surface' | 'glassAccent' | 'glassPrimary';
export type ButtonSize = 'large' | 'medium' | 'small' | 'tight' | 'compact' | 'chip' | 'xs' | 'fill';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  kind?: ButtonKind;
  /** large 56 px (default), medium 50 px pill, small 44 px, chip 44 px with 16 px sides (a row of choices), fill 44 px with no side padding (the width comes
   *  from the row it sits in, so a long label gets all of it), tight 40 px pill, compact 36 px pill (set `height` to change it), xs 32 px pill. Sizes under 44 px keep a 44 px tap area. */
  size?: ButtonSize;
  /** Old way to ask for size="small". */
  small?: boolean;
  /** Only for size="compact": the height, 36 by default. The tap area stays 44 px. */
  height?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
  /** An icon after the label, for example the X on a removable "About: ..." pill. The side after it is 4 px tighter. */
  iconAfter?: React.ReactNode;
  /** Label weight. Each kind has its own (medium for dashed, line, quiet and glass; semibold for the rest). */
  weight?: 'medium' | 'semibold';
  /** The label in the quiet text colour, for an action that is not the main one (Skip meal). */
  muted?: boolean;
  /** Press scale. Default 0.97. */
  scaleTo?: number;
  /** Layout only: flex, margins, position. Not for colours or sizes (add a kind or a size instead). */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

type SizeSpec = { h: number; r: number; px: number; fs: number; lh: number; gap: number };
const SIZE: Record<ButtonSize, SizeSpec> = {
  large: { h: 56, r: radii.xl, px: 20, fs: 16, lh: 21, gap: 8 },
  medium: { h: 50, r: 25, px: 20, fs: fontSizes.base, lh: 21, gap: 8 },
  small: { h: 44, r: radii.lg, px: 20, fs: fontSizes.md, lh: 18, gap: 8 },
  tight: { h: 40, r: 20, px: 16, fs: fontSizes.md, lh: 20, gap: 8 },
  compact: { h: 36, r: 18, px: 14, fs: fontSizes.sm, lh: 17, gap: 5 },
  chip: { h: 44, r: radii.lg, px: 16, fs: fontSizes.md, lh: 18, gap: 6 },
  fill: { h: 44, r: radii.lg, px: 0, fs: fontSizes.md, lh: 18, gap: 6 },
  xs: { h: 32, r: 16, px: 12, fs: fontSizes.xs, lh: 17, gap: 4 },
};

// Fill, line and label colour of each kind. dashed, line and quiet are transparent with a 1 px line; whiteLine sits on the white clip stage.
type KindSpec = { bg: string; fg: string; line?: string; dashed?: boolean; medium?: boolean; glass?: string };
function kindSpec(kind: ButtonKind, c: ReturnType<typeof useTheme>['c']): KindSpec {
  switch (kind) {
    case 'primary': return { bg: c.ink, fg: c.bg };
    case 'accent': return { bg: c.accent, fg: c.accentInk };
    case 'secondary': return { bg: c.surface2, fg: c.ink };
    case 'ghost': return { bg: 'transparent', fg: c.accentText };
    case 'white': return { bg: fixed.white, fg: fixed.dark };
    case 'outline': return { bg: 'transparent', fg: c.ink, line: c.line };
    case 'glass': return { bg: 'rgba(255,255,255,0.12)', fg: fixed.white, medium: true };
    case 'dashed': return { bg: 'transparent', fg: c.ink, line: c.chipLine, dashed: true, medium: true };
    case 'line': return { bg: 'transparent', fg: c.ink, line: c.chipLine, medium: true };
    case 'quiet': return { bg: 'transparent', fg: c.ink, line: c.line, medium: true };
    case 'soft': return { bg: c.accentSoft, fg: c.accentText };
    case 'whiteLine': return { bg: fixed.white, fg: fixed.dark, line: fixed.lineOnWhite };
    case 'surface': return { bg: c.surface, fg: c.ink };
    // blue glass: real iOS glass tinted with the accent (blurred glass with a blue tint elsewhere). For the one main action that floats over scrolling content.
    // the same glass in the primary colours (white in dark mode, near-black in light), for a floating primary button that is not blue (Save meal)
    case 'glassPrimary': return { bg: 'transparent', fg: c.bg, glass: `${c.ink}EB` };
    case 'glassAccent': return { bg: 'transparent', fg: c.accentInk, glass: `${c.accent}EB` };
  }
}

export function Button({ kind = 'primary', size, small, height, label, onPress, disabled, icon, iconAfter, weight, muted, scaleTo, style, accessibilityLabel }: ButtonProps) {
  const { c } = useTheme();
  const sz = size ?? (small ? 'small' : 'large');
  const s = sz === 'compact' && height ? { ...SIZE.compact, h: height, r: height / 2 } : SIZE[sz];
  const k = kindSpec(kind, c);
  const fg = muted ? c.muted : k.fg;
  const medium = weight ? weight === 'medium' : !!k.medium;
  // shorter than 44 (tight 40, compact 36 or less): the tap area still reaches 44 px
  const slop = s.h < 44 ? { top: (44 - s.h) / 2, bottom: (44 - s.h) / 2 } : undefined;
  return (
    <Pressy
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={slop}
      scaleTo={scaleTo}
      style={[{
        height: s.h, borderRadius: s.r, backgroundColor: k.bg, ...(k.glass ? { overflow: 'hidden' as const } : null), flexDirection: 'row', alignItems: 'center', ...(sz === 'compact' ? null : { justifyContent: 'center' }), gap: s.gap,
        paddingHorizontal: s.px, ...(iconAfter ? { paddingRight: s.px - 4 } : null), opacity: disabled ? 0.4 : 1,
        borderWidth: k.line ? 1 : 0, borderColor: k.line ?? c.line, ...(k.dashed ? { borderStyle: 'dashed' as const } : null),
      }, style]}
    >
      {k.glass ? <GlassBackdrop radius={s.r} tint={k.glass} /> : null}
      {icon}
      <Text style={{ fontFamily: medium ? font.medium : font.semibold, fontSize: s.fs, lineHeight: s.lh, color: fg }}>{label}</Text>
      {iconAfter}
    </Pressy>
  );
}

export type IconButtonProps = {
  /** Spoken label; there is no visible text. */
  label: string;
  onPress: () => void;
  children: React.ReactNode;
  /** Fill colour. Default is the soft surface. */
  bg?: string;
  /** Frosted glass instead of a fill, for buttons that sit on a photo or a map. */
  glass?: boolean;
  /** Press scale. Default 0.97; the stepper buttons use 0.9. */
  scaleTo?: number;
  /** Height in px, and the width unless `width` is given. Default 44. */
  size?: number;
  /** Width when the button is not square (a 44 x 40 tab, a 74 px pill with two icons side by side). Children are laid out in a row. */
  width?: number;
  /** Corner radius in px. Default `radii.lg`; use half the size for a circle. */
  radius?: number;
  /** An outline: line colour and width. */
  borderColor?: string;
  borderWidth?: number;
  /** Not pressable, and announced as disabled. Dim it with `style` (opacity). */
  disabled?: boolean;
  /** Extra tap area around a small button, so it still reaches 44 px. */
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
  style?: StyleProp<ViewStyle>;
};

/** A rounded square (44 px by default) with one icon or sign in it: close, back, minus, plus, play. `width` makes it a pill. */
export function IconButton({ label, onPress, children, bg, style, glass, scaleTo, size = 44, width, radius = radii.lg, borderColor, borderWidth, disabled, hitSlop }: IconButtonProps) {
  const { c, isDark } = useTheme();
  // On web and Android an icon button gets a thin border and a soft grey gradient that echo the iOS glass (iPhone draws the real glass). Coloured buttons are left alone.
  const mimic = Platform.OS !== 'ios' && (glass || !bg || bg === c.surface || bg === c.surface2 || bg === c.surface3);
  // Glass buttons get a soft shadow so they still read on a plain page.
  const rim = glass ? { shadowColor: fixed.shadow, shadowOpacity: isDark ? 0.35 : 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 } : null;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} onPress={onPress} scaleTo={scaleTo} disabled={disabled} hitSlop={hitSlop}
      style={[{ width: width ?? size, height: size, borderRadius: radius, ...(width ? { flexDirection: 'row' as const } : null), backgroundColor: glass ? 'transparent' : bg ?? c.surface2, alignItems: 'center', justifyContent: 'center', ...(borderWidth ? { borderWidth, borderColor } : mimic ? { borderWidth: 1, borderColor: c.glassEdge } : null) }, rim, style]}>
      {mimic ? <LinearGradient pointerEvents="none" colors={[c.glassFrom, c.glassTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius }} /> : null}
      {glass ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radii.lg, overflow: 'hidden' }}>
          <GlassBackdrop radius={22} tint={Platform.OS === 'web' ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.82)') : undefined} />
        </View>
      ) : null}
      {glass ? <View style={{ zIndex: 2 }}>{children}</View> : children}
    </Pressy>
  );
}
