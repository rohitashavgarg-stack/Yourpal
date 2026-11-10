import React, { useState } from 'react';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { View } from 'react-native';
import { ChevronLeft, ChevronRight, FingerprintPattern, MapPin, Smartphone } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { cardShadow, Hint, SubPage } from '@/features/progress/parts';
import { VISITS } from '@/features/gym/data';
import { dayName, pastMonth } from '@/features/gym/attendanceMonths';
import { Pressy } from '@/components/ui';
import { useGymScenarios } from '@/features/gym/state';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { Card } from '@/design-system/primitives/Card';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { StatusDot } from '@/design-system/primitives/StatusDot';
import { FadeIn } from '@/design-system/primitives/FadeIn';

// A visit. tag says how it was checked in: Location is the phone, Front desk is the biometric device.
type Att = { t: string; s: string; tag: 'Location' | 'Front desk'; key: string };

export default function Attendance() {
  const { c, isDark } = useTheme();
  useGymScenarios('Gym · Attendance');

  const [back, setBack] = useState(0); // months before September (0 is the current month)
  const past = back > 0 ? pastMonth(back) : null;

  // Calendar cells (September, Monday first, 30 days + padding to 35).
  const septCells = Array.from({ length: 35 }, (_, k) => {
    const inMonth = k <= 29, dN = k + 1;
    const v: string | null = VISITS[dN] === 'c' ? 'c' : null;
    let bg = 'transparent', fg = inMonth ? c.ink : c.surface3, fw = font.regular;
    const ring: string | null = null;
    if (inMonth && v === 'c') { bg = c.accent; fg = fixed.white; fw = font.semibold; }
    const aria = inMonth ? `${dN} September${v === 'c' ? ', checked in' : ''}${dN === 24 ? ', today' : ''}` : '';
    return { n: inMonth ? String(dN) : '', bg, fg, fw, ring, today: dN === 24, aria };
  });

  // An earlier month: its cells (the 1st lands on its own weekday) and one row for each visit, newest first.
  const pastCells = past ? Array.from({ length: Math.ceil((past.lead + past.days) / 7) * 7 }, (_, k) => {
    const dN = k - past.lead + 1, inMonth = dN >= 1 && dN <= past.days;
    const v: string | null = inMonth ? past.visits[dN] ?? null : null;
    let bg = 'transparent', fg = inMonth ? c.ink : c.surface3, fw = font.regular;
    if (v === 'c') { bg = c.accent; fg = fixed.white; fw = font.semibold; }
    return { n: inMonth ? String(dN) : '', bg, fg, fw, ring: null as string | null, today: false, aria: inMonth ? `${dN} ${past.name}${v === 'c' ? ', checked in' : ''}` : '' };
  }) : null;
  const cells = pastCells ?? septCells;
  const pastRows: Att[] = past ? Object.keys(past.visits).map(Number).sort((x, y) => y - x).map((d) => (
    { key: 'm' + d, t: dayName(past, d), s: 'Workout logged', tag: d % 2 ? 'Location' : 'Front desk' } as Att
  )) : [];
  const list: Att[] = past ? pastRows : [
    { key: '24', t: 'Wed 24 · 6:42 pm', s: 'Workout logged', tag: 'Location' },
    { key: '20', t: 'Sat 20 · 7:05 pm', s: 'Workout logged', tag: 'Front desk' },
    { key: '18', t: 'Thu 18 · 6:10 pm', s: 'Workout logged', tag: 'Location' },
    { key: '13', t: 'Sat 13 · 6:50 pm', s: 'Nothing logged', tag: 'Location' },
  ];

  return (
    <SubPage title="Attendance" fallback="/gym" backdrop={<TopGlow color={c.accent} />}>
      <View style={[{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 16 }, cardShadow(isDark)]}>
<CardEdge radius={radii.xl} />
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
          {[{ l: 'Check-in', col: c.accent }].map((x) => (
            <Row key={x.l} style={{ gap: 6 }}><StatusDot size={10} color={x.col} /><Txt v="caption">{x.l}</Txt></Row>
          ))}
        </Row>
      </View>
      <Card padding={{ top: 4, bottom: 4, horizontal: 16 }}>
        {list.map((r, i) => {
          return (
            <FadeIn key={r.key + r.tag} style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: i < list.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
              <IconBadge size={36} radius={radii.md} bg={c.surface2}><MapPin size={16} strokeWidth={2.4} color={c.ink} /></IconBadge>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt style={{ fontFamily: font.medium }}>{r.t}</Txt>
                <Txt v="caption">{r.s}</Txt>
              </View>
              {/* how this visit was checked in: with the phone, or with the biometric device */}
              <View accessible accessibilityLabel={r.tag === 'Location' ? 'Checked in with the phone' : 'Checked in with biometric'} style={{ width: 36, height: 36, borderRadius: radii.md, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                {r.tag === 'Location' ? <Smartphone size={18} color={c.ink} /> : <FingerprintPattern size={18} color={c.ink} />}
              </View>
            </FadeIn>
          );
        })}
      </Card>
      <Hint style={{ fontSize: fontSizes.xs }}>Check in from the app when you are at the gym (within 20 m). The front desk can also mark a visit.</Hint>
    </SubPage>
  );
}
