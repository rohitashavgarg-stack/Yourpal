import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CalendarClock, Check, Clock, Flame, Lock, Moon, X } from '@/lib/icons';
import { Chip, Pressy, Row, Txt } from '@/components/ui';
import { PersonAvatar } from '@/components/Brand';
import { coachStore } from '@/features/coach/coach';
import { useOverlay } from '@/components/Overlay';
import { fmtT } from '@/lib/data';
import { burned, plannedMin, useDomain, wkDoneInfo, workoutState } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { font } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { mmss, useNow } from '@/lib/useNow';
import { useStartWorkout } from '@/features/workout/StartSheet';
import { buildExercises, WORKOUT_MIN } from '@/features/workout/session';
import { rel } from './meals';
import { useLogGate } from '@/lib/logGate';
import { createStore } from '@/features/progress/store';

// What the member said about a missed workout (kept for the day): moved to tomorrow or skipped. "I did it" logs it as done instead.
export const missedWkStore = createStore(() => ({ answer: null as null | 'moved' | 'skipped' }));
export const MISSED_AFTER = 120;

const MINT = '#7CF0C8';
const AMBER = '#F2B35B';
const LILAC = '#B9A8FF';
const W60 = 'rgba(255,255,255,0.65)';

// The coach line at the top of the card (with the unread dot for a coach reply).
function Coach({ dim = false }: { dim?: boolean }) {
  const cs = coachStore.use();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Today's workout, planned by Coach Vikram. Open your coach" onPress={() => router.push('/coach')} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, opacity: dim ? 0.7 : 1 }}>
      <View><PersonAvatar who="coach" size={34} />{cs.unread && <View accessibilityLabel="Unread reply" style={{ position: 'absolute', right: -1, top: -1, width: 9, height: 9, borderRadius: 5, backgroundColor: MINT }} />}</View>
      <View style={{ flexShrink: 1 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22, color: '#fff' }}>{"Today's workout"}</Txt>
        <Txt style={{ fontSize: 12.5, lineHeight: 18, color: W60 }}>Planned by Coach Vikram</Txt>
      </View>
    </Pressy>
  );
}

// The workout name with its time as a small pill right after it.
function Title({ name, time, tone = 'default' }: { name: string; time?: string; tone?: 'default' | 'missed' }) {
  const missed = tone === 'missed';
  return (
    <Row style={{ gap: 10, flexWrap: 'wrap' }}>
      <Txt style={{ fontFamily: font.regular, fontSize: 34, lineHeight: 42, letterSpacing: -1.4, color: missed ? 'rgba(255,255,255,0.75)' : '#fff' }}>{name}</Txt>
      {!!time && (
        <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: missed ? 'rgba(242,179,91,0.14)' : 'rgba(255,255,255,0.12)', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: missed ? AMBER : '#fff', textDecorationLine: missed ? 'line-through' : 'none' }}>{time}</Txt>
        </View>
      )}
    </Row>
  );
}

const Btn = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressy accessibilityRole="button" onPress={onPress} style={{ height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
    <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: '#0B0E14' }}>{label}</Txt>
  </Pressy>
);
const SmallBtn = ({ label, onPress, solid = false }: { label: string; onPress: () => void; solid?: boolean }) => (
  <Pressy accessibilityRole="button" onPress={onPress} style={{ height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: solid ? '#fff' : 'rgba(255,255,255,0.12)', justifyContent: 'center' }}>
    <Txt style={{ fontFamily: solid ? font.semibold : font.medium, fontSize: 14, lineHeight: 20, color: solid ? '#0B0E14' : '#fff' }}>{label}</Txt>
  </Pressy>
);
const LiveDot = () => <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: MINT }} />;

