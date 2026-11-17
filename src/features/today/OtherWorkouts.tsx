import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, SkipForward } from '@/lib/icons';
import { Button } from '@/design-system/primitives/Button';
import { Txt } from '@/components/ui';
import { font } from '@/theme/tokens';
import { fixed, fontSizes, gradients, onDark, radii, round } from '@/design-system/tokens';
import { useOverlay } from '@/components/Overlay';
import { fmtT, TODAY_IDX, WEEK } from '@/lib/data';
import { plannedMin, useDomain, wkDoneInfo, workoutState } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { WORKOUT_MIN } from '@/features/workout/session';
import { dayWorkouts, setP, timeMin, usePlans, type DayPlan } from '@/features/plans/store';
import { createStore } from '@/features/progress/store';
import { MISSED_AFTER, missedWkStore, WorkoutCard } from './WorkoutCard';
import { rel } from './meals';
import { WorkoutCard as WorkoutCardPattern } from '@/design-system/patterns/WorkoutCard';

// What the member did about a workout that Today's workout card does not run itself (Leg workout keeps its own: the session and missedWkStore).
export const otherWkStore = createStore(() => ({ answer: null as null | 'moved' | 'skipped' | 'running' }));

// Today's workouts. A day can hold more than one (Coach Vikram adds them). They are all equal: what Today shows follows the clock, the way the Meals card follows meals.
// Each workout is done, skipped, moved, running, missed (planned more than two hours ago and not marked), due (its time has come) or upcoming (its time has not come).
// - nothing upcoming is shown
// - everything settled (done, skipped or moved) is in one completed card, a row each, as long as one of them was done (that card is green)
// - if none was done (all skipped or moved) the same rows sit in a neutral card, with no green
// - a running workout, a missed one (to log it) and the next one that is due each have their own full card; a later workout's card only appears once the ones before it are settled
// - when every workout is missed, skipped or moved (and one is missed) they are one card, a row each
type Status = 'done' | 'skipped' | 'moved' | 'running' | 'missed' | 'due' | 'upcoming';
type Item = { w: DayPlan; index: number; runsSession: boolean; at: number; status: Status };
const settled = (x: Item) => x.status === 'done' || x.status === 'skipped' || x.status === 'moved';

// Marks a workout as done. Leg workout (the one a session runs) goes through the workout log; another is marked in the day's plan.
function useMarkDone() {
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  const { state } = useStore();
  return (it: Item) => {
    if (it.runsSession) { missedWkStore.set({ answer: null }); const wkt = plannedMin(state.profile.time); set({ wkDone: { a: wkt, b: wkt + WORKOUT_MIN, k: 350 } }); }
    else {
      const day = d.plans[TODAY_IDX];
      if (!day?.more) return;
      otherWkStore.set({ answer: null });
      set({ plans: { ...d.plans, [TODAY_IDX]: { ...day, more: day.more.map((m) => (m.name === it.w.name ? { ...m, done: `Done ${m.time} – ${fmtT(timeMin(m.time) + m.mins).full}` } : m)) } } });
    }
    toast(`${it.w.name} marked as done`);
  };
}

// A workout's own full card. Leg workout is drawn by Today's workout card (it is hard-wired to Leg workout and its session); another is the same card from the pattern, in the state it is in.
// Its button opens its page: a session still runs only Leg workout.
function FullCard({ it, place }: { it: Item; place: number }) {
  const { d } = useDomain();
  const { toast } = useOverlay();
  const mark = useMarkDone();
  if (it.runsSession) return <WorkoutCard />;
  const w = it.w;
  const open = () => { haptic.tap(); setP({ day: TODAY_IDX, week: 0, wi: it.index }); router.push('/plans/workout'); };
  const state = it.status === 'running' ? 'live' : it.status === 'missed' ? 'missed' : it.status === 'upcoming' ? 'upcoming' : 'due';
  const next = w.ex[Math.min(2, w.ex.length - 1)]?.name;
  return (
    <WorkoutCardPattern state={state} heading={`Workout ${place} of 2`} name={w.name} time={w.time} when={rel(d, it.at).t}
      meta={[{ kind: 'exercises', text: `${w.ex.length} exercises` }, ...(w.mins ? [{ kind: 'time' as const, text: `~${w.mins} min` }] : [])]}
      live={{ elapsed: '14:20', done: Math.min(2, w.ex.length), total: w.ex.length, next }}
      tomorrow={`${WEEK[TODAY_IDX + 1].d} ${WEEK[TODAY_IDX + 1].num} at ${w.time}`}
      onStart={open} onResume={open} onDidIt={() => mark(it)} onMove={() => { otherWkStore.set({ answer: 'moved' }); toast(`${w.name} moved to tomorrow`); }} onSkip={() => { otherWkStore.set({ answer: 'skipped' }); toast(`${w.name} skipped for today`); }}
      onStartAnyway={() => { otherWkStore.set({ answer: null }); open(); }} />
  );
}

