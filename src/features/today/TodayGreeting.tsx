import React from 'react';
import { View } from 'react-native';
import { Txt } from '@/components/ui';
import { MEALS, fmtT } from '@/lib/data';
import { plannedMin, useDomain, workoutState } from '@/lib/domain';
import { forceCtx, greetHeading, GreetingState } from '@/lib/microcopy';
import { createStore } from '@/lib/createStore';
import { useLogsPaused } from '@/lib/logGate';
import { useStore } from '@/lib/store';
import { useStreak } from '@/features/streak/useStreak';
import { nextMeal } from './meals';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// Demo panel: preview any state of the line.
export const greetStore = createStore(() => ({ state: 'Auto' as GreetingState }));

// The top of Today: one heading that follows what is going on ("Good evening, Rohitashav", "Almost time, Rohitashav"). No container, no second line.
export function TodayGreeting() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { state } = useStore();
  const streak = useStreak();
  const paused = useLogsPaused();
  const first = (state.profile.name || '').trim().split(' ')[0];
  const nm = nextMeal(d);
  const g = greetStore.use();
  const base = {
    min: d.min, planned: plannedMin(state.profile.time), workout: workoutState(d),
    nextMeal: nm ? MEALS.find((m) => m.id === nm)?.n ?? null : null,
    weeks: streak.weeks, weekDone: streak.weekDone, target: streak.target, paused,
    day: new Date().getDate(), clock: (m: number) => fmtT(m).full,
  };
  const ctx = forceCtx(base, g.state);
  const head = greetHeading(ctx, first);
  return (
    <View accessible accessibilityLabel={head} style={{ paddingHorizontal: 4 }}>
      <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 26, lineHeight: 34, letterSpacing: -0.5, color: c.ink }}>{head}</Txt>
    </View>
  );
}
