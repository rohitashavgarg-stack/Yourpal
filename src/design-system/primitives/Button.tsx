import React from 'react';
import { Platform, StyleProp, Text, View, ViewStyle } from 'react-native';
import { GlassBackdrop } from '@/components/Glass';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, fixed, radii } from '@/design-system/tokens';
import { Pressy } from './Pressy';

/**
 * Buttons. One Button with a kind (colour) and a size (shape), and an IconButton for the round 44 px ones.
 * Every look here existed before; the old names (PillBtn, RoundBtn, StepBtn, and the two buttons on the workout card)
 * are now thin wrappers that pick a kind and a size.
 */
export type ButtonKind = 'primary' | 'accent' | 'secondary' | 'ghost' | 'white' | 'outline' | 'glass';
export type ButtonSize = 'large' | 'medium' | 'small' | 'tight' | 'compact';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  kind?: ButtonKind;
  /** large 56 px (default), medium 50 px pill, small 44 px, tight 40 px pill, compact 36 px pill (set `height` to change it). */
  size?: ButtonSize;
  /** Old way to ask for size="small". */
  small?: boolean;
  /** Only for size="compact": the height, 36 by default. The tap area stays 44 px. */
  height?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
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
};

export function Button({ kind = 'primary', size, small, height, label, onPress, disabled, icon, style, accessibilityLabel }: ButtonProps) {
  const { c } = useTheme();
  const sz = size ?? (small ? 'small' : 'large');
  const s = sz === 'compact' && height ? { ...SIZE.compact, h: height, r: height / 2 } : SIZE[sz];
  const bg = { primary: c.ink, accent: c.accent, secondary: c.surface2, ghost: 'transparent', white: fixed.white, outline: 'transparent', glass: 'rgba(255,255,255,0.12)' }[kind];
  const fg = { primary: c.bg, accent: c.accentInk, secondary: c.ink, ghost: c.accentText, white: fixed.dark, outline: c.ink, glass: fixed.white }[kind];
  const slop = sz === 'compact' ? { top: (44 - s.h) / 2, bottom: (44 - s.h) / 2 } : undefined;
  return (
    <Pressy
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={slop}
      style={[{
        height: s.h, borderRadius: s.r, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', ...(sz === 'compact' ? null : { justifyContent: 'center' }), gap: s.gap,
        paddingHorizontal: s.px, opacity: disabled ? 0.4 : 1, borderWidth: kind === 'outline' ? 1 : 0, borderColor: c.line,
      }, style]}
    >
      {icon}
      <Text style={{ fontFamily: kind === 'glass' ? font.medium : font.semibold, fontSize: s.fs, lineHeight: s.lh, color: fg }}>{label}</Text>
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
  style?: StyleProp<ViewStyle>;
};

/** A 44 px rounded square with one icon or sign in it: close, back, minus, plus. */
export function IconButton({ label, onPress, children, bg, style, glass, scaleTo }: IconButtonProps) {
  const { c, isDark } = useTheme();
  // Glass buttons get a soft shadow so they still read on a plain page.
  const rim = glass ? { shadowColor: fixed.shadow, shadowOpacity: isDark ? 0.35 : 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 } : null;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} scaleTo={scaleTo}
      style={[{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: glass ? 'transparent' : bg ?? c.surface2, alignItems: 'center', justifyContent: 'center' }, rim, style]}>
      {glass ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radii.lg, overflow: 'hidden' }}>
          <GlassBackdrop radius={22} tint={Platform.OS === 'web' ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.82)') : undefined} />
        </View>
      ) : null}
      {glass ? <View style={{ zIndex: 2 }}>{children}</View> : children}
    </Pressy>
  );
}
