import { useDomain, workoutState } from '@/lib/domain';
import { HISTORY, streakStore, WEEK_TARGET } from './data';

// Everything the streak UI needs, derived from the mock state and today's workout.
export function useStreak() {
  const { d } = useDomain();
  const s = streakStore.use();
  const past = HISTORY[s.mode];
  const today = workoutState(d) === 'done' ? 1 : 0;
  const weekDone = Math.min(WEEK_TARGET, (s.mode === 'New member' ? 0 : s.earlier) + today);
  const kept = weekDone >= WEEK_TARGET;
  let run = 0;
  for (let i = past.length - 1; i >= 0 && past[i]; i--) run++;
  const weeks = run + (kept ? 1 : 0); // this week counts once it is complete
  const left = WEEK_TARGET - weekDone;
  return { mode: s.mode, past, weekDone, kept, weeks, left, target: WEEK_TARGET, fresh: s.mode === 'New member' };
}
