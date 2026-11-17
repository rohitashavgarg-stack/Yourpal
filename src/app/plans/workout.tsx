import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Play } from '@/lib/icons';
import { Button } from '@/design-system/primitives/Button';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { SubPage } from '@/features/progress/parts';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { useStartWorkout } from '@/features/workout/StartSheet';
import { useLogsPaused } from '@/lib/logGate';
import { useCanStart, WorkoutPlan } from '@/features/plans/WorkoutPlan';
import { dayPlan, usePlans } from '@/features/plans/store';

// The details of one workout of the day (opened from a card on the Plans timeline). A full page that grows out of the card, with a drag handle, no back button.
// It shows the same plan layout as a day with one workout: the header, warm-up, exercises and cool-down. Start (or Resume) floats at the bottom of the page.
export default function PlanWorkout() {
  const { c } = useTheme();
  const { d } = useDomain();
  const startWorkout = useStartWorkout();
  const paused = useLogsPaused();
  const { p } = usePlans();
  const done = !!dayPlan(d, p, p.day)?.done; // a completed workout gets a green glow and a Completed tag
  const canStart = useCanStart() && !paused;
  const live = !!d.session;
  const footer = canStart ? (
    <Button kind="glassAccent" label={live ? 'Resume workout' : 'Start workout'} icon={<Play size={18} color={c.accentInk} fill={c.accentInk} />}
      onPress={() => (live ? router.push('/workout') : startWorkout())} />
  ) : undefined;
  return (
    <SubPage title="" fallback="/plans" backdrop={<TopGlow color={done ? c.good : c.accent} />} floatingFooter footer={footer}>
      <View style={{ gap: 24 }}>
        <WorkoutPlan hideStart completedTag />
      </View>
    </SubPage>
  );
}
