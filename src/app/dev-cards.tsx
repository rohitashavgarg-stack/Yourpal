import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mealsAt, useDomain } from '@/lib/domain';
import { goalCardStore, GoalCardState } from '@/features/today/goalCardState';
import { GoalTickCard } from '@/features/today/GoalTickCard';
import { TodayBudgetCard } from '@/features/today/TodayBudget';
import { useTheme } from '@/theme/ThemeProvider';

// Developer page for the screenshot checks (scripts/visual/capture-cards.js). It draws one card in one state, nothing else.
// It does nothing in a production build (it redirects to Today).
//   /dev-cards?c=goal&s=behind&w=12&v=flat      the goal card; s = a GoalCardState, w = days since the last weigh-in, v = flat for the goal page header
//   /dev-cards?c=budget&s=watch                 the Today calories card; s = default | nothing-eaten | all-logged | workout-done | watch
//                                               add &g=frozen (any GoalCardState) to pin the goal state of its goal row
export default function DevCards() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Harness />;
}

function Harness() {
  const p = useLocalSearchParams<{ c?: string; s?: string; v?: string; w?: string; g?: string }>();
  const { c } = useTheme();
  const { set } = useDomain();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (p.c === 'budget') {
      if (p.s === 'nothing-eaten') set({ meals: {} });
      if (p.s === 'all-logged') set({ meals: mealsAt(2000) });
      if (p.s === 'workout-done') set({ wkDone: { a: 1110, b: 1160, k: 380 } });
      if (p.s === 'watch') set({ hc: true, wearable: true });
      if (p.g) goalCardStore.set({ force: p.g as GoalCardState });
    }
    if (p.c === 'goal' && p.w) goalCardStore.set({ weighDays: Number(p.w) });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 24 }}>
      <View>
        {p.c === 'budget'
          ? <TodayBudgetCard />
          : <GoalTickCard flat={p.v === 'flat'} state={p.s as GoalCardState | undefined} weighDays={p.w ? Number(p.w) : undefined} />}
      </View>
    </ScrollView>
  );
}
