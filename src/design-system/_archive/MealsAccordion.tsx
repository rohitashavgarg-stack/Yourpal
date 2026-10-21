// Archived: the all-meals accordion card. Nothing on screen uses it any more (Today shows the meal for right now, see patterns/MealsCard.tsx).
// The old import path features/today/MealsCard still exports MealsCard from here.
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { router } from 'expo-router';
import { Check, ChevronDown, ChevronRight, Clock, Lock, Minus, Plus, UtensilsCrossed, X } from '@/lib/icons';
import { Card, Chip, Pressy, Row, Txt } from '@/components/ui';
import { CheckCircle, FoodMark } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { fmtT, KCAL_TARGET, MACRO_TARGET, MealId, MEALS } from '@/lib/data';
import { mealLog, totals, useDomain, useMeals } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { inr } from '@/lib/useNow';
import { mealById, mealKcal, mealTimeline, mealView, nextMeal } from '@/features/today/meals';
import { QuickLogSheet } from '@/features/today/QuickLogSheet';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { useLogGate } from '@/lib/logGate';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { Chevron } from '@/design-system/primitives/Chevron';
import { FadeIn } from '@/design-system/primitives/FadeIn';

function Capsule({ t, now, badge }: { t: number; now: boolean; badge: 'done' | 'part' | 'off' | null }) {
  const { c } = useTheme();
  const tt = fmtT(t);
  const bg = badge === 'done' ? c.good : badge === 'part' ? c.accent : c.surface3;
  return (
    <View style={{ width: 54, minHeight: 54, borderRadius: radii.sm, borderWidth: 1, borderColor: now ? c.ink : c.chipLine, backgroundColor: now ? c.ink : 'transparent', alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}>
      <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, letterSpacing: -0.3, lineHeight: 16, color: now ? c.bg : c.ink }}>{tt.hm}</Txt>
      <Txt style={{ fontSize: fontSizes.xs2, lineHeight: 12, color: now ? c.bg : c.muted, opacity: now ? 0.7 : 1 }}>{tt.ap}</Txt>
      {badge && (
        <FadeIn style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.surface }}>
          {badge === 'done' ? <Check size={10} strokeWidth={3.5} color={fixed.white} /> : badge === 'part' ? <Minus size={10} strokeWidth={3.5} color={fixed.white} /> : <X size={9} strokeWidth={3.5} color={c.muted} />}
        </FadeIn>
      )}
    </View>
  );
}

