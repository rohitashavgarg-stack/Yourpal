import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, interpolate, LinearTransition, SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { router } from 'expo-router';
import { Clock, Dumbbell, Flame, Footprints, GlassWater, Scale, UtensilsCrossed, X } from '@/lib/icons';
import { useStartWorkout } from '@/features/workout/StartSheet';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { PersonAvatar } from '@/components/Brand';
import { useOverlay } from '@/components/Overlay';
import { FlagSheet } from '@/features/gym/sheets';
import { usePtPending } from '@/features/shell/notifs';
import { plannedMin, useDomain, workoutState } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { planStore } from '@/lib/planState';
import { nextMeal } from './meals';
import { LogMealsSheet } from './LogMealsSheet';
import { MISSED_AFTER, missedWkStore } from './WorkoutCard';
import { reminderStore, useReminders } from '@/features/reminders/reminders';
import { useLogsPaused } from '@/lib/logGate';
import { fmtT, MEALS } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { cardShadow, CornerGlow } from '@/features/progress/parts';
import { FLAME } from '@/features/streak/StreakChip';
import { useUpdates } from './TopCards';
import { radii, fontSizes } from '@/design-system/tokens';
import { toastCopy, updateCopy } from '@/lib/microcopy';
import { goalCardStore } from './goalCardState';
import { Card } from '@/design-system/primitives/Card';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { FadeIn } from '@/design-system/primitives/FadeIn';

// The slim goal strip moved to src/design-system/_archive/ForYouGoalStrip.tsx (archived: nothing renders it). Re-exported so the old import keeps working.
export { GoalStrip } from '@/design-system/_archive/ForYouGoalStrip';

// ---------- "For you": every note, request and reminder in one swipeable stack ----------
type Item = {
  key: string; title: string; body: string; critical?: boolean; tone: 'accent' | 'warn' | 'good' | 'muted';
  who?: boolean; icon?: any; btn?: string; act?: () => void; two?: boolean;
  chips?: string[]; full?: boolean; // small chips instead of a sentence, and a full-width button
};

export function useForYou(): Item[] {
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  const allReminders = useReminders();
  const logsPaused = useLogsPaused();
  const reminders = logsPaused ? [] : allReminders; // nothing to log while logging is paused
  const ptPending = usePtPending();
  const { live } = useUpdates();
  const { openSheet } = useOverlay();
  const { state } = useStore();
  const first = (state.profile.name || '').trim().split(' ')[0];
  const startWorkout = useStartWorkout();
  const missedWk = missedWkStore.use();
  const plansOn = planStore.use().assigned;
  const out: Item[] = [];
  // Order = priority: what blocks logging, then what has a deadline, then the rest.
  if (ptPending && d.hasGym && !logsPaused) out.push({ key: 'pt', title: updateCopy.pt.title, body: updateCopy.pt.body, critical: true, tone: 'accent', who: true, two: true });
  if (d.hasGym && d.membership === 'Expiring') out.push({ key: 'member-exp', title: updateCopy.membership.title, body: updateCopy.membership.body, tone: 'warn', icon: Clock, btn: 'View plan', act: () => router.push('/gym/membership') });
  const order = ['reassess', 'reply', 'plan', 'log'];
  live.filter((u) => u.key !== 'member').sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)).forEach((u) => {
    out.push({ key: u.key, title: u.title, body: u.body, tone: u.tone, who: ['plan', 'reply'].includes(u.key), icon: u.icon, btn: u.isPlan ? 'See changes' : u.btn, act: u.isPlan ? () => router.navigate('/plans') : u.act });
  });
  // Log prompts: a meal that is due or overdue, and a workout that was planned and has not been logged. Never while logging is paused.
  if (!logsPaused && plansOn) {
    const nm = nextMeal(d);
    const meal = nm ? MEALS.find((m) => m.id === nm) : undefined;
    if (meal && d.min >= meal.t - 30) {
      const late = d.min > meal.t + 60;
      out.push({ key: 'log-meal', ...updateCopy.meal(meal.n, first, fmtT(meal.t).full, late), tone: 'accent', icon: UtensilsCrossed, btn: 'Log meal', act: () => openSheet(<LogMealsSheet mealId={meal.id} />, { label: 'Log meal' }) });
    }
    const planned = plannedMin(state.profile.time);
    if (workoutState(d) === 'todo' && d.min - planned > MISSED_AFTER && !missedWk.answer && !live.some((u) => u.key === 'log')) {
      out.push({ key: 'log-workout', ...updateCopy.workout(first, fmtT(planned).full), tone: 'accent', icon: Dumbbell, btn: 'Start workout', act: () => startWorkout() });
    }
  }
  // Personal reminders (log your water, log your weight, steps behind): a card each, last in the stack; the meals reminder lives in the meals card.
  reminders.filter((r) => r.key !== 'meals').forEach((r) => {
    if (r.key === 'water') out.push({ key: 'rem-water', ...updateCopy.water(first, reminderStore.get().waterAt == null ? null : fmtT(reminderStore.get().waterAt!).full), tone: 'accent', icon: GlassWater, btn: r.action, act: () => { set({ water: Math.min(3.5, Math.round((d.water + 0.25) * 100) / 100) }); reminderStore.set({ waterAt: d.min }); toast(toastCopy.glassAdded); } });
    else if (r.key === 'weight') out.push({ key: 'rem-weight', ...updateCopy.weight(first, goalCardStore.get().weighDays), tone: 'accent', icon: Scale, btn: r.action, act: () => router.push('/log-weight') });
    else if (r.key === 'steps') out.push({ key: 'rem-steps', ...updateCopy.steps(first), tone: 'accent', icon: Footprints });
  });
  return out.filter((i) => i.critical || !d.dismissed[i.key]);
}

