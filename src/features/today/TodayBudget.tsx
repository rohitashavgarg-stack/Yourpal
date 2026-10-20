import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Flame, Target, UtensilsCrossed } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain, totals, burned, wkDoneInfo, workoutState } from '@/lib/domain';
import { KCAL_TARGET } from '@/lib/data';
import { useGoalV2 } from '@/features/goalv2/model';
import { createStore } from '@/lib/createStore';
import { LinearGradient } from 'expo-linear-gradient';
import { font } from '@/theme/tokens';

// Which card sits at the top of Today: the whole goal (the live goal card) or today's calories. Demo panel only for now.
export const topCardStore = createStore(() => ({ mode: 'Today card' as 'Goal card' | 'Today card' }));

const PLANNED_BURN = 350;
const inr = (n: number) => Math.round(n).toLocaleString('en-IN');
const BURN = '#FF9A4D';

const WHITE = '#F3F4F6', SOFT = '#C9CDD6', MUTED = '#9AA0AD', MINT = '#2EE6A8';

// One half of the card: the icon and label with the unit on the right, the number big and light, and a thin bar.
function Half({ icon, label, unit, value, of, pct, color }: { icon: React.ReactNode; label: string; unit: string; value: string; of: string; pct: number; color: string }) {
  return (
    <View accessible accessibilityLabel={`${label}, ${value} of ${of} ${unit}`} style={{ flex: 1, gap: 6 }}>
      <Row style={{ gap: 7 }}>
        {icon}
        <Txt style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: SOFT }}>{label}</Txt>
        <Txt numberOfLines={1} style={{ flex: 1, textAlign: 'right', fontSize: 13, lineHeight: 18, color: MUTED }}>{unit}</Txt>
      </Row>
      <Txt style={{ fontFamily: font.regular, fontSize: 36, lineHeight: 44, letterSpacing: -1, color: WHITE }}>{value}<Txt style={{ fontFamily: font.regular, fontSize: 15, lineHeight: 20, color: MUTED, letterSpacing: 0 }}>{` / ${of}`}</Txt></Txt>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
        <View style={{ width: `${Math.max(0, Math.min(100, pct * 100))}%`, height: '100%', borderRadius: 3, backgroundColor: color }} />
      </View>
    </View>
  );
}

// Today's calories: eat and burn side by side on a dark card that fades from charcoal to blue, and the whole goal in a lighter strip along the bottom.
export function TodayBudgetCard() {
  const { d } = useDomain();
  const g = useGoalV2();
  const eaten = totals(d).k;
  const live = d.hc && d.wearable; // a real burned number needs a watch; without one the card shows the plan, not a measurement
  const done = workoutState(d) === 'done';
  const burn = live ? burned(d) : done ? wkDoneInfo(d).k : 0;
  const pct = Math.round(Math.max(0, Math.min(1, g.pct)) * 100);
  return (
    <View style={{ borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
      <LinearGradient colors={['#1B1D22', '#1F2A4C', '#2B3C6A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Row style={{ gap: 16, alignItems: 'flex-start', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16 }}>
        <Half icon={<UtensilsCrossed size={17} color={MINT} />} label="Eat today" unit="kcal" value={inr(eaten)} of={inr(KCAL_TARGET)} pct={eaten / KCAL_TARGET} color={MINT} />
        <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <Half icon={<Flame size={17} color={BURN} />} label="Burn today" unit="kcal" value={inr(burn)} of={`${inr(PLANNED_BURN)} ${live ? 'watch' : done ? 'done' : 'planned'}`} pct={burn / PLANNED_BURN} color={BURN} />
      </Row>
      {/* the whole goal: a lighter strip that runs edge to edge along the bottom */}
      <Pressy accessibilityRole="link" accessibilityLabel={`Your goal: ${g.name}, ${pct} percent. Open`} onPress={() => router.push('/goal-detail')} scaleTo={0.98}
        style={{ minHeight: 64, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 18, justifyContent: 'center' }}>
        <Row style={{ gap: 12 }}>
          <Target size={30} color={WHITE} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontSize: 14, lineHeight: 19, color: SOFT }}>Goal</Txt>
            <Txt numberOfLines={1} style={{ fontFamily: font.regular, fontSize: 18, lineHeight: 25, color: WHITE }}>{g.name}</Txt>
          </View>
          <Txt style={{ fontSize: 15, lineHeight: 21, color: SOFT }}>{`${pct}% completed`}</Txt>
          <ChevronRight size={18} color={WHITE} />
        </Row>
      </Pressy>
    </View>
  );
}
