import React from 'react';
import { router } from 'expo-router';
import { useOverlay } from '@/components/Overlay';
import { fmtT, KCAL_TARGET, MACRO_TARGET, MealId, MEALS } from '@/lib/data';
import { itemNow, mealLog, totals, useDomain, useMeals } from '@/lib/domain';
import { inr } from '@/lib/useNow';
import { mealById, mealKcal, mealView } from './meals';
import { LogMealsSheet } from './LogMealsSheet';
import { fmtQty, parseQty } from '@/features/plans/qty';
import { useLogGate } from '@/lib/logGate';
import { toastCopy } from '@/lib/microcopy';
import { MealsCard as MealsCardPattern, MealsCardState, MealTone, ShownMeal } from '@/design-system/patterns/MealsCard';

export { MealsCard } from '@/design-system/_archive/MealsAccordion'; // the old all-meals accordion, archived

// ---------- Today: only the meal for right now ----------
// Each meal "owns" the time from 90 min before it until 90 min before the next one. Today shows that one meal only, with a small strip
// of the whole day under it. A meal whose time has passed with nothing logged is "missed": the card asks about it first, with one-tap answers.
// The look of every state is the pattern in src/design-system/patterns/MealsCard.tsx; this reads the member's day and does the logging.
const LEAD = 90;
export function currentMealId(min: number): MealId {
  let cur = MEALS[0].id;
  MEALS.forEach((m) => { if (min >= m.t - LEAD) cur = m.id; });
  return cur;
}
const untouched = (d: ReturnType<typeof useDomain>['d'], id: MealId) => { const x = mealLog(d, id); return !x.skip && x.eaten.length === 0 && x.extra.length === 0; };
export function missedMeals(d: ReturnType<typeof useDomain>['d']): MealId[] {
  const cur = currentMealId(d.min);
  const ci = MEALS.findIndex((m) => m.id === cur);
  return MEALS.slice(0, ci).filter((m) => untouched(d, m.id)).map((m) => m.id);
}

export function TodayMealNowCard() {
  const { d, set } = useDomain();
  const { toggleItem, patch } = useMeals();
  const { openSheet, toast } = useOverlay();
  const { gate, paused } = useLogGate();
  const t = totals(d);
  const now = currentMealId(d.min);
  // tapping another meal in the strip shows it here; tapping the current one (or a fresh day) goes back to "now"
  const picked = !!d.openMeal && d.openMeal !== 'none' && MEALS.some((q) => q.id === d.openMeal);
  const shown = picked ? (d.openMeal as MealId) : now;
  const m = mealById(shown);
  const x = mealLog(d, shown);
  const v = mealView(d, m);
  const missed = missedMeals(d);
  // the most recent missed meal first; nothing to answer while logging is paused, and no "wasn't logged" banner for the meal that is already on screen
  const lastMissed = missed.length ? missed[missed.length - 1] : null;
  const ask = !paused && lastMissed && lastMissed !== shown ? lastMissed : null;
  const tone = (id: MealId): MealTone => {
    const xl = mealLog(d, id); const mv = mealView(d, mealById(id));
    return xl.skip ? 'skipped' : mv.any ? 'logged' : missed.includes(id) ? 'missed' : id === now ? 'now' : 'later';
  };
  const text = (id: MealId) => { const tn = tone(id); return tn === 'skipped' ? 'Skipped' : tn === 'logged' ? 'Logged' : tn === 'missed' ? 'Not logged' : tn === 'now' ? 'Now' : fmtT(mealById(id).t).full; };

  const openLog = (id: MealId) => gate(() => openSheet(<LogMealsSheet mealId={id} />, { label: 'Log meal' }));

  const state: MealsCardState = paused ? 'paused' : t.done === MEALS.length && !picked ? 'complete' : 'now';
  // protein of what was eaten, or of the plan when nothing is logged yet (the same basis as the calories)
  const protein = v.any
    ? x.eaten.reduce((a, k) => a + itemNow(d, shown, k).p, 0) + x.extra.reduce((a, e) => a + e.p, 0)
    : m.items.reduce((a, it) => a + it.p, 0);
  const shownMeal: ShownMeal = {
    name: m.n,
    meta: {
      time: shown === now || missed.includes(shown) ? fmtT(m.t).full : text(shown),
      kcal: v.any ? `${v.kcal} kcal eaten` : `${mealKcal(m)} kcal planned`,
      protein: `${protein} g protein`,
    },
    skipped: !!x.skip,
    status: x.skip ? 'skipped' : v.any ? 'logged' : 'todo',
    loggedAt: fmtT(x.at ?? m.t).full,
    items: m.items.map((it, k) => {
      const r = x.repl[k];
      const por = x.por?.[k] ?? 1; const q = !r ? parseQty(it.q) : null;
      return { name: r ? r.n : it.n, amount: r ? '' : q && por !== 1 ? fmtQty(Math.round(q.n * por * 100) / 100, q.unit) : it.q, type: it.type, eaten: x.eaten.includes(k) };
    }),
    extras: x.extra.map((e) => ({ name: e.n, type: e.type, est: e.est })),
  };
  const askMeal = ask ? mealById(ask) : null;
  return (
    <MealsCardPattern state={state} done={t.done} total={MEALS.length}
      pausedLine={`${inr(t.k)} of ${inr(KCAL_TARGET)} kcal, ${t.done} of 4 meals logged`}
      completeLine={`All ${MEALS.length} meals logged today. Protein is at ${t.p} of ${MACRO_TARGET.p} g.`}
      rows={MEALS.map((q) => { const xl = mealLog(d, q.id); const mv = mealView(d, q); return { id: q.id, name: q.n, skipped: !!xl.skip, sub: xl.skip ? 'Skipped' : `${mv.kcal} kcal${xl.at != null ? ', ' + fmtT(xl.at).full : ''}` }; })}
      onOpenMeal={(id) => set({ openMeal: id as MealId })}
      meal={shownMeal}
      ask={askMeal ? { name: askMeal.n, planned: fmtT(askMeal.t).full, more: missed.length - 1 } : undefined}
      onAskLog={() => ask && openLog(ask)()}
      onLogMeal={openLog(shown)} />
  );
}
export { TodayMealNowCard as MealNowCard }; // the old name, so existing imports keep working
