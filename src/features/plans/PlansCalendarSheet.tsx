import React, { useState } from 'react';
import { View } from 'react-native';
import { ChevronLeft, ChevronRight } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { IconButton } from '@/design-system/primitives/Button';
import { TODAY_IDX } from '@/lib/data';
import { dayDate, setP, usePlans } from './store';

// A month calendar in a bottom sheet to jump to a day in Plans. The page keeps two weeks back and three ahead, so only those days can be picked.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKS_BACK = 2, WEEKS_AHEAD = 3;
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function PlansCalendarSheet() {
  const { c } = useTheme();
  const { closeSheet } = useOverlay();
  const { p } = usePlans();
  const monday = dayDate(0, 0); // the first day of this week
  const today = dayDate(TODAY_IDX, 0);
  const picked = dayDate(p.day, p.week);
  const first = dayDate(0, -WEEKS_BACK), last = dayDate(6, WEEKS_AHEAD);
  const [cursor, setCursor] = useState(new Date(picked.getFullYear(), picked.getMonth(), 1));
  const lead = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7; // Monday first
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))];
  while (cells.length % 7) cells.push(null);
  const canBack = new Date(cursor.getFullYear(), cursor.getMonth(), 1) > new Date(first.getFullYear(), first.getMonth(), 1);
  const canFwd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1) <= last;
  const pick = (d: Date) => {
    const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()).getTime()) / 86400000);
    const week = Math.floor(diff / 7);
    haptic.tick();
    setP({ week, day: diff - week * 7 });
    closeSheet();
  };
  return (
    <View style={{ gap: 6, paddingBottom: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton label="Previous month" disabled={!canBack} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} style={{ opacity: canBack ? 1 : 0.35 }}><ChevronLeft size={20} color={c.ink} /></IconButton>
        <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25 }}>{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</Txt>
        <IconButton label="Next month" disabled={!canFwd} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} style={{ opacity: canFwd ? 1 : 0.35 }}><ChevronRight size={20} color={c.ink} /></IconButton>
      </Row>
      <Row>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => <Txt key={i} v="caption" style={{ flex: 1, textAlign: 'center' }}>{l}</Txt>)}</Row>
      <View>
        {Array.from({ length: cells.length / 7 }, (_, r) => (
          <Row key={r}>
            {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
              if (!d) return <View key={i} style={{ flex: 1, height: 46 }} />;
              const off = d < first || d > last;
              const on = sameDay(d, picked), isToday = sameDay(d, today);
              return (
                <View key={i} style={{ flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                  <Pressy accessibilityRole="button" accessibilityState={{ selected: on, disabled: off }} accessibilityLabel={d.toDateString()} disabled={off} onPress={() => pick(d)} scaleTo={0.92}
                    style={{ width: 40, height: 40, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.ink : 'transparent', borderWidth: isToday && !on ? 1.5 : 0, borderColor: c.accent, opacity: off ? 0.3 : 1 }}>
                    <Txt style={{ fontFamily: on ? font.semibold : font.regular, fontSize: fontSizes.md, color: on ? c.bg : c.ink }}>{d.getDate()}</Txt>
                  </Pressy>
                </View>
              );
            })}
          </Row>
        ))}
      </View>
    </View>
  );
}
