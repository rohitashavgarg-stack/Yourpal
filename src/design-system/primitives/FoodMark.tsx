import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { FoodType } from '@/lib/data';
import { fixed } from '@/design-system/tokens';

// ---------- Veg / egg / non-veg mark (Indian food label style) ----------
const MARK: Record<FoodType, { c: string; d: string; l: string }> = {
  veg: { c: fixed.foodVeg, d: 'M6 3.4a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0-5.2z', l: 'Veg' },
  egg: { c: fixed.foodEgg, d: 'M6 3.4a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0-5.2z', l: 'Egg' },
  nv: { c: fixed.foodNonVeg, d: 'M6 3l3 5H3z', l: 'Non-veg' },
};
export const foodTypeLabel = (t: FoodType = 'veg') => MARK[t].l;
export function FoodMark({ type = 'veg', size = 14 }: { type?: FoodType; size?: number }) {
  const m = MARK[type];
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" accessibilityLabel={m.l}>
      <Rect x={0.75} y={0.75} width={10.5} height={10.5} rx={2} fill="none" stroke={m.c} strokeWidth={1.5} />
      <Path d={m.d} fill={m.c} />
    </Svg>
  );
}