// Everything settled in one card: a row for each workout that is done, skipped or moved.
function CompletedCard({ items, total }: { items: Item[]; total: number }) {
  const { d } = useDomain();
  // one workout done: the card as it always was, "Done at 7:42 am", the name chip, "Workout complete" and its two stats
  if (items.length === 1 && items[0].status === 'done') {
    const x = items[0];
    const info = wkDoneInfo(d);
    const at = x.runsSession ? fmtT(info.b).full : (x.w.done ?? '').split('–')[1]?.trim() ?? x.w.time ?? '';
    const ex = x.runsSession ? info.ex ?? x.w.ex.length : x.w.ex.length;
    const second: [string, string, string] = x.runsSession ? [String(info.k), ' kcal', 'Burned'] : [String(x.w.mins ?? 0), ' min', 'Time'];
    return <WorkoutCardPattern state="done" name={x.w.name} done={{ at, stats: [[String(ex), '', ex === 1 ? 'Exercise' : 'Exercises'], second] }} />;
  }
  const done = items.filter((x) => x.status === 'done');
  const allDone = done.length === items.length; // everything in this card was done
  const everything = allDone && items.length === total; // and nothing is left for the day
  const exercises = done.reduce((n, x) => n + (x.runsSession ? (wkDoneInfo(d).ex ?? x.w.ex.length) : x.w.ex.length), 0);
  const stats: [string, string, string][] = [];
  if (done.length) { stats.push([String(done.length), '', done.length === 1 ? 'Workout' : 'Workouts'], [String(exercises), '', exercises === 1 ? 'Exercise' : 'Exercises']); if (done.some((x) => x.runsSession)) stats.push([String(wkDoneInfo(d).k), ' kcal', 'Burned']); }
  const rows = items.map((x) => ({
    name: x.w.name, status: x.status as 'done' | 'skipped' | 'moved',
    at: x.status === 'done' && x.runsSession ? fmtT(wkDoneInfo(d).a).full : x.w.time ?? '', // the time the workout started
    sub: x.status === 'done' && items.length > 1 ? `${x.runsSession ? (wkDoneInfo(d).ex ?? x.w.ex.length) : x.w.ex.length} exercises` : undefined, // with one row the stats above already say how many
  }));
  return (
    <WorkoutCardPattern state="done" name={items[0].w.name}
      done={{ at: rows[0].at, stats, rows, label: everything ? 'Everything done today' : allDone ? 'Done so far' : 'Settled so far', title: allDone ? (items.length === 1 ? 'Workout complete' : 'Workouts complete') : 'Workouts so far' }} />
  );
}

