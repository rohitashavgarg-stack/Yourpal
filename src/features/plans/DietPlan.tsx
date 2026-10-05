import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { ChevronDown, Minus, Plus } from '@/lib/icons';
import { fade } from '@/theme/motion';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { CheckCircle, FoodMark, Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { KCAL_TARGET, MACRO_TARGET, MealId, MEALS } from '@/lib/data';
import { totals, useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { inr } from '@/lib/useNow';
import { nextMeal } from '@/features/today/meals';
import { useDietActions } from './dietActions';
import { dietOpenMeal } from './openers';
import { QuickLogSheet } from '@/features/today/QuickLogSheet';
import { ItemMenuSheet, SwapSheet } from './Sheets';
import { QtySheet } from './QtySheet';
import { fmtNum, fmtQty, Qty, splitFood, stepFor, unitLabel } from './qty';
import { DItem, dietItems, dietTotals, setP, useCountUp, usePlans } from './store';

const ACircle = Animated.createAnimatedComponent(Circle);
const E = ({ i, children }: { i: number; children: React.ReactNode }) => <Animated.View entering={fade(i * 40)}>{children}</Animated.View>;

// ---------- Summary: kcal ring + macro bars ----------
function KcalRing({ k }: { k: number }) {
  const { c } = useTheme();
  const C = 2 * Math.PI * 44;
  const v = useSharedValue(0);
  useEffect(() => { v.value = withTiming(Math.min(1, k / KCAL_TARGET), { duration: 900, easing: Easing.out(Easing.cubic) }); }, [k]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - v.value) }));
  const shown = useCountUp(Math.round(k), 700);
  return (
    <View accessible accessibilityLabel={`Eaten ${Math.round(k)} of ${KCAL_TARGET} kcal`} style={{ width: 108, height: 108 }}>
      <Svg width={108} height={108} viewBox="0 0 108 108">
        <Circle cx={54} cy={54} r={44} fill="none" stroke={c.surface2} strokeWidth={10} />
        <ACircle cx={54} cy={54} r={44} fill="none" stroke={c.cAct} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${C}`} animatedProps={props} transform="rotate(-90 54 54)" />
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ fontFamily: font.display, fontSize: 25 }}>{inr(shown)}</Txt>
        <Txt style={{ fontSize: 11, color: c.muted, marginTop: -4 }}>of {inr(KCAL_TARGET)} kcal</Txt>
      </View>
    </View>
  );
}

function MacroBar({ l, v, target, col }: { l: string; v: number; target: number; col: string }) {
  const { c } = useTheme();
  const shown = useCountUp(Math.round(v), 700);
  const w = useSharedValue(0);
  useEffect(() => { w.value = withTiming(Math.min(100, (v / target) * 100), { duration: 800, easing: Easing.out(Easing.cubic) }); }, [v, target]);
  const a = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View accessible accessibilityLabel={`${l} ${Math.round(v)} of ${target} grams`} style={{ gap: 4 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ fontFamily: font.medium, fontSize: 13 }}>{l}</Txt>
        <Txt v="mono" muted style={{ fontSize: 12 }}>{shown} / {target} g</Txt>
      </Row>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surface2, overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', borderRadius: 3, backgroundColor: col }, a]} />
      </View>
    </View>
  );
}

// Marking eaten is one tap; undoing it is a deliberate two-step, so browsing other days can't flip food by accident.
function UndoEatenSheet({ what, onConfirm }: { what: string; onConfirm: () => void }) {
  const { closeSheet } = useOverlay();
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: 22, lineHeight: 29 }}>Mark as not eaten?</Txt>
      <Txt muted style={{ fontSize: 15, lineHeight: 22 }}>{what} will go back to your plan and leave today’s totals.</Txt>
      <Button kind="primary" label="Mark as not eaten" onPress={() => closeSheet(onConfirm)} />
      <Button kind="secondary" label="Keep as eaten" onPress={() => closeSheet()} />
    </View>
  );
}

// The amount of one food: always a direct − / + stepper (no dropdown, no extra tap). Hold the number for units and reset.
function QtyControl({ mid, it, qty, locked }: { mid: MealId; it: DItem; qty: Qty; locked: boolean }) {
  const { c } = useTheme();
  const A = useDietActions();
  const { openSheet } = useOverlay();
  const step = stepFor(qty.unit);
  const cur = Math.round(qty.n * it.por * 100) / 100;
  const max = Math.max(qty.n * 4, step * 10);
  const changed = Math.abs(it.por - 1) > 0.001;
  const text = `${fmtNum(cur)} ${unitLabel(qty.unit)}`;
  const go = (v: number) => {
    const n = Math.min(max, Math.max(step, Math.round(v * 100) / 100));
    if (n !== cur) { haptic.tick(); A.setPor(mid, it.key, n / qty.n); }
  };

  if (locked) return <Txt style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: c.muted }}>{text}</Txt>;

  const b = (label: string, on: () => void, off: boolean, icon: React.ReactNode) => (
    <Pressy accessibilityRole="button" accessibilityLabel={`${label} ${qty.unit || 'piece'}`} disabled={off} onPress={on} scaleTo={0.86} hitSlop={6}
      style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.35 : 1 }}>
      {icon}
    </Pressy>
  );
  return (
    <View style={{ alignSelf: 'flex-start' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: 38, paddingHorizontal: 3, borderRadius: 19, backgroundColor: c.accentSoft }}>
        {b('Less', () => go(cur - step), cur <= step, <Minus size={16} color={c.accentText} strokeWidth={2.4} />)}
        <Pressy accessibilityRole="button" accessibilityLabel={`Amount ${text}${changed ? ', changed from plan' : ''}. Hold for units and reset`}
          onLongPress={() => { haptic.medium(); openSheet(<QtySheet mid={mid} itemKey={it.key} />, { label: 'Change amount' }); }} delayLongPress={450} scaleTo={0.96}
          style={{ minWidth: 62, height: 32, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: c.accentText }}>{text}</Txt>
        </Pressy>
        {b('More', () => go(cur + step), cur >= max, <Plus size={16} color={c.accentText} strokeWidth={2.4} />)}
      </View>
      {changed && <View accessibilityLabel="Changed from plan" style={{ position: 'absolute', top: -2, right: -2, width: 9, height: 9, borderRadius: 5, backgroundColor: c.warn, borderWidth: 2, borderColor: c.bg }} />}
    </View>
  );
}

// ---------- One food line: swipe right = eaten, left = swap, hold = menu ----------

function ItemRow({ mid, it, simple }: { mid: MealId; it: DItem; simple: boolean }) {
  const { c } = useTheme();
  const A = useDietActions();
  const { openSheet } = useOverlay();
  const tx = useSharedValue(0);
  const wash = useSharedValue(0);
  const inX = useSharedValue(0);
  const op = useSharedValue(it.st === 'skipped' ? 0.5 : 1);
  const swipedAt = useRef(0);
  const prevSt = useRef(it.st);
  const prevN = useRef(it.n);

  useEffect(() => {
    if (it.st === 'eaten' && prevSt.current !== 'eaten') { wash.value = 1; wash.value = withTiming(0, { duration: 1100 }); }
    if (it.st === 'skipped' && prevSt.current !== 'skipped') { inX.value = -40; inX.value = withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) }); }
    op.value = withTiming(it.st === 'skipped' ? 0.5 : 1, { duration: 300 });
    prevSt.current = it.st;
  }, [it.st]);
  useEffect(() => {
    if (prevN.current !== it.n) { inX.value = 60; inX.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }); op.value = 0; op.value = withTiming(1, { duration: 320 }); }
    prevN.current = it.n;
  }, [it.n]);
  const kShown = useCountUp(Math.round(it.k * it.por), 700, Math.round(it.k * it.por));

  const markSwipe = () => { swipedAt.current = Date.now(); };
  const onRight = () => { if (it.st !== 'eaten') A.eat(mid, it, true); };
  const onLeft = () => { haptic.light(); openSheet(it.kind === 'plan' ? <QuickLogSheet mealId={mid} mode="sugg" replaceIdx={it.idx} /> : <SwapSheet mid={mid} itemKey={it.key} always={false} />, { label: 'Swap item' }); };
  const pan = Gesture.Pan().activeOffsetX([-12, 12]).failOffsetY([-10, 10])
    .onStart(() => { scheduleOnRN(markSwipe); })
    .onUpdate((e) => {
      const raw = e.translationX;
      tx.value = raw < -100 ? -100 + (raw + 100) * 0.3 : raw > 110 ? 110 + (raw - 110) * 0.3 : raw;
    })
    .onEnd((e) => {
      const raw = e.translationX;
      tx.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      if (raw > 80) scheduleOnRN(onRight);
      else if (raw < -80) scheduleOnRN(onLeft);
      scheduleOnRN(markSwipe);
    });

  const ate = it.st === 'eaten';
  const fg = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value + inX.value }],
    backgroundColor: interpolateColor(wash.value, [0, 1], [ate ? c.goodSoft : c.surface2, c.goodSoft]),
  }));
  const content = useAnimatedStyle(() => ({ opacity: op.value }));
  const under = useAnimatedStyle(() => ({ backgroundColor: tx.value > 0 ? c.good : tx.value < 0 ? c.accent : 'transparent' }));
  const doneL = useAnimatedStyle(() => ({ opacity: tx.value > 0 ? Math.min(1, tx.value / 80) : 0 }));
  const swapL = useAnimatedStyle(() => ({ opacity: tx.value < 0 ? Math.min(1, -tx.value / 70) : 0 }));

  const recent = () => Date.now() - swipedAt.current < 400;
  const openFood = () => { if (recent()) return; router.push({ pathname: '/food', params: { mid, k: String(it.idx), extra: it.mine ? '1' : '0' } }); };
  const menu = () => { if (recent()) return; haptic.medium(); openSheet(<ItemMenuSheet mid={mid} itemKey={it.key} />, { label: 'Item options' }); };
  const food = splitFood(it);
  const qtyText = food.qty ? fmtQty(Math.round(food.qty.n * it.por * 100) / 100, food.qty.unit) : '';
  const sub = it.st === 'skipped' ? 'Skipped for today'
    : ate ? `Eaten · ~${kShown} kcal`
    : simple ? (it.swapped ? 'Swapped' : it.mine ? 'Added by you' : 'As planned')
    : `~${kShown} kcal · P ${Math.round(it.p * it.por)} · C ${Math.round(it.c * it.por)} · F ${Math.round(it.f * it.por)} g`;

  return (
    <View style={{ borderRadius: 18, overflow: 'hidden' }}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }, under]}>
        <Animated.View style={doneL}><Txt style={{ fontFamily: font.semibold, fontSize: 14, color: '#06150E' }}>Eaten</Txt></Animated.View>
        <Animated.View style={swapL}><Txt style={{ fontFamily: font.semibold, fontSize: 14, color: '#fff' }}>Swap</Txt></Animated.View>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View collapsable={false}
          style={[{ minHeight: 64, borderRadius: 18, paddingLeft: 12, paddingRight: 4, flexDirection: 'row', alignItems: 'center', gap: 8 }, fg]}>
          <Animated.View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 }, content]}>
            <FoodMark type={it.type} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Pressy accessibilityRole="button" accessibilityLabel={`${food.name}, ${qtyText ? qtyText + ', ' : ''}${sub}. Tap for nutrition and recipe, hold for more`} accessibilityHint="Swipe right to mark eaten, left to swap"
                accessibilityActions={[{ name: 'eaten', label: 'Mark eaten' }, { name: 'swap', label: 'Swap' }, { name: 'menu', label: 'More options' }]}
                onAccessibilityAction={(e) => { const n = e.nativeEvent.actionName; if (n === 'eaten') onRight(); else if (n === 'swap') onLeft(); else if (n === 'menu') menu(); }}
                onPress={openFood} onLongPress={menu} delayLongPress={480} scaleTo={0.98} style={{ paddingTop: 10, paddingBottom: 2 }}>
                <Txt numberOfLines={2} style={{ fontFamily: font.medium, textDecorationLine: it.st === 'skipped' ? 'line-through' : 'none' }}>{food.name}</Txt>
              </Pressy>
              <View style={{ gap: 6, paddingBottom: 10 }}>
                {food.qty && it.st !== 'skipped' ? <QtyControl mid={mid} it={it} qty={food.qty} locked={ate} /> : null}
                <Pressy onPress={openFood} onLongPress={menu} delayLongPress={480} scaleTo={0.98} accessible={false}>
                  <Txt v="caption" numberOfLines={1}>{sub}</Txt>
                </Pressy>
              </View>
            </View>
            {it.mine && <Tag label="Yours" bg={c.accentSoft} fg={c.accentText} style={{ alignSelf: 'center' }} />}
          </Animated.View>
          <CheckCircle on={it.st === 'eaten'} size={40} tone="good" label={`${it.st === 'eaten' ? 'Unmark' : 'Mark eaten:'} ${it.n}`} onPress={() => (ate ? openSheet(<UndoEatenSheet what={it.n} onConfirm={() => A.eat(mid, it, false)} />, { label: 'Mark as not eaten' }) : A.eat(mid, it, true))} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ---------- Meal accordion card ----------
function Chevron({ open }: { open: boolean }) {
  const { c } = useTheme();
  const r = useSharedValue(open ? 180 : 0);
  useEffect(() => { r.value = withTiming(open ? 180 : 0, { duration: 300 }); }, [open]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={a}><ChevronDown size={18} color={c.muted} /></Animated.View>;
}

function MealCard({ mid, open }: { mid: MealId; open: boolean }) {
  const { d } = useDomain();
  const { p } = usePlans();
  const A = useDietActions();
  const { openSheet } = useOverlay();
  const m = MEALS.find((x) => x.id === mid)!;
  const items = dietItems(d, p, mid);
  const simple = p.detail === 'Simple';
  const eaten = items.filter((i) => i.st === 'eaten').length;
  const total = items.filter((i) => i.st !== 'skipped').length;
  const all = items.length > 0 && eaten > 0 && items.every((i) => i.st === 'eaten' || i.st === 'skipped');
  let kc = 0, mp = 0; items.forEach((i) => { if (i.st !== 'skipped') { kc += i.k * i.por; mp += i.p * i.por; } });
  const sub = (all ? 'All eaten' : eaten ? `${eaten} of ${total} eaten` : `${items.length} items`) + (simple ? '' : ` · ~${Math.round(kc)} kcal · P ${Math.round(mp)} g`);
  const last = useRef(0);
  const tm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(tm.current), []);
  const tap = () => {
    const now = Date.now();
    if (!all && now - last.current < 320) { clearTimeout(tm.current); last.current = 0; A.mealAll(mid, items, m.n); return; }
    last.current = now;
    clearTimeout(tm.current);
    tm.current = setTimeout(() => setP({ openMeal: open ? 'none' : mid }), 260);
  };
  const addElse = () => router.push({ pathname: '/plans/log', params: { meal: mid } });

  return (
    <Card style={{ padding: 6, borderRadius: 24 }}>
      <Row style={{ gap: 6 }}>
        <Pressy accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${m.n}, ${sub}`} accessibilityHint="Double tap quickly to mark the whole meal eaten"
          onPress={tap} scaleTo={0.985} haptics={false} style={{ flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10 }}>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 16 }}>{m.n}</Txt>
            <Txt muted style={{ fontSize: 13 }}>{sub}</Txt>
          </View>
          <Chevron open={open} />
        </Pressy>
        <View style={{ marginRight: 4 }}>
          <CheckCircle on={all} size={40} tone="good" label={`${all ? 'Unmark' : 'Mark all of'} ${m.n} as eaten`} onPress={() => (all ? openSheet(<UndoEatenSheet what={`All of ${m.n}`} onConfirm={() => A.mealAll(mid, items, m.n)} />, { label: 'Mark as not eaten' }) : A.mealAll(mid, items, m.n))} />
        </View>
      </Row>
      {open && (
        <Animated.View entering={fade()} style={{ gap: 6, paddingHorizontal: 4, paddingTop: 4, paddingBottom: 6 }}>
          {items.map((it) => <ItemRow key={it.key} mid={mid} it={it} simple={simple} />)}
          <AteElse onPress={addElse} />
        </Animated.View>
      )}
    </Card>
  );
}

