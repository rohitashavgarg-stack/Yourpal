import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, ChevronLeft, ChevronRight, Clock, House, MapPin } from '@/lib/icons';
import { fadeOut } from '@/theme/motion';
import { Button, Pill, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { cardShadow, Hint, SubPage } from '@/features/progress/parts';
import { VISITS } from '@/features/gym/data';
import { dayName, pastMonth } from '@/features/gym/attendanceMonths';
import { Pressy } from '@/components/ui';
import { gymStore, useGymScenarios } from '@/features/gym/state';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { Card } from '@/design-system/primitives/Card';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { StatusDot } from '@/design-system/primitives/StatusDot';
import { FadeIn } from '@/design-system/primitives/FadeIn';

type Att = { t: string; s: string; tag: string; type: 'c' | 'pt'; icon: 'loc' | 'home' | 'pt' | 'wait'; tone?: 'accent' | 'good' | 'warn'; ptOnly?: boolean; key: string };

export default function Attendance() {
  const { c, isDark } = useTheme();
  const { state } = useStore();
  const g = gymStore.use();
  const isPT = state.sc.member === 'PT member';
  const awaiting = isPT && g.awaiting === 'Yes' && g.sessionState === 'awaiting';
  useGymScenarios('Gym · Attendance', isPT ? [{ label: 'Filter', options: ['All', 'Check-ins', 'PT sessions'], value: ['All', 'Check-ins', 'PT sessions'][g.attFilter], onPick: (v) => gymStore.set({ attFilter: ['All', 'Check-ins', 'PT sessions'].indexOf(v) as any }) }] : [], [], [g.attFilter, isPT]);

  const [back, setBack] = useState(0); // months before September (0 is the current month)
  const past = back > 0 ? pastMonth(back) : null;

  // Calendar cells (September, Monday first, 30 days + padding to 35).
  const septCells = Array.from({ length: 35 }, (_, k) => {
    const inMonth = k <= 29, dN = k + 1;
    let v: string | null = VISITS[dN] ?? null;
    if (v === 'p' && !isPT) v = 'c';
    if (v === 'a' && (!isPT || g.awaiting === 'No')) v = isPT ? 'p' : null;
    if (v === 'a' && g.sessionState === 'confirmed') v = 'p';
    if (v === 'a' && g.sessionState === 'flagged') v = null;
    let bg = 'transparent', fg = inMonth ? c.ink : c.surface3, fw = font.regular, ring: string | null = null;
    if (inMonth && v === 'c') { bg = c.accent; fg = fixed.white; fw = font.semibold; }
    if (inMonth && v === 'h') bg = c.surface3;
    if (inMonth && v === 'p') { bg = c.good; fg = fixed.dark; fw = font.semibold; }
    if (inMonth && v === 'a') ring = c.good;
    const aria = inMonth ? `${dN} September${v === 'c' ? ', checked in' : v === 'h' ? ', home workout' : v === 'p' ? ', PT session' : v === 'a' ? ', PT session awaiting confirmation' : ''}${dN === 24 ? ', today' : ''}` : '';
    return { n: inMonth ? String(dN) : '', bg, fg, fw, ring, today: dN === 24, aria };
  });

  // An earlier month: its cells (the 1st lands on its own weekday) and one row for each visit, newest first.
  const pastCells = past ? Array.from({ length: Math.ceil((past.lead + past.days) / 7) * 7 }, (_, k) => {
    const dN = k - past.lead + 1, inMonth = dN >= 1 && dN <= past.days;
    let v: string | null = inMonth ? past.visits[dN] ?? null : null;
    if (v === 'p' && !isPT) v = 'c';
    let bg = 'transparent', fg = inMonth ? c.ink : c.surface3, fw = font.regular;
    if (v === 'c') { bg = c.accent; fg = fixed.white; fw = font.semibold; }
    if (v === 'h') bg = c.surface3;
    if (v === 'p') { bg = c.good; fg = fixed.dark; fw = font.semibold; }
    return { n: inMonth ? String(dN) : '', bg, fg, fw, ring: null as string | null, today: false, aria: inMonth ? `${dN} ${past.name}${v === 'c' ? ', checked in' : v === 'h' ? ', home workout' : v === 'p' ? ', PT session' : ''}` : '' };
  }) : null;
  const cells = pastCells ?? septCells;
  const pastRows: Att[] = past ? Object.keys(past.visits).map(Number).sort((x, y) => y - x).map((d) => {
    const v = past.visits[d] === 'p' && !isPT ? 'c' : past.visits[d];
    return v === 'p'
      ? { key: 'm' + d, t: `${dayName(past, d)} · PT session`, s: 'Coach Vikram · you rated it 5★', tag: 'Confirmed', type: 'pt' as const, icon: 'pt' as const, tone: 'good' as const, ptOnly: true }
      : v === 'h'
        ? { key: 'm' + d, t: dayName(past, d), s: 'Workout, no check-in', tag: 'Home', type: 'c' as const, icon: 'home' as const }
        : { key: 'm' + d, t: dayName(past, d), s: 'Workout logged', tag: 'Location', type: 'c' as const, icon: 'loc' as const };
  }) : [];

  let rows: Att[] = [];
  if (isPT && g.awaiting === 'Yes') {
    if (g.sessionState === 'awaiting') rows.push({ key: 'a', t: 'Tue 23 · PT session', s: 'Coach Vikram · 6–7 pm', tag: 'Awaiting confirmation', type: 'pt', icon: 'wait', tone: 'accent' });
    if (g.sessionState === 'confirmed') rows.push({ key: 'a', t: 'Tue 23 · PT session', s: `Coach Vikram · you rated it ${g.rating}★`, tag: 'Confirmed', type: 'pt', icon: 'pt', tone: 'good' });
    if (g.sessionState === 'flagged') rows.push({ key: 'a', t: 'Tue 23 · PT session', s: 'Flagged to gym admin · not counted', tag: 'Under review', type: 'pt', icon: 'wait', tone: 'warn' });
  }
  if (past) rows = pastRows; else rows = rows.concat([
    { key: '24', t: 'Wed 24 · 6:42 pm', s: 'Workout logged', tag: 'Location', type: 'c', icon: 'loc' },
    { key: '22', t: 'Mon 22 · PT session', s: 'Coach Vikram · you rated it 5★', tag: 'Confirmed', type: 'pt', icon: 'pt', ptOnly: true },
    { key: '20', t: 'Sat 20 · 7:05 pm', s: 'Workout logged', tag: 'Front desk', type: 'c', icon: 'loc' },
    { key: '18', t: 'Thu 18', s: 'Workout, no check-in', tag: 'Home', type: 'c', icon: 'home' },
    { key: '16', t: 'Tue 16 · PT session', s: 'Coach Vikram · you rated it 4★', tag: 'Confirmed', type: 'pt', icon: 'pt', ptOnly: true },
    { key: '13', t: 'Sat 13 · 6:50 pm', s: 'Nothing logged', tag: 'Location', type: 'c', icon: 'loc' },
  ]);
  const filter = isPT ? g.attFilter : 0;
  const list = rows.filter((r) => !(r.ptOnly && !isPT) && !(filter === 1 && r.type !== 'c') && !(filter === 2 && r.type !== 'pt'));

  const tone = (r: Att) => {
    if (r.tone === 'accent') return { tagBg: c.accentSoft, tagFg: c.accentText, dotBg: c.accentSoft, dotFg: c.accentText };
    if (r.tone === 'good') return { tagBg: c.goodSoft, tagFg: c.good, dotBg: c.good, dotFg: fixed.dark };
    if (r.tone === 'warn') return { tagBg: c.warnSoft, tagFg: c.warn, dotBg: c.warnSoft, dotFg: c.warn };
    return { tagBg: c.surface2, tagFg: c.muted, dotBg: r.type === 'pt' ? c.goodSoft : c.surface2, dotFg: r.type === 'pt' ? c.good : c.ink };
  };
  const Icon = { loc: MapPin, home: House, pt: Check, wait: Clock };

  return (
    <SubPage title="Attendance" fallback="/gym">
      {awaiting && back === 0 && (
        <FadeIn exiting={fadeOut()} style={[{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18, gap: 8, borderWidth: 1.5, borderColor: c.accent }, cardShadow(isDark)]}>
          <Txt style={{ fontFamily: font.semibold }}>Confirm your session</Txt>
          <Txt muted style={{ fontSize: fontSizes.md }}>Coach Vikram marked Tue 23 Sep, 6–7 pm as completed</Txt>
          <Button label="Confirm & rate" onPress={() => router.push('/gym/confirm')} style={{ height: 48, borderRadius: radii.card }} />
        </FadeIn>
      )}
      <View style={[{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 16 }, cardShadow(isDark)]}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
          <Pressy accessibilityRole="button" accessibilityLabel="Earlier month" onPress={() => setBack((n) => Math.min(6, n + 1))} disabled={back >= 6} scaleTo={0.92} style={{ width: 40, height: 40, borderRadius: radii.md, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: back >= 6 ? 0.4 : 1 }}><ChevronLeft size={20} color={c.ink} /></Pressy>
          <View style={{ alignItems: 'center' }}>
            <Txt style={{ fontFamily: font.semibold }}>{past ? past.name : 'September'}</Txt>
            <Txt v="label">{`${past ? past.count : 18} visits`}</Txt>
          </View>
          <Pressy accessibilityRole="button" accessibilityLabel="Later month" onPress={() => setBack((n) => Math.max(0, n - 1))} disabled={back === 0} scaleTo={0.92} style={{ width: 40, height: 40, borderRadius: radii.md, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: back === 0 ? 0.4 : 1 }}><ChevronRight size={20} color={c.ink} /></Pressy>
        </Row>
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          {'MTWTFSS'.split('').map((l, i) => <Txt key={i} style={{ flex: 1, textAlign: 'center', fontSize: fontSizes.xs2, color: c.muted }}>{l}</Txt>)}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 4 }}>
          {cells.map((x, i) => (
            <View key={i} style={{ width: `${100 / 7}%`, alignItems: 'center' }} accessible={!!x.aria} accessibilityLabel={x.aria || undefined}>
              <IconBadge size={38} bg={x.bg} borderWidth={x.ring || x.today ? 2 : 0} borderColor={x.today ? c.ink : x.ring ?? 'transparent'}>
                <Txt style={{ fontSize: fontSizes.sm, fontFamily: x.fw, color: x.fg }}>{x.n}</Txt>
              </IconBadge>
            </View>
          ))}
        </View>
        <Row style={{ gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
          {[{ l: 'Check-in', col: c.accent }, { l: 'Home', col: c.surface3 }, ...(isPT ? [{ l: 'PT session', col: c.good }] : [])].map((x) => (
            <Row key={x.l} style={{ gap: 6 }}><StatusDot size={10} color={x.col} /><Txt v="caption">{x.l}</Txt></Row>
          ))}
        </Row>
      </View>
      {isPT && (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {['All', 'Check-ins', 'PT sessions'].map((l, i) => <Pill key={l} label={l} on={g.attFilter === i} onPress={() => gymStore.set({ attFilter: i as any })} style={{ flex: 1, paddingHorizontal: 8 }} />)}
        </View>
      )}
      <Card padding={{ top: 4, bottom: 4, horizontal: 16 }}>
        {list.map((r, i) => {
          const t = tone(r); const I = Icon[r.icon];
          return (
            <FadeIn key={r.key + r.tag} style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: i < list.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
              <IconBadge size={36} radius={radii.md} bg={t.dotBg}><I size={16} strokeWidth={2.4} color={t.dotFg} /></IconBadge>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt style={{ fontFamily: font.medium }}>{r.t}</Txt>
                <Txt v="caption">{r.s}</Txt>
              </View>
              <Tag label={r.tag} bg={t.tagBg} fg={t.tagFg} />
            </FadeIn>
          );
        })}
        {list.length === 0 && <Txt muted style={{ paddingVertical: 18, textAlign: 'center' }}>Nothing here for this filter.</Txt>}
      </Card>
      <Hint style={{ fontSize: fontSizes.xs }}>Check in from the app when you are at the gym (within 20 m). The front desk can also mark a visit.</Hint>
    </SubPage>
  );
}
