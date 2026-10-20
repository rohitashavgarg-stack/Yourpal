import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Flame, Target, UtensilsCrossed } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain, totals, burned, wkDoneInfo, workoutState } from '@/lib/domain';
import { KCAL_TARGET } from '@/lib/data';
import { useGoalV2 } from '@/features/goalv2/model';
import { createStore } from '@/lib/createStore';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// Which card sits at the top of Today: the whole goal (the live goal card) or today's calories. Demo panel only for now.
export const topCardStore = createStore(() => ({ mode: 'Goal card' as 'Goal card' | 'Today card' }));

const PLANNED_BURN = 350;
const inr = (n: number) => Math.round(n).toLocaleString('en-IN');

function Measure({ icon, label, value, of, note, pct, color }: { icon: React.ReactNode; label: string; value: string; of?: string; note?: string; pct: number; color: string }) {
  const { c } = useTheme();
  return (
    <View accessible accessibilityLabel={`${label}, ${value}${of ? ' of ' + of : ''}${note ? ', ' + note : ''}`} style={{ gap: 8 }}>
      <Row style={{ gap: 8 }}>
        {icon}
        <Txt style={{ flex: 1, fontFamily: font.medium, fontSize: 14, lineHeight: 20 }}>{label}</Txt>
        <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24 }}>{value}{!!of && <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{` of ${of}`}</Txt>}</Txt>
      </Row>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surface3, overflow: 'hidden' }}>
        <View style={{ width: `${Math.max(0, Math.min(100, pct * 100))}%`, height: '100%', borderRadius: 3, backgroundColor: color }} />
      </View>
      {!!note && <Txt muted style={{ fontSize: 12, lineHeight: 17 }}>{note}</Txt>}
    </View>
  );
}

// Today's calories: what to eat and what to burn, with the whole goal reduced to one tappable line underneath.
export function TodayBudgetCard() {
  const { c } = useTheme();
  const { d } = useDomain();
  const g = useGoalV2();
  const eaten = totals(d).k;
  const live = d.hc && d.wearable; // a real burned number needs a watch; without one the card shows the plan, not a measurement
  const done = workoutState(d) === 'done';
  const burn = live ? burned(d) : done ? wkDoneInfo(d).k : 0;
  const left = Math.max(0, KCAL_TARGET - eaten);
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 26, padding: 18, gap: 16 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: 28, lineHeight: 37, letterSpacing: -1 }}>Today</Txt>
        <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>{left > 0 ? `${inr(left)} kcal left to eat` : 'Calories reached'}</Txt>
      </Row>
      <Measure icon={<UtensilsCrossed size={17} color={c.cNutri} />} label="Eat" value={inr(eaten)} of={`${inr(KCAL_TARGET)} kcal`} pct={eaten / KCAL_TARGET} color={c.cNutri} />
      <Measure icon={<Flame size={17} color={c.cAct} />} label="Burn" value={inr(burn)} of={`${inr(PLANNED_BURN)} kcal`} pct={burn / PLANNED_BURN}
        note={live ? 'From your watch' : done ? 'Workout done' : 'Planned with today\'s workout'} color={c.cAct} />
      <Pressy accessibilityRole="link" accessibilityLabel={`Your goal: ${g.name}. Open`} onPress={() => router.push('/goal-detail')} scaleTo={0.98}
        style={{ minHeight: 44, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 12, justifyContent: 'center' }}>
        <Row style={{ gap: 10 }}>
          <Target size={17} color={c.muted} />
          <Txt style={{ flex: 1, fontFamily: font.medium, fontSize: 14, lineHeight: 20 }}>{g.name}</Txt>
          <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>{`${Math.round(Math.max(0, Math.min(1, g.pct)) * 100)}%`}</Txt>
          <ChevronRight size={17} color={c.muted} />
        </Row>
      </Pressy>
    </View>
  );
}
