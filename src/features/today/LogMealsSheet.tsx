import React from 'react';
import { View } from 'react-native';
import { Button, Row, Txt } from '@/components/ui';
import { Minus, Plus } from '@/lib/icons';
import { QuickLogSheet } from './QuickLogSheet';
import { CheckCircle, FoodMark } from '@/components/bits';
import { fmtT, MealId, MEALS } from '@/lib/data';
import { itemNow, mealLog, useDomain, useMeals } from '@/lib/domain';
import { useLogGate } from '@/lib/logGate';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';
import { IconButton } from '@/design-system/primitives/Button';
import { fmtQty, parseQty, stepFor } from '@/features/plans/qty';
import { toastCopy } from '@/lib/microcopy';

// "Log meal" on the meals card and on the update card both open this for the meal that is due (lunch, dinner...): its food items, each with its own
// tick and its own amount. Ticking an item logs it as eaten, a second tap takes it back. The amount steps in the same units as the plan
// (halves for a katori, 25 for grams) and the calories follow it.
export function LogMealsSheet({ mealId }: { mealId: MealId }) {
  const { c, isDark } = useTheme();
  const { d, set } = useDomain();
  const { toggleItem, patch } = useMeals();
  const { gate } = useLogGate();
  const { closeSheet, openSheet, toast } = useOverlay();
  const m = MEALS.find((q) => q.id === mealId)!;
  const x = mealLog(d, mealId);
  const tick = gate((k: number) => { haptic.light(); toggleItem(mealId, k); });
  const eaten = x.eaten.length;
  const setAmount = gate((k: number, por: number) => { haptic.tick(); patch(mealId, { por: { ...(x.por ?? {}), [k]: por } }); });
  // something that is not on the plan: scan the plate, write it or pick from the catalogue (the same sheet the meals card opens)
  const elseFood = gate(() => closeSheet(() => openSheet(<QuickLogSheet mealId={mealId} mode="scan" />, { label: 'Log a meal' })));
  const skip = gate(() => {
    if (x.skip) { patch(mealId, { skip: false }); return; }
    const prev = d.meals;
    patch(mealId, { skip: true, eaten: [] });
    closeSheet(() => toast(toastCopy.mealSkipped(m.n), { undo: () => set({ meals: prev }) }));
  });
  const stepBtn = (label: string, on: () => void, off: boolean, icon: React.ReactNode) => (
    <IconButton label={label} onPress={on} disabled={off} scaleTo={0.9} size={28} radius={14} bg={c.surface} style={{ opacity: off ? 0.35 : 1 }}>{icon}</IconButton>
  );
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 2, paddingHorizontal: 4 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 24, lineHeight: 32, letterSpacing: -0.4 }}>{`Log your ${m.n.toLowerCase()}`}</Txt>
        <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{`${fmtT(m.t).full}. Tick what you ate, and change the amount if it was different.`}</Txt>
      </View>
      <View style={{ gap: 4 }}>
        {m.items.map((it, k) => {
          const on = x.eaten.includes(k);
          const n = itemNow(d, mealId, k);
          const qty = n.replaced ? null : parseQty(it.q);
          const por = x.por?.[k] ?? 1;
          const step = qty ? stepFor(qty.unit) : 0;
          const cur = qty ? Math.round(qty.n * por * 100) / 100 : 0;
          const max = qty ? Math.max(qty.n * 4, step * 10) : 0;
          const to = (v: number) => qty && setAmount(k, Math.min(max, Math.max(step, Math.round(v * 100) / 100)) / qty.n);
          return (
            <Row key={k} style={{ gap: 10, minHeight: 64, paddingLeft: 12, paddingRight: 4, paddingVertical: 6, borderRadius: radii.md, backgroundColor: on ? (isDark ? '#1E4A3F' : c.goodSoft) : c.surface2, borderWidth: on ? 1 : 0, borderColor: c.good + '66' }}>
              <FoodMark type={it.type} />
              <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <Txt style={{ fontFamily: font.medium }}>{n.n}</Txt>
                {qty ? (
                  <Row style={{ gap: 8 }}>
                    {stepBtn('Less', () => to(cur - step), cur <= step, <Minus size={14} color={c.ink} />)}
                    <Txt v="caption" style={{ minWidth: 56, textAlign: 'center', color: c.ink }}>{fmtQty(cur, qty.unit)}</Txt>
                    {stepBtn('More', () => to(cur + step), cur >= max, <Plus size={14} color={c.ink} />)}
                  </Row>
                ) : <Txt v="caption">{it.q}</Txt>}
              </View>
              <Txt v="caption" style={{ alignSelf: 'center' }}>{`${n.k} kcal`}</Txt>
              <CheckCircle on={on} size={28} tone="good" label={`${on ? 'Unmark' : 'Mark'} ${n.n} as eaten`} onPress={() => tick(k)} />
            </Row>
          );
        })}
      </View>
      <Button kind="secondary" label="Ate something else" icon={<Plus size={18} color={c.ink} />} onPress={elseFood} />
      <Button label={eaten ? 'Done' : 'Close'} onPress={() => closeSheet()} />
      <Button kind="ghost" small label={x.skip ? 'Undo skip' : 'Skip meal'} onPress={skip} />
    </View>
  );
}
