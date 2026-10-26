import React from 'react';
import { View } from 'react-native';
import { Minus, Plus } from '@/lib/icons';
import { Pressy, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, round } from '@/design-system/tokens';

export type AmountStepperProps = {
  /** The amount shown in the middle, "1 katori", "5 pcs". */
  text: string;
  onLess: () => void;
  onMore: () => void;
  /** At the smallest or largest amount: that button is dimmed and does nothing. */
  lessDisabled?: boolean;
  moreDisabled?: boolean;
  /** What one step is, for the spoken labels ("Less katori"). */
  unit?: string;
  /** Hold the amount: for example the units and reset sheet in Plans. */
  onLongPress?: () => void;
  /** Spoken label of the amount in the middle. */
  accessibilityLabel?: string;
};

/**
 * The amount control on a food: a thin outlined pill with a small round − and + (24 px, solid: light in dark mode, dark in light mode)
 * and the amount in between. The buttons sit inside the pill with room around them; each has a 44 px tap area.
 */
export function AmountStepper({ text, onLess, onMore, lessDisabled, moreDisabled, unit, onLongPress, accessibilityLabel }: AmountStepperProps) {
  const { c, isDark } = useTheme();
  const btn = (label: string, on: () => void, off: boolean | undefined, icon: React.ReactNode) => (
    <Pressy accessibilityRole="button" accessibilityLabel={`${label} ${unit || 'piece'}`} accessibilityState={{ disabled: !!off }} disabled={off} onPress={on} scaleTo={0.86} hitSlop={10}
      style={{ width: 24, height: 24, borderRadius: round(24), backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.35 : 1 }}>
      {icon}
    </Pressy>
  );
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 8, borderRadius: round(40), borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(11,14,20,0.18)' }}>
      {btn('Less', onLess, lessDisabled, <Minus size={13} strokeWidth={2.6} color={c.bg} />)}
      <Pressy accessibilityRole={onLongPress ? 'button' : undefined} accessibilityLabel={accessibilityLabel ?? `Amount ${text}`} onLongPress={onLongPress} delayLongPress={450} disabled={!onLongPress} scaleTo={0.96}
        style={{ minWidth: 52, height: 32, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.ink }}>{text}</Txt>
      </Pressy>
      {btn('More', onMore, moreDisabled, <Plus size={13} strokeWidth={2.6} color={c.bg} />)}
    </View>
  );
}
