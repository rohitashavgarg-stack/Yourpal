import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { CalendarClock, Check, ChevronRight, CircleCheck, ClipboardList, CreditCard, MessageCircle, Pause, Flame, X } from '@/lib/icons';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { PillBtn } from '@/components/bits';
import { PersonAvatar } from '@/components/Brand';
import { FlagSheet } from '@/features/gym/sheets';
import { useOverlay } from '@/components/Overlay';
import { burned, totals, useDomain } from '@/lib/domain';
import { KCAL_TARGET } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { useStartWorkout } from '@/features/workout/StartSheet';
import { progressLine, statusLine, useGoalV2 } from '@/features/goalv2/model';
import { ringCentre, StatusChip } from '@/features/goalv2/GoalCard2';
import { cardShadow, CornerGlow } from '@/features/progress/parts';
import { FLAME } from '@/features/streak/StreakChip';

const ACircle = Animated.createAnimatedComponent(Circle);
const R = 54, CIRC = 2 * Math.PI * R;
const GOAL_PCT = 0.35;

// ---------- Goal hero ----------
// After a break the goal is one quiet line, not a big ring.
export function GoalLine() {
  const { c } = useTheme();
  const g = useGoalV2();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Your goal: ${g.name}. ${progressLine(g)}. ${statusLine(g)}`} onPress={() => router.navigate('/(tabs)/progress')} scaleTo={0.98}
      style={{ backgroundColor: c.surface, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>{g.name}</Txt>
          <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{progressLine(g)} · {statusLine(g)}</Txt>
        </View>
        <ChevronRight size={18} color={c.muted} />
      </Row>
    </Pressy>
  );
}

// soft: the same card with a quieter colour and a smaller ring (used in the new Today layout, where the card is context, not the loudest thing).
export function GoalCard({ soft: compact = false }: { soft?: boolean } = {}) {
  const soft = compact;
  const { d } = useDomain();
  const SZ = soft ? 84 : 132, RR = soft ? 33 : R, CC = 2 * Math.PI * RR, SW = soft ? 8 : 12;
  const t = totals(d);
  // Name, numbers and status come from the goal itself, so every kind of goal reads differently (weight, strength, flexibility, weekly workouts...).
  const g2 = useGoalV2();
  const pct = g2.status === 'reached' && g2.kind !== 'consistency' ? 1 : g2.pct;
  const p = useSharedValue(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    p.value = withDelay(150, withTiming(pct, { duration: 1300, easing: Easing.out(Easing.cubic) }));
    let raf = 0; const t0 = Date.now();
    const step = () => { const k = Math.min(1, (Date.now() - t0) / 1100); setShown(Math.round(pct * 100 * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pct]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: CC * (1 - p.value) }));
  const goal = g2.name;
  const sub = progressLine(g2);
  const centre = ringCentre(g2);
  return (
    <Pressy accessibilityRole="link" scaleTo={0.98}
      accessibilityLabel={`Your goal: ${goal.toLowerCase()}. ${sub}, ${statusLine(g2).toLowerCase()}. Eaten ${t.k} of ${KCAL_TARGET} kcal.${d.hc && d.wearable ? ` Burned ${burned(d)}.` : ""} Open goal details`}
      onPress={() => router.push('/goal-detail')}>
      <LinearGradient colors={['#2F6BEA', '#3E8FEA', '#5CC2E6']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ borderRadius: soft ? 24 : 28, paddingVertical: soft ? 16 : 18, paddingLeft: soft ? 16 : 16, paddingRight: soft ? 16 : 18, flexDirection: 'row', alignItems: 'center', gap: soft ? 16 : 18, overflow: 'hidden' }}>
        <Svg width={260} height={260} viewBox="0 0 260 260" style={{ position: 'absolute', right: -90, top: -80, opacity: 0.16 }}>
          <Circle cx={130} cy={130} r={120} fill="none" stroke="#fff" strokeWidth={18} /><Circle cx={130} cy={130} r={78} fill="none" stroke="#fff" strokeWidth={12} />
        </Svg>
        <View style={{ width: SZ, height: SZ, borderRadius: SZ / 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <Svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`}>
            <Circle cx={SZ / 2} cy={SZ / 2} r={RR} stroke="rgba(255,255,255,0.22)" strokeWidth={SW} fill="none" />
            <ACircle cx={SZ / 2} cy={SZ / 2} r={RR} stroke={soft ? 'rgba(255,255,255,0.92)' : '#fff'} strokeWidth={SW} fill="none" strokeLinecap="round" strokeDasharray={`${CC}`} animatedProps={props} transform={`rotate(-90 ${SZ / 2} ${SZ / 2})`} />
          </Svg>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            {centre.check ? <Check size={52} color="#fff" strokeWidth={3} /> : g2.kind === 'consistency' ? (
              <View style={{ alignItems: 'center' }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: soft ? 22 : 34, lineHeight: soft ? 26 : undefined, letterSpacing: soft ? -0.5 : -1, color: '#fff' }}>{centre.big}</Txt>
                <Txt style={{ fontSize: soft ? 10 : 12, lineHeight: soft ? 13 : 16, color: 'rgba(255,255,255,0.75)' }}>this week</Txt>
              </View>
            ) : (
              <Txt style={{ fontFamily: font.semibold, fontSize: soft ? 24 : 34, letterSpacing: -0.6, color: '#fff' }}>{shown}<Txt style={{ fontFamily: font.semibold, fontSize: soft ? 13 : 18, color: 'rgba(255,255,255,0.6)' }}>%</Txt></Txt>
            )}
          </View>
        </View>
        <View style={{ flex: 1, gap: soft ? 4 : 6, minWidth: 0 }}>
          <Row style={{ justifyContent: 'space-between' }}><Txt style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Your goal</Txt><ChevronRight size={18} color="#fff" /></Row>
          <Txt numberOfLines={2} style={{ fontFamily: font.display, fontSize: soft ? 24 : 30, lineHeight: soft ? 29 : 34, color: '#fff' }}>{goal}</Txt>
          <Txt style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{sub}</Txt>
          <StatusChip g={g2} fg="#1B3FB8" />
        </View>
      </LinearGradient>
    </Pressy>
  );
}

