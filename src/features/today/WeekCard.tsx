import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Dumbbell, MapPin, UtensilsCrossed } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { fmtT } from '@/lib/data';
import { Domain, plannedMin, totals, useDomain, wkDoneInfo, workoutState } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';
import { WeekCard as WeekCardPattern, WeekDay } from '@/design-system/patterns/WeekCard';

export const ciTime = (d: Domain) => d.ciAt ?? (d.ci === 'Checked in' ? 1098 : null);

type Day = { num: number; let: string; wk: 'done' | 'rest' | ''; w: string; ws?: string; m: string; ms?: string; c: string; cs?: string; mealW: number; fut?: boolean; today?: boolean };
const DN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function days(d: Domain, planAt: string): Day[] {
  const st = workoutState(d);
  const t = totals(d);
  const done = wkDoneInfo(d);
  const ci = ciTime(d);
  const today: Day = {
    num: 24, let: 'W', today: true,
    wk: st === 'done' ? 'done' : st === 'rest' ? 'rest' : '',
    w: st === 'done' ? `Leg day · ${fmtT(done.a).full} – ${fmtT(done.b).full}` : st === 'rest' ? 'Rest day' : st === 'live' ? 'Leg day · in progress' : `Leg day · planned ${planAt}`,
    ws: st === 'done' ? `Planned ${planAt}${d.hc && d.wearable ? ` · ${done.k} kcal` : ''}` : st === 'rest' ? 'Recovery day' : `Planned ${planAt}`,
    m: `${t.done} of 4 meals done · ${t.onPlan} on plan`, ms: `${t.k} kcal so far · protein ${t.p} g`,
    c: ci != null ? `Checked in ${fmtT(ci).full}${d.ciOut ? ` · out ${fmtT(d.ciOut.at).hm}` : ''}` : 'Not checked in yet', cs: d.ciOut ? `${d.ciOut.mins} min at the gym` : ci != null ? 'Counted in your attendance' : 'Check in when you reach the gym',
    mealW: Math.round((t.onPlan / 4) * 100),
  };
  return [
    { num: 22, let: 'M', wk: 'done', w: 'Push · 6:40 – 7:25 pm', ws: 'Planned 6:30 pm · 45 min · 360 kcal', m: '4 of 4 meals on plan', ms: '1,790 kcal · protein 88 g', c: 'Checked in 6:32 pm', cs: '58 min at the gym', mealW: 100 },
    { num: 23, let: 'T', wk: 'rest', w: 'Rest day', ws: '7,900 steps · 40 min walk', m: '3 of 4 meals on plan', ms: '1,920 kcal · dinner was different', c: 'No visit', cs: "Rest days don't need a check-in", mealW: 75 },
    today,
    { num: 25, let: 'T', wk: '', w: 'Pull · planned 6:30 pm', m: 'Plan ready', c: '—', mealW: 0, fut: true },
    { num: 26, let: 'F', wk: 'rest', w: 'Rest day', m: 'Plan ready', c: '—', mealW: 0, fut: true },
    { num: 27, let: 'S', wk: '', w: 'Full body · planned 9:00 am', m: 'Plan ready', c: '—', mealW: 0, fut: true },
    { num: 28, let: 'S', wk: 'rest', w: 'Rest day', m: 'Plan ready', c: '—', mealW: 0, fut: true },
  ];
}

// The week card is a pattern (src/design-system/patterns/WeekCard.tsx). This feeds it the member's week.
export function TodayWeekCard() {
  const { d } = useDomain();
  const { state } = useStore();
  const { openSheet } = useOverlay();
  const list = days(d, fmtT(plannedMin(state.profile.time)).full);
  const t = totals(d);
  const doneN = 1 + (workoutState(d) === 'done' ? 1 : 0);
  const week: WeekDay[] = list.map((x, i) => ({ num: x.num, letter: x.let, name: DN[i], workout: x.wk, mealsPct: x.mealW, future: x.fut, today: x.today }));
  const onDayPress = (i: number) => (list[i].fut ? router.navigate({ pathname: '/plans', params: { day: String(i) } }) : openSheet(<DaySheet i={i} />, { label: 'Day summary' }));
  return <WeekCardPattern days={week} workoutsDone={doneN} onDayPress={onDayPress}
    summary={`You have done ${doneN} of 4 workouts, kept ${7 + t.onPlan} of 12 meals on plan and checked in ${ciTime(d) != null ? 'twice' : 'once'} this week.`} />;
}
export { TodayWeekCard as WeekCard }; // the old name, so existing imports keep working

export function DaySheet({ i }: { i: number }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const { state } = useStore();
  const { closeSheet } = useOverlay();
  const x = days(d, fmtT(plannedMin(state.profile.time)).full)[i];
  const rows: [any, string, string | undefined][] = [[Dumbbell, x.w, x.ws], [UtensilsCrossed, x.m, x.ms], [MapPin, x.c, x.cs]];
  return (
    <>
      <View style={{ gap: 2 }}>
        <Txt v="label">{x.today ? 'Today so far' : 'Day summary'}</Txt>
        <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.xl4, letterSpacing: -1.3 }}>{DN[i]} {x.num}</Txt>
      </View>
      <View>
        {rows.map(([I, b, s], k) => (
          <Row key={k} style={{ gap: 14, minHeight: 64, paddingHorizontal: 4, borderBottomWidth: k < 2 ? 1 : 0, borderBottomColor: c.line }}>
            <I size={19} color={c.muted} />
            <View style={{ flex: 1 }}><Txt style={{ fontFamily: font.semibold }}>{b}</Txt>{s ? <Txt v="caption">{s}</Txt> : null}</View>
          </Row>
        ))}
      </View>
      <Button kind="secondary" small label="See the full history in Progress" onPress={() => closeSheet(() => router.navigate('/progress'))} />
    </>
  );
}
