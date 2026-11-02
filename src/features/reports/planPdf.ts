import { MEALS } from '@/lib/data';
import type { Domain } from '@/lib/domain';
import { fmtClock } from '@/features/plans/TimeSheet';
import { DAYL, dateOf, dayPlan, dietItems, exSub, monthOf, PlansState } from '@/features/plans/store';
import { sharePdf } from '@/features/reports/pdf';
import { dietPlanHtml, workoutPlanHtml } from '@/features/reports/templates';

const made = () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** The whole workout plan: all seven days (rest days too), each with its warm-up, exercises and cool-down. Returns false when the phone cannot share files. */
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

/** The whole diet plan: every meal and every food in it as the coach set it (not what was eaten today), with the total for the day. */
export function downloadDietPlan(d: Domain, p: PlansState, member: string) {
  const meals = MEALS.map((m) => ({
    n: m.n,
    time: fmtClock(m.t),
    items: dietItems(d, p, m.id).filter((i) => i.kind === 'plan').map((i) => ({ n: i.n, kcal: Math.round(i.k * i.por), macros: `Protein ${Math.round(i.p * i.por)} g, carbs ${Math.round(i.c * i.por)} g, fat ${Math.round(i.f * i.por)} g` })),
  }));
  return sharePdf(dietPlanHtml({ member, gym: 'Wulf Fitness', made: made(), diet: p.diet, meals, totalKcal: meals.reduce((t, m) => t + m.items.reduce((a, i) => a + i.kcal, 0), 0) }), 'Diet plan');
}
