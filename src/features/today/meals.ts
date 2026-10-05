import { dur, fmtT, Meal, MealId, MEALS } from '@/lib/data';
import { Domain, itemNow, mealLog, nowMin } from '@/lib/domain';

export const mealKcal = (m: Meal) => m.items.reduce((a, x) => a + x.k, 0);
export const mealById = (id: MealId) => MEALS.find((m) => m.id === id)!;

// "In 2 h", "Now", "40 min late"
export function rel(d: Domain, t: number) {
  const diff = t - nowMin(d);
  if (Math.abs(diff) <= 10) return { t: 'Now', late: false };
  if (diff > 0) return { t: `In ${dur(diff)}`, late: false };
  return { t: `${dur(-diff)} late`, late: true };
}

// The next meal with nothing logged: shows the "now" capsule and opens by default.
export function nextMeal(d: Domain): MealId | null {
  const m = MEALS.find((q) => { const x = mealLog(d, q.id); return !x.skip && x.eaten.length === 0 && x.extra.length === 0; });
  return m ? m.id : null;
}

export type MealView = {
  meal: Meal; full: boolean; any: boolean; kcal: number; status: string; tone: 'muted' | 'good' | 'warn';
  badge: 'done' | 'part' | 'off' | null; isNext: boolean;
};

export function mealView(d: Domain, m: Meal): MealView {
  const x = mealLog(d, m.id);
  const full = x.eaten.length === m.items.length;
  const any = x.eaten.length + x.extra.length > 0;
  let kcal = 0;
  x.eaten.forEach((k) => (kcal += itemNow(d, m.id, k).k));
  x.extra.forEach((e) => (kcal += e.k));
  const at = fmtT(x.at ?? m.t).full;
  const isNext = nextMeal(d) === m.id;
  if (x.skip) return { meal: m, full, any, kcal, status: `Skipped · planned ${mealKcal(m)} kcal`, tone: 'muted', badge: 'off', isNext };
  if (full && !x.extra.length) return { meal: m, full, any, kcal, status: `Eaten ${at}`, tone: 'good', badge: 'done', isNext };
  if (any) return { meal: m, full, any, kcal, status: `Eaten ${at} · ${x.eaten.length}/${m.items.length}${x.extra.length ? ` +${x.extra.length}` : ''}`, tone: 'good', badge: full ? 'done' : 'part', isNext };
  const r = rel(d, m.t);
  return { meal: m, full, any, kcal: mealKcal(m), status: r.t, tone: r.late ? 'warn' : 'muted', badge: null, isNext };
}