function Shell({ colors, edge, children, compact = false, label }: { colors: string[]; edge?: string; children: React.ReactNode; compact?: boolean; label: string }) {
  return (
    <View accessibilityLabel={label} style={{ borderRadius: 24, padding: 16, paddingVertical: compact ? 14 : 16, gap: 12, overflow: 'hidden', borderWidth: edge ? 1.5 : 0, borderColor: edge }}>
      <LinearGradient colors={colors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      {!compact && <View pointerEvents="none" style={{ position: 'absolute', right: -70, top: -80, width: 220, height: 220, borderRadius: 110, borderWidth: 14, borderColor: 'rgba(255,255,255,0.05)' }} />}
      {children}
    </View>
  );
}

// Today's workout, one look per state: upcoming, due now, in progress, missed, completed, rest day, and a small row once it was moved or skipped.
// restart: after a break the card is still there (it is otherwise hidden) and offers the easy restart session.
export function WorkoutCard({ restart = false }: { restart?: boolean } = {}) {
  const { d, set } = useDomain();
  const { state } = useStore();
  const WKT = plannedMin(state.profile.time); // from the time of day chosen in onboarding
  const start = useStartWorkout();
  const { gate, paused } = useLogGate();
  const startWorkout = gate(() => start());
  const st0 = workoutState(d);
  const ms = missedWkStore.use();
  const { toast } = useOverlay();
  const { c } = useTheme();
  const st = restart && st0 === 'hidden' ? 'todo' : st0;
  const now = useNow(st === 'live', 1000);
  if (st === 'hidden') return null;
  const comeback = restart && st0 === 'hidden';
  const name = comeback ? 'Comeback plan' : 'Leg day';
  const time = comeback ? undefined : fmtT(WKT).full;
  const chips = comeback ? ['5 exercises', '~30 min', 'Lighter weights'] : [`${buildExercises().length} exercises`, `~${WORKOUT_MIN} min`];
  // while logging is paused nothing can be answered or started: the card just shows the plan
  const missed = !paused && st === 'todo' && !comeback && d.min - WKT > MISSED_AFTER;
  const didIt = gate(() => { set({ wkDone: { a: WKT, b: WKT + WORKOUT_MIN, k: 350 } }); toast('Logged as done', { undo: () => set({ wkDone: null }) }); });
  const answer = gate((a: 'moved' | 'skipped') => { missedWkStore.set({ answer: a }); toast(a === 'moved' ? 'Moved to tomorrow. Coach Vikram is told.' : 'Skipped today', { undo: () => missedWkStore.set({ answer: null }) }); });
  const burnedRow = d.hc && d.wearable ? (
    <Row style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
      <Flame size={15} color="#fff" />
      <Txt style={{ flex: 1, fontSize: 13, lineHeight: 19, color: '#fff' }}>Burned today <Txt style={{ fontFamily: font.monoBold, fontSize: 13, lineHeight: 19, color: '#fff' }}>{burned(d)}</Txt> kcal</Txt>
      <Txt style={{ fontSize: 12, lineHeight: 17, color: W60 }}>From your watch</Txt>
    </Row>
  ) : null;

  // expired membership: no Start and no dark glow, one flat card that says why and still shows the plan
  if (paused && (st === 'todo' || st === 'live')) {
    return (
      <View accessibilityLabel="Workouts are paused" style={{ borderRadius: 24, backgroundColor: c.surface2, padding: 16, gap: 12 }}>
        <Row style={{ gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.surface3, alignItems: 'center', justifyContent: 'center' }}><Lock size={18} color={c.muted} /></View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24, letterSpacing: -0.3, color: c.ink }}>Workouts are paused</Txt>
            <Txt style={{ fontSize: 13, lineHeight: 19, color: c.muted }}>Renew at Wulf Fitness reception to see your plan and start again. Your history stays here.</Txt>
          </View>
        </Row>
      </View>
    );
  }

  // 7. moved or skipped: one small row, so it stops taking space
  if (missed && ms.answer) {
    const moved = ms.answer === 'moved';
    return (
      <Shell compact label={moved ? 'Leg day moved to tomorrow' : 'Leg day skipped today'} colors={['#0B0E14', '#0E1B45', '#13327A']}>
        <Row style={{ gap: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>{moved ? <CalendarClock size={18} color="#fff" /> : <X size={18} color="#fff" />}</View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: '#fff' }}>{moved ? 'Leg day moved to tomorrow' : 'Leg day skipped today'}</Txt>
            <Txt style={{ fontSize: 12, lineHeight: 17, color: W60 }}>{moved ? 'Coach Vikram is told' : 'Your plan picks up tomorrow'}</Txt>
          </View>
          <Pressy accessibilityRole="button" accessibilityLabel="Undo" onPress={() => missedWkStore.set({ answer: null })} style={{ height: 34, paddingHorizontal: 14, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: '#fff' }}>Undo</Txt>
          </Pressy>
        </Row>
      </Shell>
    );
  }

  // 6. rest day
  if (st === 'rest') {
    return (
      <Shell label="Rest day" colors={['#0B0E14', '#141130', '#1A1636']}>
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Row style={{ gap: 8 }}><Moon size={17} color={LILAC} /><Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: LILAC }}>Recovery</Txt></Row>
          <Chip label={`Next: Pull, Thu ${fmtT(WKT).full}`} onDark />
        </Row>
        <Title name="Rest day" />
        <Txt style={{ fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.75)' }}>Muscles grow on rest days. A 20 minute walk still counts.</Txt>
        {burnedRow}
      </Shell>
    );
  }

  // 5. completed
  if (st === 'done') {
    const done = wkDoneInfo(d);
    const mins = Math.max(1, Math.round(done.b - done.a));
    const stats: [string, string, string][] = [[String(mins), ' min', 'Time'], [String(buildExercises().length), '', 'Exercises'], [String(done.k), ' kcal', 'Burned']];
    return (
      <Shell label="Workout complete" colors={['#0B0E14', '#0D2A22', '#124A3A']}>
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Row style={{ gap: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: MINT, alignItems: 'center', justifyContent: 'center' }}><Check size={16} strokeWidth={3} color="#0B0E14" /></View>
            <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: MINT }}>{`Done at ${fmtT(done.b).full}`}</Txt>
          </Row>
          <Chip label={name} onDark />
        </Row>
        <Txt style={{ fontFamily: font.regular, fontSize: 30, lineHeight: 39, letterSpacing: -1.2, color: '#fff' }}>Workout complete</Txt>
        <Row style={{ gap: 12 }}>
          {stats.map(([v, u, l]) => (
            <View key={l} style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 29, color: '#fff' }}>{v}<Txt style={{ fontSize: 13, lineHeight: 19, color: W60 }}>{u}</Txt></Txt>
              <Txt style={{ fontSize: 11, lineHeight: 16, color: W60 }}>{l}</Txt>
            </View>
          ))}
        </Row>
        {burnedRow}
      </Shell>
    );
  }

  // 3. in progress: the timer leads, one segment per exercise fills as you go
  if (st === 'live' && d.session) {
    const ex = d.session.ex;
    const doneEx = ex.filter((e) => e.sets.every((x) => x.st !== 'todo')).length;
    const next = ex.find((e) => e.sets.some((x) => x.st === 'todo'));
    const elapsed = mmss((now - d.session.startAt) / 1000).padStart(5, '0');
    return (
      <Shell label={`Workout running, ${elapsed} elapsed, ${doneEx} of ${ex.length} exercises`} colors={['#06231B', '#0B3A2C', '#0F5A42']}>
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Row style={{ gap: 8 }}><LiveDot /><Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: MINT }}>Running</Txt></Row>
          <Chip label={name} onDark tone="live" />
        </Row>
        <Row style={{ alignItems: 'baseline', gap: 8 }}>
          <Txt style={{ fontFamily: font.monoBold, fontSize: 42, lineHeight: 50, letterSpacing: -1, color: '#fff' }}>{elapsed}</Txt>
          <Txt style={{ fontSize: 12, lineHeight: 17, color: W60 }}>elapsed</Txt>
        </Row>
        <View style={{ gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 13, lineHeight: 19, color: '#fff' }}>{`${doneEx} of ${ex.length} exercises`}</Txt>
            {next && <Txt style={{ fontSize: 12, lineHeight: 17, color: W60 }}>{`Next: ${next.name}`}</Txt>}
          </Row>
          <Row style={{ gap: 4 }}>
            {ex.map((_, i) => <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < doneEx ? MINT : 'rgba(255,255,255,0.18)' }} />)}
          </Row>
        </View>
        <Btn label="Resume workout" onPress={() => router.push('/workout')} />
      </Shell>
    );
  }

  // 4. missed: muted, amber edge, the time crossed out, one question with three answers
  if (missed) {
    return (
      <Shell label="Leg day missed" colors={['#17140F', '#17140F', '#1B1710']} edge="rgba(242,179,91,0.28)">
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Coach dim />
          <View style={{ height: 28, paddingHorizontal: 11, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(242,179,91,0.5)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Clock size={13} color={AMBER} /><Txt style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 17, color: AMBER }}>Missed</Txt>
          </View>
        </Row>
        <Title name={name} time={time} tone="missed" />
        <Txt style={{ fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.8)' }}>Did you train without the app, or should it move?</Txt>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          <SmallBtn solid label="I did it" onPress={didIt} />
          <SmallBtn label="Move to tomorrow" onPress={() => answer('moved')} />
          <SmallBtn label="Skip" onPress={() => answer('skipped')} />
        </Row>
        <Pressy accessibilityRole="button" onPress={() => startWorkout()} hitSlop={8} style={{ alignSelf: 'flex-start', paddingVertical: 2 }}>
          <Txt style={{ fontSize: 13, lineHeight: 19, color: W60, textDecorationLine: 'underline' }}>Start it now anyway</Txt>
        </Pressy>
      </Shell>
    );
  }

  // comeback day: the greeting is plain text above (see ComebackGreeting), and the workout is one small grey card: the easy session,
  // with Start as the main button and today's planned workout as the quiet one. (Both open the same builder for now.)
  if (comeback) {
    const btn = { flex: 1, height: 44, borderRadius: 22, alignItems: 'center' as const, justifyContent: 'center' as const };
    return (
      <View accessibilityLabel="Easy session" style={{ borderRadius: 24, backgroundColor: c.surface2, padding: 16, gap: 12 }}>
        <View style={{ gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24, letterSpacing: -0.3, color: c.ink }}>Easy session</Txt>
          <Txt style={{ fontSize: 13, lineHeight: 19, color: c.muted }}>5 exercises, about 30 minutes, lighter weights</Txt>
        </View>
        <Row style={{ gap: 8 }}>
          <Pressy accessibilityRole="button" accessibilityLabel="Start the easy session" onPress={() => startWorkout()} style={[btn, { backgroundColor: c.ink }]}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: c.bg }}>Start</Txt>
          </Pressy>
          <Pressy accessibilityRole="button" accessibilityLabel="Do today's regular workout instead" onPress={() => startWorkout()} style={[btn, { backgroundColor: c.surface3 }]}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: c.ink }}>Do regular instead</Txt>
          </Pressy>
        </Row>
      </View>
    );
  }

  // 1. upcoming / 2. due now (a thin mint edge and a "Now" chip; the button stays white)
  const due = !comeback && d.min >= WKT - 15;
  return (
    <Shell label={`Today's workout, ${name}`} colors={['#0B0E14', '#0E1B45', '#13327A']} edge={due ? 'rgba(124,240,200,0.45)' : undefined}>
      <Row style={{ justifyContent: 'space-between', gap: 8 }}>
        <Coach />
        {due ? (
          <View style={{ height: 28, paddingHorizontal: 11, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(124,240,200,0.6)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <LiveDot /><Txt style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 17, color: MINT }}>Now</Txt>
          </View>
        ) : <Chip label={comeback ? 'Today' : rel(d, WKT).t} onDark />}
      </Row>
      <Title name={name} time={time} />
      <Row style={{ gap: 6, flexWrap: 'wrap' }}>{chips.map((t) => <Chip key={t} label={t} onDark />)}</Row>
      <Btn label={comeback ? 'Start my comeback plan' : 'Start workout'} onPress={() => startWorkout()} />
      {burnedRow}
    </Shell>
  );
}
