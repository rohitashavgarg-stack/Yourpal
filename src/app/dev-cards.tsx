import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Domain, mealsAt, useDomain } from '@/lib/domain';
import { goalCardStore, GoalCardState } from '@/features/today/goalCardState';
import { GoalTickCard } from '@/features/today/GoalTickCard';
import { TodayBudgetCard } from '@/features/today/TodayBudget';
import { WorkoutCard, missedWkStore } from '@/features/today/WorkoutCard';
import { MealNowCard } from '@/features/today/MealsCard';
import { ConnectCard, HealthCards, Trackers, WaterCard, WeightCard } from '@/features/today/Trackers';
import { WeekCard } from '@/features/today/WeekCard';
import { MembershipCard, PaymentBanner, useMembershipNotice } from '@/features/today/PaymentBanner';
import { newSession } from '@/features/workout/session';
import { useTheme } from '@/theme/ThemeProvider';

// Developer page for the screenshot checks (scripts/visual/capture-cards.js). It draws one card in one state, nothing else.
// It does nothing in a production build (it redirects to Today).
//   /dev-cards?c=goal&s=behind&w=12&v=flat      the goal card; s = a GoalCardState, w = days since the last weigh-in, v = flat for the goal page header
//   /dev-cards?c=budget&s=watch                 the Today calories card; s = default | nothing-eaten | all-logged | workout-done | watch
//                                               add &g=onTrack (any GoalCardState) to pin the goal state of its goal row
//   /dev-cards?c=workout&s=missed               the workout card; s = upcoming | due | missed | moved | skipped | live | done | done-watch | rest | paused | comeback
//   /dev-cards?c=meals&s=complete               the Today meals card; s = now | missed | complete | paused | other | nothing
//   /dev-cards?c=trackers&s=health              the tracker row; s = default | health | hc-only | weight-up | water-empty | water-full | tiles | tiles-health
//   /dev-cards?c=week&s=done                    the week card; s = default | done | checked-in
//   /dev-cards?c=banner&s=card-expired          the account banner; s = strip | card-active | card-expiring | card-expired
type Patch = Partial<Domain>;
const SCENES: Record<string, Record<string, () => Patch | void>> = {
  workout: {
    upcoming: () => ({ min: 900 }),
    due: () => ({}),
    missed: () => ({ min: 1300 }),
    moved: () => { missedWkStore.set({ answer: 'moved' }); return { min: 1300 }; },
    skipped: () => { missedWkStore.set({ answer: 'skipped' }); return { min: 1300 }; },
    live: () => ({ session: { ...newSession(), startAt: Date.now() - 754000 } }),
    done: () => ({ wkScenario: 'Done' }),
    'done-watch': () => ({ wkScenario: 'Done', hc: true, wearable: true }),
    rest: () => ({ wkScenario: 'Rest day' }),
    paused: () => ({ membership: 'Expired' }),
    comeback: () => ({ todayVariant: 'Comeback' }),
  },
  meals: {
    now: () => ({}),
    missed: () => ({ min: 1300, meals: {} }),
    complete: () => ({ meals: mealsAt(2000) }),
    paused: () => ({ membership: 'Expired' }),
    other: () => ({ openMeal: 'bf' }),
    nothing: () => ({ meals: {} }),
  },
  trackers: {
    default: () => ({}),
    health: () => ({ hc: true, wearable: true }),
    'hc-only': () => ({ hc: true }),
    'weight-up': () => ({ weight: 73.1 }),
    'water-empty': () => ({ water: 0 }),
    'water-full': () => ({ water: 3 }),
    tiles: () => ({}),
    'tiles-health': () => ({ hc: true, wearable: true }),
  },
  week: {
    default: () => ({}),
    done: () => ({ wkScenario: 'Done' }),
    'checked-in': () => ({ ci: 'Checked in' }),
  },
  banner: {
    strip: () => ({ membership: 'Expired', hasGym: true }),
    'card-active': () => ({ membership: 'Active' }),
    'card-expiring': () => ({ membership: 'Expiring' }),
    'card-expired': () => ({ membership: 'Expired' }),
  },
};

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
    const scene = p.c && p.s ? SCENES[p.c]?.[p.s] : undefined;
    if (scene) { const patch = scene(); if (patch) set(patch); }
    if (p.w) goalCardStore.set({ weighDays: Number(p.w) });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 24 }}>
      <View>{card(p.c, p.s, p.v, p.w)}</View>
    </ScrollView>
  );
}

function card(kind?: string, s?: string, v?: string, w?: string) {
  switch (kind) {
    case 'budget': return <TodayBudgetCard />;
    case 'workout': return <WorkoutCard restart={s === 'comeback'} />;
    case 'meals': return <MealNowCard />;
    case 'trackers':
      return s?.startsWith('tiles')
        ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}><WeightCard /><ConnectCard /><WaterCard />{s === 'tiles-health' && <HealthCards />}</View>
        : <Trackers />;
    case 'week': return <WeekCard />;
    case 'banner': return s === 'strip' ? <PaymentBanner /> : <NoticeCard />;
    default: return <GoalTickCard flat={v === 'flat'} state={s as GoalCardState | undefined} weighDays={w ? Number(w) : undefined} />;
  }
}

function NoticeCard() { return <MembershipCard n={useMembershipNotice()} />; }