// ---------- The stack ----------
// Every card stays mounted for good, keyed by its id (never by position), and one shared value, `prog`, says which card is in front.
// Each card works out where it sits from (its index - prog): 0 is the front, 1 and 2 are the cards behind (a little smaller, a little lower, no text),
// and -1 is a card that has just left to the side. Nothing remounts and no React state changes while a finger is moving, so there is no refresh and no flicker.

const wrapD = (i: number, p: number, n: number) => {
  'worklet';
  if (n <= 1) return 0; // a single card is always the one in front
  return ((((i - p) + 1) % n) + n) % n - 1; // in [-1, n - 1)
};

const StackCard = React.memo(function StackCard({ it, i, n, prog, inFlow, onDismiss }: { it: Item; i: number; n: number; prog: SharedValue<number>; inFlow: boolean; onDismiss: () => void }) {
  const { c, isDark } = useTheme();
  const { openSheet } = useOverlay();
  const fg = it.tone === 'warn' ? c.warn : it.tone === 'muted' ? c.ink : c.accentText;
  const bg = it.tone === 'warn' ? c.warnSoft : it.tone === 'good' ? c.goodSoft : c.accentSoft;
  const I = it.icon;
  const card = useAnimatedStyle(() => {
    const d = wrapD(i, prog.value, n);
    return {
      zIndex: 10 - Math.round(Math.abs(d)),
      opacity: interpolate(d, [-1, 0, 2, 3], [0, 1, 1, 0], 'clamp'),
      transform: [
        { translateX: interpolate(d, [-1, 0], [-360, 0], 'clamp') },
        { translateY: interpolate(d, [0, 2], [0, 26], 'clamp') },
        { scale: interpolate(d, [0, 2], [1, 0.9], 'clamp') },
      ],
    };
  });
  // the cards behind are empty shells: the text fades in only as the card comes forward
  const content = useAnimatedStyle(() => ({ opacity: interpolate(wrapD(i, prog.value, n), [-1, 0, 1], [1, 1, 0], 'clamp') }));
  return (
    <Animated.View style={[inFlow ? null : { position: 'absolute', left: 0, right: 0, top: 0, bottom: n > 2 ? 26 : n > 1 ? 14 : 0 } /* as tall as the front card (the deck padding below is the room for the edges) */, card]}>
      <Card variant="tight" border={{ color: c.line }} clip style={{ flexGrow: 1, flexShrink: 1 }}>
        <Animated.View style={content}>
          <View style={{ gap: 12 }}>
            <Row style={{ gap: 12, alignItems: 'flex-start', paddingRight: it.critical ? 0 : 28 }}>
              {it.who ? <PersonAvatar who="coach" size={40} /> : <IconBadge size={40} radius={radii.sm} bg={bg}>{I ? <I size={19} color={fg} /> : null}</IconBadge>}
              <View style={{ flex: 1, gap: 2 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{it.title}</Txt>
                {!!it.body && <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{it.body}</Txt>}
              </View>
            </Row>
            {it.two ? (
              <Row style={{ gap: 10 }}>
                <View style={{ flex: 1 }}><Button kind="secondary" label="Reject" onPress={() => openSheet(<FlagSheet />, { label: 'Flag session' })} /></View>
                <View style={{ flex: 1.4 }}><Button label="Confirm & rate" onPress={() => router.push('/gym/confirm')} /></View>
              </Row>
            ) : it.btn ? (
              <Row style={{ justifyContent: 'flex-end' }}><Pressy accessibilityRole="button" onPress={it.act} style={{ height: 40, minWidth: 132, paddingHorizontal: 24, borderRadius: 20, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}><Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20, color: c.bg }}>{it.btn}</Txt></Pressy></Row>
            ) : null}
          </View>
        </Animated.View>
        {!it.critical && (
          <Pressy accessibilityRole="button" accessibilityLabel="Dismiss this" onPress={onDismiss} style={{ position: 'absolute', top: 2, right: 2, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <X size={17} color={c.muted} />
          </Pressy>
        )}
      </Card>
    </Animated.View>
  );
}, (a, b) => a.it.key === b.it.key && a.it.title === b.it.title && a.it.body === b.it.body && a.it.btn === b.it.btn && a.it.critical === b.it.critical && a.i === b.i && a.n === b.n && a.inFlow === b.inFlow && a.prog === b.prog);

// A dot that stretches and darkens as its card comes to the front, in step with the cards.
function PagerDot({ k, n, prog }: { k: number; n: number; prog: SharedValue<number> }) {
  const { c } = useTheme();
  const st = useAnimatedStyle(() => {
    const near = 1 - Math.min(1, Math.abs(wrapD(k, prog.value, n)));
    return { width: 6 + 10 * near, opacity: 0.35 + 0.65 * near };
  });
  return <Animated.View style={[{ height: 6, borderRadius: radii.xs, backgroundColor: c.ink }, st]} />;
}


export function ForYouStack() {
  const { set } = useDomain();
  const raw = useForYou();
  const items = raw; // cards are keyed by id and memoised below, so a rebuilt list does not re-render them
  const n = items.length;
  const many = n > 1;
  const prog = useSharedValue(0);
  const base = useSharedValue(0);
  const [front, setFront] = useState(0);
  const settle = (target: number) => { haptic.light(); setFront(((Math.round(target) % n) + n) % n); };
  const swipe = Gesture.Pan().enabled(many).activeOffsetX([-14, 14]).failOffsetY([-14, 14])
    .onStart(() => { base.value = prog.value; })
    .onUpdate((e) => { prog.value = base.value + Math.max(-1, Math.min(1, -e.translationX / 280)); })
    .onEnd((e) => {
      const move = -e.translationX / 280 - e.velocityX / 4000;
      const target = base.value + (move > 0.3 ? 1 : move < -0.3 ? -1 : 0);
      // the next card takes its place in the layout right away, so the height change runs with the swipe instead of after it
      if (target !== base.value) scheduleOnRN(settle, target);
      prog.value = withTiming(target, { duration: 280, easing: Easing.out(Easing.cubic) });
    });
  if (!n) return null;
  // each card's own height (content plus the card's padding and border); the deck follows the one in front
  const cur = items[Math.min(front, n - 1)];
  const dismiss = () => {
    if (!cur) return;
    haptic.light();
    const next = Math.min(front, Math.max(0, n - 2));
    prog.value = next; // the next card takes the front at once; the dismissed one is gone from the list
    setFront(next);
    set((s) => ({ dismissed: { ...s.dismissed, [cur.key]: true } }));
  };
  return (
    <View>
      <GestureDetector gesture={swipe}>
        <Animated.View layout={LinearTransition.duration(240)} style={{ paddingBottom: n > 2 ? 26 : n > 1 ? 14 : 0 }}>
          {items.map((it, i) => <StackCard key={it.key} it={it} i={i} n={n} prog={prog} inFlow={i === Math.min(front, n - 1)} onDismiss={dismiss} />)}
        </Animated.View>
      </GestureDetector>
      {many && (
        <View pointerEvents="none" style={{ flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'center', height: 14, marginTop: 2 }}>
          {items.map((x, k) => <PagerDot key={x.key} k={k} n={n} prog={prog} />)}
        </View>
      )}
    </View>
  );
}

// After a break: its own warm card (a flame, a soft orange glow), not a note in the stack, so the way back is clearly not "updates".
export function ComebackPlan() {
  const { c, isDark } = useTheme();
  const start = useStartWorkout();
  return (
    <FadeIn style={[{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18, gap: 14, overflow: 'hidden' }, cardShadow(isDark)]}>
      <CornerGlow color={FLAME} size={520} />
      <Row style={{ gap: 12 }}>
        <IconBadge size={44} radius={radii.lg} bg="rgba(255,138,61,0.16)"><Flame size={22} color={FLAME} fill={FLAME} /></IconBadge>
        <View style={{ flex: 1, gap: 6 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 27, letterSpacing: -0.5 }}>Your comeback plan with lighter weights</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {['20 min', '4 exercises'].map((t) => <View key={t} style={{ height: 28, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: c.chipLine, justifyContent: 'center' }}><Txt style={{ fontFamily: font.medium, fontSize: 12.5, lineHeight: 18 }}>{t}</Txt></View>)}
          </Row>
        </View>
      </Row>
      <Button label="Start easy session" onPress={() => start()} />
    </FadeIn>
  );
}
