import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useDomain } from '@/lib/domain';
import { haptic } from '@/lib/haptics';
import { fontSizes } from '@/design-system/tokens';
import { Range, TODAY, trend } from '@/features/progress/trends';
import { useStreak } from '@/features/streak/useStreak';
import { sharePdf } from '@/features/reports/pdf';
import { reportHtml } from '@/features/reports/templates';

const RANGES: { value: Range; label: string }[] = [{ value: 'week', label: 'This week' }, { value: 'month', label: 'This month' }, { value: 'year', label: 'This year' }];
const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const nums = (a: (number | null)[]) => a.filter((v): v is number => v != null);

// "Progress report": pick the time, download a PDF with the goal, attendance and measurements for it.
export function ReportSheet() {
  const { d } = useDomain();
  const { state } = useStore();
  const st = useStreak();
  const { closeSheet, toast } = useOverlay();
  const [range, setRange] = useState<Range>('month');
  const [busy, setBusy] = useState(false);

  const make = async () => {
    setBusy(true);
    try {
      const live = { weight: d.weight, water: d.water };
      const tw = trend('weight', range, TODAY, live);
      const w = nums(tw.vals);
      const water = nums(trend('water', range, TODAY, live).vals);
      const diff = w.length ? w[w.length - 1] - w[0] : 0;
      const html = reportHtml({
        member: state.profile.name || 'Member',
        gym: 'Wulf Fitness',
        period: `${fmt(tw.win.start)} to ${fmt(tw.win.end)}`,
        made: fmt(new Date()),
        goal: d.goal.type,
        goalBy: d.goal.by,
        weight: w.length ? { start: `${w[0].toFixed(1)} kg`, now: `${w[w.length - 1].toFixed(1)} kg`, change: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg` } : null,
        water: water.length ? `${(water.reduce((a, b) => a + b, 0) / water.length).toFixed(1)} L` : null,
        workouts: { weekDone: st.weekDone, target: st.target, weeks: st.weeks, logged: Object.keys(d.pastLogs).length },
      });
      const ok = await sharePdf(html, 'Progress report');
      haptic.success();
      closeSheet(() => { if (!ok) toast('Saving a file is not available on this phone'); });
    } catch {
      setBusy(false);
      toast('Could not make the report. Try again');
    }
  };

  return (
    <View style={{ gap: 14, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: fontSizes.xl2, lineHeight: 29 }}>Progress report</Txt>
      <Row style={{ gap: 6 }}>
        {RANGES.map((r) => <Pill key={r.value} label={r.label} on={range === r.value} onPress={() => { setRange(r.value); haptic.tick(); }} style={{ flex: 1, paddingHorizontal: 0 }} />)}
      </Row>
      <Txt muted style={{ fontSize: fontSizes.md }}>Your goal, attendance and measurements as a PDF.</Txt>
      <Button kind="accent" label={busy ? 'Making your report' : 'Download PDF'} disabled={busy} onPress={make} />
    </View>
  );
}
