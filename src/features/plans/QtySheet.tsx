import React from 'react';
import { View } from 'react-native';
import { Minus, Plus } from '@/lib/icons';
import { Button, Pressy, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { MealId } from '@/lib/data';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { useDietActions } from './dietActions';
import { dietItems, usePlans } from './store';
import { fmtNum, splitFood, stepFor, unitLabel } from './qty';

// Change how much of one food you have. Today only; the plan itself is not edited.
export function QtySheet({ mid, itemKey }: { mid: MealId; itemKey: string }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();
  const A = useDietActions();
  const { closeSheet } = useOverlay();
  const it = dietItems(d, p, mid).find((x) => x.key === itemKey);
  if (!it) return <Txt muted>This item was removed.</Txt>;
  const { name, qty } = splitFood(it);
  if (!qty) return <Txt muted>This item has no fixed amount.</Txt>;

  const step = stepFor(qty.unit);
  const cur = Math.round(qty.n * it.por * 100) / 100;
  const max = Math.max(qty.n * 4, step * 10);
  const set = (v: number) => {
    const n = Math.min(max, Math.max(step, Math.round(v * 100) / 100));
    if (n === cur) return;
    haptic.tick();
    A.setPor(mid, it.key, n / qty.n);
  };
  const btn = (label: string, on: () => void, off: boolean, icon: React.ReactNode) => (
    <Pressy accessibilityRole="button" accessibilityLabel={label} disabled={off} onPress={on} scaleTo={0.9}
      style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.35 : 1 }}>
      {icon}
    </Pressy>
  );
  const planned = qty.n;
  return (
    <View style={{ gap: 14, paddingBottom: 8 }}>
      <View style={{ gap: 2 }}>
        <Txt v="title" style={{ fontSize: 22, lineHeight: 29 }}>{name}</Txt>
        <Txt muted style={{ fontSize: 13 }}>Planned: {fmtNum(planned)} {unitLabel(qty.unit)}</Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
        {btn('Less', () => set(cur - step), cur <= step, <Minus size={22} color={c.ink} />)}
        <View style={{ alignItems: 'center' }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: 48, lineHeight: 60, letterSpacing: -1.2 }}>{fmtNum(cur)}</Txt>
          <Txt muted style={{ fontSize: 15 }}>{unitLabel(qty.unit)}</Txt>
        </View>
        {btn('More', () => set(cur + step), cur >= max, <Plus size={22} color={c.ink} />)}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
        <Txt style={{ fontFamily: font.semibold }}>~{Math.round(it.k * it.por)} kcal</Txt>
        <Txt muted>P {Math.round(it.p * it.por)} g</Txt>
        <Txt muted>C {Math.round(it.c * it.por)} g</Txt>
        <Txt muted>F {Math.round(it.f * it.por)} g</Txt>
      </View>
      <Txt v="caption" style={{ textAlign: 'center' }}>Changes today only. Your plan stays as Coach Vikram set it.</Txt>
      <Button label="Done" onPress={() => closeSheet()} />
      {it.por !== 1 && <Button kind="ghost" small label="Back to planned amount" onPress={() => A.setPor(mid, it.key, 1)} />}
    </View>
  );
}
