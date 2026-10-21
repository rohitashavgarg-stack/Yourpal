import React from 'react';
import { View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { Check, ChevronRight, Clock, Lock, Plus, UtensilsCrossed } from '@/lib/icons';
import { Card, Chip, Pressy, Row, Txt } from '@/components/ui';
import { CheckCircle, FoodMark } from '@/components/bits';
import { FoodType } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { font, fontSizes, radii } from '@/design-system/tokens';

/**
 * The Today meals card. It shows only the meal for right now, with a small strip of the whole day under it.
 *   now        the meal on screen (items with one tick each, "Ate something else", Skip) and the day strip.
 *              `ask` adds the "wasn't logged" prompt for the most recent missed meal.
 *   complete   every meal is logged: a plain list, tap a meal to open it
 *   paused     the membership has ended: logging is off, the day's total is still shown
 */
export type MealsCardState = 'now' | 'complete' | 'paused';
export type MealTone = 'skipped' | 'logged' | 'missed' | 'now' | 'later';

export type MealItemRow = { name: string; sub: string; kcal: string; type?: FoodType; eaten: boolean; /** swapped for something the member picked: shows "Yours" */ yours: boolean };
export type MealExtraRow = { name: string; kcal: number; type?: FoodType; est?: boolean };
export type ShownMeal = {
  name: string;
  /** "650 kcal planned" or "290 kcal eaten". */
  caption: string;
  /** The pill at the top right: a time, or a status word for another meal. */
  pill: string;
  /** Shows a small clock in the pill (the meal that is due or missed). */
  clock: boolean;
  /** The member skipped it: names are greyed and struck through. */
  skipped: boolean;
  items: MealItemRow[];
  extras: MealExtraRow[];
  /** The label of the quiet button: "Skip meal", "Mark rest eaten", "Unmark all", "Undo skip". */
  allLabel: string;
  /** The quiet button is drawn in ink instead of muted. */
  allActive: boolean;
};
export type MissedAsk = { name: string; /** "3:30 pm" */ planned: string; /** how many more missed meals after this one */ more: number };
export type MealChipItem = { id: string; /** "Dinner" */ name: string; /** "Snack" for the evening snack */ label: string; /** "Logged", "Now", "3:30 pm" */ text: string; tone: MealTone; selected: boolean };
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
  strip?: MealChipItem[];
  onPick?: (id: string) => void;
  onToggleItem?: (k: number) => void;
  onOpenFood?: (k: number, extra: boolean) => void;
  onRemoveExtra?: (j: number) => void;
  onAteElse?: () => void;
  onAll?: () => void;
  onAskAteIt?: () => void;
  onAskSomethingElse?: () => void;
  onAskSkipped?: () => void;
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

// The prompt for a meal that passed with nothing logged: three one-tap answers.
function MissedPrompt({ ask, onAteIt, onSomethingElse, onSkipped }: { ask: MissedAsk; onAteIt?: () => void; onSomethingElse?: () => void; onSkipped?: () => void }) {
  const { c } = useTheme();
  const n = ask.name.toLowerCase();
  return (
    <FadeIn style={{ borderRadius: radii.md, backgroundColor: c.warnSoft, padding: 12, gap: 10 }}>
      <Row style={{ gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.md, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}><Clock size={18} color={c.warn} /></View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21 }}>{`${ask.name} wasn't logged`}</Txt>
          <Txt v="caption">{ask.more ? `Planned for ${ask.planned}. ${ask.more} more to catch up.` : `Planned for ${ask.planned}`}</Txt>
        </View>
      </Row>
      <Row style={{ gap: 8 }}>
        <Pressy accessibilityRole="button" accessibilityLabel={`I ate ${n} as planned`} onPress={onAteIt}
          style={{ height: 36, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: c.ink, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.bg }}>I ate it</Txt>
        </Pressy>
        <Pressy accessibilityRole="button" accessibilityLabel={`I ate something else for ${n}`} onPress={onSomethingElse}
          style={{ height: 36, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: c.surface, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18 }}>Something else</Txt>
        </Pressy>
        <Pressy accessibilityRole="button" accessibilityLabel={`I skipped ${n}`} onPress={onSkipped}
          style={{ height: 36, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: c.surface, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18 }}>Skipped</Txt>
        </Pressy>
      </Row>
    </FadeIn>
  );
}

