import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { Dumbbell, MoreHorizontal, UtensilsCrossed } from '@/lib/icons';
import { fade } from '@/theme/motion';
import { TabScreen } from '@/components/TabScreen';
import { GymHeader } from '@/components/GymHeader';
import { Pressy, Row, Segmented, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { basePlans, TODAY_IDX } from '@/lib/data';
import { useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { StickyStart, useCanStart, WorkoutPlan } from '@/features/plans/WorkoutPlan';
import { DietPlan } from '@/features/plans/DietPlan';
import { DietMenuSheet, PlanMenuSheet } from '@/features/plans/Sheets';
import { applyCoachUpdate, COACH_HL } from '@/features/plans/content';
import { haptic } from '@/lib/haptics';
import { DAYL, DAYN, dateOf, monthOf, dayPlan, Diet, resetPlans, setP, usePlans } from '@/features/plans/store';

const JUMP: [string, number][] = [['Today (Wed)', TODAY_IDX], ['Past day (Mon)', 0], ['Rest day (Tue)', 1], ['Future (Thu)', 3]];

const WEEKS = [-2, -1, 0, 1, 2, 3]; // two back, this week, three ahead
const THIS = WEEKS.indexOf(0);

// Swipe sideways for other weeks. Past weeks have no logged history; future weeks repeat the plan.
function DayStrip() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();
  const isW = p.seg === 'workout';
  const [w, setW] = useState(0);
  const [page, setPage] = useState(THIS);
  const ref = useRef<ScrollView>(null);
  const cur = WEEKS[page] ?? 0;
  useEffect(() => { if (w > 0) { const t = setTimeout(() => ref.current?.scrollTo({ x: THIS * w, animated: false }), 30); return () => clearTimeout(t); } }, [w]);
  useEffect(() => { // a deep link to another week brings that week into view
    const k = WEEKS.indexOf(p.week);
    if (w > 0 && k >= 0 && k !== page) { ref.current?.scrollTo({ x: k * w, animated: true }); setPage(k); }
  }, [p.week]);
  const goto = (k: number) => { ref.current?.scrollTo({ x: k * w, animated: true }); setPage(k); haptic.tick(); };
  const range = `${monthOf(0, cur)} ${dateOf(0, cur)} – ${monthOf(6, cur) !== monthOf(0, cur) ? monthOf(6, cur) + ' ' : ''}${dateOf(6, cur)}`;
  return (
    <View style={{ gap: 6 }}>
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4, minHeight: 32 }}>
        <Txt v="label" accessibilityLiveRegion="polite">{cur === 0 ? `This week · ${range}` : cur < 0 ? `${range} · earlier` : `${range} · coming up`}</Txt>
        {cur !== 0 && <Pressy accessibilityRole="button" accessibilityLabel="Back to this week" onPress={() => goto(THIS)} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: c.accentSoft, justifyContent: 'center' }}><Txt style={{ fontFamily: font.semibold, fontSize: 12, color: c.accentText }}>This week</Txt></Pressy>}
      </Row>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <ScrollView ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false} accessibilityLabel="Weeks, swipe for earlier or later weeks" scrollEventThrottle={16}
          onScroll={(e) => { const k = Math.round(e.nativeEvent.contentOffset.x / (w || 1)); if (k !== page && k >= 0 && k < WEEKS.length) { setPage(k); haptic.tick(); } }}
          contentOffset={{ x: THIS * (w || 0), y: 0 }}>
          {WEEKS.map((wk) => (
            <View key={wk} style={{ width: w || 358, flexDirection: 'row', gap: 4 }}>
              {DAYN.map((l, i) => {
                const pw = { ...p, week: wk };
                const plan = dayPlan(d, pw, i);
                const on = i === p.day && wk === p.week;
                const isToday = wk === 0 && i === TODAY_IDX;
                const rel = Math.sign(wk * 7 + i - TODAY_IDX);
                const dot = isW ? (plan ? (rel < 0 && plan.done ? c.good : c.accent) : 'transparent') : rel <= 0 && wk === 0 ? c.good : 'transparent';
                return (
                  <Pressy key={i} accessibilityRole="button" accessibilityState={{ selected: on }}
                    accessibilityLabel={`${DAYL[i]} ${dateOf(i, wk)} ${monthOf(i, wk)}${isToday ? ', today' : ''}${isW ? (plan ? `, ${plan.name}` : ', rest day') : ''}`}
                    onPress={() => setP({ day: i, week: wk })} scaleTo={0.94}
                    style={{ flex: 1, height: 60, borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 1, backgroundColor: on ? c.ink : 'transparent', borderWidth: isToday ? 1.5 : 0, borderColor: c.accent }}>
                    <Txt style={{ fontSize: 11, lineHeight: 14, color: on ? c.bg : c.ink, opacity: 0.7 }}>{l}</Txt>
                    <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 21, color: on ? c.bg : c.ink }}>{dateOf(i, wk)}</Txt>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: dot }} />
                  </Pressy>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default function Plans() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { p } = usePlans();
  const { openSheet, toast } = useOverlay();
  const params = useLocalSearchParams<{ day?: string; seg?: string }>();

  // Deep links from Today (a future day in "This week", "Re-plan my week").
  useEffect(() => {
    const day = params.day != null ? Number(params.day) : NaN;
    if (!Number.isNaN(day) && day >= 0 && day < 7) setP({ day, week: 0 });
    if (params.seg === 'diet' || params.seg === 'workout') setP({ seg: params.seg });
  }, [params.day, params.seg]);

  const isW = p.seg === 'workout';
  const openMenu = () => {
    if (p.noPlan) { toast('Menu opens once Coach Vikram shares your plan'); return; }
    openSheet(isW ? <PlanMenuSheet /> : <DietMenuSheet />, { label: isW ? 'Plan menu' : 'Diet menu' });
  };

  useScenarios({
    title: 'Plans',
    rows: [
      { label: 'Plan type', options: ['Workout', 'Diet'], value: isW ? 'Workout' : 'Diet', onPick: (v) => setP({ seg: v === 'Diet' ? 'diet' : 'workout' }) },
      { label: 'Coach updated the plan', options: ['Off', 'On'], value: d.coachUpdated ? 'On' : 'Off', onPick: (v) => {
        const on = v === 'On';
        if (!on && p.applied) set({ plans: basePlans() });
        set({ coachUpdated: on }); setP({ applied: false, hl: [] });
      } },
      { label: 'Plan change request', options: ['None', 'Requested', 'Ready'], value: { none: 'None', requested: 'Requested', ready: 'Ready' }[d.planReq], onPick: (v) => set({ planReq: v.toLowerCase() as any }) },
      { label: 'No plan yet (before assessment)', options: ['Off', 'On'], value: p.noPlan ? 'On' : 'Off', onPick: (v) => setP({ noPlan: v === 'On' }) },
      { label: 'Mid-workout when the update arrives', options: ['Off', 'On'], value: p.mid ? 'On' : 'Off', onPick: (v) => setP({ mid: v === 'On' }) },
      { label: 'Connection', options: ['Online', 'Offline'], value: d.offline ? 'Offline' : 'Online', onPick: (v) => set({ offline: v === 'Offline' }) },
      { label: 'Diet type (plan + swaps)', options: ['Veg', 'Eggetarian', 'Non-veg'], value: p.diet, onPick: (v) => setP({ diet: v as Diet }) },
      { label: 'Detail level', options: ['Detailed', 'Simple'], value: p.detail, onPick: (v) => setP({ detail: v as any }) },
      { label: 'Camera (scan food)', options: ['Allowed', 'Denied'], value: p.cam, onPick: (v) => setP({ cam: v as any, camOk: null }) },
      { label: 'Scan result', options: ['Works', 'Fails'], value: d.scanFails ? 'Fails' : 'Works', onPick: (v) => set({ scanFails: v === 'Fails' }) },
      { label: 'Jump to day', options: JUMP.map((j) => j[0]), value: JUMP.find((j) => j[1] === p.day)?.[0] ?? '', onPick: (v) => setP({ week: 0, day: JUMP.find((j) => j[0] === v)![1], seg: 'workout' }) },
    ],
    actions: [
      { label: 'Apply Coach update now', run: () => { set((s) => ({ plans: applyCoachUpdate(s.plans), planReq: 'none', coachUpdated: true })); setP({ applied: true, hl: COACH_HL, day: TODAY_IDX, seg: 'workout' }); } },
      { label: 'Reset this prototype', run: () => { resetPlans(); set({ plans: basePlans(), planReq: 'none', coachUpdated: false }); } },
    ],
  }, [p.seg, p.noPlan, p.mid, p.diet, p.detail, p.cam, p.day, p.applied, d.coachUpdated, d.planReq, d.offline, d.scanFails]);

  const canStart = useCanStart();
  return (
    <View style={{ flex: 1 }}>
    <TabScreen title="Plans" header={<GymHeader />} compactTitle={false} bottomPad={canStart ? 190 : 130}>
      {d.offline && (
        <Animated.View entering={fade()} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.warnSoft }}>
          <Txt style={{ fontFamily: font.medium, fontSize: 13, color: c.warn }}>You're offline · changes save on this phone and sync later</Txt>
        </Animated.View>
      )}
      <Row style={{ gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Segmented accessibilityLabel="Plan type" value={p.seg} onChange={(v) => setP({ seg: v })}
            options={[{ value: 'workout', label: 'Workout' }, { value: 'diet', label: 'Diet' }]}
            icons={{ workout: (col) => <Dumbbell size={16} color={col} />, diet: (col) => <UtensilsCrossed size={16} color={col} /> }} />
        </View>
        <Pressy accessibilityRole="button" accessibilityLabel={isW ? 'Plan menu' : 'Diet menu'} onPress={openMenu}
          style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
          <MoreHorizontal size={22} color={c.ink} />
        </Pressy>
      </Row>
      <DayStrip />
      <View key={p.seg} style={{ gap: 12 }}>
        {isW ? <WorkoutPlan /> : <DietPlan />}
      </View>
    </TabScreen>
    {canStart && <StickyStart />}
    </View>
  );
}
