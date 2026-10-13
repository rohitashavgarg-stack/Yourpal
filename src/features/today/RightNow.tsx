import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check, Dumbbell, Moon, Sun, Sunrise, Sunset, UtensilsCrossed } from '@/lib/icons';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { dur, fmtT, KCAL_TARGET, Meal, MEALS, TODAY_IDX } from '@/lib/data';
import { mealLog, plannedMin, totals, useDomain, useMeals, workoutState } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fade } from '@/theme/motion';
import { haptic } from '@/lib/haptics';
import { buildExercises, WORKOUT_MIN } from '@/features/workout/session';
import { useStartWorkout } from '@/features/workout/StartSheet';
import { mealKcal } from './meals';

// "Right now": the one thing that matters at this hour. The full plan (Workout, Meals, This week) stays below it.
type Focus =
  | { kind: 'live' }
  | { kind: 'restart' }
  | { kind: 'workout'; diff: number }
  | { kind: 'meal'; meal: Meal }
  | { kind: 'late'; diff: number }
  | { kind: 'next'; what: 'workout' | 'meal'; label: string; at: number }
  | { kind: 'wrap' };

const open = (d: ReturnType<typeof useDomain>['d'], m: Meal) => { const x = mealLog(d, m.id); return !x.skip && x.eaten.length === 0 && x.extra.length === 0; };

function pickFocus(d: ReturnType<typeof useDomain>['d'], plan: number, restart: boolean): Focus {
  const now = d.min;
  const st = workoutState(d);
  if (d.session) return { kind: 'live' };
  // After a break the one action is the easy restart session (only where the layout has no Comeback card of its own).
  if (restart && d.todayVariant === 'Comeback') return { kind: 'restart' };
  if (st === 'live') return { kind: 'live' };
  const wkTodo = st === 'todo';
  if (wkTodo && now >= plan - 60 && now <= plan + 120) return { kind: 'workout', diff: plan - now };
  const meal = MEALS.find((m) => open(d, m) && now >= m.t - 60 && now <= m.t + 180);
  if (meal) return { kind: 'meal', meal };
  if (wkTodo && now > plan + 120 && now < 1380) return { kind: 'late', diff: plan - now };
  const upcoming: { what: 'workout' | 'meal'; label: string; at: number }[] = [];
  if (wkTodo && plan > now) upcoming.push({ what: 'workout', label: 'Workout', at: plan });
  MEALS.forEach((m) => { if (open(d, m) && m.t > now) upcoming.push({ what: 'meal', label: m.n, at: m.t }); });
  upcoming.sort((a, b) => a.at - b.at);
  if (upcoming.length) return { kind: 'next', ...upcoming[0] };
  return { kind: 'wrap' };
}

const partOfDay = (min: number) => (min >= 1260 || min < 300 ? { n: 'Night', I: Moon } : min < 720 ? { n: 'Morning', I: Sunrise } : min < 1020 ? { n: 'Afternoon', I: Sun } : { n: 'Evening', I: Sunset });

// The kind of thing Right now is showing, so the layout can avoid repeating it (for example hide the Workout card while Right now is the workout).
export function useRightNowKind(restart = false) {
  const { d } = useDomain();
  const { state } = useStore();
  return pickFocus(d, plannedMin(state.profile.time), restart).kind;
}

export function RightNow({ restart = false }: { restart?: boolean } = {}) {
  const { d } = useDomain();
  const { state } = useStore();
  const plan = plannedMin(state.profile.time);
  const f = pickFocus(d, plan, restart);
  if (d.loading) return null;
  const when = partOfDay(d.min);
  return (
    <Animated.View key={f.kind + (f.kind === 'meal' ? f.meal.id : '')} entering={fade()}>
      {f.kind === 'live' || f.kind === 'restart' || f.kind === 'workout' || f.kind === 'late'
        ? <WorkoutFocus f={f} plan={plan} part={when} />
        : f.kind === 'meal' ? <MealFocus meal={f.meal} part={when} />
        : f.kind === 'next' ? <NextRow f={f} part={when} />
        : <Wrap part={when} />}
    </Animated.View>
  );
}

function Label({ part, color }: { part: ReturnType<typeof partOfDay>; color: string }) {
  const I = part.I;
  return (
    <Row style={{ gap: 6 }}>
      <I size={15} color={color} />
      <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 17, letterSpacing: 0.4, color }}>RIGHT NOW · {part.n.toUpperCase()}</Txt>
    </Row>
  );
}

