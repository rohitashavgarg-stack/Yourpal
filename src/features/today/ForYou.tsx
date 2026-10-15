import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, interpolate, SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { CreditCard, Flame, X } from '@/lib/icons';
import { useStartWorkout } from '@/features/workout/StartSheet';
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
import { cardShadow, CornerGlow } from '@/features/progress/parts';
import { FLAME } from '@/features/streak/StreakChip';
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
  chips?: string[]; full?: boolean; // small chips instead of a sentence, and a full-width button
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

// ---------- The stack ----------
// Every card stays mounted for good, keyed by its id (never by position), and one shared value, `prog`, says which card is in front.
// Each card works out where it sits from (its index - prog): 0 is the front, 1 and 2 are the cards behind (a little smaller, a little lower, no text),
// and -1 is a card that has just left to the side. Nothing remounts and no React state changes while a finger is moving, so there is no refresh and no flicker.
const frontH = (hs: number[], p: number) => {
  'worklet';
  const n = hs.length;
  if (!n) return 0;
  const q = ((p % n) + n) % n, i0 = Math.floor(q), i1 = (i0 + 1) % n, t = q - i0;
  return hs[i0] * (1 - t) + hs[i1] * t;
};

const wrapD = (i: number, p: number, n: number) => {
  'worklet';
  return ((((i - p) + 1) % n) + n) % n - 1; // in [-1, n - 1)
};

const StackCard = React.memo(function StackCard({ it, i, n, prog, hs, onNatural, onDismiss }: { it: Item; i: number; n: number; prog: SharedValue<number>; hs: SharedValue<number[]>; onNatural: (k: string, h: number) => void; onDismiss: () => void }) {
  const { c, isDark } = useTheme();
  const { openSheet } = useOverlay();
  const fg = it.tone === 'warn' ? c.warn : it.tone === 'muted' ? c.ink : c.accentText;
  const bg = it.tone === 'warn' ? c.warnSoft : it.tone === 'good' ? c.goodSoft : c.accentSoft;
  const I = it.icon;
  const card = useAnimatedStyle(() => {
    const d = wrapD(i, prog.value, n);
    return {
      height: frontH(hs.value, prog.value),
      zIndex: 10 - Math.round(Math.abs(d)),
      opacity: interpolate(d, [-1, 0, 2, 3], [0, 1, 1, 0], 'clamp'),
      transform: [
        { translateX: interpolate(d, [-1, 0], [-360, 0], 'clamp') },
        { translateY: interpolate(d, [0, 2], [0, 26], 'clamp') },
        { scale: interpolate(d, [0, 2], [1, 0.9], 'clamp') },
      ],
    };
  });
  // the cards behind are empty shells: the text fades in only as the card comes forward
  const content = useAnimatedStyle(() => ({ opacity: interpolate(wrapD(i, prog.value, n), [-1, 0, 1], [1, 1, 0], 'clamp') }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0 }, card]}>
      <View style={[{ flex: 1, backgroundColor: c.surface, borderRadius: 24, padding: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.line }, cardShadow(isDark)]}>
        <Animated.View style={content} onLayout={(e) => onNatural(it.key, e.nativeEvent.layout.height)}>
          <View style={{ gap: 12 }}>
            <Row style={{ gap: 12, alignItems: 'flex-start', paddingRight: it.critical ? 0 : 28 }}>
              {it.who ? <PersonAvatar who="coach" size={40} /> : <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{I ? <I size={19} color={fg} /> : null}</View>}
              <View style={{ flex: 1, gap: 2 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{it.title}</Txt>
                {!!it.body && <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>{it.body}</Txt>}
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
        </Animated.View>
        {!it.critical && (
          <Pressy accessibilityRole="button" accessibilityLabel="Dismiss this" onPress={onDismiss} style={{ position: 'absolute', top: 2, right: 2, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <X size={17} color={c.muted} />
          </Pressy>
        )}
      </View>
    </Animated.View>
  );
}, (a, b) => a.it.key === b.it.key && a.it.title === b.it.title && a.it.body === b.it.body && a.it.btn === b.it.btn && a.it.critical === b.it.critical && a.i === b.i && a.n === b.n && a.hs === b.hs && a.prog === b.prog);

// A dot that stretches and darkens as its card comes to the front, in step with the cards.
function Dot({ k, n, prog }: { k: number; n: number; prog: SharedValue<number> }) {
  const { c } = useTheme();
  const st = useAnimatedStyle(() => {
    const near = 1 - Math.min(1, Math.abs(wrapD(k, prog.value, n)));
    return { width: 6 + 10 * near, opacity: 0.35 + 0.65 * near };
  });
  return <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: c.ink }, st]} />;
}

