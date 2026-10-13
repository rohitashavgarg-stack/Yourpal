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
  const R = 23, C = 2 * Math.PI * R;
  // a second number that matters for this kind of goal
  const kind = d.goal.type;
  const extra = kind === 'Weight loss' || kind === 'Lean body' ? `${Math.max(0, KCAL_TARGET - t.k).toLocaleString('en-IN')} kcal left today`
    : kind === 'Muscle gain' || kind === 'Strength' ? `Protein ${t.p} g today` : statusLine(g);
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Your goal: ${g.name}. ${progressLine(g)}. ${statusLine(g)}`} onPress={() => router.navigate('/(tabs)/progress')} scaleTo={0.98}
      style={{ backgroundColor: c.surface, borderRadius: 26, paddingVertical: 18, paddingHorizontal: 18 }}>
      <Row style={{ gap: 16 }}>
        <View style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={58} height={58} viewBox="0 0 58 58" style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={29} cy={29} r={R} stroke={c.surface3} strokeWidth={5} fill="none" />
            <Circle cx={29} cy={29} r={R} stroke={c.accent} strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} />
          </Svg>
          <Txt style={{ position: 'absolute', fontFamily: font.semibold, fontSize: 13, lineHeight: 18 }}>{Math.round(pct * 100)}%</Txt>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 19, lineHeight: 26, letterSpacing: -0.3 }}>{g.name}</Txt>
          <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>{progressLine(g)} · {extra}</Txt>
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

// One card of the stack. The dots are not in here (they sit under the stack), so a card behind the front one shows only its edge.
function ItemCard({ it, i, n, onDismiss }: { it: Item; i: number; n: number; onDismiss: () => void }) {
  const { c, isDark } = useTheme();
  const { openSheet } = useOverlay();
  const fg = it.tone === 'warn' ? c.warn : it.tone === 'muted' ? c.ink : c.accentText;
  const bg = it.tone === 'warn' ? c.warnSoft : it.tone === 'good' ? c.goodSoft : c.accentSoft;
  const I = it.icon;
  return (
    <View style={[{ backgroundColor: c.surface, borderRadius: 24, padding: 16, gap: 12, overflow: 'hidden' }, cardShadow(isDark)]}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row style={{ gap: 8 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 17, letterSpacing: 0.4, color: c.muted }}>FOR YOU</Txt>
          {n > 1 && <View style={{ paddingHorizontal: 8, paddingVertical: 1, borderRadius: 999, backgroundColor: c.surface2 }}><Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 16, color: c.muted }}>{i + 1} of {n}</Txt></View>}
        </Row>
        {!it.critical && (
          <Pressy accessibilityRole="button" accessibilityLabel="Dismiss this" onPress={onDismiss} style={{ width: 44, height: 44, marginTop: -12, marginRight: -10, alignItems: 'center', justifyContent: 'center' }}>
            <X size={17} color={c.muted} />
          </Pressy>
        )}
      </Row>
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
    </View>
  );
}

// The stack: the front card follows the finger, the cards behind rise as it leaves (scale up, move forward), and the front card goes to the back of the stack.
export function ForYouStack() {
  const { c } = useTheme();
  const { set } = useDomain();
  const items = useForYou();
  const [idx, setIdx] = useState(0);
  const [h, setH] = useState(0);
  const n = items.length;
  const many = n > 1;
  const i = n ? idx % n : 0;
  const tx = useSharedValue(0);
  const p = useSharedValue(0); // 0 = resting, 1 = the front card has left
  const advance = () => {
    haptic.light();
    setIdx((i + 1) % n);
    tx.value = 0; // the next card is already in front's place (scale 1), so resetting is invisible
    p.value = 0;
  };
  const swipe = Gesture.Pan().enabled(many).activeOffsetX([-18, 18]).failOffsetY([-14, 14])
    .onUpdate((e) => { tx.value = e.translationX; p.value = Math.min(1, Math.abs(e.translationX) / 140); })
    .onEnd((e) => {
      const go = Math.abs(e.translationX) > 70 || Math.abs(e.velocityX) > 700;
      if (!go) { tx.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) }); p.value = withTiming(0, { duration: 200 }); return; }
      const dir = e.translationX < 0 || (e.translationX === 0 && e.velocityX < 0) ? -1 : 1;
      p.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
      tx.value = withTiming(dir * 420, { duration: 220, easing: Easing.in(Easing.quad) }, (fin) => { if (fin) scheduleOnRN(advance); });
    });
  const front = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { rotate: `${tx.value / 40}deg` }] }));
  const second = useAnimatedStyle(() => ({ transform: [{ translateY: 18 * (1 - p.value) }, { scale: 0.93 + 0.07 * p.value }] }));
  const third = useAnimatedStyle(() => ({ transform: [{ translateY: 34 - 16 * p.value }, { scale: 0.86 + 0.07 * p.value }] }));
  const washSecond = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - p.value) }));
  const washThird = useAnimatedStyle(() => ({ opacity: 0.85 - 0.4 * p.value }));
  if (!n) return null;
  const dismiss = (k: string) => { haptic.light(); set((s) => ({ dismissed: { ...s.dismissed, [k]: true } })); };
  const peek = (k: number) => items[(i + k) % n];
  return (
    <View style={{ paddingBottom: many ? (n > 2 ? 56 : 40) : 0 }}>
      <View>
        {/* behind the front card: real cards, the same size, squeezed and pushed down so only their edges show */}
        {n > 2 && (
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: h || undefined, overflow: 'hidden', borderRadius: 24, borderWidth: 1, borderColor: c.line }, third]}>
            <ItemCard it={peek(2)} i={(i + 2) % n} n={n} onDismiss={() => {}} />
            <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: c.surface3 }, washThird]} />
          </Animated.View>
        )}
        {many && (
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: h || undefined, overflow: 'hidden', borderRadius: 24, borderWidth: 1, borderColor: c.line }, second]}>
            <ItemCard it={peek(1)} i={(i + 1) % n} n={n} onDismiss={() => {}} />
            <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: c.surface3 }, washSecond]} />
          </Animated.View>
        )}
        <GestureDetector gesture={swipe}>
          <Animated.View onLayout={(e) => setH(e.nativeEvent.layout.height)} style={many ? front : undefined}>
            <ItemCard it={items[i]} i={i} n={n} onDismiss={() => dismiss(items[i].key)} />
          </Animated.View>
        </GestureDetector>
      </View>
      {many && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'center', height: 14 }}>
          {items.map((x, k) => <View key={x.key} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: k === i ? c.ink : c.surface3 }} />)}
        </View>
      )}
    </View>
  );
}
