import React, { useEffect, useRef, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { TabScreen } from '@/components/TabScreen';
import { GymHeader } from '@/components/GymHeader';
import { Skeleton } from '@/components/bits';
import { useToastLift } from '@/components/Overlay';
import { CheckInScenario, mealsAt, mealsFor, NOWS, TimeOfDay, useDomain, workoutState } from '@/lib/domain';
import { nextMeal } from '@/features/today/meals';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ComebackCard, ComebackGreeting, PtConfirmCard, UpdatesCard } from '@/features/today/TopCards';
import { usePtPending } from '@/features/shell/notifs';
import { Trackers } from '@/features/today/Trackers';
import { WorkoutCard } from '@/features/today/WorkoutCard';
import { MealNowCard } from '@/features/today/MealsCard';
import { WeekCard } from '@/features/today/WeekCard';
import { useRightNowFocus } from '@/features/today/timeline';
import { ForYouStack, useForYou } from '@/features/today/ForYou';
import { todayUiStore } from '@/features/today/ui';
import { PaymentBanner, usePaymentNotice } from '@/features/today/PaymentBanner';
import { CheckInBar, useCiMode } from '@/features/today/CheckInBar';
import { useCheckIn, useCheckInPanel } from '@/features/checkin/useCheckIn';
import { ViewOnly } from '@/features/today/ViewOnly';
import { TodayBudgetCard, topCardStore } from '@/features/today/TodayBudget';
import { TodayGreeting } from '@/features/today/TodayGreeting';
import { DayQuote } from '@/features/today/DayQuote';
import { NoPlanCard } from '@/features/today/NoPlanCard';
import { planStore } from '@/lib/planState';
import { PushBanner } from '@/features/reminders/PushBanner';
import { GOAL_STATE_OPTIONS, goalCardStore } from '@/features/today/goalCardState';

const SHOW_GREETING = false; // the big greeting is off for now, the goal sits right under the header
let firstLoad = true; // the skeleton shows once per app launch, like a real fetch

import { StreakChip } from '@/features/streak/StreakChip';
import { STEPS_DESIGNS, StepsDesign, stepsStore } from '@/features/today/StepsCards';
import { goalSizeStore, GoalTickCard } from '@/features/today/GoalTickCard';
import { goalV2Store } from '@/features/goalv2/model';
import { useGoalV2Rows } from '@/features/goalv2/signs';
import { DESIGNS, GoalDesign, GoalPace, goalStore, PACES } from '@/features/today/GoalCards';
const Enter = ({ i, children }: { i: number; children: React.ReactNode }) => (
  <Animated.View entering={fade(i * 50)}>{children}</Animated.View>
);

