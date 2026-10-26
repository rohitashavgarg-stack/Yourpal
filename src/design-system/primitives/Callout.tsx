import React from 'react';
import { View, StyleProp, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/design-system/tokens';

/**
 * A soft block inside a page or a sheet: a notice (warn), a tip (accent) or a quiet panel (plain). No shadow, no line, it only draws
 * the fill, the corners and the padding; what goes inside (title, sentence, rows, a stat) is the caller's.
 *
 *   tone  warn    soft amber, for something to know (away, locked, deleting). Text on it uses the warn colour.
 *         accent  soft blue, for a tip or a summary. Text on it uses the accent text colour.
 *         plain   the quiet surface, for a panel or a note. Text on it uses the normal or muted colour.
 *   size  compact  padding 10, radius 14 (the message under the chat composer)
 *         sm       padding 12, radius 18 (a stat tile, a short notice)
 *         md       padding 14 by 16, radius 20 (the default: notes, hints, the plans info box)
 *         lg       padding 16, radius 22 (a notice with a title and a sentence)
 *         xl       padding 18, radius 24 (a notice that is a whole card, for example delete account)
 */
export type CalloutTone = 'warn' | 'accent' | 'plain';
export type CalloutSize = 'compact' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<CalloutSize, { v: number; h: number; r: number }> = {
  compact: { v: 10, h: 10, r: 14 },
  sm: { v: 12, h: 12, r: radii.md },
  md: { v: 14, h: 16, r: radii.block },
  lg: { v: 16, h: 16, r: radii.lg },
  xl: { v: 18, h: 18, r: radii.card },
};

export type CalloutProps = Omit<ViewProps, 'style'> & {
  tone?: CalloutTone;
  size?: CalloutSize;
  /** Space between the children. */
  gap?: number;
  /** Layout only: flex, width, margins, alignment of the children. Not for colours, radius or padding. */
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/** The text colour that goes with a tone, for callers that draw their own text inside. */
export function calloutInk(tone: CalloutTone, c: { warn: string; accentText: string; ink: string }) {
  return tone === 'warn' ? c.warn : tone === 'accent' ? c.accentText : c.ink;
}

export function Callout({ tone = 'plain', size = 'md', gap, style, children, ...rest }: CalloutProps) {
  const { c } = useTheme();
  const s = SIZE[size];
  const bg = tone === 'warn' ? c.warnSoft : tone === 'accent' ? c.accentSoft : c.surface2;
  return (
    <View {...rest} style={[{ paddingVertical: s.v, paddingHorizontal: s.h, borderRadius: s.r, backgroundColor: bg, ...(gap !== undefined ? { gap } : null) }, style]}>
      {children}
    </View>
  );
}
