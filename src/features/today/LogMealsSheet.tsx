import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Plus } from '@/lib/icons';
import { QuickLogSheet } from './QuickLogSheet';
import { SheetFooter } from '@/design-system/primitives/Sheet';
import { CheckCircle, FoodMark, Tag } from '@/components/bits';
import { MealId, MEALS } from '@/lib/data';
import { Extra, mealLog, useDomain, useMeals } from '@/lib/domain';
import { useLogGate } from '@/lib/logGate';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';
import { fmtQty, parseQty, stepFor } from '@/features/plans/qty';
import { AmountStepper } from '@/design-system/primitives/AmountStepper';
import { toastCopy } from '@/lib/microcopy';

// What the sheet edits before it is saved: which planned foods were eaten, how much of each, and the foods added with "Ate something else".
export type MealDraft = { eaten: number[]; por: Record<number, number>; extra: Extra[] };

// "Log meal" on the meals card and on the update card both open this for the meal that is due (lunch, dinner...). It looks like the meal card
// in Plans: the meal with its item count, calories and protein, one row per food with an amount stepper and the macros under it, and a big
// circle to tick what was eaten. Tap a row to tick it, hold it to open the food's page. Nothing is saved until "Save meal": closing the
// sheet leaves the meal as it was. (Foods added with "Ate something else" are saved by that sheet, and come back here already in the list.)
export function LogMealsSheet({ mealId, draft: start }: { mealId: MealId; draft?: Partial<MealDraft> }) {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { patch } = useMeals();
  const { gate } = useLogGate();
  const { closeSheet, openSheet, toast } = useOverlay();
  const m = MEALS.find((q) => q.id === mealId)!;
  const x = mealLog(d, mealId);
  const [dr, setDr] = useState<MealDraft>({ eaten: start?.eaten ?? x.eaten, por: start?.por ?? x.por ?? {}, extra: x.extra });

  const tick = gate((k: number) => { haptic.light(); setDr((s) => ({ ...s, eaten: s.eaten.includes(k) ? s.eaten.filter((i) => i !== k) : [...s.eaten, k] })); });
  const total = m.items.length + dr.extra.length, eatenN = dr.eaten.length + dr.extra.length;
  const allOn = eatenN === total;
  const tickAll = gate(() => { haptic.light(); setDr((s) => ({ ...s, eaten: allOn ? [] : m.items.map((_, k) => k) })); });
  const setAmount = gate((k: number, por: number) => { haptic.tick(); setDr((s) => ({ ...s, por: { ...s.por, [k]: por } })); });
  const removeExtra = gate((j: number) => { haptic.light(); setDr((s) => ({ ...s, extra: s.extra.filter((_, i) => i !== j) })); });
  // something that is not on the plan: scan the plate, write it or pick from the catalogue; then back here with what was ticked so far
  const elseFood = gate(() => closeSheet(() => openSheet(<QuickLogSheet mealId={mealId} mode="scan" backTo={() => openSheet(<LogMealsSheet mealId={mealId} draft={{ eaten: dr.eaten, por: dr.por }} />, { label: 'Log meal' })} />, { label: 'Log a meal' })));
  const openFood = (k: number, extra: boolean) => closeSheet(() => router.push({ pathname: '/food', params: { mid: mealId, k: String(k), extra: extra ? '1' : '0' } }));
  const save = gate(() => {
    const prev = d.meals;
    patch(mealId, { eaten: dr.eaten, por: dr.por, extra: dr.extra, skip: false, at: dr.eaten.length || dr.extra.length ? x.at ?? d.min : x.at });
    haptic.success();
    closeSheet(() => toast(toastCopy.mealSaved(m.n), { undo: () => set({ meals: prev }) }));
  });
  const skip = gate(() => {
    if (x.skip) { patch(mealId, { skip: false }); return; }
    const prev = d.meals;
    patch(mealId, { skip: true, eaten: [] });
    closeSheet(() => toast(toastCopy.mealSkipped(m.n), { undo: () => set({ meals: prev }) }));
  });

  // calories and protein follow the drafted amounts
  const now = m.items.map((it, k) => {
    const r = x.repl[k];
    const por = dr.por[k] ?? 1;
    return r ? { n: r.n, k: r.k, p: r.p, replaced: true } : { n: it.n, k: Math.round(it.k * por), p: Math.round(it.p * por), replaced: false };
  });
  const kcal = now.reduce((a, n) => a + n.k, 0) + dr.extra.reduce((a, e) => a + e.k, 0), prot = now.reduce((a, n) => a + n.p, 0) + dr.extra.reduce((a, e) => a + e.p, 0);

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
          const on = dr.eaten.includes(k);
          const n = now[k];
          const qty = n.replaced ? null : parseQty(it.q);
          const por = dr.por[k] ?? 1;
          const step = qty ? stepFor(qty.unit) : 0;
          const cur = qty ? Math.round(qty.n * por * 100) / 100 : 0;
          const max = qty ? Math.max(qty.n * 4, step * 10) : 0;
          const to = (v: number) => qty && setAmount(k, Math.min(max, Math.max(step, Math.round(v * 100) / 100)) / qty.n);
          return (
            <Pressy key={k} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`${n.n}. ${on ? 'Eaten' : 'Not eaten'}. Tap to ${on ? 'unmark' : 'mark as eaten'}, hold for details`}
              onPress={() => tick(k)} onLongPress={() => { haptic.medium(); openFood(k, false); }} delayLongPress={450} scaleTo={0.985}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 64, paddingLeft: 12, paddingRight: 4, borderRadius: radii.md, backgroundColor: on ? c.goodSoft : c.surface2 }}>
              <FoodMark type={it.type} />
              <View style={{ flex: 1, minWidth: 0, gap: 6, paddingVertical: 10 }}>
                <Txt numberOfLines={2} style={{ fontFamily: font.medium }}>{n.n}</Txt>
                {qty && on ? (
                  <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.muted }}>{fmtQty(cur, qty.unit)}</Txt>
                ) : qty ? (
                  <AmountStepper text={fmtQty(cur, qty.unit)} unit={qty.unit} onLess={() => to(cur - step)} onMore={() => to(cur + step)} lessDisabled={cur <= step} moreDisabled={cur >= max} />
                ) : null}
                <Txt v="caption" numberOfLines={1}>{on ? `Eaten · ~${n.k} kcal` : `~${n.k} kcal · P ${n.p} · C ${Math.round((n.k * 0.5) / 4)} · F ${Math.round((n.k * 0.3) / 9)} g`}</Txt>
              </View>
              <CheckCircle on={on} size={40} tone="good" label={`${on ? 'Unmark' : 'Mark'} ${n.n} as eaten`} onPress={() => tick(k)} />
            </Pressy>
          );
        })}
        {dr.extra.map((e, j) => {
          // like the Plans diet card: "Poha" with "1 plate" under it, then "Eaten · ~250 kcal", and a "Yours" tag
          const cut = e.n.lastIndexOf(', ');
          const name = cut > 0 ? e.n.slice(0, cut) : e.n;
          const amount = cut > 0 ? e.n.slice(cut + 2) : '';
          return (
            <Pressy key={`x${j}`} accessibilityRole="button" accessibilityLabel={`${e.n}, added by you. Tap to remove, hold for details`}
              onPress={() => removeExtra(j)} onLongPress={() => { haptic.medium(); openFood(j, true); }} delayLongPress={450} scaleTo={0.985}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 64, paddingLeft: 12, paddingRight: 4, borderRadius: radii.md, backgroundColor: c.goodSoft }}>
              <FoodMark type={e.type ?? 'veg'} />
              <View style={{ flex: 1, minWidth: 0, gap: 4, paddingVertical: 10 }}>
                <Txt numberOfLines={2} style={{ fontFamily: font.medium }}>{name}</Txt>
                {!!amount && <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.muted }}>{amount}</Txt>}
                <Txt v="caption" numberOfLines={1}>{`Eaten · ~${e.k} kcal`}</Txt>
              </View>
              <Tag label="Yours" bg={c.accentSoft} fg={c.accentText} style={{ alignSelf: 'center' }} />
              <CheckCircle on size={40} tone="good" label={`Remove ${e.n}`} onPress={() => removeExtra(j)} />
            </Pressy>
          );
        })}
        <Row style={{ gap: 8 }}>
          <Button kind="dashed" size="fill" label="Ate something else?" accessibilityLabel="Ate something else? Log it" icon={<Plus size={16} color={c.ink} />} onPress={elseFood} style={{ flex: 1.5 }} />
          <Button kind="quiet" size="fill" muted={!x.skip} label={x.skip ? 'Undo skip' : 'Skip meal'} onPress={skip} style={{ flex: 1 }} />
        </Row>
      </View>
      {/* pinned under the list, so Save meal stays in view however many foods the meal has */}
      <SheetFooter><Button label="Save meal" onPress={save} /></SheetFooter>
    </View>
  );
}
