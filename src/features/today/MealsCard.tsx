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
import { mealById, mealKcal, mealTimeline, mealView, nextMeal } from './meals';
import { QuickLogSheet } from './QuickLogSheet';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { useLogGate } from '@/lib/logGate';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
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

function Chevron({ open }: { open: boolean }) {
  const { c } = useTheme();
  const r = useSharedValue(open ? 180 : 0);
  useEffect(() => { r.value = withSpring(open ? 180 : 0, spring.snappy); }, [open]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={a}><ChevronDown size={18} color={c.muted} /></Animated.View>;
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
        <Chevron open={open} />
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

// ---------- Today: only the meal for right now ----------
// Each meal "owns" the time from 90 min before it until 90 min before the next one. Today shows that one meal only, with a small strip
// of the whole day under it. A meal whose time has passed with nothing logged is "missed": the card asks about it first, with one-tap answers.
const LEAD = 90;
export function currentMealId(min: number): MealId {
  let cur = MEALS[0].id;
  MEALS.forEach((m) => { if (min >= m.t - LEAD) cur = m.id; });
  return cur;
}
const untouched = (d: ReturnType<typeof useDomain>['d'], id: MealId) => { const x = mealLog(d, id); return !x.skip && x.eaten.length === 0 && x.extra.length === 0; };
export function missedMeals(d: ReturnType<typeof useDomain>['d']): MealId[] {
  const cur = currentMealId(d.min);
  const ci = MEALS.findIndex((m) => m.id === cur);
  return MEALS.slice(0, ci).filter((m) => untouched(d, m.id)).map((m) => m.id);
}

function MissedRow({ id, more }: { id: MealId; more: number }) {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { patch } = useMeals();
  const { openSheet, toast } = useOverlay();
  const m = mealById(id);
  const { gate } = useLogGate();
  const answer = gate((msg: string, p: Parameters<typeof patch>[1]) => { const prev = d.meals; patch(id, p); set({ openMeal: null }); toast(msg, { undo: () => set({ meals: prev }) }); });
  return (
    <FadeIn style={{ borderRadius: radii.md, backgroundColor: c.warnSoft, padding: 12, gap: 10 }}>
      <Row style={{ gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.md, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}><Clock size={18} color={c.warn} /></View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21 }}>{`${m.n} wasn't logged`}</Txt>
          <Txt v="caption">{more ? `Planned for ${fmtT(m.t).full}. ${more} more to catch up.` : `Planned for ${fmtT(m.t).full}`}</Txt>
        </View>
      </Row>
      <Row style={{ gap: 8 }}>
        <Pressy accessibilityRole="button" accessibilityLabel={`I ate ${m.n.toLowerCase()} as planned`} onPress={() => answer(`${m.n} logged as planned`, { eaten: m.items.map((_, k) => k), skip: false, at: m.t })}
          style={{ height: 36, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: c.ink, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.bg }}>I ate it</Txt>
        </Pressy>
        <Pressy accessibilityRole="button" accessibilityLabel={`I ate something else for ${m.n.toLowerCase()}`} onPress={gate(() => openSheet(<QuickLogSheet mealId={id} mode="scan" />, { label: 'Log a meal' }))}
          style={{ height: 36, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: c.surface, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18 }}>Something else</Txt>
        </Pressy>
        <Pressy accessibilityRole="button" accessibilityLabel={`I skipped ${m.n.toLowerCase()}`} onPress={() => answer(`${m.n} skipped`, { skip: true, eaten: [] })}
          style={{ height: 36, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: c.surface, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18 }}>Skipped</Txt>
        </Pressy>
      </Row>
    </FadeIn>
  );
}

// Behind the meals card: a soft orange wash from the top right corner. It is one big round fade (centred past the corner) that reaches zero opacity
// on its own, so there is no edge or band anywhere: it just melts into the card. It sits under everything (the content is drawn after it).
function MealsBackdrop() {
  const { isDark } = useTheme();
  const W = 460, H = 340;
  const peak = isDark ? 0.34 : 0.26;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: 24 }}>
      <View style={{ position: 'absolute', top: -H * 0.45, right: -W * 0.35, width: W, height: H }}>
        <Svg width={W} height={H}>
          <Defs>
            <RadialGradient id="mealsWash" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FF9A4D" stopOpacity={peak} />
              <Stop offset="0.45" stopColor="#FF9A4D" stopOpacity={peak * 0.4} />
              <Stop offset="1" stopColor="#FF9A4D" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={W / 2} cy={H / 2} rx={W / 2} ry={H / 2} fill="url(#mealsWash)" />
        </Svg>
      </View>
    </View>
  );
}

// A dotted rule under the heading: 1 px thick, 40% white, 3 px dots with 3 px gaps. Drawn as small blocks in a clipped row so it looks the same on web and native.
const DOTS = Array.from({ length: 100 }, (_, i) => i);
function DotRule({ top }: { top: number }) {
  const { isDark } = useTheme();
  const col = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  return (
    <View accessibilityElementsHidden style={{ height: 1, flexDirection: 'row', overflow: 'hidden', marginHorizontal: 4, marginTop: top }}>
      {DOTS.map((i) => <View key={i} style={{ width: 3, height: 1, marginRight: 3, backgroundColor: col }} />)}
    </View>
  );
}