function AteElse({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Ate something else? Log it" onPress={onPress}
      style={{ height: 44, borderRadius: 22, borderWidth: 1, borderStyle: 'dashed', borderColor: c.chipLine, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Plus size={16} color={c.ink} /><Txt style={{ fontFamily: font.medium, fontSize: 14 }}>Ate something else?</Txt>
    </Pressy>
  );
}

// ---------- Diet segment ----------
export function DietPlan() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();

  if (p.noPlan) {
    return (
      <E i={0}>
        <Card style={{ padding: 22, gap: 10 }}>
          <Tag label="Diet plan on the way" bg={c.accentSoft} fg={c.accentText} />
          <Txt v="headline">Coach Vikram shares your diet after the assessment</Txt>
          <Txt muted style={{ fontSize: 14 }}>Until then you can log what you eat.</Txt>
          <Button kind="secondary" small label="Log a meal" onPress={() => router.push({ pathname: '/plans/log', params: { meal: dietOpenMeal(d) } })} style={{ alignSelf: 'flex-start' }} />
        </Card>
      </E>
    );
  }

  const t = dietTotals(d, p);
  const openId = p.openMeal === 'none' ? null : p.openMeal ?? nextMeal(d) ?? 'lu';
  const onPlan = totals(d).onPlan;
  const left = Math.max(0, Math.round(KCAL_TARGET - t.k));
  const overBy = Math.max(0, Math.round(t.k - KCAL_TARGET));
  return (
    <>
      <E i={0}>
        <Card style={{ paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <KcalRing k={t.k} />
          <View style={{ flex: 1, gap: 10, minWidth: 0 }}>
            <MacroBar l="Protein" v={t.p} target={MACRO_TARGET.p} col={c.accent} />
            <MacroBar l="Carbs" v={t.c} target={MACRO_TARGET.c} col={c.cNutri} />
            <MacroBar l="Fat" v={t.f} target={MACRO_TARGET.f} col={c.cFat} />
          </View>
        </Card>
      </E>
      <E i={1}>
        <Row style={{ gap: 12, flexWrap: 'wrap', paddingHorizontal: 6 }}>
          <Txt v="caption" style={overBy ? { color: c.warn } : undefined}>{overBy ? `${inr(overBy)} kcal over today's target` : `${inr(left)} kcal left`} · planned ~{inr(Math.round(t.plan))}</Txt>
          <View style={{ flex: 1 }} />
          {(['veg', 'egg', 'nv'] as const).map((ty) => (
            <Row key={ty} style={{ gap: 4 }}><FoodMark type={ty} size={12} /><Txt v="caption">{ty === 'veg' ? 'Veg' : ty === 'egg' ? 'Egg' : 'Non-veg'}</Txt></Row>
          ))}
        </Row>
        {overBy > 0 && (
          <Animated.View entering={fade()} accessibilityRole="alert" style={{ marginTop: 8, padding: 12, borderRadius: 16, backgroundColor: c.warnSoft }}>
            <Txt style={{ fontSize: 13, lineHeight: 19, color: c.warn }}>You're about {inr(overBy)} kcal over today. That's okay. Keep your next meal light and have some water.</Txt>
          </Animated.View>
        )}
      </E>
      <E i={1}><Txt v="caption" style={{ paddingHorizontal: 6 }}>Swipe right = eaten · swipe left = swap · tap the amount to change it · hold for more · double tap a meal to mark it all eaten</Txt></E>
      {MEALS.map((m, i) => <E key={m.id} i={2 + i}><MealCard mid={m.id} open={openId === m.id} /></E>)}
      <Txt muted style={{ textAlign: 'center', fontSize: 13 }}>This week: {7 + onPlan} of 12 meals on plan</Txt>
    </>
  );
}
