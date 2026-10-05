import React, { useEffect, useRef, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { TabScreen } from '@/components/TabScreen';
import { GymHeader } from '@/components/GymHeader';
import { Skeleton } from '@/components/bits';
import { useToastLift } from '@/components/Overlay';
import { CheckInScenario, mealsFor, TimeOfDay, useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ComebackCard, GoalCard, UpdatesCard } from '@/features/today/TopCards';
import { Trackers } from '@/features/today/Trackers';
import { WorkoutCard } from '@/features/today/WorkoutCard';
import { MealsCard } from '@/features/today/MealsCard';
import { WeekCard } from '@/features/today/WeekCard';
import { CheckInBar, useCiMode } from '@/features/today/CheckInBar';
import { useCheckIn, useCheckInPanel } from '@/features/checkin/useCheckIn';

let firstLoad = true; // the skeleton shows once per app launch, like a real fetch

import { StreakChip } from '@/features/streak/StreakChip';
import { STEPS_DESIGNS, StepsDesign, stepsStore } from '@/features/today/StepsCards';
import { GoalCard2 } from '@/features/goalv2/GoalCard2';
import { goalV2Store } from '@/features/goalv2/model';
import { useGoalV2Rows } from '@/features/goalv2/signs';
import { DESIGNS, GoalDesign, GoalPace, goalStore, GoalSwitch, PACES } from '@/features/today/GoalCards';
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

  const gs = goalStore.use();
  const st = stepsStore.use();
  const gv = goalV2Store.use();
  const goalRows = useGoalV2Rows();
  useScenarios({
    title: 'Today',
    rows: [
      { label: 'Today variant', options: ['Regular', 'With updates', 'Comeback'], value: d.todayVariant, onPick: (v) => set({ todayVariant: v as any, dismissed: {} }) },
      ...goalRows,
      ...(gv.version === 'Version 1' ? [{ label: 'Goal card design', options: DESIGNS, value: gs.design, onPick: (v: string) => goalStore.set({ design: v as GoalDesign }) }] : []),
      { label: 'Steps tracker design', options: STEPS_DESIGNS, value: st.design, onPick: (v) => stepsStore.set({ design: v as StepsDesign }) },
      ...(gv.version === 'Version 1' ? [{ label: 'Goal pace', options: PACES, value: gs.pace, onPick: (v: string) => goalStore.set({ pace: v as GoalPace }) }] : []),
      { label: 'Wearable (Health Connect)', options: ['Connected', 'Not connected'], value: d.hc ? 'Connected' : 'Not connected', onPick: (v) => set({ hc: v === 'Connected' }) },
      { label: 'Time of day', options: ['Morning', 'Afternoon', 'Evening'], value: d.time, onPick: (v) => set({ time: v as TimeOfDay, meals: mealsFor(v as TimeOfDay), openMeal: null, ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null }) },
      { label: 'Workout today', options: ['Not started', 'Done', 'Rest day'], value: d.wkDone ? 'Done' : d.wkScenario, onPick: (v) => set({ wkScenario: v as any, wkDone: null, session: v === 'Not started' ? d.session : null }) },
      { label: 'Check-in (location)', options: ['Away', 'Near (25 m)', 'At the gym', 'Checked in', 'Location off'], value: d.ci, onPick: (v) => CI.pickCi(v as CheckInScenario) },
      { label: 'Food scan result', options: ['Works', 'Fails'], value: d.scanFails ? 'Fails' : 'Works', onPick: (v) => set({ scanFails: v === 'Fails' }) },
    ],
    actions: [
      ...ciActions,
      { label: 'Show loading state', run: () => load(1400) },
      { label: 'Reset meals for this time of day', run: () => set({ meals: mealsFor(d.time), openMeal: null }) },
    ],
  }, [d.todayVariant, d.hc, d.time, d.wkScenario, d.wkDone, d.ci, d.scanFails, d.session, d.ciStart, d.ciOut, d.ciExtend, gs.design, gs.pace, st.design, gv.version, gv.scenario, d.goal]);

  const greet = { Morning: 'Good morning', Afternoon: 'Good afternoon', Evening: 'Good evening' }[d.time];
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TabScreen title={`${greet},
Jyotsana`} header={<GymHeader />} compactTitle={false} bottomPad={anyBar ? 186 : 112}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={c.accentText} onRefresh={() => { setRefreshing(true); load(1000); }} />}>
        {d.loading ? (
          <>
            <Skeleton h={172} />
            <Skeleton h={148} />
            <View style={{ flexDirection: 'row', gap: 12 }}><Skeleton h={176} style={{ flex: 1 }} /><Skeleton h={176} style={{ flex: 1 }} /></View>
            <Skeleton h={64} />
            <Skeleton h={250} />
          </>
        ) : (
          <>
            {d.todayVariant === 'With updates' && <Enter i={0}><UpdatesCard /></Enter>}
            <Enter i={1}><StreakChip /></Enter>
            <Enter i={1}>{gv.version === 'Version 2' ? <GoalCard2 size="compact" /> : <GoalSwitch />}</Enter>
            {d.todayVariant === 'Comeback' && <Enter i={2}><ComebackCard /></Enter>}
            <Enter i={2}><Trackers /></Enter>
            <Enter i={3}><WorkoutCard /></Enter>
            <Enter i={4}><MealsCard /></Enter>
            <Enter i={5}><WeekCard /></Enter>
          </>
        )}
      </TabScreen>
      {!d.loading && <CheckInBar />}
    </View>
  );
}
