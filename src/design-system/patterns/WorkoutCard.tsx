import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarClock, Check, Clock, Dumbbell, Flame, Lock, Moon, X } from '@/lib/icons';
import { Chip, Pressy, Row, Txt } from '@/components/ui';
import { PersonAvatar } from '@/components/Brand';
import { Button } from '@/design-system/primitives/Button';
import { MetaRow } from '@/design-system/primitives/MetaRow';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, fixed, radii, onDark, gradients, round } from '@/design-system/tokens';

/**
 * Today's workout, one look per state:
 *   upcoming   planned for later today
 *   due        within 15 minutes of the planned time or after it: a thin mint edge and a "Now" chip
 *   live       a session is running: timer, one segment per exercise
 *   missed     two hours past the plan with nothing logged: muted, amber edge, one question with three answers
 *   moved      the member answered "Move to tomorrow": one small row with Undo
 *   skipped    the member answered "Skip": one small row with Undo
 *   done       completed: time, exercises and calories
 *   rest       rest day
 *   paused     the membership has ended: one flat card that says why, no Start
 *   comeback   after a break: the easy session, with Start and "Do regular instead"
 */
export type WorkoutCardState = 'upcoming' | 'due' | 'live' | 'missed' | 'moved' | 'skipped' | 'done' | 'rest' | 'paused' | 'comeback';

export type WorkoutCardProps = {
  state: WorkoutCardState;
  /** The workout name, "Leg day". */
  name: string;
  /** The planned time, "6:30 pm". Shown as a small pill after the name. */
  time?: string;
  /** upcoming: the chip at the top right, "in 2 h". */
  when?: string;
  /** upcoming and due: facts under the name, each with an icon and a thin line between: "7 exercises", "~50 min". */
  meta?: { kind: 'exercises' | 'time'; text: string }[];
  /** The coach reply dot on the coach line. */
  coachUnread?: boolean;
  onOpenCoach?: () => void;
  /** With a watch: the "Burned today" row at the bottom (rest, done, upcoming and due). */
  burned?: number;
  /** live */
  live?: { elapsed: string; done: number; total: number; next?: string };
  /** done: "6:58 pm" and the three stats (value, unit, label). */
  done?: { at: string; stats: [string, string, string][] };
  /** rest: "Next: Pull, Thu 6:30 pm". */
  restNext?: string;
  onStart?: () => void;
  onResume?: () => void;
  /** missed */
  onDidIt?: () => void;
  onMove?: () => void;
  onSkip?: () => void;
  onStartAnyway?: () => void;
  /** moved and skipped */
  onUndo?: () => void;
  /** comeback: the quiet second button. */
  onStartRegular?: () => void;
};

const MINT = fixed.live;
const AMBER = onDark.amber;
const LILAC = onDark.lilac;
const W60 = 'rgba(255,255,255,0.65)';

// The coach line at the top of the card (with the unread dot for a coach reply).
function Coach({ dim = false, unread, onPress }: { dim?: boolean; unread?: boolean; onPress?: () => void }) {
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Today's workout, planned by Coach Vikram. Open your coach" onPress={onPress} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, opacity: dim ? 0.7 : 1 }}>
      <View><PersonAvatar who="coach" size={34} />{unread && <View accessibilityLabel="Unread reply" style={{ position: 'absolute', right: -1, top: -1, width: 9, height: 9, borderRadius: radii.dot, backgroundColor: MINT }} />}</View>
      <View style={{ flexShrink: 1 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.basePlus, lineHeight: 22, color: fixed.white }}>{"Today's workout"}</Txt>
        <Txt style={{ fontSize: fontSizes.xsPlus, lineHeight: 18, color: W60 }}>Planned by Coach Vikram</Txt>
      </View>
    </Pressy>
  );
}

// The workout name with its time as a small pill right after it. The pill sits 3 px below the middle of the line box: the name is mostly lower-case with descenders, so its visual centre is lower than its capitals.
function WorkoutTitle({ name, time, tone = 'default' }: { name: string; time?: string; tone?: 'default' | 'missed' }) {
  const missed = tone === 'missed';
  return (
    <Row style={{ gap: 10, flexWrap: 'wrap' }}>
      <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.xl5, lineHeight: 42, letterSpacing: -1.4, color: missed ? 'rgba(255,255,255,0.75)' : fixed.white }}>{name}</Txt>
      {!!time && (
        <View style={{ height: 28, paddingHorizontal: 10, marginTop: 6, borderRadius: round(28), backgroundColor: missed ? 'rgba(242,179,91,0.14)' : 'rgba(255,255,255,0.12)', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, color: missed ? AMBER : fixed.white, textDecorationLine: missed ? 'line-through' : 'none' }}>{time}</Txt>
        </View>
      )}
    </Row>
  );
}

const LiveDot = () => <View style={{ width: 8, height: 8, borderRadius: radii.xs, backgroundColor: MINT }} />;

