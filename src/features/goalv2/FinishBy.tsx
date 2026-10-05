import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Pill, Row, Txt } from '@/components/ui';
import { Wheel } from '@/components/Wheel';
import { useOverlay } from '@/components/Overlay';
import { font } from '@/theme/tokens';
import { TODAY } from '@/features/progress/trends';
import { addDays, daysBetween, fmtDay, parseBy } from './model';
import { MONTHS, daysIn } from '@/lib/dob';

export const WEEK_CHOICES = [8, 12, 16];

// "Finish by" is required for every measurable goal. Quick durations, or pick a date.
export function FinishBy({ by, onChange }: { by: string; onChange: (by: string) => void }) {
  const { openSheet } = useOverlay();
  const cur = parseBy(by);
  const weeks = cur ? daysBetween(TODAY, cur) / 7 : null;
  const quick = WEEK_CHOICES.find((w) => weeks != null && Math.abs(weeks - w) < 0.15);
  const custom = cur && quick == null;
  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 2 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>Finish by</Txt>
        <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>Your trainer can suggest a good length if you are not sure.</Txt>
      </View>
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>
        {WEEK_CHOICES.map((w) => <Pill key={w} label={`${w} weeks`} on={quick === w} onPress={() => onChange(fmtDay(addDays(TODAY, w * 7)))} />)}
        <Pill label={custom && cur ? `Date · ${fmtDay(cur)}` : 'Pick date'} on={!!custom} onPress={() => openSheet(<DateSheet start={cur ?? addDays(TODAY, 84)} onPick={onChange} />, { label: 'Pick a finish date' })} />
      </Row>
      {cur && <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{`Ends ${fmtDay(cur)}${weeks != null ? ` · about ${Math.round(weeks)} weeks from today` : ''}`}</Txt>}
    </View>
  );
}

export function DateSheet({ start, onPick }: { start: Date; onPick: (by: string) => void }) {
  const { closeSheet } = useOverlay();
  const [m, setM] = useState(start.getMonth() + 1);
  const [y, setY] = useState(start.getFullYear());
  const [day, setDay] = useState(start.getDate());
  const maxD = daysIn(y, m);
  const d = Math.min(day, maxD);
  const date = new Date(y, m - 1, d);
  const tooSoon = daysBetween(TODAY, date) < 7;
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 29 }}>Finish date</Txt>
      <Row style={{ gap: 4 }}>
        <Wheel key={`d${maxD}`} accessibilityLabel="Day" value={d} onChange={setDay} min={1} max={maxD} size={40} fmt={(n) => String(n)} />
        <Wheel accessibilityLabel="Month" value={m} onChange={setM} min={1} max={12} size={40} fmt={(n) => MONTHS[n - 1]} />
        <Wheel accessibilityLabel="Year" value={y} onChange={setY} min={TODAY.getFullYear()} max={TODAY.getFullYear() + 1} size={40} fmt={(n) => String(n)} />
      </Row>
      <Txt muted style={{ textAlign: 'center', fontSize: 13, lineHeight: 19 }}>{tooSoon ? 'Pick a date at least a week away.' : `${Math.round(daysBetween(TODAY, date) / 7)} weeks from today`}</Txt>
      <Button label="Use this date" disabled={tooSoon} onPress={() => closeSheet(() => onPick(fmtDay(date)))} />
    </View>
  );
}
