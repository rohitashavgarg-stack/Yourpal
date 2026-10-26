import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/design-system/tokens';
import { fontSizes } from '@/design-system/tokens';

// The text primitive: eight variants, always a line height of about 1.3 times the size.
export type TxtVariant = 'display' | 'title' | 'headline' | 'body' | 'label' | 'caption' | 'mono' | 'number';
const V: Record<TxtVariant, TextStyle> = {
  display: { fontFamily: font.regular, fontSize: fontSizes.xl5, letterSpacing: -1.4, lineHeight: 44 },
  title: { fontFamily: font.regular, fontSize: fontSizes.xl3Plus, letterSpacing: -1.1, lineHeight: 37 },
  headline: { fontFamily: font.semibold, fontSize: fontSizes.lg, letterSpacing: -0.2, lineHeight: 25 },
  body: { fontFamily: font.regular, fontSize: fontSizes.base, lineHeight: 23 },
  label: { fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 19 },
  caption: { fontFamily: font.regular, fontSize: fontSizes.xs, lineHeight: 18 },
  mono: { fontFamily: font.mono, fontSize: fontSizes.sm, lineHeight: 19 },
  number: { fontFamily: font.display, fontSize: fontSizes.xl4, letterSpacing: -0.6, lineHeight: 39 },
};

export function Txt({ v = 'body', muted, color, style, ...rest }: TextProps & { v?: TxtVariant; muted?: boolean; color?: string }) {
  const { c } = useTheme();
  // Geist crops at the top with tight leading: always give ~1.3x the font size.
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const fs = flat?.fontSize ?? V[v].fontSize!;
  const lh = Math.max(flat?.lineHeight ?? 0, Math.round(fs * 1.3));
  return <Text {...rest} style={[V[v], { color: color ?? (muted || v === 'label' || v === 'caption' ? c.muted : c.ink) }, style, { lineHeight: lh }]} />;
}
