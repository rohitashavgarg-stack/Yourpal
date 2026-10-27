import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Row, Txt } from '@/components/ui';
import { Check, Dumbbell } from '@/lib/icons';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { fmtT } from '@/lib/data';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { AmountStepper } from '@/design-system/primitives/AmountStepper';
import { SheetFooter } from '@/design-system/primitives/Sheet';
import { Pressy } from '@/components/ui';
import { DAYL, dateOf, dayPlan, usePlans } from './store';

// Log a workout for a day that has gone by: tick what you did, say when you started and how long it took. Sample data: it is kept in the app's state.
const minutesOf = (t?: string) => {
  const m = (t ?? '6:30 pm').match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!m) return 18 * 60 + 30;
  return (Number(m[1]) % 12 + (m[3].toLowerCase() === 'pm' ? 12 : 0)) * 60 + Number(m[2]);
};

export function LogPastWorkoutSheet({ day, week }: { day: number; week: number }) {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { p } = usePlans();
  const { closeSheet, toast } = useOverlay();
  const plan = dayPlan(d, { ...p, week }, day);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [start, setStart] = useState(() => minutesOf(plan?.time));
  const [took, setTook] = useState(45);
  if (!plan) return null;
  const key = `${week}:${day}`;
  const label = `${DAYL[day]} ${dateOf(day, week)}`;
  const flip = (id: string) => { haptic.tick(); setSkipped((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])); };
  const done = plan.ex.length - skipped.length;
  const save = () => {
    if (done === 0) return;
    haptic.success();
    const prev = d.pastLogs;
    set({ pastLogs: { ...prev, [key]: { a: start, b: start + took, skip: skipped } } });
    closeSheet(() => toast(`${plan.name} logged for ${label}`, { undo: () => set({ pastLogs: prev }) }));
  };
  return (
    <View style={{ gap: 14, paddingBottom: 8 }}>
      <View style={{ gap: 2 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.4 }}>{`Log ${plan.name}`}</Txt>
        <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{label}</Txt>
      </View>

      <View style={{ gap: 8 }}>
        <Txt v="label">What you did</Txt>
        <View style={{ gap: 6 }}>
          {plan.ex.map((e) => {
            const off = skipped.includes(e.id);
            return (
              <Pressy key={e.id} accessibilityRole="checkbox" accessibilityState={{ checked: !off }} accessibilityLabel={`${e.name}. ${off ? 'Not done' : 'Done'}`} onPress={() => flip(e.id)} scaleTo={0.985}
                style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: c.surface2 }}>
                <View style={{ width: 24, height: 24, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: off ? 'transparent' : c.good, borderWidth: off ? 1.5 : 0, borderColor: c.chipLine }}>
                  {!off && <Check size={14} color={c.bg} strokeWidth={3} />}
                </View>
                <Txt style={{ flex: 1, fontFamily: font.medium, opacity: off ? 0.5 : 1, textDecorationLine: off ? 'line-through' : 'none' }}>{e.name}</Txt>
              </Pressy>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="label">Started</Txt>
          <AmountStepper text={fmtT(start).full} unit="min" onLess={() => setStart((s) => Math.max(5 * 60, s - 15))} onMore={() => setStart((s) => Math.min(22 * 60, s + 15))} lessDisabled={start <= 5 * 60} moreDisabled={start >= 22 * 60} accessibilityLabel="Start time" />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="label">It took</Txt>
          <AmountStepper text={`${took} min`} unit="min" onLess={() => setTook((t) => Math.max(10, t - 5))} onMore={() => setTook((t) => Math.min(180, t + 5))} lessDisabled={took <= 10} moreDisabled={took >= 180} accessibilityLabel="Duration" />
        </Row>
      </View>

      <SheetFooter><Button kind="accent" label="Save workout" icon={<Dumbbell size={18} color={c.accentInk} />} disabled={done === 0} onPress={save} /></SheetFooter>
    </View>
  );
}
