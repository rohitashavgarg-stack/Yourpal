import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { CreditCard, X } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { PersonAvatar } from '@/components/Brand';
import { useOverlay } from '@/components/Overlay';
import { FlagSheet } from '@/features/gym/sheets';
import { usePtPending } from '@/features/shell/notifs';
import { useDomain } from '@/lib/domain';
import { useGoalV2, progressLine, statusLine } from '@/features/goalv2/model';
import { totals } from '@/lib/domain';
import { KCAL_TARGET } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fade } from '@/theme/motion';
import { haptic } from '@/lib/haptics';
import { cardShadow } from '@/features/progress/parts';
import { usePaymentNotice } from './PaymentBanner';
import { useUpdates } from './TopCards';

// ---------- Slim goal strip: the member's reason for opening the app, in one line ----------
export function GoalStrip() {
  const { c } = useTheme();
  const { d } = useDomain();
  const g = useGoalV2();
  const t = totals(d);
  const pct = Math.max(0, Math.min(1, g.pct));
  const R = 17, C = 2 * Math.PI * R;
  // a second number that matters for this kind of goal
  const kind = d.goal.type;
  const extra = kind === 'Weight loss' || kind === 'Lean body' ? `${Math.max(0, KCAL_TARGET - t.k).toLocaleString('en-IN')} kcal left today`
    : kind === 'Muscle gain' || kind === 'Strength' ? `Protein ${t.p} g today` : statusLine(g);
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Your goal: ${g.name}. ${progressLine(g)}. ${statusLine(g)}`} onPress={() => router.navigate('/(tabs)/progress')} scaleTo={0.98}
      style={{ backgroundColor: c.surface, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={44} height={44} viewBox="0 0 44 44" style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={22} cy={22} r={R} stroke={c.surface3} strokeWidth={4} fill="none" />
            <Circle cx={22} cy={22} r={R} stroke={c.accent} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} />
          </Svg>
          <Txt style={{ position: 'absolute', fontFamily: font.semibold, fontSize: 11, lineHeight: 15 }}>{Math.round(pct * 100)}%</Txt>
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{g.name}</Txt>
          <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{progressLine(g)} · {extra}</Txt>
        </View>
      </Row>
    </Pressy>
  );
}

// ---------- "For you": every note, request and reminder in one swipeable stack ----------
type Item = {
  key: string; title: string; body: string; critical?: boolean; tone: 'accent' | 'warn' | 'good' | 'muted';
  who?: boolean; icon?: any; btn?: string; act?: () => void; two?: boolean;
};

export function useForYou(): Item[] {
  const { d } = useDomain();
  const pay = usePaymentNotice();
  const ptPending = usePtPending();
  const { live } = useUpdates();
  const out: Item[] = [];
  // Order = priority: what blocks logging, then what has a deadline, then the rest.
  if (pay) out.push({ key: 'pay', title: pay.title, body: pay.sub, critical: d.membership !== 'Expiring', tone: pay.tone === 'accent' ? 'accent' : pay.tone === 'warn' ? 'warn' : 'muted', icon: CreditCard, btn: 'View membership', act: () => router.push('/gym/membership') });
  if (ptPending && d.hasGym) out.push({ key: 'pt', title: 'Confirm your PT session', body: 'Coach Vikram marked Tue 23 Sep, 6–7 pm as done. It confirms itself on Fri 26 Sep.', critical: true, tone: 'accent', who: true, two: true });
  const order = ['reassess', 'reply', 'plan', 'log'];
  live.filter((u) => u.key !== 'member').sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)).forEach((u) => {
    out.push({ key: u.key, title: u.title, body: u.body, tone: u.tone, who: ['plan', 'reply'].includes(u.key), icon: u.icon, btn: u.isPlan ? 'See changes' : u.btn, act: u.isPlan ? () => router.navigate('/plans') : u.act });
  });
  return out.filter((i) => i.critical || !d.dismissed[i.key]);
}

export function ForYouStack() {
  const { c, isDark } = useTheme();
  const { d, set } = useDomain();
  const { openSheet } = useOverlay();
  const items = useForYou();
  const [idx, setIdx] = useState(0);
  const tx = useSharedValue(0);
  const many = items.length > 1;
  const i = Math.min(idx, Math.max(0, items.length - 1));
  const go = (dir: 1 | -1) => {
    haptic.light();
    setIdx((i + dir + items.length) % items.length);
    tx.value = dir * 40; // the next one starts a little to the side and fades in
    tx.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
  };
  const swipe = Gesture.Pan().enabled(many).activeOffsetX([-18, 18]).failOffsetY([-14, 14])
    .onUpdate((e) => { tx.value = e.translationX * 0.8; })
    .onEnd((e) => {
      const dir = e.translationX < -45 || e.velocityX < -600 ? 1 : e.translationX > 45 || e.velocityX > 600 ? -1 : 0;
      if (dir === 0) { tx.value = withTiming(0, { duration: 180 }); return; }
      tx.value = withTiming(-dir * 80, { duration: 130, easing: Easing.in(Easing.cubic) }, (fin) => { if (fin) scheduleOnRN(go, dir); });
    });
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }], opacity: 1 - Math.min(1, Math.abs(tx.value) / 110) }));
  const it = items[i];
  if (!it) return null;
  const fg = it.tone === 'warn' ? c.warn : it.tone === 'muted' ? c.ink : c.accentText;
  const bg = it.tone === 'warn' ? c.warnSoft : it.tone === 'good' ? c.goodSoft : c.accentSoft;
  const I = it.icon;
  const dismiss = () => { haptic.light(); set((s) => ({ dismissed: { ...s.dismissed, [it.key]: true } })); };
  return (
    <View>
      {/* the edges of the next cards under this one: it reads as a stack */}
      {many && <View pointerEvents="none" style={{ position: 'absolute', left: 14, right: 14, bottom: -6, height: 24, borderRadius: 24, backgroundColor: c.surface2 }} />}
      {items.length > 2 && <View pointerEvents="none" style={{ position: 'absolute', left: 26, right: 26, bottom: -11, height: 24, borderRadius: 24, backgroundColor: c.surface3, opacity: 0.6 }} />}
      <GestureDetector gesture={swipe}>
        <View style={[{ backgroundColor: c.surface, borderRadius: 24, padding: 16, gap: 12, overflow: 'hidden' }, cardShadow(isDark)]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ gap: 8 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 17, letterSpacing: 0.4, color: c.muted }}>FOR YOU</Txt>
              {many && <View style={{ paddingHorizontal: 8, paddingVertical: 1, borderRadius: 999, backgroundColor: c.surface2 }}><Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 16, color: c.muted }}>{i + 1} of {items.length}</Txt></View>}
            </Row>
            {!it.critical && (
              <Pressy accessibilityRole="button" accessibilityLabel="Dismiss this" onPress={dismiss} style={{ width: 44, height: 44, marginTop: -12, marginRight: -10, alignItems: 'center', justifyContent: 'center' }}>
                <X size={17} color={c.muted} />
              </Pressy>
            )}
          </Row>
          <Animated.View style={[{ gap: 12 }, slide]}>
            <Row style={{ gap: 12, alignItems: 'flex-start' }}>
              {it.who ? <PersonAvatar who="coach" size={40} /> : <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{I ? <I size={19} color={fg} /> : null}</View>}
              <View style={{ flex: 1, gap: 2 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{it.title}</Txt>
                <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>{it.body}</Txt>
              </View>
            </Row>
            {it.two ? (
              <Row style={{ gap: 10 }}>
                <View style={{ flex: 1 }}><Button kind="secondary" label="Reject" onPress={() => openSheet(<FlagSheet />, { label: 'Flag session' })} /></View>
                <View style={{ flex: 1.4 }}><Button label="Confirm & rate" onPress={() => router.push('/gym/confirm')} /></View>
              </Row>
            ) : it.btn ? (
              <Row><Pressy accessibilityRole="button" onPress={it.act} style={{ height: 40, paddingHorizontal: 18, borderRadius: 20, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}><Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: c.bg }}>{it.btn}</Txt></Pressy></Row>
            ) : null}
          </Animated.View>
          {many && (
            <Row style={{ gap: 4, justifyContent: 'center' }}>
              {items.map((x, k) => <View key={x.key} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: k === i ? c.ink : c.surface3 }} />)}
            </Row>
          )}
        </View>
      </GestureDetector>
      {many && <View style={{ height: 8 }} />}
    </View>
  );
}
