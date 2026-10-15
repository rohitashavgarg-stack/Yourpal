import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check, Flame } from '@/lib/icons';
import { Chip, Row, Txt } from '@/components/ui';
import { PersonAvatar } from '@/components/Brand';
import { coachStore } from '@/features/coach/coach';
import { useOverlay } from '@/components/Overlay';
import { Pressy } from '@/components/ui';
import { fmtT } from '@/lib/data';
import { burned, plannedMin, useDomain, wkDoneInfo, workoutState } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { font } from '@/theme/tokens';
import { mmss, useNow } from '@/lib/useNow';
import { useStartWorkout } from '@/features/workout/StartSheet';
import { buildExercises, WORKOUT_MIN } from '@/features/workout/session';
import { rel } from './meals';
import { createStore } from '@/features/progress/store';


// What the member said about a missed workout (kept for the day): moved to tomorrow or skipped. "I did it" logs it as done instead.
export const missedWkStore = createStore(() => ({ answer: null as null | 'moved' | 'skipped' }));
export const MISSED_AFTER = 120;

function Tile({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <View style={{ flex: 1, gap: 2, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.07)' }}>
      <Txt style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{k}</Txt>
      <Txt style={{ fontFamily: font.semibold, color: color ?? '#fff' }}>{v}</Txt>
    </View>
  );
}

// Dark card, same layout in every state: Now / late / In progress / Done / Rest day.
// restart: after a break the card is still there (it is otherwise hidden) and offers the easy restart session.
export function WorkoutCard({ restart = false }: { restart?: boolean } = {}) {
  const { d, set } = useDomain();
  const { state } = useStore();
  const WKT = plannedMin(state.profile.time); // from the time of day chosen in onboarding
  const startWorkout = useStartWorkout();
  const st0 = workoutState(d);
  const ms = missedWkStore.use();
  const { toast } = useOverlay();
  const st = restart && st0 === 'hidden' ? 'todo' : st0;
  const cs = coachStore.use();
  const now = useNow(st === 'live', 1000);
  if (st === 'hidden') return null;
  const missed = st === 'todo' && !restart && d.min - WKT > MISSED_AFTER;
  const answered = missed ? ms.answer : null;
  const ask = missed && !answered;
  const didIt = () => { set({ wkDone: { a: WKT, b: WKT + WORKOUT_MIN, k: 350 } }); toast('Logged as done', { undo: () => set({ wkDone: null }) }); };
  const answer = (a: 'moved' | 'skipped') => { missedWkStore.set({ answer: a }); toast(a === 'moved' ? 'Moved to tomorrow. Coach Vikram is told.' : 'Skipped today', { undo: () => missedWkStore.set({ answer: null }) }); };
  const done = wkDoneInfo(d);
  const elapsed = d.session ? mmss((now - d.session.startAt) / 1000).padStart(5, '0') : '';
  const chip = answered === 'moved' ? 'Moved' : answered === 'skipped' ? 'Skipped' : missed ? 'Missed' : st === 'done' ? 'Done' : st === 'rest' ? 'Rest' : st === 'live' ? 'In progress' : restart && st0 === 'hidden' ? 'Today' : d.min - WKT > 120 ? 'Still on for today' : rel(d, WKT).t;
  const live = st === 'done' || st === 'live';
  const chips = st === 'rest' ? ['Recovery day', `Next: Pull · Thu ${fmtT(WKT).full}`] : restart && st0 === 'hidden' ? ['5 exercises', '~30 min', 'Lighter weights'] : [`${buildExercises().length} exercises`, `~${WORKOUT_MIN} min`, ...(d.hc && d.wearable ? ['~350 kcal'] : [])];
  const did = answered === 'moved' ? 'Moved to tomorrow' : answered === 'skipped' ? 'Skipped today' : st === 'done' ? `${fmtT(done.a).hm} – ${fmtT(done.b).full}` : st === 'live' ? `Started · ${elapsed}` : st === 'rest' ? 'A walk counts' : 'Not yet';
  const cta = answered ? null : ask ? null : st === 'todo' ? (restart && st0 === 'hidden' ? 'Start my comeback plan' : 'Start workout') : st === 'live' ? 'Resume workout' : null;
  const mins = Math.max(1, Math.round(done.b - done.a));
  const onCta = () => (st === 'live' ? router.push('/workout') : startWorkout());

  return (
    <View accessibilityLabel="Today's workout" style={{ borderRadius: 24, backgroundColor: '#0B0E14', padding: 16, gap: 12, overflow: 'hidden' }}>
      <LinearGradient colors={['#0B0E14', '#0E1B45', '#13327A']} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View pointerEvents="none" style={{ position: 'absolute', right: -70, top: -80, width: 220, height: 220, borderRadius: 110, borderWidth: 14, borderColor: 'rgba(255,255,255,0.06)' }} />
      <View pointerEvents="none" style={{ position: 'absolute', right: -30, top: -40, width: 140, height: 140, borderRadius: 70, borderWidth: 10, borderColor: 'rgba(255,255,255,0.05)' }} />
      <Row style={{ justifyContent: 'space-between', gap: 8 }}>
        <Pressy accessibilityRole="button" accessibilityLabel="Coach Vikram. Open your coach" onPress={() => router.push('/coach')} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          {st !== 'rest' && <View><PersonAvatar who="coach" size={26} />{cs.unread && <View accessibilityLabel="Unread reply" style={{ position: 'absolute', right: -1, top: -1, width: 9, height: 9, borderRadius: 5, backgroundColor: '#7CF0C8', borderWidth: 1.5, borderColor: '#0B0E14' }} />}</View>}
          <View style={{ flexShrink: 1 }}>
            <Txt style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Today's workout</Txt>
            {st !== 'rest' && <Txt style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Planned by Coach Vikram</Txt>}
          </View>
        </Pressy>
        <Chip label={chip} onDark tone={live ? 'live' : missed && !answered ? 'warn' : 'default'} style={live ? { borderColor: 'rgba(124,240,200,0.5)' } : undefined} />
      </Row>
      {st === 'done' ? (
        <>
          <Row style={{ gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#7CF0C8', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={26} strokeWidth={3} color="#0B0E14" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1, lineHeight: 36, color: '#fff' }}>Workout complete</Txt>
              <Txt style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Leg day · nice work</Txt>
            </View>
          </Row>
          <Row style={{ gap: 8 }}>
            <Tile k="Time" v={`${mins} min`} color="#7CF0C8" />
            <Tile k="Finished" v={fmtT(done.b).full} color="#7CF0C8" />
          </Row>
        </>
      ) : (
        <>
          <Txt style={{ fontFamily: font.regular, fontSize: 40, letterSpacing: -1.8, lineHeight: 42, color: '#fff' }}>{st === 'rest' ? 'Rest day' : restart && st0 === 'hidden' ? 'Comeback plan' : 'Leg day'}</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>{chips.map((t) => <Chip key={t} label={t} onDark />)}</Row>
          <Row style={{ gap: 8 }}>
            <Tile k="Planned" v={st === 'rest' ? 'No workout' : restart && st0 === 'hidden' ? 'Whenever you are ready' : fmtT(WKT).full} />
            <Tile k="You did it" v={did} color={live ? '#7CF0C8' : 'rgba(255,255,255,0.6)'} />
          </Row>
        </>
      )}
      {ask && (
        <View style={{ gap: 10 }}>
          <Txt style={{ fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.85)' }}>Did you train without the app, or should it move?</Txt>
          <Row style={{ gap: 8, flexWrap: 'wrap' }}>
            <Pressy accessibilityRole="button" onPress={didIt} style={{ height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: '#0B0E14' }}>I did it</Txt>
            </Pressy>
            <Pressy accessibilityRole="button" onPress={() => answer('moved')} style={{ height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: '#fff' }}>Move to tomorrow</Txt>
            </Pressy>
            <Pressy accessibilityRole="button" onPress={() => answer('skipped')} style={{ height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: '#fff' }}>Skip today</Txt>
            </Pressy>
          </Row>
          <Pressy accessibilityRole="button" onPress={onCta} hitSlop={8} style={{ alignSelf: 'flex-start', paddingVertical: 4 }}>
            <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.7)', textDecorationLine: 'underline' }}>Start it now anyway</Txt>
          </Pressy>
        </View>
      )}
      {cta && (
        <Pressy accessibilityRole="button" onPress={onCta} style={{ height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 15, color: '#0B0E14' }}>{cta}</Txt>
        </Pressy>
      )}
      {d.hc && d.wearable && (
      <Row style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
        <Flame size={15} color="#fff" />
        <Txt style={{ flex: 1, fontSize: 13, color: '#fff' }}>Burned today <Txt style={{ fontFamily: font.monoBold, fontSize: 13, color: '#fff' }}>{burned(d)}</Txt> kcal</Txt>
        <Txt style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>From your watch</Txt>
      </Row>
      )}
    </View>
  );
}
