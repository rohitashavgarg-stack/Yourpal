import React from 'react';
import { router } from 'expo-router';
import { coachStore } from '@/features/coach/coach';
import { useOverlay } from '@/components/Overlay';
import { fmtT, TODAY_IDX, WEEK } from '@/lib/data';
import { timeMin } from '@/features/plans/store';
import { burned, plannedMin, useDomain, wkDoneInfo, workoutState } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { mmss, useNow } from '@/lib/useNow';
import { useStartWorkout } from '@/features/workout/StartSheet';
import { buildExercises, WORKOUT_MIN } from '@/features/workout/session';
import { rel } from './meals';
import { useLogGate } from '@/lib/logGate';
import { createStore } from '@/features/progress/store';
import { toastCopy } from '@/lib/microcopy';
import { WorkoutCard as WorkoutCardPattern, WorkoutCardState } from '@/design-system/patterns/WorkoutCard';

// What the member said about a missed workout (kept for the day): moved to tomorrow or skipped. "I did it" logs it as done instead.
export const missedWkStore = createStore(() => ({ answer: null as null | 'moved' | 'skipped' }));
export const MISSED_AFTER = 120;

// Today's workout. The look of every state is the pattern in src/design-system/patterns/WorkoutCard.tsx; this reads the member's day and picks the state.
// restart: after a break the card is still there (it is otherwise hidden) and offers the easy restart session.
export function TodayWorkoutCard({ restart = false }: { restart?: boolean } = {}) {
  const { d, set } = useDomain();
  const { state } = useStore();
  const WKT = plannedMin(state.profile.time); // from the time of day chosen in onboarding
  const start = useStartWorkout();
  const { gate, paused } = useLogGate();
  const startWorkout = gate(() => start());
  const st0 = workoutState(d);
  const ms = missedWkStore.use();
  const { toast } = useOverlay();
  const cs = coachStore.use();
  const st = restart && st0 === 'hidden' ? 'todo' : st0;
  const now = useNow(st === 'live', 1000);
  if (st === 'hidden') return null;
  const comeback = restart && st0 === 'hidden';
  const name = comeback ? 'Comeback plan' : 'Leg workout';
  const time = comeback ? undefined : fmtT(WKT).full;
  const meta = comeback ? [] : [{ kind: 'exercises' as const, text: `${buildExercises().length} exercises` }, { kind: 'time' as const, text: `~${WORKOUT_MIN} min` }];
  // while logging is paused nothing can be answered or started: the card just shows the plan
  const missed = !paused && st === 'todo' && !comeback && d.min - WKT > MISSED_AFTER;
  const didIt = gate(() => { set({ wkDone: { a: WKT, b: WKT + WORKOUT_MIN, k: 350 } }); toast(toastCopy.workoutLogged, { undo: () => set({ wkDone: null }) }); });
  const answer = gate((a: 'moved' | 'skipped') => { missedWkStore.set({ answer: a }); toast(a === 'moved' ? toastCopy.workoutMoved : toastCopy.workoutSkipped, { undo: () => missedWkStore.set({ answer: null }) }); });
  const burnedKcal = d.hc && d.wearable ? burned(d) : undefined;
  // a day with a second workout (added by Coach Vikram): if it was planned earlier and is not marked, the card asks about it
  const other = comeback ? undefined : d.plans[TODAY_IDX]?.more?.[0];
  // each card says its place in the day, in time order
  const placeInDay = other ? (timeMin(other.time) < WKT ? 2 : 1) : 0;
  const heading = other ? `Workout ${placeInDay} of 2` : undefined;

  let ps: WorkoutCardState;
  if (paused && (st === 'todo' || st === 'live')) ps = 'paused';
  else if ((missed || (comeback && ms.answer === 'skipped')) && ms.answer) ps = ms.answer;
  else if (st === 'rest') ps = 'rest';
  else if (st === 'done') ps = 'done';
  else if (st === 'live' && d.session) ps = 'live';
  else if (missed) ps = 'missed';
  else if (comeback) ps = 'comeback';
  else ps = d.min >= WKT - 15 ? 'due' : 'upcoming';

  let live, done;
  if (ps === 'live' && d.session) {
    const ex = d.session.ex;
    const doneEx = ex.filter((e) => e.sets.every((x) => x.st !== 'todo')).length;
    const next = ex.find((e) => e.sets.some((x) => x.st === 'todo'));
    live = { elapsed: mmss((now - d.session.startAt) / 1000).padStart(5, '0'), done: doneEx, total: ex.length, next: next?.name };
  }
  if (ps === 'done') {
    const info = wkDoneInfo(d);
    done = { at: fmtT(info.b).full, stats: [[String(info.ex ?? buildExercises().length), '', info.ex === 1 ? 'Exercise' : 'Exercises'], [String(info.k), ' kcal', 'Burned']] as [string, string, string][] };
    // a day with two workouts and both are done: one card that lists both, with the totals
    if (other?.done) {
      const total = (info.ex ?? buildExercises().length) + other.ex.length;
      const end = (other.done.split('–')[1] ?? other.time).trim();
      const rows = [{ name: other.name, at: end, t: timeMin(other.time), sub: `${other.ex.length} exercises` }, { name: 'Leg workout', at: fmtT(info.b).full, t: WKT, sub: `${info.ex ?? buildExercises().length} exercises` }].sort((a, b) => a.t - b.t).map(({ name, at, sub }) => ({ name, at, sub }));
      done = { at: fmtT(info.b).full, stats: [['2', '', 'Workouts'], [String(total), '', 'Exercises'], [String(info.k), ' kcal', 'Burned']] as [string, string, string][], rows };
    }
  }
  return (
    <WorkoutCardPattern state={ps} name={name} time={time} when={rel(d, WKT).t} meta={meta} heading={heading} coachUnread={cs.unread} onOpenCoach={() => router.push('/coach')}
      burned={burnedKcal} live={live} done={done} restNext={`Next: Pull, Thu ${fmtT(WKT).full}`} tomorrow={`${WEEK[TODAY_IDX + 1].d} ${WEEK[TODAY_IDX + 1].num} at ${fmtT(WKT).full}`}
      onStart={() => startWorkout()} onResume={() => router.push('/workout')} onDidIt={didIt} onMove={() => answer('moved')} onSkip={() => answer('skipped')}
      onStartAnyway={() => { missedWkStore.set({ answer: null }); startWorkout(); }} onUndo={() => missedWkStore.set({ answer: null })} onNotToday={() => answer('skipped')} />
  );
}
export { TodayWorkoutCard as WorkoutCard }; // the old name, so existing imports keep working
