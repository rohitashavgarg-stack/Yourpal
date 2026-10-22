import React from 'react';
import { View } from 'react-native';
import { Check, Dumbbell, Moon, UtensilsCrossed } from '@/lib/icons';
import { Card, Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, radii } from '@/design-system/tokens';

export type WeekDay = {
  /** Day of the month. */
  num: number;
  /** One letter above the number. */
  letter: string;
  /** Weekday name, for the spoken label. */
  name: string;
  /** done: green tick. rest: moon. empty: a ring (solid for today, dashed for a day still to come). */
  workout: 'done' | 'rest' | '';
  /** How many of the day's 4 meals were on plan, 0 to 4. */
  mealsOnPlan: number;
  /** A day that has not happened yet: faint, and it opens the plan instead of the summary. */
  future?: boolean;
  today?: boolean;
};

export type WeekCardProps = {
  days: WeekDay[];
  /** The two numbers at the top. */
  workouts: { done: number; target: number };
  meals: { onPlan: number; total: number };
  /** The whole week in one sentence, read out by screen readers. */
  summary: string;
  /** A day was tapped (its index in `days`). The container decides between the summary sheet and the plan. */
  onDayPress: (i: number) => void;
};

const MARK = 24;

function Stat({ icon, label, value, of }: { icon: React.ReactNode; label: string; value: number; of?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 0, borderRadius: 14, backgroundColor: c.surface2, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 9 }}>
      <Row style={{ gap: 5 }}>{icon}<Txt numberOfLines={1} style={{ flexShrink: 1, fontSize: fontSizes.xs, lineHeight: 16, color: c.muted }}>{label}</Txt></Row>
      <Txt style={{ marginTop: 4, fontFamily: font.semibold, fontSize: 22, lineHeight: 29, color: c.ink }}>
        {value}{of != null ? <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.md, lineHeight: 20, color: c.muted }}>{`/${of}`}</Txt> : null}
      </Txt>
    </View>
  );
}

// Workout: a green tick when done, a moon on a rest day, a solid ring for today, a dashed ring for a day still to come.
function WorkoutMark({ day }: { day: WeekDay }) {
  const { c } = useTheme();
  const box = { width: MARK, height: MARK, borderRadius: MARK / 2, alignItems: 'center', justifyContent: 'center' } as const;
  if (day.workout === 'done') return <View style={[box, { backgroundColor: c.good }]}><Check size={14} strokeWidth={3} color={c.bg} /></View>;
  if (day.workout === 'rest') return <View style={box}><Moon size={15} color={c.muted} /></View>;
  if (day.today) return <View style={[box, { borderWidth: 1.5, borderColor: c.ink }]} />;
  return <View style={[box, { borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.chipLine }]} />;
}

// Meals: four dots in a 2 x 2 square, one per meal; green on plan, grey not on plan, faint on a day still to come.
function MealsMark({ day }: { day: WeekDay }) {
  const { c } = useTheme();
  return (
    <View style={{ width: MARK, height: MARK, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 3 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: day.future ? c.surface2 : i < day.mealsOnPlan ? c.good : c.surface3 }} />
      ))}
    </View>
  );
}

/** This week: two numbers (workouts, meals on plan), then the seven days, each with its workout and its meals, and a one-line legend. */
export function WeekCard({ days, workouts, meals, summary, onDayPress }: WeekCardProps) {
  const { c } = useTheme();
  return (
    <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}>
      <View accessible accessibilityLabel={summary} style={{ gap: 14 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, lineHeight: 39, letterSpacing: -1.3 }}>This week</Txt>
        <Row style={{ gap: 8, alignItems: 'stretch' }}>
          <Stat icon={<Dumbbell size={15} color={c.muted} />} label="Workouts" value={workouts.done} of={workouts.target} />
          <Stat icon={<UtensilsCrossed size={15} color={c.muted} />} label="Meals on plan" value={meals.onPlan} of={meals.total} />
        </Row>
      </View>
      <View accessibilityLabel="Days this week. Tap a past day for its summary, a future day to open its plan" style={{ flexDirection: 'row', gap: 4 }}>
        {days.map((x, i) => (
          <Pressy key={x.num} accessibilityRole="button" accessibilityLabel={`${x.name} ${x.num}${x.today ? ', today' : ''}${x.future ? ', open plan' : ', open summary'}`}
            onPress={() => onDayPress(i)} scaleTo={0.96}
            style={{ flex: 1, alignItems: 'center', gap: 10, paddingTop: 8, paddingBottom: 10, borderRadius: radii.md, backgroundColor: x.today ? c.surface2 : 'transparent' }}>
            <View style={{ height: 34, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontSize: fontSizes.xs2, lineHeight: 15, color: x.future ? c.muted : c.muted, opacity: x.future ? 0.6 : 1 }}>{x.letter}</Txt>
              <Txt style={{ fontFamily: x.today ? font.semibold : font.regular, fontSize: fontSizes.base, lineHeight: 19, color: c.ink, opacity: x.future ? 0.45 : 1 }}>{x.num}</Txt>
            </View>
            <WorkoutMark day={x} />
            <MealsMark day={x} />
          </Pressy>
        ))}
      </View>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <Row style={{ gap: 6 }}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}><Check size={9} strokeWidth={3.5} color={c.bg} /></View>
          <Txt style={{ fontSize: fontSizes.xs, lineHeight: 16, color: c.muted }}>Workout</Txt>
        </Row>
        <Row style={{ gap: 6 }}>
          <View style={{ width: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {[0, 1, 2, 3].map((i) => <View key={i} style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: i < 3 ? c.good : c.surface3 }} />)}
          </View>
          <Txt style={{ fontSize: fontSizes.xs, lineHeight: 16, color: c.muted }}>Meals on plan</Txt>
        </Row>
      </View>
    </Card>
  );
}
