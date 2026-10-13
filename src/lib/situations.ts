import { bucketOf, Domain, mealsFor, useDomain } from '@/lib/domain';
import { streakStore, StreakMode } from '@/features/streak/data';

// What can be true at the same time.
//
// Facts about the member combine freely: time of day, member type, gym or not, Health and wearable, membership (payment), theme, offline.
// A SITUATION is one thing at a time, and choosing it sets everything it implies, so the app never shows a day that could not happen
// (a comeback with a finished workout, a rest day with a workout running, a "new member" with a 7-week streak).
// Payment (Membership) is the one overlay that works on top of any situation: a lapsed member can also be coming back.
export type Situation = 'Normal day' | 'With updates' | 'Comeback' | 'Workout done' | 'Rest day' | 'New member';
export const SITUATIONS: Situation[] = ['Normal day', 'With updates', 'Comeback', 'Workout done', 'Rest day', 'New member'];

// Shown next to the chips so it is clear what a choice does.
export const SITUATION_HINT: Record<Situation, string> = {
  'Normal day': 'Nothing special. Workout still to do this evening.',
  'With updates': 'An active member with coach and plan updates waiting.',
  Comeback: 'Away for days: no workout, no check-in, nothing logged today, streak paused.',
  'Workout done': 'Checked in and finished. Right now moves on to meals.',
  'Rest day': 'No workout planned. A walk, steps and water instead.',
  'New member': 'First days: no streak and no history yet.',
};

const NOT_AT_GYM = { ci: 'Away' as const, ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null };
const clean = { wkScenario: 'Not started' as const, wkDone: null, session: null, loading: false, dismissed: {} as Domain['dismissed'] };

// The full set of values a situation implies, plus a fitting time of day.
export function situationPatch(s: Situation, d: Domain): { patch: Partial<Domain>; streak: { mode: StreakMode; earlier: number } } {
  const at = (min: number): Partial<Domain> => ({ min, time: bucketOf(min), meals: mealsFor(bucketOf(min)), openMeal: null });
  switch (s) {
    case 'With updates':
      return { patch: { ...clean, ...at(1100), todayVariant: 'With updates', water: 1.8 }, streak: { mode: 'Active', earlier: 1 } };
    case 'Comeback':
      return { patch: { ...clean, ...NOT_AT_GYM, ...at(480), todayVariant: 'Comeback', water: 0, planReq: 'none' }, streak: { mode: 'Active', earlier: 0 } };
    case 'Workout done': {
      // checked in earlier and finished: the check-in times match the default workout (6:18 to 7:28 pm)
      return { patch: { ...clean, ...at(1230), todayVariant: 'Regular', wkScenario: 'Done', ci: 'Checked in', ciAt: 1098, ciStart: Date.now() - 132 * 60000, ciOut: { at: 1168, mins: 70 }, ciExtend: 0, ciHold: null, water: 2.2 }, streak: { mode: 'Active', earlier: 2 } };
    }
    case 'Rest day':
      return { patch: { ...clean, ...NOT_AT_GYM, ...at(600), todayVariant: 'Regular', wkScenario: 'Rest day', water: 0.5 }, streak: { mode: 'Active', earlier: 1 } };
    case 'New member':
      return { patch: { ...clean, ...NOT_AT_GYM, ...at(540), todayVariant: 'Regular', water: 0, weightLog: [] }, streak: { mode: 'New member', earlier: 0 } };
    default:
      return { patch: { ...clean, ...at(1100), todayVariant: 'Regular', ci: d.ci === 'Away' ? 'At the gym' : d.ci, water: 1.8 }, streak: { mode: 'Active', earlier: 1 } };
  }
}

export function currentSituation(d: Domain, streak: StreakMode): Situation {
  if (d.todayVariant === 'Comeback') return 'Comeback';
  if (streak === 'New member') return 'New member';
  if (d.wkScenario === 'Rest day') return 'Rest day';
  if (d.wkDone || d.wkScenario === 'Done') return 'Workout done';
  if (d.todayVariant === 'With updates') return 'With updates';
  return 'Normal day';
}

export function useSituation() {
  const { d, set } = useDomain();
  const streak = streakStore.use().mode;
  const current = currentSituation(d, streak);
  const pick = (s: Situation) => {
    const { patch, streak: st } = situationPatch(s, d);
    streakStore.set(st);
    set({ ...patch, autoNote: '' });
  };
  return { current, pick };
}
