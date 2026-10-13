import { Meal, MEALS } from '@/lib/data';
import { mealLog, plannedMin, useDomain, workoutState } from '@/lib/domain';
import { useStore } from '@/lib/store';

// The day as a timeline: the workout at the member's time, then breakfast 7:00, lunch 1:00, evening snack 3:30, dinner 8:00.
// "Now" is the event that has just started (from 30 min before it): at 6 the workout, at 7 breakfast, at 1 lunch, at 3 to 4 the snack, at 8 dinner.
// When two overlap, the later one wins. Between events it points at what is next; a skipped workout stays as a gentle nudge.
// Today uses this only to decide which of its existing cards comes first.
export type Focus =
  | { kind: 'live' }
  | { kind: 'restart' }
  | { kind: 'workout'; diff: number }
  | { kind: 'meal'; meal: Meal }
  | { kind: 'late'; diff: number }
  | { kind: 'next'; what: 'workout' | 'meal'; label: string; at: number }
  | { kind: 'wrap' };

const open = (d: Parameters<typeof mealLog>[0], m: Meal) => { const x = mealLog(d, m.id); return !x.skip && x.eaten.length === 0 && x.extra.length === 0; };

export function pickFocus(d: Parameters<typeof mealLog>[0], plan: number, restart: boolean): Focus {
  const now = d.min;
  const st = workoutState(d);
  if (d.session) return { kind: 'live' };
  if (restart && d.todayVariant === 'Comeback') return { kind: 'restart' };
  if (st === 'live') return { kind: 'live' };
  const wkTodo = st === 'todo';
  type Ev = { t: number; end: number; wk?: true; meal?: Meal };
  const evs: Ev[] = [];
  if (wkTodo) evs.push({ t: plan, end: plan + 120, wk: true });
  MEALS.forEach((m) => { if (open(d, m)) evs.push({ t: m.t, end: m.t + 90, meal: m }); });
  const current = evs.filter((e) => now >= e.t - 30 && now <= e.end).sort((a, b) => b.t - a.t)[0];
  if (current) return current.wk ? { kind: 'workout', diff: plan - now } : { kind: 'meal', meal: current.meal! };
  const upcoming = evs.filter((e) => e.t > now).sort((a, b) => a.t - b.t)[0];
  if (wkTodo && now > plan + 120 && now < 1380 && !(upcoming && upcoming.t - now <= 90)) return { kind: 'late', diff: plan - now };
  if (upcoming) return { kind: 'next', what: upcoming.wk ? 'workout' : 'meal', label: upcoming.wk ? 'Workout' : upcoming.meal!.n, at: upcoming.t };
  return { kind: 'wrap' };
}

export function useRightNowFocus(restart = false): Focus {
  const { d } = useDomain();
  const { state } = useStore();
  return pickFocus(d, plannedMin(state.profile.time), restart);
}
