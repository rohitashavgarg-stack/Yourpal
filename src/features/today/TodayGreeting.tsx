import React from 'react';
import { View } from 'react-native';
import { Txt } from '@/components/ui';
import { MEALS, fmtT } from '@/lib/data';
import { plannedMin, useDomain, workoutState } from '@/lib/domain';
import { forceCtx, greeting, GreetingState } from '@/lib/microcopy';
import { createStore } from '@/lib/createStore';
import { useLogsPaused } from '@/lib/logGate';
import { useStore } from '@/lib/store';
import { planStore } from '@/lib/planState';
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
    day: new Date().getDate(), clock: (m: number) => fmtT(m).full, noPlan: !planStore.use().assigned,
  };
  const ctx = forceCtx(base, g.state);
  const { top, lead, hl } = greeting(ctx, first);
  const big = { fontFamily: font.regular, fontSize: 32, lineHeight: 40, letterSpacing: -0.6, color: c.muted } as const; // both lines: light, grey; the key phrase is brighter
  return (
    <View accessible accessibilityLabel={`${top}. ${lead ? lead + ' ' : ''}${hl}`} style={{ paddingHorizontal: 4, gap: 0 }}>
      <Txt style={big}>{top}</Txt>
      <Txt accessibilityRole="header" style={big}>{lead ? lead + ' ' : ''}<Txt style={[big, { color: c.ink }]}>{hl}</Txt></Txt>
    </View>
  );
}