// The items of the meal on screen: one row per food with its own tick, then "Ate something else" and the quiet Skip button.
function MealItems({ meal, onToggleItem, onOpenFood, onRemoveExtra, onAteElse, onAll }: Pick<MealsCardProps, 'onToggleItem' | 'onOpenFood' | 'onRemoveExtra' | 'onAteElse' | 'onAll'> & { meal: ShownMeal }) {
  const { c, isDark } = useTheme();
  return (
    <Animated.View layout={LinearTransition.duration(180)}>
      <FadeIn style={{ gap: 4, paddingBottom: 0 }}>
        {meal.items.map((it, k) => (
          <Row key={k} style={{ gap: 10, minHeight: 52, paddingLeft: 12, paddingRight: 4, paddingVertical: 4, borderRadius: radii.md, backgroundColor: it.eaten ? (isDark ? '#1E4A3F' : c.goodSoft) : c.surface2, borderWidth: it.eaten ? 1 : 0, borderColor: c.good + '66' }}>
            <FoodMark type={it.type} />
            <Pressy accessibilityRole="button" accessibilityLabel={`${it.name}: nutrition, recipe and swap`} onPress={() => onOpenFood?.(k, false)} scaleTo={0.98} style={{ flex: 1, minWidth: 0, paddingVertical: 4 }}>
              <Txt style={{ fontFamily: font.medium, color: meal.skipped ? c.muted : c.ink, textDecorationLine: meal.skipped ? 'line-through' : 'none' }}>{it.name}</Txt>
              <Txt v="caption">{it.sub}</Txt>
            </Pressy>
            <Txt v="caption" style={{ alignSelf: 'center' }}>{it.kcal}</Txt>
            {it.yours && <Chip label="Yours" style={{ height: 22, borderColor: c.accentSoft, alignSelf: 'center' }} />}
            <CheckCircle on={it.eaten} size={28} tone="good" label={`${it.eaten ? 'Unmark' : 'Mark'} ${it.name} as eaten`} onPress={() => onToggleItem?.(k)} />
          </Row>
        ))}
        {meal.extras.map((e, j) => (
          <Row key={`x${j}`} style={{ gap: 10, minHeight: 52, paddingLeft: 12, paddingRight: 4, paddingVertical: 4, borderRadius: radii.md, backgroundColor: c.accentSoft }}>
            <FoodMark type={e.type ?? 'veg'} />
            <Pressy accessibilityRole="button" accessibilityLabel={`${e.name}: details`} onPress={() => onOpenFood?.(j, true)} scaleTo={0.98} style={{ flex: 1, minWidth: 0, paddingVertical: 4 }}>
              <Txt style={{ fontFamily: font.medium }}>{e.name}</Txt>
              {e.est ? <Txt v="caption">Estimated</Txt> : null}
            </Pressy>
            <Txt v="caption" style={{ alignSelf: 'center' }}>{`${e.kcal} kcal`}</Txt>
            <Chip label="Yours" style={{ height: 22, borderColor: c.accentSoft, alignSelf: 'center' }} />
            <CheckCircle on size={28} tone="good" label={`Remove ${e.name}`} onPress={() => onRemoveExtra?.(j)} />
          </Row>
        ))}
        <Row style={{ gap: 8, marginTop: 4 }}>
          <Pressy accessibilityRole="button" onPress={onAteElse}
            style={{ flex: 1.7, height: 46, borderRadius: 23, backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={17} color={c.ink} /><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm }}>Ate something else</Txt>
          </Pressy>
          <Pressy accessibilityRole="button" onPress={onAll} style={{ flex: 1, height: 46, borderRadius: 23, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, color: meal.allActive ? c.ink : c.muted }}>{meal.allLabel}</Txt>
          </Pressy>
        </Row>
      </FadeIn>
    </Animated.View>
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
  const tones: Record<MealTone, { col: string; bg: string }> = {
    skipped: { col: c.muted, bg: c.surface2 }, logged: { col: c.good, bg: c.surface2 }, missed: { col: c.warn, bg: c.warnSoft },
    now: { col: c.accentText, bg: c.accentSoft }, later: { col: c.muted, bg: c.surface2 },
  };
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
      {p.ask && <MissedPrompt ask={p.ask} onAteIt={p.onAskAteIt} onSomethingElse={p.onAskSomethingElse} onSkipped={p.onAskSkipped} />}
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <View>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 27, letterSpacing: -0.4 }}>{meal.name}</Txt>
          <Txt v="caption">{meal.caption}</Txt>
        </View>
        <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.18)' : c.chipLine, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
          {meal.clock && <Clock size={12} color={c.ink} />}
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, paddingTop: 1 }}>{meal.pill}</Txt>
        </View>
      </Row>
      <MealItems meal={meal} onToggleItem={p.onToggleItem} onOpenFood={p.onOpenFood} onRemoveExtra={p.onRemoveExtra} onAteElse={p.onAteElse} onAll={p.onAll} />
      <Row style={{ gap: 6 }}>
        {(p.strip ?? []).map((q) => {
          const t = tones[q.tone];
          return (
            <Pressy key={q.id} accessibilityRole="button" accessibilityState={{ selected: q.selected }} accessibilityLabel={`${q.name}, ${q.text}`} scaleTo={0.96}
              onPress={() => p.onPick?.(q.id)}
              style={{ flex: 1, minHeight: 48, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 7, backgroundColor: t.bg, borderWidth: q.selected ? 1.5 : 0, borderColor: c.accent, justifyContent: 'center' }}>
              <Txt numberOfLines={1} style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 17 }}>{q.label}</Txt>
              <Txt numberOfLines={1} style={{ fontSize: fontSizes.xs2, lineHeight: 15, color: t.col }}>{q.text}</Txt>
            </Pressy>
          );
        })}
      </Row>
    </Card>
  );
}
