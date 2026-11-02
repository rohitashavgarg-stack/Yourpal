import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { Wheel } from '@/design-system/primitives/Wheel';
import { fontSizes } from '@/design-system/tokens';

/** Minutes since midnight, written as "1:05 pm". */
export function fmtClock(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

// "When did you eat?" Three scrolling wheels: hour, minute and am or pm. A time later than now is not allowed.
export function TimeSheet({ title, initial, max, onSave, saveLabel = 'Save time', onCancel }: { title: string; initial: number; max: number; onSave: (min: number) => void; saveLabel?: string; onCancel?: () => void }) {
  const { closeSheet } = useOverlay();
  const [min, setMin] = useState(Math.min(initial, max));
  const h = Math.floor(min / 60);
  const m = min % 60;
  const pm = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const tooLate = min > max;
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: fontSizes.xl2, lineHeight: 29 }}>{title}</Txt>
      <Row style={{ gap: 4 }}>
        <Wheel accessibilityLabel="Hour" value={h12} min={1} max={12} size={40} fmt={(n) => String(n)} onChange={(v) => setMin(((v % 12) + (pm ? 12 : 0)) * 60 + m)} />
        <Wheel accessibilityLabel="Minutes" value={m} min={0} max={59} size={40} fmt={(n) => String(n).padStart(2, '0')} onChange={(v) => setMin(h * 60 + v)} />
        <Wheel accessibilityLabel="am or pm" value={pm ? 1 : 0} min={0} max={1} size={40} fmt={(n) => (n ? 'pm' : 'am')} onChange={(v) => setMin((h % 12 + (v ? 12 : 0)) * 60 + m)} />
      </Row>
      <Txt v="caption" style={{ textAlign: 'center', minHeight: 18 }}>{tooLate ? 'That time has not come yet. Pick a time up to now.' : ' '}</Txt>
      <Button kind="primary" label={saveLabel} disabled={tooLate} onPress={() => closeSheet(() => onSave(min))} />
      <Button kind="secondary" label={onCancel ? 'Back' : 'Cancel'} onPress={() => closeSheet(onCancel)} />
    </View>
  );
}
