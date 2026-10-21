import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { fixed, shadows } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Card variants. Each one is a look that already existed in the app; none is new.
 *   default  white card, radius 28, padding 20 (the old components/ui.tsx Card)
 *   compact  white card, radius 24, padding 18, gap 10 (the old Card in app/goal-detail.tsx)
 *   dark     the dark card (palette `dark`), radius 28, padding 20, never a shadow
 * The shadow is the card shadow in light mode and none in dark mode, as before.
 * Radius 24 is not a step of the `radii` scale; it is kept here so the compact card does not change (see docs/tokens-review.md).
 */
export type CardVariant = 'default' | 'compact' | 'dark';

const SPEC: Record<CardVariant, { radius: number; padding: number; gap?: number }> = {
  default: { radius: 28, padding: 20 },
  compact: { radius: 24, padding: 18, gap: 10 },
  dark: { radius: 28, padding: 20 },
};

export type CardProps = {
  variant?: CardVariant;
  /** Space between children. Overrides the variant's gap. */
  gap?: number;
  /** Old name for variant="dark". Kept so existing <Card dark> calls keep working. */
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function Card({ variant, dark, gap, style, children }: CardProps) {
  const { c, isDark } = useTheme();
  const v: CardVariant = variant ?? (dark ? 'dark' : 'default');
  const s = SPEC[v];
  const g = gap ?? s.gap;
  return (
    <View style={[{
      backgroundColor: v === 'dark' ? c.dark : c.surface, borderRadius: s.radius, padding: s.padding,
      ...(g !== undefined ? { gap: g } : null),
      ...(isDark || v === 'dark' ? null : { ...shadows.card, shadowColor: fixed.shadow }),
    }, style]}>
      {children}
    </View>
  );
}
