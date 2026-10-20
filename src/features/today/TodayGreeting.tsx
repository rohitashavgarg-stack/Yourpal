import React from 'react';
import { View } from 'react-native';
import { Txt } from '@/components/ui';
import { MEALS, fmtT } from '@/lib/data';
import { plannedMin, useDomain, workoutState } from '@/lib/domain';
import { forceCtx, greeting, GreetingState } from '@/lib/microcopy';
import { createStore } from '@/lib/createStore';
import { useLogsPaused } from '@/lib/logGate';
import { useStore } from '@/lib/store';
import { useStreak } from '@/features/streak/useStreak';
import { nextMeal } from './meals';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// Demo panel: preview any state of the line.
export const greetStore = createStore(() => ({ state: 'Auto' as GreetingState }));

// The top of Today: one big line with the name in it ("It's your rest day, Rohitashav"), or a small greeting with the name over a big fact ("Good job, Rohitashav" over "3 week streak"). No container.
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
  const { small, big } = greeting(ctx, first);
  return (
    <View accessible accessibilityLabel={small ? `${small}. ${big}` : big} style={{ paddingHorizontal: 4, gap: 0 }}>
      {!!small && <Txt style={{ fontFamily: font.medium, fontSize: 19, lineHeight: 26, color: c.muted }}>{small}</Txt>}
      <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 32, lineHeight: 40, letterSpacing: -0.8, color: c.ink }}>{big}</Txt>
    </View>
  );
}