function MealRow({ id, open, bare = false }: { id: MealId; open: boolean; bare?: boolean }) {
  const { c, isDark } = useTheme();
  const { d, set } = useDomain();
  const { toggleItem, patch } = useMeals();
  const { openSheet, toast } = useOverlay();
  const m = mealById(id);
  const x = mealLog(d, id);
  const v = mealView(d, m);
  const withUndo = (msg: string, fn: () => void) => { const prev = d.meals; fn(); toast(msg, { undo: () => set({ meals: prev }) }); };

  const { gate } = useLogGate();
  const toggle = gate((k: number) => {
    const willFull = !x.eaten.includes(k) && x.eaten.length + 1 === m.items.length;
    if (willFull) withUndo(`${m.n} done, +${mealKcal(m)} kcal`, () => toggleItem(id, k));
    else toggleItem(id, k);
  });
  const removeExtra = gate((j: number) => {
    const gone = x.extra[j];
    withUndo(`Removed ${gone?.n ?? 'item'}`, () => patch(id, { extra: x.extra.filter((_, i) => i !== j) }));
  });
  const all = gate(() => {
    if (x.skip) patch(id, { skip: false });
    else if (v.full) patch(id, { eaten: [] });
    else if (v.any) withUndo(`${m.n} done`, () => patch(id, { eaten: m.items.map((_, k) => k), at: x.at ?? d.min }));
    else withUndo(`${m.n} skipped`, () => patch(id, { skip: true, eaten: [] }));
  });
  const allL = x.skip ? 'Undo skip' : v.full ? 'Unmark all' : v.any ? 'Mark rest eaten' : 'Skip meal';
  const openFood = (k: number, extra: boolean) => router.push({ pathname: '/food', params: { mid: id, k: String(k), extra: extra ? '1' : '0' } });

  return (
    <Animated.View layout={LinearTransition.duration(180)} style={bare ? undefined : { borderTopWidth: 1, borderTopColor: c.line }}>
      {!bare && <Pressy accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${m.n}, ${v.status}`} scaleTo={0.985}
        onPress={() => set({ openMeal: open ? 'none' : id })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
        <Capsule t={m.t} now={v.isNext && !v.any && !x.skip} badge={v.badge} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 16 }}>{m.n}</Txt>
          <Txt numberOfLines={1} style={{ fontSize: fontSizes.sm, color: v.tone === 'good' ? c.good : v.tone === 'warn' ? c.warn : c.muted }}>{v.status}</Txt>
        </View>
        <Txt v="mono" muted style={{ fontSize: fontSizes.xs }}>{v.kcal} kcal</Txt>
        <Chevron open={open} motion="spring" />
      </Pressy>}
      {(open || bare) && (
        <FadeIn style={{ gap: 4, paddingBottom: bare ? 0 : 12 }}>
          {m.items.map((it, k) => {
            const on = x.eaten.includes(k);
            const r = x.repl[k];
            return (
              <Row key={k} style={{ gap: 10, minHeight: 52, paddingLeft: 12, paddingRight: 4, paddingVertical: 4, borderRadius: radii.md, backgroundColor: on ? (isDark ? '#1E4A3F' : c.goodSoft) : c.surface2, borderWidth: on ? 1 : 0, borderColor: c.good + '66' }}>
                <FoodMark type={it.type} />
                <Pressy accessibilityRole="button" accessibilityLabel={`${r ? r.n : it.n}: nutrition, recipe and swap`} onPress={() => openFood(k, false)} scaleTo={0.98} style={{ flex: 1, minWidth: 0, paddingVertical: 4 }}>
                  <Txt style={{ fontFamily: font.medium, color: x.skip ? c.muted : c.ink, textDecorationLine: x.skip ? 'line-through' : 'none' }}>{r ? r.n : it.n}</Txt>
                  <Txt v="caption">{r ? `Instead of ${it.n.toLowerCase()}` : it.q}</Txt>
                </Pressy>
                <Txt v="caption" style={{ alignSelf: 'center' }}>{`${r ? r.k : it.k} kcal${r?.est ? '*' : ''}`}</Txt>
                {!!r && <Chip label="Yours" style={{ height: 22, borderColor: c.accentSoft, alignSelf: 'center' }} />}
                <CheckCircle on={on} size={28} tone="good" label={`${on ? 'Unmark' : 'Mark'} ${r ? r.n : it.n} as eaten`} onPress={() => toggle(k)} />
              </Row>
            );
          })}
          {x.extra.map((e, j) => (
            <Row key={`x${j}`} style={{ gap: 10, minHeight: 52, paddingLeft: 12, paddingRight: 4, paddingVertical: 4, borderRadius: radii.md, backgroundColor: c.accentSoft }}>
              <FoodMark type={e.type ?? 'veg'} />
              <Pressy accessibilityRole="button" accessibilityLabel={`${e.n}: details`} onPress={() => openFood(j, true)} scaleTo={0.98} style={{ flex: 1, minWidth: 0, paddingVertical: 4 }}>
                <Txt style={{ fontFamily: font.medium }}>{e.n}</Txt>
                {e.est ? <Txt v="caption">Estimated</Txt> : null}
              </Pressy>
              <Txt v="caption" style={{ alignSelf: 'center' }}>{`${e.k} kcal`}</Txt>
              <Chip label="Yours" style={{ height: 22, borderColor: c.accentSoft, alignSelf: 'center' }} />
              <CheckCircle on size={28} tone="good" label={`Remove ${e.n}`} onPress={() => removeExtra(j)} />
            </Row>
          ))}
          {!bare && <Txt v="caption" style={{ paddingHorizontal: 4, paddingTop: 2 }}>Tap a food for nutrition, recipe or to swap it</Txt>}
          <Row style={{ gap: 8, marginTop: 4 }}>
            <Pressy accessibilityRole="button" onPress={gate(() => openSheet(<QuickLogSheet mealId={id} mode="scan" />, { label: 'Log a meal' }))}
              style={{ flex: 1.7, height: 46, borderRadius: 23, backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Plus size={17} color={c.ink} /><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm }}>Ate something else</Txt>
            </Pressy>
            <Pressy accessibilityRole="button" onPress={all} style={{ flex: 1, height: 46, borderRadius: 23, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, color: x.skip || v.any ? c.ink : c.muted }}>{allL}</Txt>
            </Pressy>
          </Row>
        </FadeIn>
      )}
    </Animated.View>
  );
}

export function MealsCard({ timeline = false }: { timeline?: boolean } = {}) {
  const { c } = useTheme();
  const { d } = useDomain();
  const t = totals(d);
  const openId = d.openMeal ?? nextMeal(d);
  const over = t.k > KCAL_TARGET;
  const w = useSharedValue(0);
  useEffect(() => { w.value = withTiming(Math.min(100, (t.k / KCAL_TARGET) * 100), { duration: 700 }); }, [t.k]);
  const bar = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 8 }}>
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 12 }}>
        <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, letterSpacing: -1.3 }} accessibilityRole="header">Meals</Txt>
        <Chip label={`${t.done} of 4 done`} icon={<UtensilsCrossed size={13} color={c.ink} />} style={{ height: 38, borderRadius: 19, paddingHorizontal: 14 }} />
      </Row>
      {timeline && <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, paddingHorizontal: 4, paddingBottom: 12, color: c.ink }}>{mealTimeline(d)}</Txt>}
      <View accessible accessibilityLabel={`Eaten today ${t.k} of ${KCAL_TARGET} kcal, protein ${t.p} of ${MACRO_TARGET.p} grams`} style={{ gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 20, backgroundColor: c.tAct, marginBottom: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.xs, color: c.cAct }}>Eaten today</Txt>
          <Txt style={{ fontSize: fontSizes.xs, color: over ? c.warn : c.muted }}>{over ? `${t.k - KCAL_TARGET} kcal over` : `${inr(KCAL_TARGET - t.k)} kcal left`}</Txt>
        </Row>
        <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 28 }}>{inr(t.k)}<Txt muted style={{ fontFamily: font.display, fontSize: fontSizes.md }}> / {inr(KCAL_TARGET)} kcal</Txt></Txt>
        <View style={{ height: 5, borderRadius: radii.xs, backgroundColor: `${c.cAct}26`, overflow: 'hidden' }}>
          <Animated.View style={[{ height: '100%', borderRadius: radii.xs, backgroundColor: c.cAct }, bar]} />
        </View>
        <Txt v="caption">Protein {t.p} / {MACRO_TARGET.p} g</Txt>
        {over && <Txt style={{ fontSize: fontSizes.xs, lineHeight: 18, color: c.warn }}>{"Above today's target. A lighter next meal evens it out."}</Txt>}
      </View>
      {MEALS.map((m) => <MealRow key={m.id} id={m.id} open={openId === m.id} />)}
    </Card>
  );
}
