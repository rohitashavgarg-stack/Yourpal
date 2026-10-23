import React from 'react';
import { View, StyleProp, ViewProps, ViewStyle } from 'react-native';
import { fixed, radii, shadows } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Card variants. Each one is a look that already existed in the app; none is new.
 *   default  white card, radius 28, padding 20 (the old components/ui.tsx Card)
 *   roomy    white card, radius 28, padding 18 (break, health, metric pages)
 *   compact  white card, radius 24, padding 18, gap 10 (the old Card in app/goal-detail.tsx)
 *   tight    white card, radius 24, padding 16 (update cards, the no-plan card, onboarding summaries, streaks)
 *   dark     the dark card (palette `dark`), radius 28, padding 20, never a shadow
 * The shadow is the card shadow in light mode and none in dark mode, as before. `flat` leaves it out. `tone` fills the card with a soft colour instead of the surface (accent for a summary, warn for a notice).
 * The compact and tight radius is `radii.card` (24).
 */
export type CardVariant = 'default' | 'roomy' | 'compact' | 'tight' | 'dark';

const SPEC: Record<CardVariant, { radius: number; padding: number; gap?: number }> = {
  default: { radius: 28, padding: 20 },
  roomy: { radius: 28, padding: 18 },
  compact: { radius: radii.card, padding: 18, gap: 10 },
  tight: { radius: radii.card, padding: 16 },
  dark: { radius: 28, padding: 20 },
};

export type CardTone = 'surface' | 'accent' | 'warn';
export type CardPadding = { top?: number; bottom?: number; horizontal?: number };

export type CardProps = Omit<ViewProps, 'style'> & {
  variant?: CardVariant;
  /** Space between children. Overrides the variant's gap. */
  gap?: number;
  /** Old name for variant="dark". Kept so existing <Card dark> calls keep working. */
  dark?: boolean;
  /** The fill: the surface (default), soft blue or soft amber. */
  tone?: CardTone;
  /** No shadow, also in light mode (a card on a sheet or inside another surface). */
  flat?: boolean;
  /** A line around the card: colour, and width (default 1). For example the selected plan on the break page. */
  border?: { color: string; width?: number };
  /** Clip the content to the rounded corners (a chart or an image that runs to the edge). */
  clip?: boolean;
  /** Per-side padding for list cards whose rows bring their own vertical space. Replaces the variant's padding. */
  padding?: CardPadding;
  /** Layout only: flex, margins, direction and alignment of the children. Not for colours, radius or padding. */
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function Card({ variant, dark, gap, tone = 'surface', flat, border, clip, padding, style, children, ...rest }: CardProps) {
  const { c, isDark } = useTheme();
  const v: CardVariant = variant ?? (dark ? 'dark' : 'default');
  const s = SPEC[v];
  const g = gap ?? s.gap;
  const pad = padding
    ? { paddingTop: padding.top ?? 0, paddingBottom: padding.bottom ?? 0, paddingHorizontal: padding.horizontal ?? 0 }
    : { padding: s.padding };
  return (
    <View {...rest} style={[{
      backgroundColor: v === 'dark' ? c.dark : tone === 'accent' ? c.accentSoft : tone === 'warn' ? c.warnSoft : c.surface, borderRadius: s.radius, ...pad,
      ...(g !== undefined ? { gap: g } : null),
      ...(border ? { borderWidth: border.width ?? 1, borderColor: border.color } : null),
      ...(clip ? { overflow: 'hidden' as const } : null),
      ...(isDark || v === 'dark' || flat ? null : { ...shadows.card, shadowColor: fixed.shadow }),
    }, style]}>
      {children}
    </View>
  );
}
