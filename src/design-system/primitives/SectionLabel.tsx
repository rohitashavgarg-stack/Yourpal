import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import { Row, Txt } from '@/components/ui';
import { IconBadge } from './IconBadge';
import { font, fontSizes } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The small heading above a group of cards. Three looks, all of them already in the app (they were four separate `Label` components):
 *   overline  11 px semibold, letter-spaced, muted (Coach, Streaks pages)
 *   quiet     13 px medium, muted (goal page)
 *   label     the Txt "label" variant with a 6 px inset (Profile and Settings pages)
 *   section   the heading of a part of a page (Warm-up, Main workout, Cool-down): a small round icon in the part's colour, the title at 17 px semibold, and an optional note on the right
 * `inset` is horizontal padding. It defaults to 6 for `label` and 0 for the others.
 */
export type SectionLabelVariant = 'overline' | 'quiet' | 'label' | 'section';

const SPEC = {
  overline: { fontFamily: font.semibold, fontSize: fontSizes.xs2, lineHeight: 15, letterSpacing: 1.3 },
  quiet: { fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 19 },
} as const;

export function SectionLabel({ children, variant = 'label', inset, style, icon, tint, right }: { children: React.ReactNode; variant?: SectionLabelVariant; inset?: number; style?: StyleProp<TextStyle>; icon?: React.ReactNode; tint?: string; right?: React.ReactNode }) {
  const { c } = useTheme();
  if (variant === 'section') {
    return (
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: inset ?? 6, minHeight: 32 }}>
        <Row style={{ gap: 10 }}>
          {icon ? <IconBadge size={28} radius={14} bg={`${tint ?? c.accent}26`}>{icon}</IconBadge> : null}
          <Txt accessibilityRole="header" style={[{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25, letterSpacing: -0.2 }, style]}>{children}</Txt>
        </Row>
        {right}
      </Row>
    );
  }
  if (variant === 'label') return <Txt v="label" accessibilityRole="header" style={[{ paddingHorizontal: inset ?? 6 }, style]}>{children}</Txt>;
  return <Txt accessibilityRole="header" style={[{ ...SPEC[variant], color: c.muted, ...(inset ? { paddingHorizontal: inset } : null) }, style]}>{children}</Txt>;
}