export default function Today() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const insets = useSafeAreaInsets();
  const ciMode = useCiMode();
  const CI = useCheckIn();
  const ciActions = useCheckInPanel();
  const [refreshing, setRefreshing] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = (ms: number) => { set({ loading: true }); clearTimeout(t.current); t.current = setTimeout(() => { set({ loading: false }); setRefreshing(false); }, ms); };
  useEffect(() => { if (firstLoad) { firstLoad = false; load(1100); } return () => clearTimeout(t.current); }, []);

  const anyBar = !d.loading && (!!d.session || ciMode !== 'none');
  const navBottom = Math.max(insets.bottom - 6, 14);
  useToastLift(anyBar ? navBottom + 74 + 68 : 0);

  const ptPending = usePtPending();
  // cards that would render nothing get no slot at all, so an empty slot never adds an extra gap
  const forYou = useForYou();
  const [stripY, setStripY] = useState(0); // where the membership strip sits in the page: it docks under the header once scrolled to
  const payNotice = usePaymentNotice();
  const layout = todayUiStore.use().layout;
  const isNew = layout === 'New';
  const focus = useRightNowFocus(isNew);
  // New layout: the section for what is happening now floats to the top, the others follow.
  // The main card of the moment comes first, right under the updates; the goal follows it. Workout time: workout. Meal time: meals.
  // Neither is due: the workout is first (unless it is done or a rest day, then the meals). End of the day: the week.
  const wkSettledNow = ['done', 'rest', 'hidden'].includes(workoutState(d));
  const primary: 'restart' | 'workout' | 'meals' | 'wrap' = focus.kind === 'restart' ? 'restart' : focus.kind === 'live' || focus.kind === 'workout' || focus.kind === 'late' ? 'workout' : focus.kind === 'meal' ? 'meals' : focus.kind === 'next' ? (wkSettledNow ? 'meals' : 'workout') : 'wrap';
  // What matters most right now floats up (the goal and anything that needs an answer stay pinned at the top):
  //  workout time: workout, then meals. Meal time: meals first, and the workout drops lower once it is done or it is a rest day.
  //  End of the day: the week first. In between: trackers, then whatever comes next. The streak card sits above the goal.
  const wkSettled = ['done', 'rest', 'hidden'].includes(workoutState(d));
  const mealsSettled = nextMeal(d) === null;
  type Slot = 'workout' | 'meals' | 'trackers' | 'week';
  const order: Slot[] = primary === 'workout' ? ['workout', 'meals', 'trackers', 'week']
    : primary === 'meals' ? (wkSettled ? ['meals', 'trackers', 'workout', 'week'] : ['meals', 'workout', 'trackers', 'week'])
    : primary === 'wrap' ? (wkSettled ? ['week', 'meals', 'workout', 'trackers'] : ['week', 'workout', 'meals', 'trackers'])
    : ['trackers', 'workout', 'meals', 'week'];
  // every meal is already logged: the meals card has nothing to ask, so it moves below the trackers
  if (mealsSettled && primary !== 'wrap') { order.splice(order.indexOf('meals'), 1); order.splice(order.indexOf('trackers') + 1, 0, 'meals'); }
  const assigned = planStore.use().assigned;
  if (!assigned) order.splice(0, order.length, 'trackers'); // no plans: only the trackers
  const slots: Record<Slot, React.ReactNode> = { workout: <WorkoutCard />, meals: <ViewOnly><MealNowCard /></ViewOnly>, trackers: <ViewOnly><Trackers /></ViewOnly>, week: <WeekCard /> };
  const focusMeal = focus.kind === 'meal' ? focus.meal.id : null;
  useEffect(() => { if (focusMeal) set({ openMeal: focusMeal }); }, [focusMeal]); // eslint-disable-line react-hooks/exhaustive-deps
  const gs = goalStore.use();
  const st = stepsStore.use();
  const gv = goalV2Store.use();
  const gsz = goalSizeStore.use();
  const goalRows = useGoalV2Rows();
  const gcs = goalCardStore.use();
  const topMode = topCardStore.use().mode;
  useScenarios({
    title: 'Today',
    rows: [
      { label: 'Today variant', options: ['Regular', 'With updates', 'Comeback'], value: d.todayVariant, onPick: (v) => set({ todayVariant: v as any, dismissed: {} }) },
      ...goalRows,
      { label: 'Goal card state', options: ['Auto', ...GOAL_STATE_OPTIONS.map(([l]) => l)], value: gcs.force === 'auto' ? 'Auto' : GOAL_STATE_OPTIONS.find(([, k]) => k === gcs.force)![0],
        onPick: (v) => {
          const hit = GOAL_STATE_OPTIONS.find(([l]) => l === v);
          goalCardStore.set({ force: hit ? hit[1] : 'auto' });
          // keep the goal page in step, so tapping a Behind card lands on the option to move the date
          if (hit?.[1] === 'behind') goalV2Store.set({ scenario: 'A bit behind', extendDays: 0, lowerBy: 0, finished: false });
        } },
      { label: 'Membership hold', options: ['None', 'Frozen', 'Paused'], value: d.hold ?? 'None', onPick: (v) => set({ hold: v as any }) },
      { label: 'Last weigh-in', options: ['Today', '3 days ago', '10+ days ago'], value: gcs.weighDays >= 10 ? '10+ days ago' : gcs.weighDays >= 3 ? '3 days ago' : 'Today', onPick: (v) => goalCardStore.set({ weighDays: v === '10+ days ago' ? 12 : v === '3 days ago' ? 3 : 0 }) },
      ...(gv.version === 'Version 1' ? [{ label: 'Goal card design', options: DESIGNS, value: gs.design, onPick: (v: string) => goalStore.set({ design: v as GoalDesign }) }] : []),
      { label: 'Steps tracker design', options: STEPS_DESIGNS, value: st.design, onPick: (v) => stepsStore.set({ design: v as StepsDesign }) },
      ...(gv.version === 'Version 1' ? [{ label: 'Goal pace', options: PACES, value: gs.pace, onPick: (v: string) => goalStore.set({ pace: v as GoalPace }) }] : []),
      { label: 'Health (steps)', options: ['Connected', 'Not connected'], value: d.hc ? 'Connected' : 'Not connected', onPick: (v) => set({ hc: v === 'Connected' }) },
      { label: 'Wearable (heart rate, sleep, energy)', options: ['Has a wearable', 'No wearable'], value: d.wearable ? 'Has a wearable' : 'No wearable', onPick: (v) => set({ wearable: v === 'Has a wearable' }) },
      { label: 'Time of day', options: ['Morning', 'Afternoon', 'Evening'], value: d.time, onPick: (v) => set({ time: v as TimeOfDay, min: NOWS[v as TimeOfDay], meals: mealsFor(v as TimeOfDay), openMeal: null, ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null }) },
      { label: 'Workout today', options: ['Not started', 'Done', 'Rest day'], value: d.wkDone ? 'Done' : d.wkScenario, onPick: (v) => set({ wkScenario: v as any, wkDone: null, session: v === 'Not started' ? d.session : null }) },
      { label: 'Check-in (location)', options: ['Away', 'Near (25 m)', 'At the gym', 'Checked in', 'Location off'], value: d.ci, onPick: (v) => CI.pickCi(v as CheckInScenario) },
      { label: 'Food scan result', options: ['Works', 'Fails'], value: d.scanFails ? 'Fails' : 'Works', onPick: (v) => set({ scanFails: v === 'Fails' }) },
    ],
    actions: [
      ...ciActions,
      { label: 'Show loading state', run: () => load(1400) },
      { label: 'Reset meals for this time of day', run: () => set({ meals: mealsAt(d.min), openMeal: null }) },
    ],
  }, [layout, d.todayVariant, d.hc, d.time, d.wkScenario, d.wkDone, d.ci, d.scanFails, d.session, d.ciStart, d.ciOut, d.ciExtend, gs.design, gs.pace, st.design, gv.version, gsz.size, gv.scenario, d.goal, d.hold, gcs.force, gcs.weighDays]);

  // After a break the greeting itself says welcome back (new layout); the days away sit right under the title.
  const greet = { Morning: 'Good morning', Afternoon: 'Good afternoon', Evening: 'Good evening' }[d.time];
  const comebackNew = isNew && d.todayVariant === 'Comeback';
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TabScreen title={!SHOW_GREETING ? '' : comebackNew ? `We missed you
the last ${d.awayDays} days` : `${greet},
Rohitashav`} header={<GymHeader />} compactTitle={false} bottomPad={anyBar ? 186 : 112}
        pinned={isNew && !!payNotice && !payNotice.once ? <View style={{ paddingTop: 10, marginBottom: -8 }}><PaymentBanner /></View> : undefined} pinAfter={Math.max(0, stripY - (insets.top + 8 + 56))}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={c.accentText} onRefresh={() => { setRefreshing(true); load(1000); }} />}>
        {d.loading ? (
          <>
            <Skeleton h={172} />
            <Skeleton h={148} />
            <View style={{ flexDirection: 'row', gap: 12 }}><Skeleton h={176} style={{ flex: 1 }} /><Skeleton h={176} style={{ flex: 1 }} /></View>
            <Skeleton h={64} />
            <Skeleton h={250} />
          </>
        ) : isNew ? (
          <>
            {/* top: the membership strip, then the updates; on a comeback day the comeback card comes first and the updates after the goal */}
            {comebackNew && <Enter i={0}><ComebackGreeting /></Enter>}
            {!!payNotice && <Enter i={0}><View style={{ marginTop: 14, marginBottom: comebackNew ? -12 : 6 }} onLayout={(e) => setStripY(e.nativeEvent.layout.y)}><PaymentBanner /></View></Enter>}
            {comebackNew && <Enter i={0}><WorkoutCard restart /></Enter>}
            {!comebackNew && <Enter i={0}><TodayGreeting /></Enter>}
            {!comebackNew && forYou.length > 0 && <Enter i={0}><ForYouStack /></Enter>}
            {/* today's calories stay at the top, right under the updates; the cards below follow the time of day (the workout at workout time, the meals at meal time, the week at the end of the day) */}
            <Enter i={1}>{!assigned ? <NoPlanCard /> : topMode === 'Today card' ? <TodayBudgetCard /> : <GoalTickCard />}</Enter>
            {comebackNew && forYou.length > 0 && <Enter i={1}><ForYouStack /></Enter>}
            {order.map((k, i) => <Enter key={k} i={2 + i}>{slots[k]}</Enter>)}
            <Enter i={7}><DayQuote /></Enter>
          </>
        ) : (
          <>
            {/* account banner and the other things that need an answer come first; on a comeback day the comeback card (the workout) comes right before the goal */}
            {!!payNotice && <Enter i={0}><PaymentBanner /></Enter>}
            {ptPending && d.hasGym && <Enter i={0}><PtConfirmCard /></Enter>}
            {d.todayVariant === 'With updates' && <Enter i={0}><UpdatesCard /></Enter>}
            {d.todayVariant === 'Comeback' && <Enter i={0}><ComebackCard /></Enter>}
            <Enter i={1}><StreakChip /></Enter>
            <Enter i={1}>{!assigned ? <NoPlanCard /> : topMode === 'Today card' ? <TodayBudgetCard /> : <GoalTickCard />}</Enter>
            {order.map((k, i) => <Enter key={k} i={2 + i}>{slots[k]}</Enter>)}
          </>
        )}
      </TabScreen>
      {!d.loading && <CheckInBar />}
      <PushBanner />
    </View>
  );
}