function WorkoutFocus({ f, plan, part }: { f: Extract<Focus, { kind: 'live' | 'restart' | 'workout' | 'late' }>; plan: number; part: ReturnType<typeof partOfDay> }) {
  const { d } = useDomain();
  const start = useStartWorkout();
  const n = buildExercises().length;
  const name = plan < 720 ? 'Morning workout' : plan < 1020 ? 'Afternoon workout' : 'Evening workout';
  const head = f.kind === 'restart' ? 'Your easy restart session' : f.kind === 'live' ? 'Workout in progress' : f.kind === 'late' ? `${name} is still open` : f.diff > 10 ? `${name} in ${dur(f.diff)}` : f.diff >= -10 ? `Time for your ${name.toLowerCase()}` : `${name} · ${dur(-f.diff)} late`;
  const sub = f.kind === 'restart' ? 'About 30 min · 5 exercises · lighter weights to ease back in.' : f.kind === 'live' ? 'Pick up where you left off.' : f.kind === 'late' ? `Planned for ${fmtT(plan).full}. A shorter session still counts.` : `Planned ${fmtT(plan).full} · Leg day · ${n} exercises · about ${WORKOUT_MIN} min`;
  const arrive = d.hasGym && f.kind === 'workout' && d.ci !== 'Checked in' && d.ci !== 'At the gym';
  return (
    <View accessibilityLabel="Right now: your workout" style={{ borderRadius: 24, overflow: 'hidden', padding: 16, gap: 10, backgroundColor: '#0B0E14' }}>
      <LinearGradient colors={['#0B0E14', '#0E1B45', '#13327A']} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Label part={part} color="rgba(255,255,255,0.75)" />
      <Row style={{ gap: 12, alignItems: 'flex-start' }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}><Dumbbell size={22} color="#fff" /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 29, letterSpacing: -0.6, color: '#fff' }}>{head}</Txt>
          <Txt style={{ fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.72)' }}>{sub}</Txt>
        </View>
      </Row>
      {arrive && <Txt style={{ fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.7)' }}>Check in when you arrive and your workout opens from the bar below.</Txt>}
      <Pressy accessibilityRole="button" onPress={() => (f.kind === 'live' ? router.push('/workout') : start())} style={{ height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 15, color: '#0B0E14' }}>{f.kind === 'live' ? 'Resume workout' : f.kind === 'restart' ? 'Start easy session' : 'Start workout'}</Txt>
      </Pressy>
    </View>
  );
}

function MealFocus({ meal, part }: { meal: Meal; part: ReturnType<typeof partOfDay> }) {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { toggleItem, snapshot, restore } = useMeals();
  const { toast } = useOverlay();
  const x = mealLog(d, meal.id);
  const diff = meal.t - d.min;
  const chip = diff > 10 ? `In ${dur(diff)}` : diff >= -10 ? 'Now' : `${dur(-diff)} late`;
  const markAll = () => {
    const before = snapshot();
    haptic.success();
    set((s) => ({ meals: { ...s.meals, [meal.id]: { ...mealLog(s, meal.id), eaten: meal.items.map((_, i) => i), skip: false, at: s.min } } }));
    toast(`${meal.n} marked as eaten`, { undo: () => restore(before) });
  };
  const skip = () => {
    const before = snapshot();
    haptic.light();
    set((s) => ({ meals: { ...s.meals, [meal.id]: { ...mealLog(s, meal.id), skip: true } } }));
    toast(`${meal.n} skipped`, { undo: () => restore(before) });
  };
  return (
    <Card style={{ padding: 16, gap: 12 }}>
      <Label part={part} color={c.accentText} />
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 29, letterSpacing: -0.6 }}>{meal.n}</Txt>
          <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>Planned {fmtT(meal.t).full} · {mealKcal(meal)} kcal · {Math.max(0, KCAL_TARGET - totals(d).k)} kcal left today</Txt>
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: diff < -10 ? c.warnSoft : c.accentSoft }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 17, color: diff < -10 ? c.warn : c.accentText }}>{chip}</Txt>
        </View>
      </Row>
      <View>
        {meal.items.map((it, i) => {
          const on = x.eaten.includes(i);
          return (
            <Pressy key={it.n + i} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`${it.n}, ${it.q}`} onPress={() => { haptic.tap(); toggleItem(meal.id, i); }} scaleTo={0.985}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: on ? c.accent : c.surface3, backgroundColor: on ? c.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {on ? <Check size={14} strokeWidth={3} color="#fff" /> : null}
              </View>
              <Txt style={{ flex: 1, fontFamily: font.medium, color: on ? c.muted : c.ink, textDecorationLine: on ? 'line-through' : 'none' }}>{it.n} <Txt muted style={{ fontSize: 13 }}>· {it.q}</Txt></Txt>
              <Txt v="mono" muted style={{ fontSize: 12 }}>{it.k} kcal</Txt>
            </Pressy>
          );
        })}
      </View>
      <Row style={{ gap: 8 }}>
        <Button label="Mark all eaten" onPress={markAll} style={{ flex: 1 }} />
        <Button kind="secondary" label="Skip" onPress={skip} style={{ paddingHorizontal: 20 }} />
      </Row>
    </Card>
  );
}

function NextRow({ f, part }: { f: Extract<Focus, { kind: 'next' }>; part: ReturnType<typeof partOfDay> }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const I = f.what === 'workout' ? Dumbbell : UtensilsCrossed;
  const diff = f.at - d.min;
  return (
    <Card style={{ padding: 14 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><I size={20} color={c.accentText} /></View>
        <View style={{ flex: 1, gap: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 17, letterSpacing: 0.4, color: c.accentText }}>RIGHT NOW · {part.n.toUpperCase()}</Txt>
          <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24 }}>Up next: {f.label}</Txt>
          <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>{fmtT(f.at).full} · in {dur(diff)}</Txt>
        </View>
      </Row>
    </Card>
  );
}

function Wrap({ part }: { part: ReturnType<typeof partOfDay> }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const { state } = useStore();
  const t = totals(d);
  const st = workoutState(d);
  const tomorrow = d.plans[(TODAY_IDX + 1) % 7];
  const tmw = tomorrow ? `${tomorrow.name} at ${fmtT(plannedMin(state.profile.time)).full}` : 'Rest day';
  const bits = [st === 'done' ? 'Workout done' : st === 'rest' ? 'Rest day' : null, `${t.k.toLocaleString('en-IN')} kcal eaten`, `${Math.round(d.water * 100) / 100} L water`].filter(Boolean);
  return (
    <Card style={{ padding: 16, gap: 8 }}>
      <Label part={part} color={c.accentText} />
      <Txt style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 29, letterSpacing: -0.6 }}>You are all set for today</Txt>
      <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>{bits.join(' · ')}</Txt>
      <Txt style={{ fontSize: 14, lineHeight: 20 }}>Tomorrow: <Txt style={{ fontFamily: font.semibold }}>{tmw}</Txt></Txt>
    </Card>
  );
}
