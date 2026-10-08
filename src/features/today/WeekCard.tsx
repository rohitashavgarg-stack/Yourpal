import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Dumbbell, MapPin, UtensilsCrossed } from '@/lib/icons';
import { Button, Card, Chip, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { fmtT } from '@/lib/data';
import { Domain, totals, useDomain, wkDoneInfo, workoutState } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

export const ciTime = (d: Domain) => d.ciAt ?? (d.ci === 'Checked in' ? 1098 : null);

type Day = { num: number; let: string; wk: 'done' | 'rest' | ''; w: string; ws?: string; m: string; ms?: string; c: string; cs?: string; mealW: number; fut?: boolean; today?: boolean };
const DN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function days(d: Domain): Day[] {
  const st = workoutState(d);
  const t = totals(d);
  const done = wkDoneInfo(d);
  const ci = ciTime(d);
  const today: Day = {
    num: 24, let: 'W', today: true,
    wk: st === 'done' ? 'done' : st === 'rest' ? 'rest' : '',
    w: st === 'done' ? `Leg day · ${fmtT(done.a).full} – ${fmtT(done.b).full}` : st === 'rest' ? 'Rest day' : st === 'live' ? 'Leg day · in progress' : 'Leg day · planned 6:30 pm',
    ws: st === 'done' ? `Planned 6:30 pm${d.hc ? ` · ${done.k} kcal` : ''}` : st === 'rest' ? 'Recovery day' : 'Planned 6:30 pm',
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

function Dot({ kind }: { kind: 'done' | 'rest' | '' }) {
  const { c } = useTheme();
  if (kind === 'rest') return <View style={{ width: 8, height: 8 }} />;
  return <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: kind === 'done' ? c.accent : c.surface3, backgroundColor: kind === 'done' ? c.accent : 'transparent' }} />;
}
function Bar({ w }: { w: number }) {
  const { c } = useTheme();
  return <View style={{ width: 22, height: 4, borderRadius: 2, backgroundColor: c.surface2, overflow: 'hidden' }}><View style={{ width: `${w}%`, height: '100%', backgroundColor: c.good, borderRadius: 2 }} /></View>;
}

export function WeekCard() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { openSheet } = useOverlay();
  const list = days(d);
  const t = totals(d);
  const doneN = 1 + (workoutState(d) === 'done' ? 1 : 0);
  return (
    <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 10, gap: 14 }}>
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: 30, letterSpacing: -1.3 }}>This week</Txt>
        <Chip label={`${doneN} of 4 workouts`} icon={<Dumbbell size={13} color={c.ink} />} />
      </Row>
      <View accessibilityLabel="Days this week. Tap a past day for its summary, a future day to open its plan" style={{ flexDirection: 'row' }}>
        {list.map((x, i) => (
          <View key={x.num} style={{ flex: 1, alignItems: 'center', gap: 6, borderLeftWidth: i ? 1 : 0, borderLeftColor: c.line }}>
            <Pressy accessibilityRole="button" accessibilityLabel={`${DN[i]} ${x.num}${x.today ? ', today' : ''}${x.fut ? ', open plan' : ', open summary'}`}
              onPress={() => (x.fut ? router.navigate({ pathname: '/plans', params: { day: String(i) } }) : openSheet(<DaySheet i={i} />, { label: 'Day summary' }))}
              style={{ width: 44, height: 58, borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: x.today ? c.ink : 'transparent', opacity: x.fut ? 0.55 : 1 }}>
              <Txt style={{ fontFamily: font.medium, fontSize: 15, color: x.today ? c.bg : c.ink }}>{x.num}</Txt>
              <Txt style={{ fontSize: 11, color: x.today ? c.bg : c.muted, opacity: x.today ? 0.7 : 1 }}>{x.let}</Txt>
            </Pressy>
            <Dot kind={x.wk} />
            <Bar w={x.mealW} />
          </View>
        ))}
      </View>
      <Txt muted style={{ fontSize: 13, paddingHorizontal: 4 }}>{doneN} of 4 workouts · {7 + t.onPlan} of 12 meals on plan · {ciTime(d) != null ? '2 check-ins' : '1 check-in'}</Txt>
      <Row style={{ gap: 14, justifyContent: 'center', paddingTop: 2, paddingBottom: 6 }}>
        <Row style={{ gap: 5 }}><Dot kind="done" /><Txt style={{ fontSize: 11, color: c.muted }}>Workout done</Txt></Row>
        <Row style={{ gap: 5 }}><Dot kind="" /><Txt style={{ fontSize: 11, color: c.muted }}>Planned</Txt></Row>
        <Row style={{ gap: 5 }}><Bar w={70} /><Txt style={{ fontSize: 11, color: c.muted }}>Meals on plan</Txt></Row>
      </Row>
    </Card>
  );
}

export function DaySheet({ i }: { i: number }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const { closeSheet } = useOverlay();
  const x = days(d)[i];
  const rows: [any, string, string | undefined][] = [[Dumbbell, x.w, x.ws], [UtensilsCrossed, x.m, x.ms], [MapPin, x.c, x.cs]];
  return (
    <>
      <View style={{ gap: 2 }}>
        <Txt v="label">{x.today ? 'Today so far' : 'Day summary'}</Txt>
        <Txt style={{ fontFamily: font.regular, fontSize: 30, letterSpacing: -1.3 }}>{DN[i]} {x.num}</Txt>
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
