/* eslint-disable react-hooks/immutability, react-hooks/purity, react-hooks/refs -- reanimated shared values are written from gesture and animation callbacks; Date.now() is read inside event handlers, not during render; refs are read and written in gesture-handler callbacks, not during render */
import React, { useEffect, useRef, useState } from 'react';
import { useLogGate, useLogsPaused } from '@/lib/logGate';
import { View } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { ArrowRightLeft, ChevronDown, Minus, MoreHorizontal, Plus } from '@/lib/icons';
import { Button, Card, IconButton, Pressy, Row, Txt } from '@/components/ui';
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
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { Chevron } from '@/design-system/primitives/Chevron';
import { AmountStepper } from '@/design-system/primitives/AmountStepper';
import { ProgressBar } from '@/design-system/primitives/ProgressBar';
import { FadeIn } from '@/design-system/primitives/FadeIn';

const ACircle = Animated.createAnimatedComponent(Circle);

// ---------- Summary: kcal ring + macro bars ----------
function KcalRing({ k }: { k: number }) {
  const C = 2 * Math.PI * 44;
  const v = useSharedValue(0);
  useEffect(() => { v.value = withTiming(Math.min(1, k / KCAL_TARGET), { duration: 900, easing: Easing.out(Easing.cubic) }); }, [k]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - v.value) }));
  const shown = useCountUp(Math.round(k), 700);
  const { c } = useTheme();
  return (
    <View accessible accessibilityLabel={`Eaten ${Math.round(k)} of ${KCAL_TARGET} kcal`} style={{ width: 108, height: 108 }}>
      <Svg width={108} height={108} viewBox="0 0 108 108">
        <Circle cx={54} cy={54} r={44} fill="none" stroke={c.surface2} strokeWidth={10} />
        <ACircle cx={54} cy={54} r={44} fill="none" stroke={c.cAct} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${C}`} animatedProps={props} transform="rotate(-90 54 54)" />
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3 }}>{inr(shown)}</Txt>
        <Txt style={{ fontSize: fontSizes.xs2, color: c.muted, marginTop: -4 }}>of {inr(KCAL_TARGET)} kcal</Txt>
      </View>
    </View>
  );
}

function MacroBar({ l, v, target, col }: { l: string; v: number; target: number; col: string }) {
  const shown = useCountUp(Math.round(v), 700);
  const w = useSharedValue(0);
  useEffect(() => { w.value = withTiming(Math.min(100, (v / target) * 100), { duration: 800, easing: Easing.out(Easing.cubic) }); }, [v, target]);
  const a = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View accessible accessibilityLabel={`${l} ${Math.round(v)} of ${target} grams`} style={{ gap: 4 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm }}>{l}</Txt>
        <Txt v="mono" muted style={{ fontSize: fontSizes.xs }}>{shown} / {target} g</Txt>
      </Row>
      <ProgressBar height={6} color={col} fillStyle={a} />
    </View>
  );
}

// Marking eaten is one tap; undoing it is a deliberate two-step, so browsing other days can't flip food by accident.
export function UndoEatenSheet({ what, onConfirm }: { what: string; onConfirm: () => void }) {
  const { closeSheet } = useOverlay();
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: fontSizes.xl2, lineHeight: 29 }}>Mark as not eaten?</Txt>
      <Txt muted style={{ fontSize: fontSizes.base, lineHeight: 22 }}>{what} will go back to your plan and leave today’s totals.</Txt>
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

  if (locked) return <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.muted }}>{text}</Txt>;

  return (
    <View style={{ alignSelf: 'flex-start' }}>
      <AmountStepper text={text} unit={qty.unit} onLess={() => go(cur - step)} onMore={() => go(cur + step)} lessDisabled={cur <= step} moreDisabled={cur >= max}
        accessibilityLabel={`Amount ${text}${changed ? ', changed from plan' : ''}. Hold for units and reset`}
        onLongPress={() => { haptic.medium(); openSheet(<QtySheet mid={mid} itemKey={it.key} />, { label: 'Change amount' }); }} />
      {changed && <View accessibilityLabel="Changed from plan" style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: radii.xs, backgroundColor: c.warn }} />}
    </View>
  );
}

// ---------- One food card ----------
// Not eaten: a dashed card with the amount stepper and the check on the right. Swipe left for Swap and Skip (Delete for a food you added).
// Eaten: a solid card, the amount is locked, the macros sit in a darker strip with a menu to mark it as not eaten.
// Skipped: faded. Hold any card to open the food page.
const ACTION = 44;                       // the Swap and Skip buttons are 44 px
const REVEAL = ACTION + 64 + 8 * 3;      // Swap, Skip (wider, it has a word) and the gaps

function ItemRow({ mid, it, simple }: { mid: MealId; it: DItem; simple: boolean }) {
  const { c } = useTheme();
  const A = useDietActions();
  const { openSheet } = useOverlay();
  const { gate: logGate } = useLogGate();
  const tx = useSharedValue(0);
  const base = useSharedValue(0);
  const kShown = useCountUp(Math.round(it.k * it.por), 700, Math.round(it.k * it.por));
  const ate = it.st === 'eaten';
  const skipped = it.st === 'skipped';
  const canSwipe = it.st === 'todo';
  const food = splitFood(it);

  const close = () => { tx.value = withTiming(0, { duration: 200 }); base.value = 0; };
  const tick = () => { haptic.light(); };
  const onSwap = logGate(() => { close(); openSheet(it.kind === 'plan' ? <QuickLogSheet mealId={mid} mode="sugg" replaceIdx={it.idx} /> : <SwapSheet mid={mid} itemKey={it.key} always={false} />, { label: 'Swap item' }); });
  const onSkip = () => { close(); if (it.mine) A.deleteExtra(mid, it); else A.skipItem(mid, it); };
  const openFood = () => { haptic.medium(); router.push({ pathname: '/food', params: { mid, k: String(it.idx), extra: it.mine ? '1' : '0' } }); };

  const pan = Gesture.Pan().enabled(canSwipe).activeOffsetX([-12, 12]).failOffsetY([-10, 10])
    .onUpdate((e) => { tx.value = Math.max(-REVEAL, Math.min(0, base.value + e.translationX)); })
    .onEnd(() => {
      const open = tx.value < -REVEAL / 2;
      tx.value = withTiming(open ? -REVEAL : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
      if (open && base.value === 0) scheduleOnRN(tick);
      base.value = open ? -REVEAL : 0;
    });
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  const macros = simple ? (it.swapped ? 'Swapped' : it.mine ? 'Added by you' : 'As planned') : `P ${Math.round(it.p * it.por)} · C ${Math.round(it.c * it.por)} · F ${Math.round(it.f * it.por)} g`;
  const amountText = food.qty ? fmtQty(Math.round(food.qty.n * it.por * 100) / 100, food.qty.unit) : '';
  const label = `${food.name}, ${amountText ? amountText + ', ' : ''}${skipped ? 'skipped for today' : `${kShown} kcal`}. Hold for nutrition and recipe`;
  const actions = ate ? [{ name: 'details', label: 'Open details' }] : [{ name: 'swap', label: 'Swap' }, { name: it.mine ? 'delete' : 'skip', label: it.mine ? 'Delete' : 'Skip' }, { name: 'details', label: 'Open details' }];
  const onAction = (n: string) => { if (n === 'swap') onSwap(); else if (n === 'skip' || n === 'delete') onSkip(); else if (n === 'details') openFood(); };
  const check = (
    <CheckCircle on={ate} size={34} tone="good" label={`${ate ? 'Unmark' : 'Mark eaten:'} ${it.n}`}
      onPress={() => (ate ? openSheet(<UndoEatenSheet what={it.n} onConfirm={() => A.eat(mid, it, false)} />, { label: 'Mark as not eaten' }) : A.eat(mid, it, true))} />
  );
  const title = (
    <Row style={{ gap: 8 }}>
      <FoodMark type={it.type} size={13} />
      <Txt numberOfLines={2} style={{ flexShrink: 1, fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 21, textDecorationLine: skipped ? 'line-through' : 'none' }}>{food.name}</Txt>
      {it.mine && <Tag label="Yours" bg={c.accentSoft} fg={c.accentText} />}
    </Row>
  );

  if (ate) {
    return (
      <Pressy accessibilityRole="button" accessibilityLabel={label} accessibilityActions={actions} onAccessibilityAction={(e) => onAction(e.nativeEvent.actionName)}
        onLongPress={openFood} delayLongPress={480} scaleTo={0.99} haptics={false} style={{ borderRadius: radii.md, overflow: 'hidden', backgroundColor: c.surface2 }}>
        <View style={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, gap: 10 }}>
          {title}
          <Row style={{ justifyContent: 'space-between' }}>
            {food.qty ? <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20 }}>{amountText}</Txt> : <View />}
            <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{kShown} kcal</Txt>
          </Row>
        </View>
        <Row style={{ justifyContent: 'space-between', backgroundColor: c.surface3, paddingLeft: 14, paddingRight: 8, paddingVertical: 8, minHeight: 52 }}>
          <Txt v="caption" style={{ flexShrink: 1 }}>{macros}</Txt>
          <IconButton label={`More for ${it.n}`} onPress={() => openSheet(<UndoEatenSheet what={it.n} onConfirm={() => A.eat(mid, it, false)} />, { label: 'Mark as not eaten' })} size={36} radius={radii.pill} borderWidth={1.5} borderColor={c.chipLine} hitSlop={4}>
            <MoreHorizontal size={18} color={c.ink} />
          </IconButton>
        </Row>
      </Pressy>
    );
  }

  return (
    <View style={{ borderRadius: radii.md, overflow: 'hidden' }}>
      {canSwipe && (
        <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: REVEAL, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Pressy accessibilityRole="button" accessibilityLabel="Swap" onPress={onSwap} scaleTo={0.94} style={{ width: ACTION, height: ACTION, borderRadius: radii.tile, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRightLeft size={20} color={c.bg} />
          </Pressy>
          <Pressy accessibilityRole="button" accessibilityLabel={it.mine ? 'Delete' : 'Skip'} onPress={onSkip} scaleTo={0.94} style={{ minWidth: 64, height: ACTION, paddingHorizontal: 12, borderRadius: radii.tile, backgroundColor: c.surface3, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20, color: it.mine ? c.warn : c.ink }}>{it.mine ? 'Delete' : 'Skip'}</Txt>
          </Pressy>
        </View>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View collapsable={false} style={[{ borderRadius: radii.md, backgroundColor: c.surface }, slide]}>
          <Pressy accessibilityRole="button" accessibilityLabel={label} accessibilityActions={actions} onAccessibilityAction={(e) => onAction(e.nativeEvent.actionName)}
            onLongPress={openFood} delayLongPress={480} scaleTo={0.99} haptics={false}
            style={{ borderRadius: radii.md, borderWidth: 1.5, borderStyle: skipped ? 'solid' : 'dashed', borderColor: skipped ? 'transparent' : c.chipLine, backgroundColor: skipped ? c.surface2 : 'transparent', paddingVertical: 12, paddingLeft: 14, paddingRight: 10, flexDirection: 'row', alignItems: 'center', gap: 10, opacity: skipped ? 0.55 : 1 }}>
            <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
              {title}
              {skipped ? <Txt v="caption">Skipped for today</Txt> : (
                <>
                  <Row style={{ gap: 10, flexWrap: 'wrap' }}>
                    {food.qty ? <QtyControl mid={mid} it={it} qty={food.qty} locked={false} /> : null}
                    <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{kShown} kcal</Txt>
                  </Row>
                  <Txt v="caption">{macros}</Txt>
                </>
              )}
            </View>
            {check}
          </Pressy>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ---------- Meal accordion card ----------
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
  const paused = useLogsPaused();
  const addElse = () => router.push({ pathname: '/plans/log', params: { meal: mid } });

  return (
    <Card style={{ padding: 6, borderRadius: radii.card }}>
      <Row style={{ gap: 6 }}>
        <Pressy accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${m.n}, ${sub}`} accessibilityHint="Double tap quickly to mark the whole meal eaten"
          onPress={tap} scaleTo={0.985} haptics={false} style={{ flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10 }}>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 16 }}>{m.n}</Txt>
            <Txt muted style={{ fontSize: fontSizes.sm }}>{sub}</Txt>
          </View>
          <Chevron open={open} />
        </Pressy>
        <View style={{ marginRight: 4 }}>
          <CheckCircle on={all} size={40} tone="good" label={`${all ? 'Unmark' : 'Mark all of'} ${m.n} as eaten`} onPress={() => (all ? openSheet(<UndoEatenSheet what={`All of ${m.n}`} onConfirm={() => A.mealAll(mid, items, m.n)} />, { label: 'Mark as not eaten' }) : A.mealAll(mid, items, m.n))} />
        </View>
      </Row>
      {open && (
        <FadeIn style={{ gap: 6, paddingHorizontal: 4, paddingTop: 4, paddingBottom: 6 }}>
          {items.map((it) => <ItemRow key={it.key} mid={mid} it={it} simple={simple} />)}
          {!paused && <AteElse onPress={addElse} />}
        </FadeIn>
      )}
    </Card>
  );
}

