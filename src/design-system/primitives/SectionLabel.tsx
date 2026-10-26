import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Txt } from '@/components/ui';
import { font, fontSizes } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The small heading above a group of cards. Three looks, all of them already in the app (they were four separate `Label` components):
 *   overline  11 px semibold, letter-spaced, muted (Coach, Streaks pages)
 *   quiet     13 px medium, muted (goal page)
 *   label     the Txt "label" variant with a 6 px inset (Profile and Settings pages)
 * `inset` is horizontal padding. It defaults to 6 for `label` and 0 for the others.
 */
export type SectionLabelVariant = 'overline' | 'quiet' | 'label';

const SPEC = {
  overline: { fontFamily: font.semibold, fontSize: fontSizes.xs2, lineHeight: 15, letterSpacing: 1.3 },
  quiet: { fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 19 },
} as const;

export function SectionLabel({ children, variant = 'label', inset, style }: { children: React.ReactNode; variant?: SectionLabelVariant; inset?: number; style?: StyleProp<TextStyle> }) {
  const { c } = useTheme();
  if (variant === 'label') return <Txt v="label" accessibilityRole="header" style={[{ paddingHorizontal: inset ?? 6 }, style]}>{children}</Txt>;
  return <Txt accessibilityRole="header" style={[{ ...SPEC[variant], color: c.muted, ...(inset ? { paddingHorizontal: inset } : null) }, style]}>{children}</Txt>;
}