// Workouts that are not settled well, in one card, a row each: missed ones ask like a missed meal (I did it, Move to tomorrow, Skip); skipped or moved ones say so, with Undo and Start today anyway.
// Used when every workout is missed, skipped or moved. No green here: green is for a workout that was done.
function UnsettledCard({ items, grey }: { items: Item[]; grey?: boolean }) {
  const { toast } = useOverlay();
  const mark = useMarkDone();
  const answer = (it: Item, a: 'moved' | 'skipped' | null) => (it.runsSession ? missedWkStore.set({ answer: a }) : otherWkStore.set({ answer: a }));
  const open = (it: Item) => { haptic.tap(); setP({ day: TODAY_IDX, week: 0, wi: it.index }); router.push('/plans/workout'); };
  const W60 = 'rgba(255,255,255,0.65)';
  const anyMissed = !grey && items.some((x) => x.status === 'missed');
  return (
    <View accessibilityLabel={items.map((it) => `${it.w.name} ${it.status}`).join(', ')} style={{ borderRadius: radii.card, padding: 16, gap: 14, overflow: 'hidden', borderWidth: anyMissed ? 1.5 : 1, borderColor: anyMissed ? 'rgba(242,179,91,0.28)' : 'rgba(255,255,255,0.12)' }}>
      <LinearGradient colors={(anyMissed ? gradients.workoutMissed : gradients.workoutRest) as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      {items.map((it, i) => {
        const missed = it.status === 'missed';
        return (
          <View key={it.w.name} style={[{ gap: 10 }, i > 0 ? { borderColor: 'rgba(255,255,255,0.22)', borderStyle: 'dashed', borderTopWidth: 1, paddingTop: 14 } : null]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: round(36), backgroundColor: missed ? 'rgba(242,179,91,0.16)' : 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                {missed ? <Clock size={18} color={onDark.amber} /> : <SkipForward size={18} color={fixed.white} />}
              </View>
              <View style={{ flex: 1 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24, color: fixed.white }}>{missed ? `Did you do ${it.w.name}?` : it.status === 'moved' ? `${it.w.name} moved to tomorrow` : `${it.w.name} skipped`}</Txt>
                <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: W60 }}>{missed ? `It was planned for ${it.w.time}.` : `Back tomorrow at ${it.w.time}.`}</Txt>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {missed ? (
                <>
                  <Button kind="white" size="small" label="I did it" onPress={() => mark(it)} />
                  <Button kind="glassClear" size="small" label="Move to tomorrow" onPress={() => { answer(it, 'moved'); toast(`${it.w.name} moved to tomorrow`); }} />
                  <Button kind="glassClear" size="small" label="Skip" onPress={() => { answer(it, 'skipped'); toast(`${it.w.name} skipped for today`); }} />
                </>
              ) : (
                <>
                  <Button kind="white" size="small" label="Undo" onPress={() => answer(it, null)} />
                  <Button kind="glassClear" size="small" label="Start today anyway" onPress={() => { answer(it, null); open(it); }} />
                </>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function TodayWorkouts() {
  const { d } = useDomain();
  const { p } = usePlans();
  const { state } = useStore();
  const answer = missedWkStore.use().answer; // hooks: they run on every render, not inside a condition
  const otherAnswer = otherWkStore.use().answer;
  const list = d.hasGym ? dayWorkouts(d, { ...p, week: 0 }, TODAY_IDX) : [];
  const mainState = workoutState(d);
  if (list.length < 2 || mainState === 'hidden' || mainState === 'rest') return <WorkoutCard />;
  const wkt = plannedMin(state.profile.time);
  const items: Item[] = list.map((w, index) => {
    const runsSession = !w.extra; // the one a session runs (Leg workout)
    const at = runsSession ? wkt : timeMin(w.time);
    let status: Status;
    if (runsSession ? mainState === 'done' : !!w.done) status = 'done';
    else if (runsSession && mainState === 'live') status = 'running';
    else if (runsSession && answer) status = answer;
    else if (!runsSession && otherAnswer && !(otherAnswer === 'running' && mainState === 'live')) status = otherAnswer;
    else if (d.min - at > MISSED_AFTER) status = 'missed';
    else status = d.min >= at - 15 ? 'due' : 'upcoming';
    return { w, index, runsSession, at, status };
  }).sort((a, b) => a.at - b.at);
  // every workout is missed, skipped or moved (and at least one is missed): one card for all of them
  const unresolved = items.filter((x) => x.status === 'missed' || x.status === 'skipped' || x.status === 'moved');
  if (unresolved.length === items.length && items.some((x) => x.status === 'missed')) return <UnsettledCard items={items} />;
  const settledItems = items.filter(settled);
  // a due workout shows only once every workout before it is settled
  const firstDue = items.find((x) => x.status === 'due' && items.every((y) => y.at >= x.at || settled(y)));
  const missedItems = items.filter((x) => x.status === 'missed');
  const own = items.filter((x) => x.status === 'running' || x === firstDue);
  // nothing else to show: the next workout of the day gets its card, so Today is never empty
  if (own.length === 0 && settledItems.length === 0 || (own.length === 0 && missedItems.length > 0)) { const next = items.find((x) => x.status === 'upcoming'); if (next) own.push(next); }
  // a missed workout sits in a grey card above the card that is showing; alone, it has its own full card to log it
  const missedAbove = missedItems.length > 0 && own.length > 0;
  if (!missedAbove) own.unshift(...missedItems);
  return (
    <View style={{ gap: 12 }}>
      {settledItems.length > 0 && (settledItems.some((x) => x.status === 'done') ? <CompletedCard items={settledItems} total={items.length} /> : <UnsettledCard items={settledItems} grey />)}
      {missedAbove && <UnsettledCard items={missedItems} grey />}
      {own.map((it) => <FullCard key={it.w.name} it={it} place={items.indexOf(it) + 1} />)}
    </View>
  );
}
