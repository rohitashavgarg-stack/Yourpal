import React from 'react';
import { View } from 'react-native';
import { Flame, UtensilsCrossed } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { GoalCard, RadialGlow } from '@/design-system/patterns/GoalCard';
import { GoalCardState } from '@/features/today/goalCardState';
import { font } from '@/theme/tokens';
import { radii, fontSizes, onDark, fixed } from '@/design-system/tokens';

const inr = (n: number) => Math.round(n).toLocaleString('en-IN');
const BURN = onDark.burn;
const WHITE = onDark.text, SOFT = onDark.soft, MUTED = onDark.muted, MINT = onDark.mint;

/**
 * "Daily budget": today's calories, eaten and burned, side by side on a dark card that fades from charcoal to blue, with the
 * Programme goal as a strip along the bottom (GoalCard variant "strip", driven by the same goal state).
 *
 * It only draws what it is given. The numbers come from the container (TodayBudgetCard in features/today/TodayBudget.tsx).
 * States, all by prop:
 *   eaten / eatTarget       kcal eaten so far and the day's target. The bar is clamped at 100 percent; the number is not
 *   burned / burnTarget     kcal burned and the workout's planned burn
 *   burnSource              'plan'   nothing measured yet: the target is shown as "planned"
 *                           'done'   the workout was logged: its burn is shown, target marked "done"
 *                           'watch'  a watch is connected: the live burn is shown, target marked "watch"
 *   goalState               pin the goal strip to a GoalCardState; leave it out to follow the member's data
 */
export type BudgetBurnSource = 'plan' | 'done' | 'watch';
export type BudgetCardProps = {
  eaten: number; eatTarget: number;
  burned: number; burnTarget: number; burnSource?: BudgetBurnSource;
  goalState?: GoalCardState;
};

// One half of the card: the icon and label with the unit on the right, the number big and light, and a thin bar.
function Half({ icon, label, unit, value, of, pct, color }: { icon: React.ReactNode; label: string; unit: string; value: string; of: string; pct: number; color: string }) {
  return (
    <View accessible accessibilityLabel={`${label}, ${value} of ${of} ${unit}`} style={{ flex: 1, gap: 6 }}>
      <Row style={{ gap: 7 }}>
        {icon}
        <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.md, lineHeight: 20, color: SOFT }}>{label}</Txt>
              </Row>
      <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, lineHeight: 38, letterSpacing: -0.8, color: WHITE }}>{value}<Txt style={{ fontFamily: font.regular, fontSize: fontSizes.base, lineHeight: 20, color: MUTED, letterSpacing: 0 }}>{` / ${of}`}</Txt></Txt>
      <View style={{ height: 5, borderRadius: radii.xs, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
        <View style={{ width: `${Math.max(0, Math.min(100, pct * 100))}%`, height: '100%', borderRadius: radii.xs, backgroundColor: color }} />
      </View>
    </View>
  );
}

const SOURCE_WORD: Record<BudgetBurnSource, string> = { plan: 'planned', done: 'done', watch: 'watch' };

export function BudgetCard({ eaten, eatTarget, burned, burnTarget, burnSource = 'plan', goalState }: BudgetCardProps) {
  return (
    <View style={{ borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
      {/* charcoal with a soft blue glow from the top right corner */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: onDark.card }} />
      <RadialGlow color={fixed.blue} a={0.32} side="right" top />
      <GoalCard variant="strip" state={goalState} />
      <View style={{ height: 1, marginHorizontal: 18, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      <Row style={{ gap: 16, alignItems: 'flex-start', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18 }}>
        <Half icon={<UtensilsCrossed size={17} color={MINT} />} label="Eat today" unit="kcal" value={inr(eaten)} of={inr(eatTarget)} pct={eaten / eatTarget} color={MINT} />
        <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <Half icon={<Flame size={17} color={BURN} />} label="Burn today" unit="kcal" value={inr(burned)} of={burnSource === 'watch' ? inr(burnTarget) : `${inr(burnTarget)} ${SOURCE_WORD[burnSource]}`} pct={burned / burnTarget} color={BURN} />
      </Row>
    </View>
  );
}
