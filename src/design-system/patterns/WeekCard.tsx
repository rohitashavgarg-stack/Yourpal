import React from 'react';
import { View } from 'react-native';
import { Dumbbell } from '@/lib/icons';
import { Card, Chip, Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, radii } from '@/design-system/tokens';

export type WeekDay = {
  /** Day of the month. */
  num: number;
  /** One letter under the number. */
  letter: string;
  /** Weekday name, for the spoken label. */
  name: string;
  /** done: a filled dot. rest: no dot. empty: an outline dot (planned). */
  workout: 'done' | 'rest' | '';
  /** How much of the day's meals were on plan, 0 to 100. */
  mealsPct: number;
  /** A day that has not happened yet: dimmed, and it opens the plan instead of the summary. */
  future?: boolean;
  today?: boolean;
};

export type WeekCardProps = {
  days: WeekDay[];
  /** Workouts done this week, for the chip. */
  workoutsDone: number;
  /** The weekly goal for the chip, 4 by default. */
  workoutsTarget?: number;
  /** The line under the strip. */
  summary: string;
  /** A day was tapped (its index in `days`). The container decides between the summary sheet and the plan. */
  onDayPress: (i: number) => void;
};

function DayDot({ kind }: { kind: 'done' | 'rest' | '' }) {
  const { c } = useTheme();
  if (kind === 'rest') return <View style={{ width: 8, height: 8 }} />;
  return <View style={{ width: 8, height: 8, borderRadius: radii.xs, borderWidth: 1.5, borderColor: kind === 'done' ? c.accent : c.surface3, backgroundColor: kind === 'done' ? c.accent : 'transparent' }} />;
}
function WeekBar({ w }: { w: number }) {
  const { c } = useTheme();
  return <View style={{ width: 22, height: 4, borderRadius: radii.xs, backgroundColor: c.surface2, overflow: 'hidden' }}><View style={{ width: `${w}%`, height: '100%', backgroundColor: c.good, borderRadius: radii.xs }} /></View>;
}

/** This week: a seven day strip with a workout dot and a meals bar under each day, a summary line and a legend. */
export function WeekCard({ days, workoutsDone, workoutsTarget = 4, summary, onDayPress }: WeekCardProps) {
  const { c } = useTheme();
  return (
    <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 10, gap: 14 }}>
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, letterSpacing: -1.3 }}>This week</Txt>
        <Chip label={`${workoutsDone} of ${workoutsTarget} workouts`} icon={<Dumbbell size={13} color={c.ink} />} />
      </Row>
      <View accessibilityLabel="Days this week. Tap a past day for its summary, a future day to open its plan" style={{ flexDirection: 'row' }}>
        {days.map((x, i) => (
          <View key={x.num} style={{ flex: 1, alignItems: 'center', gap: 6, borderLeftWidth: i ? 1 : 0, borderLeftColor: c.line }}>
            <Pressy accessibilityRole="button" accessibilityLabel={`${x.name} ${x.num}${x.today ? ', today' : ''}${x.future ? ', open plan' : ', open summary'}`}
              onPress={() => onDayPress(i)}
              style={{ width: 44, height: 58, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: x.today ? c.ink : 'transparent', opacity: x.future ? 0.55 : 1 }}>
              <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, color: x.today ? c.bg : c.ink }}>{x.num}</Txt>
              <Txt style={{ fontSize: fontSizes.xs2, color: x.today ? c.bg : c.muted, opacity: x.today ? 0.7 : 1 }}>{x.letter}</Txt>
            </Pressy>
            <DayDot kind={x.workout} />
            <WeekBar w={x.mealsPct} />
          </View>
        ))}
      </View>
      <Txt muted style={{ fontSize: fontSizes.sm, paddingHorizontal: 4 }}>{summary}</Txt>
      <Row style={{ gap: 14, justifyContent: 'center', paddingTop: 2, paddingBottom: 6 }}>
        <Row style={{ gap: 5 }}><DayDot kind="done" /><Txt style={{ fontSize: fontSizes.xs2, color: c.muted }}>Workout done</Txt></Row>
        <Row style={{ gap: 5 }}><DayDot kind="" /><Txt style={{ fontSize: fontSizes.xs2, color: c.muted }}>Planned</Txt></Row>
        <Row style={{ gap: 5 }}><WeekBar w={70} /><Txt style={{ fontSize: fontSizes.xs2, color: c.muted }}>Meals on plan</Txt></Row>
      </Row>
    </Card>
  );
}