// The deck is as tall as the card in front plus room for the edges of the cards behind.
function Deck({ prog, hs, peek, children }: { prog: SharedValue<number>; hs: SharedValue<number[]>; peek: number; children: React.ReactNode }) {
  const st = useAnimatedStyle(() => ({ height: frontH(hs.value, prog.value) + peek }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

export function ForYouStack() {
  const { set } = useDomain();
  const raw = useForYou();
  const items = raw; // cards are keyed by id and memoised below, so a rebuilt list does not re-render them
  const n = items.length;
  const many = n > 1;
  const prog = useSharedValue(0);
  const base = useSharedValue(0);
  const [front, setFront] = useState(0);
  const [nat, setNat] = useState<Record<string, number>>({});
  const onNatural = (k: string, h: number) => setNat((m) => (Math.abs((m[k] ?? 0) - h) < 1 ? m : { ...m, [k]: h }));
  const hs = useSharedValue<number[]>([]);
  const heights = items.map((x) => (nat[x.key] ?? 0) + 34);
  const hKey = heights.join(',');
  useEffect(() => { hs.value = heights; }, [hKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const settle = (target: number) => { haptic.light(); setFront(((Math.round(target) % n) + n) % n); };
  const swipe = Gesture.Pan().enabled(many).activeOffsetX([-14, 14]).failOffsetY([-14, 14])
    .onStart(() => { base.value = prog.value; })
    .onUpdate((e) => { prog.value = base.value + Math.max(-1, Math.min(1, -e.translationX / 280)); })
    .onEnd((e) => {
      const move = -e.translationX / 280 - e.velocityX / 4000;
      const target = base.value + (move > 0.3 ? 1 : move < -0.3 ? -1 : 0);
      prog.value = withTiming(target, { duration: 280, easing: Easing.out(Easing.cubic) }, (fin) => { if (fin && target !== base.value) scheduleOnRN(settle, target); });
    });
  if (!n) return null;
  // each card's own height (content plus the card's padding and border); the deck follows the one in front
  const cur = items[Math.min(front, n - 1)];
  const dismiss = () => {
    if (!cur) return;
    haptic.light();
    const next = Math.min(front, Math.max(0, n - 2));
    prog.value = next; // the next card takes the front at once; the dismissed one is gone from the list
    setFront(next);
    set((s) => ({ dismissed: { ...s.dismissed, [cur.key]: true } }));
  };
  return (
    <View>
      <GestureDetector gesture={swipe}>
        <Deck prog={prog} hs={hs} peek={n > 2 ? 26 : n > 1 ? 14 : 0}>
          {items.map((it, i) => <StackCard key={it.key} it={it} i={i} n={n} prog={prog} hs={hs} onNatural={onNatural} onDismiss={dismiss} />)}
        </Deck>
      </GestureDetector>
      {many && (
        <View pointerEvents="none" style={{ flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'center', height: 14, marginTop: 2 }}>
          {items.map((x, k) => <Dot key={x.key} k={k} n={n} prog={prog} />)}
        </View>
      )}
    </View>
  );
}

// After a break: its own warm card (a flame, a soft orange glow), not a note in the stack, so the way back is clearly not "updates".
export function ComebackPlan() {
  const { c, isDark } = useTheme();
  const start = useStartWorkout();
  return (
    <Animated.View entering={fade()} style={[{ backgroundColor: c.surface, borderRadius: 28, padding: 18, gap: 14, overflow: 'hidden' }, cardShadow(isDark)]}>
      <CornerGlow color={FLAME} size={520} />
      <Row style={{ gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,138,61,0.16)', alignItems: 'center', justifyContent: 'center' }}><Flame size={22} color={FLAME} fill={FLAME} /></View>
        <View style={{ flex: 1, gap: 6 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 20, lineHeight: 27, letterSpacing: -0.5 }}>Your comeback plan with lighter weights</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {['30 min', '5 exercises'].map((t) => <View key={t} style={{ height: 28, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: c.chipLine, justifyContent: 'center' }}><Txt style={{ fontFamily: font.medium, fontSize: 12.5, lineHeight: 18 }}>{t}</Txt></View>)}
          </Row>
        </View>
      </Row>
      <Button label="Start easy session" onPress={() => start()} />
    </Animated.View>
  );
}
