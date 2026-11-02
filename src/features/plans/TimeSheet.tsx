import React, { useState } from 'react';
import { View } from 'react-native';
import { Minus, Plus } from '@/lib/icons';
import { Button, Pill, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { radii, fontSizes } from '@/design-system/tokens';

/** Minutes since midnight, written as "1:05 pm". */
export function fmtClock(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

function Step({ label, value, onLess, onMore }: { label: string; value: string; onLess: () => void; onMore: () => void }) {
  const { c } = useTheme();
  const btn = { width: 64, height: 44, borderRadius: radii.md, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Pressy accessibilityRole="button" accessibilityLabel={`More ${label}`} onPress={onMore} scaleTo={0.94} style={btn}><Plus size={20} color={c.ink} /></Pressy>
      <Txt accessibilityLabel={`${label} ${value}`} style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 44 }}>{value}</Txt>
      <Pressy accessibilityRole="button" accessibilityLabel={`Less ${label}`} onPress={onLess} scaleTo={0.94} style={btn}><Minus size={20} color={c.ink} /></Pressy>
    </View>
  );
}

// "When did you eat?" Hours, minutes (steps of 5) and am or pm. A time later than now is not allowed.
export function TimeSheet({ title, initial, max, onSave }: { title: string; initial: number; max: number; onSave: (min: number) => void }) {
  const { closeSheet } = useOverlay();
  const [min, setMin] = useState(Math.min(initial, max));
  const h = Math.floor(min / 60);
  const m = min % 60;
  const pm = h >= 12;
  const tooLate = min > max;
  const put = (v: number) => { haptic.tick(); setMin(((v % 1440) + 1440) % 1440); };
  const hour = (by: number) => put((((h + by) % 24 + 24) % 24) * 60 + m);
  const minute = (by: number) => put(h * 60 + ((m + by + 60) % 60));
  return (
    <View style={{ gap: 16, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: fontSizes.xl2, lineHeight: 29 }}>{title}</Txt>
      <Row style={{ justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        <Step label="hour" value={String(h % 12 === 0 ? 12 : h % 12)} onLess={() => hour(-1)} onMore={() => hour(1)} />
        <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 44 }}>:</Txt>
        <Step label="minutes" value={String(m).padStart(2, '0')} onLess={() => minute(-5)} onMore={() => minute(5)} />
        <View style={{ gap: 8, marginLeft: 6 }}>
          <Pill label="am" on={!pm} onPress={() => { if (pm) put(min - 720); }} />
          <Pill label="pm" on={pm} onPress={() => { if (!pm) put(min + 720); }} />
        </View>
      </Row>
      <Txt v="caption" style={{ textAlign: 'center', minHeight: 18 }}>{tooLate ? 'That time has not come yet. Pick a time up to now.' : ' '}</Txt>
      <Button kind="primary" label="Save time" disabled={tooLate} onPress={() => closeSheet(() => onSave(min))} />
      <Button kind="secondary" label="Cancel" onPress={() => closeSheet()} />
    </View>
  );
}