function AteElse({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Button kind="dashed" size="fill" label="Ate something else?" accessibilityLabel="Ate something else? Log it" icon={<Plus size={16} color={c.ink} />} onPress={onPress} />
  );
}

// ---------- Diet segment ----------
export function DietPlan() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();
  const paused = useLogsPaused();

  if (p.noPlan) {
    return (
      <FadeIn i={0}>
        <Card style={{ padding: 22, gap: 10 }}>
          <Tag label="Diet plan on the way" bg={c.accentSoft} fg={c.accentText} />
          <Txt v="headline">Coach Vikram shares your diet after the assessment</Txt>
          <Txt muted style={{ fontSize: fontSizes.md }}>Until then you can log what you eat.</Txt>
          {!paused && <Button kind="secondary" small label="Log a meal" onPress={() => router.push({ pathname: '/plans/log', params: { meal: dietOpenMeal(d) } })} style={{ alignSelf: 'flex-start' }} />}
        </Card>
      </FadeIn>
    );
  }

  const t = dietTotals(d, p);
  const openId = p.openMeal === 'none' ? null : p.openMeal ?? nextMeal(d) ?? 'lu';
  const onPlan = totals(d).onPlan;
  const overBy = Math.max(0, Math.round(t.k - KCAL_TARGET));
  return (
    <>
      <FadeIn i={0}>
        <Card style={{ paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <KcalRing k={t.k} />
          <View style={{ flex: 1, gap: 10, minWidth: 0 }}>
            <MacroBar l="Protein" v={t.p} target={MACRO_TARGET.p} col={c.accent} />
            <MacroBar l="Carbs" v={t.c} target={MACRO_TARGET.c} col={c.cNutri} />
            <MacroBar l="Fat" v={t.f} target={MACRO_TARGET.f} col={c.cFat} />
          </View>
        </Card>
      </FadeIn>
      <FadeIn i={1}>
        {overBy > 0 && (
          <FadeIn accessibilityRole="alert" style={{ marginTop: 8, padding: 12, borderRadius: radii.md, backgroundColor: c.warnSoft }}>
            <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.warn }}>You&apos;re about {inr(overBy)} kcal over today. That&apos;s okay. Keep your next meal light and have some water.</Txt>
          </FadeIn>
        )}
      </FadeIn>
      <FadeIn i={2}>
        <Row style={{ gap: 16, paddingHorizontal: 6, paddingVertical: 2 }}>
          {(['veg', 'egg', 'nv'] as const).map((ty) => (
            <Row key={ty} style={{ gap: 5 }}><FoodMark type={ty} size={13} /><Txt v="caption">{ty === 'veg' ? 'Veg' : ty === 'egg' ? 'Egg' : 'Non-veg'}</Txt></Row>
          ))}
        </Row>
      </FadeIn>
      {MEALS.map((m, i) => <FadeIn key={m.id} i={3 + i}><MealCard mid={m.id} open={openId === m.id} /></FadeIn>)}
      <FadeIn i={3 + MEALS.length}>
        <View accessible accessibilityLabel={`This week: ${7 + onPlan} of 12 meals on plan`} style={{ gap: 2, paddingHorizontal: 6, paddingTop: 8, paddingBottom: 12 }}>
          <Row style={{ alignItems: 'baseline', gap: 6 }}>
            <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 39, letterSpacing: -0.6 }}>{7 + onPlan}</Txt>
            <Txt muted style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 29 }}>of 12</Txt>
          </Row>
          <Txt muted style={{ fontSize: fontSizes.sm }}>meals on plan this week</Txt>
        </View>
      </FadeIn>
    </>
  );
}
