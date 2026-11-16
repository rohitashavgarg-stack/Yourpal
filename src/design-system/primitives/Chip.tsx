import React from 'react';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, fixed, round } from '@/design-system/tokens';

export type ChipTone = 'default' | 'good' | 'warn' | 'live';
export type ChipProps = { label: string; icon?: React.ReactNode; tone?: ChipTone; onDark?: boolean; filled?: boolean; outlined?: boolean; edge?: boolean; size?: 'md' | 'lg'; style?: StyleProp<ViewStyle> };

/** Outline chip: information, never an action. `filled` swaps the line for a soft fill (with `outlined` it keeps the line as well); `edge` (with `filled`) adds the thin gradient stroke the cards have; `size="lg"` is 36 px high with 13 px text. */
export function Chip({ label, icon, tone = 'default', onDark, filled, outlined, edge, size = 'md', style }: ChipProps) {
  const { c } = useTheme();
  const col = tone === 'good' ? c.good : tone === 'warn' ? c.warn : tone === 'live' ? c.live : onDark ? fixed.white : c.ink;
  const border = tone === 'default' ? (onDark ? 'rgba(255,255,255,0.28)' : c.chipLine) : col;
  const lg = size === 'lg';
  const h = lg ? 36 : 28;
  const fill = tone === 'good' ? c.goodSoft : tone === 'warn' ? c.warnSoft : c.surface2; // the soft fill, when `filled`
  return (
    <View style={[{ height: h, paddingHorizontal: lg ? 14 : 11, borderRadius: round(h), borderWidth: filled && !outlined ? 0 : 1, borderColor: border, ...(filled ? { backgroundColor: fill } : null), flexDirection: 'row', alignItems: 'center', gap: lg ? 8 : 6, alignSelf: 'flex-start' }, style]}>
      {icon}
      {filled && edge ? <CardEdge radius={round(h)} /> : null}
      <Text style={{ fontFamily: font.medium, fontSize: lg ? fontSizes.sm : fontSizes.xs, lineHeight: lg ? 19 : 16, color: col }}>{label}</Text>
    </View>
  );
}