export function MealNowCard() {
  const { c, isDark } = useTheme();
  const { d, set } = useDomain();
  const t = totals(d);
  const now = currentMealId(d.min);
  // tapping another meal in the strip shows it here; tapping the current one (or a fresh day) goes back to "now"
  const shown = d.openMeal && d.openMeal !== 'none' && MEALS.some((q) => q.id === d.openMeal) ? (d.openMeal as MealId) : now;
  const m = mealById(shown);
  const v = mealView(d, m);
  const missed = missedMeals(d);
  const { paused } = useLogGate();
  // the most recent missed meal first; nothing to answer while logging is paused, and no "wasn't logged" banner for the meal that is already on screen
  const lastMissed = missed.length ? missed[missed.length - 1] : null;
  const ask = !paused && lastMissed && lastMissed !== shown ? lastMissed : null;
  const status = (id: MealId) => {
    const x = mealLog(d, id); const mv = mealView(d, mealById(id));
    if (x.skip) return { t: 'Skipped', col: c.muted, bg: c.surface2 };
    if (mv.any) return { t: 'Logged', col: c.good, bg: c.surface2 };
    if (missed.includes(id)) return { t: 'Not logged', col: c.warn, bg: c.warnSoft };
    if (id === now) return { t: 'Now', col: c.accentText, bg: c.accentSoft };
    return { t: fmtT(mealById(id).t).full, col: c.muted, bg: c.surface2 };
  };
  if (paused) {
    return (
      <View accessibilityLabel="Meal logging is paused" style={{ borderRadius: 24, backgroundColor: c.surface2, padding: 16, gap: 12 }}>
        <Row style={{ gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: c.surface3, alignItems: 'center', justifyContent: 'center' }}><Lock size={18} color={c.muted} /></View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24, letterSpacing: -0.3 }}>Meal logging is paused</Txt>
            <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Renew at Wulf Fitness reception to log again. Your meals and plan stay here.</Txt>
          </View>
        </Row>
        <View style={{ gap: 2, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.line }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 22, color: c.ink }}>Eaten today</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.muted }}>{`${inr(t.k)} of ${inr(KCAL_TARGET)} kcal, ${t.done} of 4 meals logged`}</Txt>
        </View>
      </View>
    );
  }
  const picked = !!d.openMeal && d.openMeal !== 'none' && MEALS.some((q) => q.id === d.openMeal);
  if (t.done === MEALS.length && !picked) {
    return (
      <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 8, gap: 12, overflow: 'hidden' }}>
        <MealsBackdrop />
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, lineHeight: 39, letterSpacing: -1.3 }}>Meals</Txt>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}><Check size={16} color={c.bg} strokeWidth={3} /></View>
        </Row>
        <Txt muted style={{ paddingHorizontal: 4, marginTop: -6, fontSize: fontSizes.md, lineHeight: 20 }}>{`All ${MEALS.length} meals logged. Protein ${t.p} of ${MACRO_TARGET.p} g.`}</Txt>
        <DotRule top={-2} />
        <View>
          {MEALS.map((q, i) => {
            const x = mealLog(d, q.id);
            const mv = mealView(d, q);
            return (
              <Pressy key={q.id} accessibilityRole="button" accessibilityLabel={`${q.n}, ${x.skip ? 'skipped' : 'logged'}. Open`} scaleTo={0.98} onPress={() => set({ openMeal: q.id })}
                style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
                {x.skip ? <View style={{ width: 24, height: 24, borderRadius: radii.sm, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.muted }} />
                  : <View style={{ width: 24, height: 24, borderRadius: radii.sm, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}><Check size={14} color={c.bg} strokeWidth={3} /></View>}
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 22 }}>{q.n}</Txt>
                  <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{x.skip ? 'Skipped' : `${mv.kcal} kcal${x.at != null ? ', ' + fmtT(x.at).full : ''}`}</Txt>
                </View>
                <ChevronRight size={16} color={c.muted} />
              </Pressy>
            );
          })}
        </View>
      </Card>
    );
  }
  return (
    <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16, gap: 14, overflow: 'hidden' }}>
      <MealsBackdrop />
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, lineHeight: 39, letterSpacing: -1.3 }}>Meals</Txt>
        <View style={{ borderRadius: radii.pill, backgroundColor: isDark ? 'rgba(10,12,16,0.22)' : 'rgba(255,255,255,0.45)' }}>
          <Chip label={`${t.done} of 4 done`} icon={<UtensilsCrossed size={13} color={c.ink} />} style={{ height: 38, borderRadius: 19, paddingHorizontal: 14 }} />
        </View>
      </Row>
      <DotRule top={-4} />
      {ask && <MissedRow id={ask} more={missed.length - 1} />}
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <View>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 27, letterSpacing: -0.4 }}>{m.n}</Txt>
          <Txt v="caption">{v.any ? `${v.kcal} kcal eaten` : `${mealKcal(m)} kcal planned`}</Txt>
        </View>
        <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.18)' : c.chipLine, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
          {(shown === now || missed.includes(shown)) && <Clock size={12} color={c.ink} />}
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, paddingTop: 1 }}>{shown === now || missed.includes(shown) ? fmtT(m.t).full : status(shown).t}</Txt>
        </View>
      </Row>
      <MealRow id={shown} open bare />
      <Row style={{ gap: 6 }}>
        {MEALS.map((q) => {
          const st = status(q.id);
          const on = q.id === shown;
          return (
            <Pressy key={q.id} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${q.n}, ${st.t}`} scaleTo={0.96}
              onPress={() => set({ openMeal: q.id === now ? null : q.id })}
              style={{ flex: 1, minHeight: 48, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 7, backgroundColor: st.bg, borderWidth: on ? 1.5 : 0, borderColor: c.accent, justifyContent: 'center' }}>
              <Txt numberOfLines={1} style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 17 }}>{q.n === 'Evening snack' ? 'Snack' : q.n}</Txt>
              <Txt numberOfLines={1} style={{ fontSize: fontSizes.xs2, lineHeight: 15, color: st.col }}>{st.t}</Txt>
            </Pressy>
          );
        })}
      </Row>
    </Card>
  );
}
