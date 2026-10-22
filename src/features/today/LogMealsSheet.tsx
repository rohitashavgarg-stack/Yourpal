import React from 'react';
import { View } from 'react-native';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Minus, Plus } from '@/lib/icons';
import { QuickLogSheet } from './QuickLogSheet';
import { CheckCircle, FoodMark } from '@/components/bits';
import { MealId, MEALS } from '@/lib/data';
import { itemNow, mealLog, useDomain, useMeals } from '@/lib/domain';
import { useLogGate } from '@/lib/logGate';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';
import { fmtQty, parseQty, stepFor } from '@/features/plans/qty';
import { toastCopy } from '@/lib/microcopy';

// "Log meal" on the meals card and on the update card both open this for the meal that is due (lunch, dinner...). It looks like the meal card
// in Plans: the meal with its item count, calories and protein, one row per food with an amount pill (halves for a katori, 25 for grams) and
// the macros under it, and a big circle to tick what was eaten. The circle in the header ticks everything. The calories follow the amount.
export function LogMealsSheet({ mealId }: { mealId: MealId }) {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { toggleItem, patch } = useMeals();
  const { gate } = useLogGate();
  const { closeSheet, openSheet, toast } = useOverlay();
  const m = MEALS.find((q) => q.id === mealId)!;
  const x = mealLog(d, mealId);
  const tick = gate((k: number) => { haptic.light(); toggleItem(mealId, k); });
  const total = m.items.length + x.extra.length, eatenN = x.eaten.length + x.extra.length;
  const allOn = eatenN === total;
  const tickAll = gate(() => { haptic.light(); patch(mealId, { eaten: allOn ? [] : m.items.map((_, k) => k), skip: false, at: x.at ?? d.min }); });
  const setAmount = gate((k: number, por: number) => { haptic.tick(); patch(mealId, { por: { ...(x.por ?? {}), [k]: por } }); });
  // something that is not on the plan: scan the plate, write it or pick from the catalogue (the same sheet the meals card used to open)
  const elseFood = gate(() => closeSheet(() => openSheet(<QuickLogSheet mealId={mealId} mode="scan" backTo={() => openSheet(<LogMealsSheet mealId={mealId} />, { label: 'Log meal' })} />, { label: 'Log a meal' })));
  const skip = gate(() => {
    if (x.skip) { patch(mealId, { skip: false }); return; }
    const prev = d.meals;
    patch(mealId, { skip: true, eaten: [] });
    closeSheet(() => toast(toastCopy.mealSkipped(m.n), { undo: () => set({ meals: prev }) }));
  });
  const now = m.items.map((_, k) => itemNow(d, mealId, k));
  const kcal = now.reduce((a, n) => a + n.k, 0) + x.extra.reduce((a, e) => a + e.k, 0), prot = now.reduce((a, n) => a + n.p, 0) + x.extra.reduce((a, e) => a + e.p, 0);
  const removeExtra = gate((j: number) => { const prev = d.meals; const gone = x.extra[j]; patch(mealId, { extra: x.extra.filter((_, i) => i !== j) }); toast(toastCopy.removed(gone?.n ?? 'item'), { undo: () => set({ meals: prev }) }); });

  const stepBtn = (label: string, on: () => void, off: boolean, icon: React.ReactNode) => (
    <Pressy accessibilityRole="button" accessibilityLabel={label} disabled={off} onPress={on} scaleTo={0.86} hitSlop={6}
      style={{ width: 32, height: 32, borderRadius: radii.md, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.35 : 1 }}>
      {icon}
    </Pressy>
  );
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between', paddingBottom: 2 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{m.n}</Txt>
            <Txt v="caption">{`${allOn ? 'All eaten' : eatenN ? `${eatenN} of ${total} eaten` : `${total} items`} · ~${kcal} kcal · P ${prot} g`}</Txt>
          </View>
          <CheckCircle on={allOn} size={40} tone="good" label={allOn ? 'Unmark all' : 'Mark all as eaten'} onPress={tickAll} />
        </Row>
        {m.items.map((it, k) => {
          const on = x.eaten.includes(k);
          const n = now[k];
          const qty = n.replaced ? null : parseQty(it.q);
          const por = x.por?.[k] ?? 1;
          const step = qty ? stepFor(qty.unit) : 0;
          const cur = qty ? Math.round(qty.n * por * 100) / 100 : 0;
          const max = qty ? Math.max(qty.n * 4, step * 10) : 0;
          const to = (v: number) => qty && setAmount(k, Math.min(max, Math.max(step, Math.round(v * 100) / 100)) / qty.n);
          return (
            <Row key={k} style={{ gap: 8, minHeight: 64, paddingLeft: 12, paddingRight: 4, borderRadius: radii.md, backgroundColor: on ? c.goodSoft : c.surface2 }}>
              <FoodMark type={it.type} />
              <View style={{ flex: 1, minWidth: 0, gap: 6, paddingVertical: 10 }}>
                <Txt numberOfLines={2} style={{ fontFamily: font.medium }}>{n.n}</Txt>
                {qty && on ? (
                  <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.muted }}>{fmtQty(cur, qty.unit)}</Txt>
                ) : qty ? (
                  <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 2, height: 38, paddingHorizontal: 3, borderRadius: 19, backgroundColor: c.accentSoft }}>
                    {stepBtn(`Less ${qty.unit || 'piece'}`, () => to(cur - step), cur <= step, <Minus size={16} color={c.accentText} strokeWidth={2.4} />)}
                    <View style={{ minWidth: 62, height: 32, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' }}>
                      <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.accentText }}>{fmtQty(cur, qty.unit)}</Txt>
                    </View>
                    {stepBtn(`More ${qty.unit || 'piece'}`, () => to(cur + step), cur >= max, <Plus size={16} color={c.accentText} strokeWidth={2.4} />)}
                  </View>
                ) : null}
                <Txt v="caption" numberOfLines={1}>{on ? `Eaten · ~${n.k} kcal` : `~${n.k} kcal · P ${n.p} · C ${Math.round((n.k * 0.5) / 4)} · F ${Math.round((n.k * 0.3) / 9)} g`}</Txt>
              </View>
              <CheckCircle on={on} size={40} tone="good" label={`${on ? 'Unmark' : 'Mark'} ${n.n} as eaten`} onPress={() => tick(k)} />
            </Row>
          );
        })}
        {x.extra.map((e, j) => (
          <Row key={`x${j}`} style={{ gap: 8, minHeight: 64, paddingLeft: 12, paddingRight: 4, borderRadius: radii.md, backgroundColor: c.goodSoft }}>
            <FoodMark type={e.type ?? 'veg'} />
            <View style={{ flex: 1, minWidth: 0, gap: 4, paddingVertical: 10 }}>
              <Txt numberOfLines={2} style={{ fontFamily: font.medium }}>{e.n}</Txt>
              <Txt v="caption" numberOfLines={1}>{`Added by you · ~${e.k} kcal · P ${e.p} · C ${Math.round((e.k * 0.5) / 4)} · F ${Math.round((e.k * 0.3) / 9)} g`}</Txt>
            </View>
            <CheckCircle on size={40} tone="good" label={`Remove ${e.n}`} onPress={() => removeExtra(j)} />
          </Row>
        ))}
        <Row style={{ gap: 8 }}>
          <Pressy accessibilityRole="button" accessibilityLabel="Ate something else? Log it" onPress={elseFood}
            style={{ flex: 1.5, height: 44, borderRadius: radii.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: c.chipLine, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={16} color={c.ink} /><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md }}>Ate something else?</Txt>
          </Pressy>
          <Pressy accessibilityRole="button" accessibilityLabel={x.skip ? 'Undo skip' : 'Skip meal'} onPress={skip}
            style={{ flex: 1, height: 44, borderRadius: radii.lg, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, color: x.skip ? c.ink : c.muted }}>{x.skip ? 'Undo skip' : 'Skip meal'}</Txt>
          </Pressy>
        </Row>
      </View>
      <Button label={x.eaten.length ? 'Done' : 'Close'} onPress={() => closeSheet()} />
    </View>
  );
}
