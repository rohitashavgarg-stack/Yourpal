import React from 'react';
import { View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { Beef, Check, ChevronRight, Clock, Flame, Lock, Plus, Salad, UtensilsCrossed, X } from '@/lib/icons';
import { Button, Card, Chip, Pressy, Row, Txt } from '@/components/ui';
import { CheckCircle, FoodMark } from '@/components/bits';
import { FoodType } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { MetaRow } from '@/design-system/primitives/MetaRow';
import { font, fontSizes, radii } from '@/design-system/tokens';

/**
 * The Today meals card. It shows only the meal for right now.
 *   now        the meal on screen (items with one tick each, "Ate something else", Skip).
 *              `ask` adds the "wasn't logged" prompt for the most recent missed meal.
 *   complete   every meal is logged: a plain list, tap a meal to open it
 *   paused     the membership has ended: logging is off, the day's total is still shown
 */
export type MealsCardState = 'now' | 'complete' | 'paused';
export type MealTone = 'skipped' | 'logged' | 'missed' | 'now' | 'later';

export type MealItemRow = { name: string; /** the amount in front of the name, "1 bowl"; empty for a food the member swapped in */ amount: string; type?: FoodType; eaten: boolean };
export type MealExtraRow = { name: string; type?: FoodType; est?: boolean };
export type ShownMeal = {
  name: string;
  /** Under the name, each with an icon and a thin line between: the time (or a status word), "650 kcal planned" or "290 kcal eaten", "22 g protein". */
  meta: { time: string; kcal: string; protein: string };
  /** todo: nothing logged. partial: some foods logged. logged: all of them (the card shows when, and "Edit log"). skipped. */
  status: 'todo' | 'partial' | 'logged' | 'skipped';
  /** logged: the time it was logged, "1:10 pm". */
  loggedAt?: string;
  /** The member skipped it: names are greyed and struck through. */
  skipped: boolean;
  items: MealItemRow[];
  extras: MealExtraRow[];
};
export type MissedAsk = { name: string; /** "3:30 pm" */ planned: string; /** how many more missed meals after this one */ more: number };
export type MealSummaryRow = { id: string; name: string; skipped: boolean; sub: string };

export type MealsCardProps = {
  state: MealsCardState;
  /** Meals logged so far, and how many there are in a day (4). */
  done: number;
  total: number;
  /** paused: the day's total, for example "1,150 of 1,800 kcal, 3 of 4 meals logged". */
  pausedLine?: string;
  /** complete: the line under the title, for example "All 4 meals logged. Protein 88 of 120 g." */
  completeLine?: string;
  rows?: MealSummaryRow[];
  onOpenMeal?: (id: string) => void;
  /** now */
  meal?: ShownMeal;
  ask?: MissedAsk;
  /** "Log meal": opens the bottom sheet for the meal on screen. Logging happens there, not on the card. */
  onLogMeal?: () => void;
  /** The same button on the "Did you have lunch?" prompt, for the missed meal. */
  onAskLog?: () => void;
};

// Behind the meals card: a soft orange wash from the top right corner. It is one big round fade (centred past the corner) that reaches zero opacity
// on its own, so there is no edge or band anywhere: it just melts into the card. It sits under everything (the content is drawn after it).
function MealsBackdrop() {
  const { isDark } = useTheme();
  const W = 460, H = 340;
  const peak = isDark ? 0.34 : 0.26;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: radii.card }}>
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

// The prompt for a meal that passed with nothing logged: one button that opens the same sheet.
function MissedPrompt({ ask, onLog }: { ask: MissedAsk; onLog?: () => void }) {
  const { c } = useTheme();
  const n = ask.name.toLowerCase();
  return (
    <FadeIn style={{ borderRadius: radii.md, backgroundColor: c.warnSoft, padding: 12, gap: 10 }}>
      <Row style={{ gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.md, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}><Clock size={18} color={c.warn} /></View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21 }}>{`Did you have your ${n}?`}</Txt>
          <Txt v="caption">{ask.more ? `It was planned for ${ask.planned}. ${ask.more} earlier ${ask.more === 1 ? 'meal' : 'meals'} still to log.` : `It was planned for ${ask.planned}.`}</Txt>
        </View>
      </Row>
      <Row style={{ justifyContent: 'flex-end' }}><Button size="compact" kind="primary" label={`Log ${n}`} onPress={onLog} accessibilityLabel={`Log ${n}`} /></Row>
    </FadeIn>
  );
}

// The meal on screen: its foods in one line with one food icon ("2 bowl dal, 4 roti, 1 bowl salad"), and one button that opens the sheet where it is logged.
function MealItems({ meal, onLogMeal }: Pick<MealsCardProps, 'onLogMeal'> & { meal: ShownMeal }) {
  const { c } = useTheme();
  const rows = [...meal.items.map((it) => ({ name: it.name, amount: it.amount, type: it.type, eaten: it.eaten })), ...meal.extras.map((e) => ({ name: e.name, amount: e.est ? 'estimated' : '', type: e.type ?? ('veg' as FoodType), eaten: true }))];
  const line = rows.map((r) => (r.amount ? r.amount + ' ' : '') + r.name).join(', ');
  return (
    <Animated.View layout={LinearTransition.duration(180)}>
      <FadeIn style={{ gap: 12, paddingBottom: 0 }}>
        <View accessible accessibilityLabel={`${meal.name}: ${line}`} style={{ paddingHorizontal: 4 }}>
          {rows.map((r, k) => (
            <Row key={k} style={{ gap: 10, minHeight: 40, borderTopWidth: k ? 1 : 0, borderTopColor: c.line }}>
              <FoodMark type={r.type} />
              <Txt numberOfLines={1} style={{ flex: 1, fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 22, color: meal.skipped ? c.muted : c.ink, textDecorationLine: meal.skipped ? 'line-through' : 'none' }}>{r.name}</Txt>
              {meal.status === 'partial' && r.eaten && <Check size={14} strokeWidth={3} color={c.good} />}
              {!!r.amount && <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, color: c.muted }}>{r.amount}</Txt>}
            </Row>
          ))}
        </View>
        <Button kind={meal.status === 'logged' ? 'secondary' : 'primary'} label={meal.status === 'logged' ? 'Edit log' : 'Log meal'} onPress={onLogMeal} />
      </FadeIn>
    </Animated.View>
  );
}

