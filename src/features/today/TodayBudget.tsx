import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Flame, Target, UtensilsCrossed } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain, totals, burned, wkDoneInfo, workoutState } from '@/lib/domain';
import { KCAL_TARGET } from '@/lib/data';
import { useGoalV2 } from '@/features/goalv2/model';
import { createStore } from '@/lib/createStore';
import { Glow } from './GoalTickCard';
import { GC } from './goalCardState';
import { font } from '@/theme/tokens';

// Which card sits at the top of Today: the whole goal (the live goal card) or today's calories. Demo panel only for now.
export const topCardStore = createStore(() => ({ mode: 'Goal card' as 'Goal card' | 'Today card' }));

const PLANNED_BURN = 350;
const inr = (n: number) => Math.round(n).toLocaleString('en-IN');
const BURN = '#FF9A4D';

// One half of the card: a label, the number big, and a thin bar.
function Half({ icon, label, hint, value, of, pct, color }: { icon: React.ReactNode; label: string; hint: string; value: string; of: string; pct: number; color: string }) {
  return (
    <View accessible accessibilityLabel={`${label}, ${value} of ${of}, ${hint}`} style={{ flex: 1, gap: 4 }}>
      <Row style={{ gap: 6 }}>
        {icon}
        <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: GC.rest }}>{label}</Txt>
        <Txt numberOfLines={1} style={{ flex: 1, textAlign: 'right', fontSize: 12, lineHeight: 17, color: GC.rest, opacity: 0.8 }}>{hint}</Txt>
      </Row>
      <Txt style={{ fontFamily: font.display, fontSize: 30, lineHeight: 38, letterSpacing: -0.6, color: GC.title }}>{value}<Txt style={{ fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: GC.rest, letterSpacing: 0 }}>{` / ${of}`}</Txt></Txt>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: GC.unfilled, overflow: 'hidden', marginTop: 2 }}>
        <View style={{ width: `${Math.max(0, Math.min(100, pct * 100))}%`, height: '100%', borderRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

// Today's calories: eat and burn side by side in the goal card's dark style, the whole goal as one small line on top.
export function TodayBudgetCard() {
  const { d } = useDomain();
  const g = useGoalV2();
  const eaten = totals(d).k;
  const live = d.hc && d.wearable; // a real burned number needs a watch; without one the card shows the plan, not a measurement
  const done = workoutState(d) === 'done';
  const burn = live ? burned(d) : done ? wkDoneInfo(d).k : 0;
  const left = Math.max(0, KCAL_TARGET - eaten);
  return (
    <View style={{ backgroundColor: GC.bg, borderColor: GC.border, borderWidth: 1, borderRadius: 24, overflow: 'hidden', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 8 }}>
      <Glow color="#2F6BEA" a={0.55} />
      <Pressy accessibilityRole="link" accessibilityLabel={`Your goal: ${g.name}. Open`} onPress={() => router.push('/goal-detail')} scaleTo={0.98} style={{ minHeight: 44, justifyContent: 'center', marginTop: -6, marginBottom: -4 }}>
        <Row style={{ gap: 8 }}>
          <Target size={15} color={GC.rest} />
          <Txt numberOfLines={1} style={{ flex: 1, fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: GC.title }}>{g.name}</Txt>
          <Txt style={{ fontSize: 13, lineHeight: 19, color: GC.rest }}>{`${Math.round(Math.max(0, Math.min(1, g.pct)) * 100)}%`}</Txt>
          <ChevronRight size={15} color={GC.rest} />
        </Row>
      </Pressy>
      <Row style={{ gap: 16, alignItems: 'flex-start' }}>
        <Half icon={<UtensilsCrossed size={14} color={GC.mint} />} label="Eat" hint={left > 0 ? `${inr(left)} left` : 'Reached'} value={inr(eaten)} of={`${inr(KCAL_TARGET)} kcal`} pct={eaten / KCAL_TARGET} color={GC.mint} />
        <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <Half icon={<Flame size={14} color={BURN} />} label="Burn" hint={live ? 'watch' : done ? 'done' : 'planned'} value={inr(burn)} of={`${inr(PLANNED_BURN)} kcal`} pct={burn / PLANNED_BURN} color={BURN} />
      </Row>
    </View>
  );
}
