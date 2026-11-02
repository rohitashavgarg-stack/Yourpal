import { MEALS } from '@/lib/data';
import type { Domain } from '@/lib/domain';
import { fmtClock } from '@/features/plans/TimeSheet';
import { DAYL, dateOf, dayPlan, dietItems, dietTotals, exSub, monthOf, PlansState } from '@/features/plans/store';
import { sharePdf } from '@/features/reports/pdf';
import { dietPlanHtml, workoutPlanHtml } from '@/features/reports/templates';

const made = () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** The whole week of workouts as a PDF. Returns false when the phone cannot share files. */
export function downloadWorkoutPlan(d: Domain, p: PlansState, member: string) {
  const days = DAYL.map((_, i) => {
    const pl = dayPlan(d, p, i);
    return {
      day: `${DAYL[i]} ${dateOf(i, p.week)} ${monthOf(i, p.week)}`,
      name: pl ? pl.name : 'Rest day',
      time: pl?.time,
      warm: (pl?.wu ?? []).map((x) => x.n),
      cool: (pl?.cd ?? []).map((x) => x.n),
      ex: (pl?.ex ?? []).map((e) => ({ n: e.name, line: exSub(e) })),
    };
  });
  return sharePdf(workoutPlanHtml({ member, gym: 'Wulf Fitness', made: made(), days }), 'Workout plan');
}

/** The day's meals as a PDF, for the diet type the member follows. */
export function downloadDietPlan(d: Domain, p: PlansState, member: string) {
  const meals = MEALS.map((m) => ({
    n: m.n,
    time: fmtClock(m.t),
    items: dietItems(d, p, m.id).filter((i) => i.st !== 'skipped').map((i) => ({ n: i.n, kcal: Math.round(i.k * i.por), macros: `Protein ${Math.round(i.p * i.por)} g, carbs ${Math.round(i.c * i.por)} g, fat ${Math.round(i.f * i.por)} g` })),
  }));
  return sharePdf(dietPlanHtml({ member, gym: 'Wulf Fitness', made: made(), diet: p.diet, meals, totalKcal: Math.round(dietTotals(d, p).plan) }), 'Diet plan');
}