function WorkoutShell({ colors, edge, children, compact = false, label }: { colors: readonly string[]; edge?: string; children: React.ReactNode; compact?: boolean; label: string }) {
  return (
    <View accessibilityLabel={label} style={{ borderRadius: radii.card, padding: 16, paddingVertical: compact ? 14 : 16, gap: 12, overflow: 'hidden', borderWidth: edge ? 1.5 : 0, borderColor: edge }}>
      <LinearGradient colors={colors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      {!compact && <View pointerEvents="none" style={{ position: 'absolute', right: -70, top: -80, width: 220, height: 220, borderRadius: round(220), borderWidth: 14, borderColor: 'rgba(255,255,255,0.05)' }} />}
      {children}
    </View>
  );
}

const noop = () => {};

export function WorkoutCard({ state, name, time, when, meta = [], coachUnread, onOpenCoach, burned, live, done, restNext, onStart = noop, onResume = noop, onDidIt = noop, onMove = noop, onSkip = noop, onStartAnyway = noop, onUndo = noop, onStartRegular = noop }: WorkoutCardProps) {
  const { c } = useTheme();
  const burnedRow = burned != null ? (
    <Row style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
      <Flame size={15} color={fixed.white} />
      <Txt style={{ flex: 1, fontSize: fontSizes.sm, lineHeight: 19, color: fixed.white }}>Burned today <Txt style={{ fontFamily: font.monoBold, fontSize: fontSizes.sm, lineHeight: 19, color: fixed.white }}>{burned}</Txt> kcal</Txt>
      <Txt style={{ fontSize: fontSizes.xs, lineHeight: 17, color: W60 }}>From your watch</Txt>
    </Row>
  ) : null;

  // expired membership: no Start and no dark glow, one flat card that says why and still shows the plan
  if (state === 'paused') {
    return (
      <View accessibilityLabel="Workouts are paused" style={{ borderRadius: radii.card, backgroundColor: c.surface2, padding: 16, gap: 12 }}>
        <Row style={{ gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: c.surface3, alignItems: 'center', justifyContent: 'center' }}><Lock size={18} color={c.muted} /></View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24, letterSpacing: -0.3, color: c.ink }}>Workouts are paused</Txt>
            <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.muted }}>Renew at Wulf Fitness reception to see your plan and start again. Your history stays here.</Txt>
          </View>
        </Row>
      </View>
    );
  }

  // moved or skipped: one small row, so it stops taking space
  if (state === 'moved' || state === 'skipped') {
    const moved = state === 'moved';
    return (
      <WorkoutShell compact label={moved ? `${name} moved to tomorrow` : `${name} skipped today`} colors={gradients.workoutPlanned}>
        <Row style={{ gap: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: radii.md, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>{moved ? <CalendarClock size={18} color={fixed.white} /> : <X size={18} color={fixed.white} />}</View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21, color: fixed.white }}>{moved ? `${name} moved to tomorrow` : `${name} skipped today`}</Txt>
            <Txt style={{ fontSize: fontSizes.xs, lineHeight: 17, color: W60 }}>{moved ? 'Coach Vikram is told' : 'Your plan picks up tomorrow'}</Txt>
          </View>
          <Pressy accessibilityRole="button" accessibilityLabel="Undo" onPress={onUndo} style={{ height: 34, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, color: fixed.white }}>Undo</Txt>
          </Pressy>
        </Row>
      </WorkoutShell>
    );
  }

  if (state === 'rest') {
    return (
      <WorkoutShell label="Rest day" colors={gradients.workoutRest}>
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Row style={{ gap: 8 }}><Moon size={17} color={LILAC} /><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, color: LILAC }}>Recovery</Txt></Row>
          {!!restNext && <Chip label={restNext} onDark />}
        </Row>
        <WorkoutTitle name="Rest day" />
        <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, color: 'rgba(255,255,255,0.75)' }}>Muscles grow on rest days. A 20 minute walk still counts.</Txt>
        {burnedRow}
      </WorkoutShell>
    );
  }

  if (state === 'done' && done) {
    return (
      <WorkoutShell label="Workout complete" colors={gradients.workoutDone}>
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Row style={{ gap: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: round(28), backgroundColor: MINT, alignItems: 'center', justifyContent: 'center' }}><Check size={16} strokeWidth={3} color={fixed.dark} /></View>
            <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, color: MINT }}>{`Done at ${done.at}`}</Txt>
          </Row>
          <Chip label={name} onDark />
        </Row>
        <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, lineHeight: 39, letterSpacing: -1.2, color: fixed.white }}>Workout complete</Txt>
        <Row style={{ gap: 12 }}>
          {done.stats.map(([v, u, l]) => (
            <View key={l} style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, color: fixed.white }}>{v}<Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: W60 }}>{u}</Txt></Txt>
              <Txt style={{ fontSize: fontSizes.xs2, lineHeight: 16, color: W60 }}>{l}</Txt>
            </View>
          ))}
        </Row>
        {burnedRow}
      </WorkoutShell>
    );
  }

  // in progress: the timer leads, one segment per exercise fills as you go
  if (state === 'live' && live) {
    return (
      <WorkoutShell label={`Workout running, ${live.elapsed} elapsed, ${live.done} of ${live.total} exercises`} colors={gradients.workoutLive}>
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Row style={{ gap: 8 }}><LiveDot /><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, color: MINT }}>Running</Txt></Row>
          <Chip label={name} onDark tone="live" />
        </Row>
        <Row style={{ alignItems: 'baseline', gap: 8 }}>
          <Txt style={{ fontFamily: font.monoBold, fontSize: fontSizes.xl6, lineHeight: 50, letterSpacing: -1, color: fixed.white }}>{live.elapsed}</Txt>
          <Txt style={{ fontSize: fontSizes.xs, lineHeight: 17, color: W60 }}>elapsed</Txt>
        </Row>
        <View style={{ gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: fixed.white }}>{`${live.done} of ${live.total} exercises`}</Txt>
            {!!live.next && <Txt style={{ fontSize: fontSizes.xs, lineHeight: 17, color: W60 }}>{`Next: ${live.next}`}</Txt>}
          </Row>
          <Row style={{ gap: 4 }}>
            {Array.from({ length: live.total }, (_, i) => <View key={i} style={{ flex: 1, height: 6, borderRadius: radii.xs, backgroundColor: i < live.done ? MINT : 'rgba(255,255,255,0.18)' }} />)}
          </Row>
        </View>
        <Button kind="white" size="medium" label="Resume workout" onPress={onResume} />
      </WorkoutShell>
    );
  }

  // missed: muted, amber edge, the time crossed out, one question with three answers
  if (state === 'missed') {
    return (
      <WorkoutShell label={`${name} missed`} colors={gradients.workoutMissed} edge="rgba(242,179,91,0.28)">
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Coach dim unread={coachUnread} onPress={onOpenCoach} />
          <View style={{ height: 28, paddingHorizontal: 11, borderRadius: round(28), borderWidth: 1, borderColor: 'rgba(242,179,91,0.5)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Clock size={13} color={AMBER} /><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 17, color: AMBER }}>Missed</Txt>
          </View>
        </Row>
        <WorkoutTitle name={name} time={time} tone="missed" />
        <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, color: 'rgba(255,255,255,0.8)' }}>Did you train without the app, or should it move?</Txt>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          <Button kind="white" size="tight" label="I did it" onPress={onDidIt} />
          <Button kind="glass" size="tight" label="Move to tomorrow" onPress={onMove} />
          <Button kind="glass" size="tight" label="Skip" onPress={onSkip} />
        </Row>
        <Pressy accessibilityRole="button" onPress={onStartAnyway} hitSlop={8} style={{ alignSelf: 'flex-start', paddingVertical: 2 }}>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: W60, textDecorationLine: 'underline' }}>Start it now anyway</Txt>
        </Pressy>
      </WorkoutShell>
    );
  }

  // comeback day: the greeting is plain text above (see ComebackGreeting), and the workout is one small grey card: the easy session,
  // with Start as the main button and today's planned workout as the quiet one.
  if (state === 'comeback') {
    const btn = { flex: 1, height: 44, borderRadius: radii.lg, alignItems: 'center' as const, justifyContent: 'center' as const };
    return (
      <View accessibilityLabel="Easy session" style={{ borderRadius: radii.card, backgroundColor: c.surface2, padding: 16, gap: 12 }}>
        <View style={{ gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24, letterSpacing: -0.3, color: c.ink }}>Easy session</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.muted }}>5 exercises, about 30 minutes, lighter weights</Txt>
        </View>
        <Row style={{ gap: 8 }}>
          <Pressy accessibilityRole="button" accessibilityLabel="Start the easy session" onPress={onStart} style={[btn, { backgroundColor: c.ink }]}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20, color: c.bg }}>Start</Txt>
          </Pressy>
          <Pressy accessibilityRole="button" accessibilityLabel="Do today's regular workout instead" onPress={onStartRegular} style={[btn, { backgroundColor: c.surface3 }]}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20, color: c.ink }}>Do regular instead</Txt>
          </Pressy>
        </Row>
      </View>
    );
  }

  // upcoming / due now (a thin mint edge and a "Now" chip; the button stays white)
  const due = state === 'due';
  return (
    <WorkoutShell label={`Today's workout, ${name}`} colors={gradients.workoutPlanned} edge={due ? 'rgba(124,240,200,0.45)' : undefined}>
      <Row style={{ justifyContent: 'space-between', gap: 8 }}>
        <Coach unread={coachUnread} onPress={onOpenCoach} />
        {due ? (
          <View style={{ height: 28, paddingHorizontal: 11, borderRadius: round(28), borderWidth: 1, borderColor: 'rgba(124,240,200,0.6)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <LiveDot /><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 17, color: MINT }}>Now</Txt>
          </View>
        ) : <Chip label={when ?? ''} onDark />}
      </Row>
      <WorkoutTitle name={name} time={time} />
      <MetaRow color={W60} dividerColor="rgba(255,255,255,0.22)" items={meta.map((m) => ({ icon: m.kind === 'exercises' ? <Dumbbell size={14} color={W60} /> : <Clock size={14} color={W60} />, text: m.text }))} />
      <Button kind="white" size="medium" label="Start workout" onPress={onStart} />
      {burnedRow}
    </WorkoutShell>
  );
}
