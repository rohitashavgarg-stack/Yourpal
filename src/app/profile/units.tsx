import React from 'react';
import { View } from 'react-native';
import { Pill, Row } from '@/components/ui';
import { useScenarios } from '@/lib/store';
import { Label, Note, SubPage } from '@/features/shell/parts';
import { useShell } from '@/features/shell/state';

export default function Units() {
  const { s, set } = useShell();
  useScenarios({
    title: 'Units & detail',
    rows: [
      { label: 'Weight', options: ['kg', 'lb'], value: s.unitsW, onPick: (v) => set({ unitsW: v as any }) },
      { label: 'Diet detail level', options: ['Simple', 'Detailed'], value: s.detail, onPick: (v) => set({ detail: v as any }) },
    ],
  }, [s.unitsW, s.detail]);

  const groups = [
    { l: 'Weight', opts: ['kg', 'lb'], v: s.unitsW, pick: (v: string) => set({ unitsW: v as any }) },
    { l: 'Length', opts: ['cm', 'in'], v: s.unitsL, pick: (v: string) => set({ unitsL: v as any }) },
    { l: 'Diet detail level', opts: ['Simple', 'Detailed'], v: s.detail, pick: (v: string) => set({ detail: v as any }) },
  ];
  return (
    <SubPage title="Units & detail" fallback="/profile" gap={16}>
      {groups.map((g) => (
        <View key={g.l} style={{ gap: 6 }} accessibilityRole="radiogroup" accessibilityLabel={g.l}>
          <Label>{g.l}</Label>
          <Row style={{ gap: 8 }}>
            {g.opts.map((o) => <Pill key={o} label={o} on={g.v === o} onPress={() => g.pick(o)} style={{ flex: 1 }} />)}
          </Row>
        </View>
      ))}
      <Note style={{ fontSize: 13 }}>Simple shows calories and protein only. Detailed adds carbs, fat and micronutrients.</Note>
      <Note style={{ fontSize: 13 }}>Equipment can override weight units (e.g. a machine labelled in lb).</Note>
    </SubPage>
  );
}
