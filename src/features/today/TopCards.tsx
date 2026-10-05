import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CalendarClock, ChevronRight, CircleCheck, ClipboardList, CreditCard, MessageCircle, Pause, Flame, X } from '@/lib/icons';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { PillBtn } from '@/components/bits';
import { PersonAvatar } from '@/components/Brand';
import { useOverlay } from '@/components/Overlay';
import { burned, totals, useDomain } from '@/lib/domain';
import { KCAL_TARGET } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { StartWorkoutSheet } from '@/features/workout/StartSheet';
import { cardShadow, CornerGlow } from '@/features/progress/parts';
import { FLAME } from '@/features/streak/StreakChip';

const ACircle = Animated.createAnimatedComponent(Circle);
const R = 54, CIRC = 2 * Math.PI * R;
const GOAL_PCT = 0.35;

// ---------- Goal hero ----------
export function GoalCard() {
  const { d } = useDomain();
  const t = totals(d);
  const p = useSharedValue(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    p.value = withDelay(150, withTiming(GOAL_PCT, { duration: 1300, easing: Easing.out(Easing.cubic) }));
    let raf = 0; const t0 = Date.now();
    const step = () => { const k = Math.min(1, (Date.now() - t0) / 1100); setShown(Math.round(GOAL_PCT * 100 * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  const props = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - p.value) }));
  const goal = d.goal.type === 'Weight loss' ? `Lose ${d.goal.target} kg` : d.goal.type === 'Muscle gain' && d.goal.target ? `Gain ${d.goal.target} kg` : d.goal.type;
  return (
    <Pressy accessibilityRole="link" scaleTo={0.98}
      accessibilityLabel={`Your goal: ${goal.toLowerCase()}. 2.1 kg down, on track. Eaten ${t.k} of ${KCAL_TARGET} kcal, burned ${burned(d)}. Open progress`}
      onPress={() => router.navigate('/progress')}>
      <LinearGradient colors={['#2F6BEA', '#3E8FEA', '#5CC2E6']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ borderRadius: 28, paddingVertical: 18, paddingLeft: 16, paddingRight: 18, flexDirection: 'row', alignItems: 'center', gap: 18, overflow: 'hidden' }}>
        <Svg width={260} height={260} viewBox="0 0 260 260" style={{ position: 'absolute', right: -90, top: -80, opacity: 0.16 }}>
          <Circle cx={130} cy={130} r={120} fill="none" stroke="#fff" strokeWidth={18} /><Circle cx={130} cy={130} r={78} fill="none" stroke="#fff" strokeWidth={12} />
        </Svg>
        <View style={{ width: 132, height: 132, borderRadius: 66, backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <Svg width={132} height={132} viewBox="0 0 132 132">
            <Circle cx={66} cy={66} r={R} stroke="rgba(255,255,255,0.22)" strokeWidth={12} fill="none" />
            <ACircle cx={66} cy={66} r={R} stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC}`} animatedProps={props} transform="rotate(-90 66 66)" />
          </Svg>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 34, letterSpacing: -1, color: '#fff' }}>{shown}<Txt style={{ fontFamily: font.semibold, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>%</Txt></Txt>
          </View>
        </View>
        <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
          <Row style={{ justifyContent: 'space-between' }}><Txt style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Your goal</Txt><ChevronRight size={18} color="#fff" /></Row>
          <Txt style={{ fontFamily: font.display, fontSize: 32, lineHeight: 30, color: '#fff' }}>{goal}</Txt>
          <Txt style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>2.1 kg down</Txt>
          <View style={{ alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}><Txt style={{ fontFamily: font.semibold, fontSize: 12, color: '#1B3FB8' }}>On track</Txt></View>
        </View>
      </LinearGradient>
    </Pressy>
  );
}

// ---------- Comeback (after a break) ----------
export function ComebackCard() {
  const { c, isDark } = useTheme();
  const { state } = useStore();
  const { openSheet, toast } = useOverlay();
  const { set } = useDomain();
  const isPT = state.sc.member === 'PT member';
  const a = useSharedValue(0);
  useEffect(() => { a.value = withDelay(1200, withTiming(1, { duration: 700 })); }, []);
  const pause = useAnimatedStyle(() => ({ opacity: 1 - a.value, transform: [{ scale: 1 - 0.4 * a.value }] }));
  const flame = useAnimatedStyle(() => ({ opacity: a.value, transform: [{ scale: 0.5 + 0.5 * a.value }] }));
  return (
    <Animated.View entering={fade()} style={[{ backgroundColor: c.surface, borderRadius: 28, padding: 20, gap: 12, overflow: 'hidden' }, cardShadow(isDark)]}>
      <CornerGlow color={FLAME} size={520} />
      <Row style={{ gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,138,61,0.16)', alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[{ position: 'absolute' }, pause]}><Pause size={20} color={FLAME} fill={FLAME} /></Animated.View>
          <Animated.View style={[{ position: 'absolute' }, flame]}><Flame size={22} color={FLAME} fill={FLAME} /></Animated.View>
        </View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 29, letterSpacing: -0.6 }}>Welcome back, Jyotsana</Txt>
          {isPT && <Txt v="caption">From Coach Vikram</Txt>}
        </View>
      </Row>
      <View style={{ gap: 8 }}>
        <Txt style={{ fontSize: 16, lineHeight: 23 }}>Here's a 30-minute restart session.</Txt>
        <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,138,61,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 18, color: isDark ? '#FFB27A' : '#B5500F' }}>Streak paused, not lost</Txt>
        </View>
      </View>
      <Button label="Start 30-min session" onPress={() => { set({ mode: 1, quick: 30 }); openSheet(<StartWorkoutSheet />, { label: 'Start options' }); }} />
      <Button kind="outline" small label="Re-plan my week" onPress={() => router.navigate('/plans')} />
    </Animated.View>
  );
}

// ---------- Updates: one compact card with a pager ----------
type Upd = { key: string; title: string; body: string; btn?: string; act?: () => void; isPlan?: boolean; icon: any; tone: 'accent' | 'warn' | 'good' };

function useUpdates() {
  const { state } = useStore();
  const { d, set } = useDomain();
  const { openSheet, toast } = useOverlay();
  const isPT = state.sc.member === 'PT member';
  const all: Upd[] = [
    ...(isPT ? [{ key: 'pt', title: "Confirm yesterday's PT session", body: 'Coach Vikram marked Tue 23 Sep, 6–7 pm as done', btn: 'Confirm & rate', act: () => router.navigate('/gym'), icon: CircleCheck, tone: 'accent' as const }] : []),
    { key: 'plan', title: 'Coach Vikram updated your plan', body: 'Leg day: lunges added, leg extension removed', isPlan: true, icon: ClipboardList, tone: 'accent' },
    { key: 'reply', title: 'Coach Vikram replied', body: '“Keep your back straight on rows.”', btn: 'Reply', act: () => toast('Chat with Coach Vikram opens in the Gym tab'), icon: MessageCircle, tone: 'accent' },
    { key: 'reassess', title: 'Reassessment due', body: 'This week · book with front desk', icon: CalendarClock, tone: 'warn' },
    { key: 'member', title: 'Membership', body: 'Expires in 12 days · renew at the front desk', icon: CreditCard, tone: 'warn' },
    { key: 'log', title: 'Checked in 6:42 pm (location)', body: "Log today's workout?", btn: 'Log workout', act: () => openSheet(<StartWorkoutSheet />, { label: 'Start options' }), icon: CircleCheck, tone: 'good' },
  ];
  const live = d.todayVariant === 'With updates' ? all.filter((u) => !d.dismissed[u.key]) : [];
  const dismiss = (k: string) => { haptic.light(); set((s) => ({ dismissed: { ...s.dismissed, [k]: true } })); };
  return { live, dismiss };
}

function UpdIcon({ u }: { u: Upd }) {
  const { c } = useTheme();
  const bg = u.tone === 'warn' ? c.warnSoft : u.tone === 'good' ? c.goodSoft : c.accentSoft;
  const fg = u.tone === 'warn' ? c.warn : u.tone === 'good' ? c.good : c.accentText;
  const I = u.icon;
  if (['pt', 'plan', 'reply'].includes(u.key)) return <PersonAvatar who="coach" size={40} />;
  return <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><I size={19} color={fg} /></View>;
}

const PLAN_CHANGES: [string, string][] = [['+ Walking lunges', '3×10'], ['− Leg extension', 'Leg day'], ['Squat 60 → 62.5 kg', 'Leg day']];
function PlanChanges() {
  const { c } = useTheme();
  return (
    <View style={{ gap: 2, paddingLeft: 52 }}>
      {PLAN_CHANGES.map(([a, b], i) => (
        <Animated.View key={a} entering={fade(i * 150)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: c.accentSoft }}>
          <Txt style={{ fontFamily: font.medium }}>{a}</Txt><Txt v="caption" style={i === 0 ? { fontFamily: font.mono } : undefined}>{b}</Txt>
        </Animated.View>
      ))}
    </View>
  );
}

export function UpdatesCard() {
  const { c } = useTheme();
  const { openSheet } = useOverlay();
  const { live, dismiss } = useUpdates();
  const [idx, setIdx] = useState(0);
  const [planOpen, setPlanOpen] = useState(false);
  if (!live.length) return null;
  const i = Math.min(idx, live.length - 1);
  const u = live[i];
  const btn = u.isPlan ? (planOpen ? 'Hide changes' : 'See changes') : u.btn;
  const act = u.isPlan ? () => setPlanOpen((o) => !o) : u.act;
  return (
    <Card style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 12, gap: 12 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row style={{ gap: 8 }}>
          <Txt style={{ fontFamily: font.semibold }}>Updates</Txt>
          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: c.accent }}><Txt style={{ fontFamily: font.semibold, fontSize: 12, color: '#fff' }}>{live.length}</Txt></View>
        </Row>
        <Pressy accessibilityRole="button" onPress={() => openSheet(<UpdatesSheet />, { label: 'Updates' })} style={{ height: 44, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 13, color: c.accentText }}>See all</Txt>
        </Pressy>
      </Row>
      <Animated.View key={u.key} entering={fade()} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <UpdIcon u={u} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold }}>{u.title}</Txt>
          <Txt muted style={{ fontSize: 14 }}>{u.body}</Txt>
        </View>
        <Pressy accessibilityRole="button" accessibilityLabel="Dismiss this update" onPress={() => { if (u.isPlan) setPlanOpen(false); dismiss(u.key); }} style={{ width: 44, height: 44, marginTop: -4, marginRight: -6, alignItems: 'center', justifyContent: 'center' }}>
          <X size={17} color={c.muted} />
        </Pressy>
      </Animated.View>
      {u.isPlan && planOpen && <PlanChanges />}
      <Row style={{ gap: 8, paddingLeft: 52 }}>
        {btn ? <PillBtn label={btn} onPress={act} /> : null}
        <View style={{ flex: 1 }} />
        {live.length > 1 && (
          <>
            <Row style={{ gap: 4 }}>
              {live.map((_, k) => <View key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: k === i ? c.ink : c.surface3 }} />)}
            </Row>
            <Pressy accessibilityRole="button" accessibilityLabel="Next update" onPress={() => { setPlanOpen(false); setIdx((i + 1) % live.length); }}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={17} color={c.ink} />
            </Pressy>
          </>
        )}
      </Row>
    </Card>
  );
}

export function UpdatesSheet() {
  const { c } = useTheme();
  const { closeSheet } = useOverlay();
  const { live, dismiss } = useUpdates();
  return (
    <>
      <Txt style={{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1 }}>Updates</Txt>
      <View>
        {live.map((u) => {
          const fg = u.tone === 'warn' ? c.warn : u.tone === 'good' ? c.good : c.accentText;
          return (
            <Animated.View key={u.key} entering={fade()} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: c.line }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: fg, marginTop: 6 }} />
              <View style={{ flex: 1 }}><Txt style={{ fontFamily: font.semibold }}>{u.title}</Txt><Txt v="caption">{u.body}</Txt></View>
              {u.btn && <PillBtn tone="soft" h={30} label={u.btn} onPress={() => closeSheet(u.act)} />}
              <Pressy accessibilityRole="button" accessibilityLabel={`Dismiss ${u.title}`} onPress={() => dismiss(u.key)} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}><X size={15} color={c.muted} /></Pressy>
            </Animated.View>
          );
        })}
        {!live.length && <Txt muted style={{ paddingVertical: 20 }}>You're all caught up.</Txt>}
      </View>
      <Txt v="caption">Older updates are in Notifications.</Txt>
    </>
  );
}
