import { router } from 'expo-router';
import { MealId, MEALS } from '@/lib/data';
import { Domain } from '@/lib/domain';
import { nextMeal } from '@/features/today/meals';
import { dayPlan, dietItems, DietRow, freeDay, getP, setP } from './store';

// Entry points shared by the tab, the menus and the pushed pages.

export function startWorkoutEdit(d: Domain): boolean {
  const p = getP();
  const plan = dayPlan(d, p, p.day);
  if (!plan) return false;
  const rows = plan.ex.map((e) => { const n = { ...e }; delete n.hl; return n; });
  setP({ draft: { kind: 'workout', day: p.day, rows, orig: JSON.stringify(rows) }, eiKey: null });
  router.push('/plans/edit');
  return true;
}

export const dietOpenMeal = (d: Domain): MealId => {
  const o = getP().openMeal;
  if (o && o !== 'none') return o;
  return nextMeal(d) ?? 'lu';
};

export function startDietEdit(d: Domain, meal?: MealId) {
  const mid = meal ?? dietOpenMeal(d);
  const rows: DietRow[] = dietItems(d, getP(), mid).map((i) => ({ key: i.key, n: i.n, k: i.k, p: i.p, por: i.por, type: i.type, mine: i.mine }));
  setP({ draft: { kind: 'diet', meal: mid, rows, orig: JSON.stringify(rows) }, eiKey: null });
  router.push('/plans/edit');
}

export function startCreate(d: Domain) {
  const p = getP();
  setP({ cName: '', cEx: [], cErr: '', cDay: freeDay(d, p, dayPlan(d, p, p.day) ? 4 : p.day) });
  router.push('/plans/create');
}

export const mealName = (mid: MealId) => MEALS.find((m) => m.id === mid)?.n ?? 'Meal';