// The small filled pill after the meal name: the time (text only), "Logged 7:10 am" in soft green once it is logged, or "Skipped". No outline, like the time pill on the workout card.
function StatusPill({ status, time, loggedAt }: { status: ShownMeal['status']; time: string; loggedAt?: string }) {
  const { c, isDark } = useTheme();
  const logged = status === 'logged', skipped = status === 'skipped';
  const bg = logged ? c.goodSoft : isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const fg = logged ? c.good : skipped ? c.muted : c.ink;
  const label = logged ? ('Logged ' + (loggedAt ?? '')).trim() : skipped ? 'Skipped' : time;
  return (
    <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {logged ? <Check size={13} strokeWidth={3} color={fg} /> : skipped ? <X size={13} color={fg} /> : null}
      <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, color: fg }}>{label}</Txt>
    </View>
  );
}

export function MealsCard(p: MealsCardProps) {
  const { c, isDark } = useTheme();
  const { state, done, total } = p;

  if (state === 'paused') {
    return (
      <View accessibilityLabel="Meal logging is paused" style={{ borderRadius: radii.card, backgroundColor: c.surface2, padding: 16, gap: 12 }}>
        <Row style={{ gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: c.surface3, alignItems: 'center', justifyContent: 'center' }}><Lock size={18} color={c.muted} /></View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24, letterSpacing: -0.3 }}>Meal logging is paused</Txt>
            <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Renew at Wulf Fitness reception to log again. Your meals and plan stay here.</Txt>
          </View>
        </Row>
        <View style={{ gap: 2, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.line }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 22, color: c.ink }}>Eaten today</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.muted }}>{p.pausedLine}</Txt>
        </View>
      </View>
    );
  }

  if (state === 'complete') {
    return (
      <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 8, gap: 12, overflow: 'hidden' }}>
        <MealsBackdrop />
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, lineHeight: 39, letterSpacing: -1.3 }}>Meals</Txt>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}><Check size={16} color={c.bg} strokeWidth={3} /></View>
        </Row>
        <Txt muted style={{ paddingHorizontal: 4, marginTop: -6, fontSize: fontSizes.md, lineHeight: 20 }}>{p.completeLine}</Txt>
        <DotRule top={-2} />
        <View>
          {(p.rows ?? []).map((q, i) => (
            <Pressy key={q.id} accessibilityRole="button" accessibilityLabel={`${q.name}, ${q.skipped ? 'skipped' : 'logged'}. Open`} scaleTo={0.98} onPress={() => p.onOpenMeal?.(q.id)}
              style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              {q.skipped ? <View style={{ width: 24, height: 24, borderRadius: radii.sm, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.muted }} />
                : <View style={{ width: 24, height: 24, borderRadius: radii.sm, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}><Check size={14} color={c.bg} strokeWidth={3} /></View>}
              <View style={{ flex: 1 }}>
                <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 22 }}>{q.name}</Txt>
                <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{q.sub}</Txt>
              </View>
              <ChevronRight size={16} color={c.muted} />
            </Pressy>
          ))}
        </View>
      </Card>
    );
  }

  const meal = p.meal!;
  return (
    <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16, gap: 14, overflow: 'hidden' }}>
      <MealsBackdrop />
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, lineHeight: 39, letterSpacing: -1.3 }}>Meals</Txt>
        <View style={{ borderRadius: radii.pill, backgroundColor: isDark ? 'rgba(10,12,16,0.22)' : 'rgba(255,255,255,0.45)' }}>
          <Chip label={`${done} of ${total} done`} icon={<UtensilsCrossed size={13} color={c.ink} />} style={{ height: 38, borderRadius: 19, paddingHorizontal: 14 }} />
        </View>
      </Row>
      <DotRule top={-4} />
      {p.ask && <MissedPrompt ask={p.ask} onLog={p.onAskLog} />}
      <View style={{ paddingHorizontal: 4, gap: 8 }}>
        <Row style={{ gap: 10 }}>
          <Txt style={{ flexShrink: 1, fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 27, letterSpacing: -0.4 }}>{meal.name}</Txt>
          <StatusPill status={meal.status} time={meal.meta.time} loggedAt={meal.loggedAt} />
        </Row>
        <MetaRow color={c.muted} dividerColor={c.line} items={[
          { icon: <Flame size={14} color={c.muted} />, text: meal.meta.kcal },
          { icon: <Beef size={14} color={c.muted} />, text: meal.meta.protein },
        ]} />
      </View>
      <MealItems meal={meal} onLogMeal={p.onLogMeal} />
    </Card>
  );
}