// ---------- PT session waiting to be confirmed ----------
export function PtConfirmCard() {
  const { c, isDark } = useTheme();
  const { openSheet } = useOverlay();
  return (
    <Animated.View entering={fade()} style={[{ backgroundColor: c.surface, borderRadius: 28, padding: 18, gap: 12, overflow: 'hidden' }, cardShadow(isDark)]}>
      <CornerGlow color={c.accent} size={420} />
      <Row style={{ gap: 12 }}>
        <PersonAvatar who="coach" size={44} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 18, lineHeight: 25, letterSpacing: -0.3 }}>Confirm your PT session</Txt>
          <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>Coach Vikram marked Tue 23 Sep, 6–7 pm as done.</Txt>
        </View>
      </Row>
      <Row style={{ gap: 10 }}>
        <View style={{ flex: 1 }}><Button kind="secondary" label="Reject" onPress={() => openSheet(<FlagSheet />, { label: 'Flag session' })} /></View>
        <View style={{ flex: 1.4 }}><Button label="Confirm & rate" onPress={() => router.push('/gym/confirm')} /></View>
      </Row>
      <Txt v="caption" style={{ textAlign: 'center' }}>Not confirmed? It confirms itself on Fri 26 Sep, so your package stays right.</Txt>
    </Animated.View>
  );
}

// ---------- Comeback (after a break) ----------
export function ComebackCard() {
  const { c, isDark } = useTheme();
  const { state } = useStore();
  const { openSheet, toast } = useOverlay();
  const startWorkout = useStartWorkout();
  const isPT = state.sc.member === 'PT member';
  const { d } = useDomain();
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
          <Txt style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 29, letterSpacing: -0.6 }}>{`We missed you these ${d.awayDays} days`}</Txt>
          {isPT && <Txt v="caption">From Coach Vikram</Txt>}
        </View>
      </Row>
      <View style={{ gap: 8 }}>
        <Txt style={{ fontSize: 16, lineHeight: 23 }}>Check your easy comeback plan.</Txt>
        <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,138,61,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 18, color: isDark ? '#FFB27A' : '#B5500F' }}>Streak paused, not lost</Txt>
        </View>
      </View>
      <Row style={{ gap: 10 }}>
        <View style={{ flex: 1.3 }}><Button label="Start session" onPress={() => { startWorkout(); }} /></View>
        <View style={{ flex: 1 }}><Button kind="outline" label="Re-plan week" onPress={() => router.navigate('/plans')} /></View>
      </Row>
    </Animated.View>
  );
}

// ---------- Updates: one compact card with a pager ----------
export type Upd = { key: string; title: string; body: string; btn?: string; act?: () => void; isPlan?: boolean; icon: any; tone: 'accent' | 'warn' | 'good' };

