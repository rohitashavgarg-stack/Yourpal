import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Field, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';

type F = { key: string; label: string; unit?: string; ph: string; min?: number; max?: number; text?: boolean };

// Generic "type a value and save" sheet for metrics that have no tracker of their own (sample data: nothing is stored).
export function ManualLogSheet({ title, hint, fields, done }: { title: string; hint?: string; fields: F[]; done: string }) {
  const { closeSheet, toast } = useOverlay();
  const [v, setV] = useState<Record<string, string>>({});
  const bad = (f: F) => {
    const t = (v[f.key] ?? '').trim();
    if (f.text || !t) return false;
    const n = parseFloat(t.replace(',', '.'));
    return !isFinite(n) || n < (f.min ?? 0) || n > (f.max ?? 9999);
  };
  const filled = fields.some((f) => (v[f.key] ?? '').trim());
  const ok = filled && !fields.some(bad);
  const save = () => { if (!ok) return; haptic.success(); closeSheet(() => toast(done)); };
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: 24, lineHeight: 32, letterSpacing: -0.5 }}>{title}</Txt>
      {fields.map((f) => (
        <View key={f.key} style={{ gap: 6 }}>
          <Txt v="label">{f.label}</Txt>
          <Field value={v[f.key] ?? ''} onChangeText={(t) => setV((x) => ({ ...x, [f.key]: t }))} placeholder={f.ph} keyboardType={f.text ? 'default' : 'decimal-pad'} accessibilityLabel={f.label} error={bad(f)} />
          {bad(f) && <Txt style={{ fontSize: 13, lineHeight: 19, color: '#C4610E' }}>{`Enter ${f.min ?? 0} to ${f.max}${f.unit ? ' ' + f.unit : ''}`}</Txt>}
        </View>
      ))}
      {hint ? <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{hint}</Txt> : null}
      <Button kind="accent" label="Save" disabled={!ok} onPress={save} />
    </View>
  );
}

export const LOG_SHEETS: Record<'hr' | 'sleep' | 'meas' | 'cons', { button: string; props: Parameters<typeof ManualLogSheet>[0] }> = {
  hr: { button: 'Log heart rate', props: { title: 'Resting heart rate', fields: [{ key: 'bpm', label: 'Beats per minute', unit: 'bpm', ph: 'e.g. 64', min: 30, max: 220 }], hint: 'Best measured after sitting still for a few minutes.', done: 'Heart rate logged' } },
  sleep: { button: 'Log sleep', props: { title: 'Last night’s sleep', fields: [{ key: 'h', label: 'Hours', unit: 'h', ph: 'e.g. 7', min: 0, max: 16 }, { key: 'm', label: 'Minutes', unit: 'min', ph: 'e.g. 30', min: 0, max: 59 }], done: 'Sleep logged' } },
  meas: { button: 'Log measurements', props: { title: 'Measurements', fields: [{ key: 'w', label: 'Waist', unit: 'cm', ph: 'e.g. 89', min: 40, max: 200 }, { key: 'c', label: 'Chest', unit: 'cm', ph: 'e.g. 98', min: 40, max: 200 }, { key: 'a', label: 'Arm', unit: 'cm', ph: 'e.g. 32', min: 15, max: 80 }], hint: 'Fill in only what you measured today.', done: 'Measurements logged' } },
  cons: { button: 'Log a workout from outside', props: { title: 'Workout outside the gym', fields: [{ key: 't', label: 'What did you do?', ph: 'e.g. Football, run, yoga', text: true }, { key: 'min', label: 'Minutes', unit: 'min', ph: 'e.g. 45', min: 1, max: 300 }], done: 'Workout logged' } },
};
