/* eslint-disable react-hooks/set-state-in-effect -- the effect resets local state when its input changes, as designed */
import React, { useEffect, useRef, useState } from 'react';
import { useLogsPaused } from '@/lib/logGate';
import { ScrollView, View, type ScrollViewInstance, type ViewInstance } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Check, ChevronDown, ChevronsLeft, ChevronsRight, Dumbbell, Lock, MoreHorizontal, UtensilsCrossed } from '@/lib/icons';
import { TabScreen } from '@/components/TabScreen';
import { GymHeader } from '@/components/GymHeader';
import { Pressy, Row, Segmented, Txt } from '@/components/ui';
import { IconButton } from '@/design-system/primitives/Button';
import { useOverlay } from '@/components/Overlay';
import { basePlans, TODAY_IDX } from '@/lib/data';
import { useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { StickyLog, StickyStart, useCanLog, useCanStart, WorkoutPlan } from '@/features/plans/WorkoutPlan';
import { DietPlan } from '@/features/plans/DietPlan';
import { DietMenuSheet, PlanMenuSheet } from '@/features/plans/Sheets';
import { PlansCalendarSheet } from '@/features/plans/PlansCalendarSheet';
import { applyCoachUpdate, COACH_HL } from '@/features/plans/content';
import { haptic } from '@/lib/haptics';
import { DAYL, DAYN, dateOf, monthOf, dayPlan, Diet, resetPlans, setP, usePlans } from '@/features/plans/store';
import { radii, fontSizes } from '@/design-system/tokens';
import { Callout } from '@/design-system/primitives/Callout';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { FadeIn } from '@/design-system/primitives/FadeIn';

const JUMP: [string, number][] = [['Today (Wed)', TODAY_IDX], ['Past day (Mon)', 0], ['Rest day (Tue)', 1], ['Future (Thu)', 3]];

const MONTH_FULL: Record<string, string> = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
const WEEKS = [-2, -1, 0, 1, 2, 3]; // two back, this week, three ahead
const THIS = WEEKS.indexOf(0);

// Swipe sideways for other weeks. Past weeks have no logged history; future weeks repeat the plan.
function DayStrip() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();
  const isW = p.seg === 'workout';
  const paused = useLogsPaused();
  const [w, setW] = useState(0);
  const [page, setPage] = useState(THIS);
  const ref = useRef<ScrollViewInstance>(null);
  const cur = WEEKS[page] ?? 0;
  useEffect(() => { if (w > 0) { const t = setTimeout(() => ref.current?.scrollTo({ x: THIS * w, animated: false }), 30); return () => clearTimeout(t); } }, [w]);
  useEffect(() => { // a deep link to another week brings that week into view
    const k = WEEKS.indexOf(p.week);
    if (w > 0 && k >= 0 && k !== page) { ref.current?.scrollTo({ x: k * w, animated: true }); setPage(k); }
  }, [p.week]);
  const m0 = monthOf(0, cur), m6 = monthOf(6, cur);
  const monthTitle = m0 === m6 ? (MONTH_FULL[m0] ?? m0) : `${m0} – ${m6}`;
  const { openSheet } = useOverlay();
  const goto = (k: number) => { ref.current?.scrollTo({ x: k * w, animated: true }); setPage(k); haptic.tick(); };
  return (
    <View style={{ marginBottom: 12, gap: 10 }}>
      {/* the month is a heading above the strip; on another week the way back sits on the right of the same row, so the strip keeps one size when you swipe */}
      <Row style={{ justifyContent: 'space-between', height: 28, paddingHorizontal: 4 }}>
        <Pressy accessibilityRole="button" accessibilityLabel={`${monthTitle}. Open the calendar`} onPress={() => { haptic.tick(); openSheet(<PlansCalendarSheet />, { label: 'Pick a date' }); }} hitSlop={8} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 28 }}>
          <Txt accessibilityRole="header" accessibilityLiveRegion="polite" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25, letterSpacing: -0.2 }}>{monthTitle}</Txt>
          <ChevronDown size={18} color={c.ink} />
        </Pressy>
        {cur !== 0 && (
          <Pressy accessibilityRole="button" accessibilityLabel="Back to this week" onPress={() => goto(THIS)} hitSlop={10} scaleTo={0.96}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 26, paddingHorizontal: 12, borderRadius: radii.pill, borderWidth: 1, borderColor: c.chipLine }}>
            {cur > 0 && <ChevronsLeft size={12} color={c.ink} />}
            <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16 }}>This week</Txt>
            {cur < 0 && <ChevronsRight size={12} color={c.ink} />}
          </Pressy>
        )}
      </Row>
      <View style={{ marginHorizontal: -16, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: c.surface2 }}>
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
                const dot = isW ? (plan ? c.accent : 'transparent') : rel <= 0 && wk === 0 ? c.good : 'transparent';
                const logged = isW && !!plan?.done;
                const locked = isW && paused && !!plan && !plan.done;
                const missed = isW && !!plan && !plan.done && rel < 0 && wk === 0 && !paused;
                return (
                  <Pressy key={i} accessibilityRole="button" accessibilityState={{ selected: on }}
                    accessibilityLabel={`${DAYL[i]} ${dateOf(i, wk)} ${monthOf(i, wk)}${isToday ? ', today' : ''}${isW ? (plan ? `${locked ? "" : ", " + plan.name}${logged ? ', logged' : locked ? ', locked' : missed ? ', not logged' : ''}` : ', rest day') : ''}`}
                    onPress={() => setP({ day: i, week: wk })} scaleTo={0.94}
                    style={{ flex: 1, height: 66, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: on ? c.ink : 'transparent', borderWidth: isToday ? 1.5 : 0, borderColor: c.accent }}>
                    <Txt style={{ fontSize: fontSizes.xs2, lineHeight: 14, color: on ? c.bg : c.ink, opacity: 0.7 }}>{l}</Txt>
                    <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 21, color: on ? c.bg : c.ink }}>{dateOf(i, wk)}</Txt>
                    {/* the mark under the date always gets the same 16 px slot, so a check, a lock or a dot never moves the numbers */}
                    <View style={{ height: 16, minWidth: 16, alignItems: 'center', justifyContent: 'center' }}>
                      {locked ? <Lock size={11} color={c.muted} />
                      : logged ? <IconBadge size={14} bg={c.good}><Check size={9} color={c.bg} strokeWidth={4} /></IconBadge>
                      : missed ? <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.warn }} />
                      : <View style={{ width: 4, height: 4, borderRadius: radii.xs, backgroundColor: dot }} />}
                    </View>
                  </Pressy>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
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
      { label: 'Reset this prototype', run: () => { resetPlans(); set({ plans: basePlans(), planReq: 'none', coachUpdated: false, pastLogs: {} }); } },
    ],
  }, [p.seg, p.noPlan, p.mid, p.diet, p.detail, p.cam, p.day, p.applied, d.coachUpdated, d.planReq, d.offline, d.scanFails]);

  const paused = useLogsPaused();
  const canStart = useCanStart() && !paused;
  const canLog = useCanLog() && !paused;
  const insets = useSafeAreaInsets();
  const sy = useSharedValue(0);
  const startRef = useRef<ViewInstance>(null);
  const [floating, setFloating] = useState(false);
  const under = insets.top + 8 + 56 + 8; // below this the page content is hidden behind the header
  // while scrolling, ask where the Start button in the page is right now; once it has gone under the header the floating one takes over
  const check = () => startRef.current?.measureInWindow((_x, y, _w, h) => { if (h > 0) setFloating(y + h < under); });
  useAnimatedReaction(() => Math.round(sy.value / 12), (v, prev) => { if (v !== prev) scheduleOnRN(check); }, [under]);
  return (
    <View style={{ flex: 1 }}>
    <TabScreen title="Plans" scrollY={sy} header={<GymHeader />} compactTitle={false} bottomPad={canStart || canLog ? 190 : 130} titleRight={(
      <Row style={{ gap: 8 }}>
        <Segmented iconOnly accessibilityLabel="Plan type" value={p.seg} onChange={(v) => setP({ seg: v })}
          options={[{ value: 'workout', label: 'Workout' }, { value: 'diet', label: 'Diet' }]}
          icons={{ workout: (col) => <Dumbbell size={20} color={col} />, diet: (col) => <UtensilsCrossed size={20} color={col} /> }} />
        {!paused && <IconButton label={isW ? 'Plan menu' : 'Diet menu'} onPress={openMenu} size={52} radius={radii.xl} bg={c.surface} borderWidth={1} borderColor={c.line}>
          <MoreHorizontal size={22} color={c.ink} />
        </IconButton>}
      </Row>
    )}>
      {d.offline && (
        <FadeIn style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: c.warnSoft }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, color: c.warn }}>You&apos;re offline · changes save on this phone and sync later</Txt>
        </FadeIn>
      )}
      {paused && (
        <Callout accessibilityLabel="Plans are view only">
          <Row style={{ gap: 12, alignItems: 'flex-start' }}>
            <IconBadge size={36} radius={radii.sm} bg={c.surface3}><Lock size={17} color={c.muted} /></IconBadge>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21 }}>Plans are view only</Txt>
              <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Renew at Wulf Fitness reception to start workouts, log meals or change your plan.</Txt>
            </View>
          </Row>
        </Callout>
      )}
      <DayStrip />
      <View key={p.seg} style={{ gap: isW ? 24 : 12 }}>
        {isW ? <WorkoutPlan startRef={startRef} /> : <DietPlan />}
      </View>
    </TabScreen>
    {floating && (canStart ? <StickyStart /> : canLog ? <StickyLog /> : null)}
    </View>
  );
}