export function useUpdates() {
  const { state } = useStore();
  const { d, set } = useDomain();
  const { openSheet, toast } = useOverlay();
  const startWorkout = useStartWorkout();
  const isPT = state.sc.member === 'PT member';
  const all: Upd[] = [
    { key: 'plan', title: 'Coach Vikram updated your plan', body: 'Leg day: lunges added, leg extension removed', isPlan: true, icon: ClipboardList, tone: 'accent' },
    { key: 'reply', title: 'Coach Vikram replied', body: '“Keep your back straight on rows.”', btn: 'Reply', act: () => toast('Chat with Coach Vikram opens in the Gym tab'), icon: MessageCircle, tone: 'accent' },
    { key: 'reassess', title: 'Reassessment due', body: 'This week · book with front desk', icon: CalendarClock, tone: 'warn' },
    { key: 'member', title: 'Membership', body: 'Expires in 12 days · renew at the front desk', icon: CreditCard, tone: 'warn' },
    { key: 'log', title: 'Checked in 6:42 pm (location)', body: "Log today's workout?", btn: 'Log workout', act: () => startWorkout(), icon: CircleCheck, tone: 'good' },
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
  const i = Math.min(idx, Math.max(0, live.length - 1));
  const u = live[i];
  // Swipe left for the next update, right for the previous one. The card follows the finger and fades; on release it slides out,
  // then the next update is wiped in from the side the finger came from. One light tap of haptic per change, no arrow button.
  const tx = useSharedValue(0);
  const reveal = useSharedValue(1);
  const [boxW, setBoxW] = useState(0);
  const [fromRight, setFromRight] = useState(true);
  const commit = (dir: 1 | -1) => {
    setPlanOpen(false);
    haptic.light();
    setIdx((i + dir + live.length) % live.length);
    setFromRight(dir === 1);
    tx.value = 0;
    reveal.value = 0; // the new update is uncovered from the edge it came in from
    reveal.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
  };
  const many = live.length > 1;
  const swipe = Gesture.Pan().enabled(many).activeOffsetX([-18, 18]).failOffsetY([-14, 14])
    .onUpdate((e) => { tx.value = e.translationX * 0.8; })
    .onEnd((e) => {
      const dir = e.translationX < -45 || e.velocityX < -600 ? 1 : e.translationX > 45 || e.velocityX > 600 ? -1 : 0;
      if (dir === 0) { tx.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.cubic) }); return; }
      tx.value = withTiming(-dir * 90, { duration: 140, easing: Easing.in(Easing.cubic) }, (fin) => { if (fin) scheduleOnRN(commit, dir); });
    });
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }], opacity: 1 - Math.min(1, Math.abs(tx.value) / 120) }));
  const wipe = useAnimatedStyle(() => ({ width: boxW ? boxW * reveal.value : undefined }));
  if (!u) return null;
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
      <GestureDetector gesture={swipe}>
        <View>
          {/* The update itself (icon, text, button) follows the finger, slides out and is wiped in. */}
          <Animated.View onLayout={(e) => setBoxW(e.nativeEvent.layout.width)} style={[slide]}>
            <Animated.View style={[{ overflow: 'hidden', alignSelf: fromRight ? 'flex-end' : 'flex-start' }, wipe]}>
              <View style={{ width: boxW || undefined, gap: 12, alignSelf: fromRight ? 'flex-end' : 'flex-start' }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingRight: 38 }}>
                  <UpdIcon u={u} />
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Txt style={{ fontFamily: font.semibold }}>{u.title}</Txt>
                    <Txt muted style={{ fontSize: 14 }}>{u.body}</Txt>
                  </View>
                </View>
                {u.isPlan && planOpen && <PlanChanges />}
                <View style={{ paddingLeft: 52, minHeight: 44, flexDirection: 'row', alignItems: 'center' }}>
                  {btn ? <PillBtn label={btn} onPress={act} /> : null}
                </View>
              </View>
            </Animated.View>
          </Animated.View>
          {/* The cross and the dots stay where they are and keep their own fade; they never swipe. */}
          <Animated.View key={u.key} entering={fade()} pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
            <Pressy accessibilityRole="button" accessibilityLabel="Dismiss this update" onPress={() => { if (u.isPlan) setPlanOpen(false); dismiss(u.key); }} style={{ position: 'absolute', top: -4, right: -6, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <X size={17} color={c.muted} />
        </Pressy>
            {live.length > 1 && (
              <View pointerEvents="none" style={{ position: 'absolute', right: 0, bottom: 0, height: 44, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {live.map((_, k) => <View key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: k === i ? c.ink : c.surface3 }} />)}
              </View>
            )}
          </Animated.View>
        </View>
      </GestureDetector>
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
