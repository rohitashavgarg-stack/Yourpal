import React from 'react';
import { ScrollView, View } from 'react-native';
import { Check } from '@/lib/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Pressy, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { HIST } from '@/features/plans/content';
import { HistSheet } from '@/features/plans/Sheets';
import { PageHeader } from '@/features/plans/parts';

export default function WorkoutHistory() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { openSheet } = useOverlay();
  const open = (i: number) => openSheet(<HistSheet h={HIST[i]} />, { label: 'Workout summary' });
  useScenarios({ title: 'Workout history', rows: [], actions: HIST.map((h, i) => ({ label: `Open ${h.t}`, run: () => open(i) })) }, []);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title="History" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 28, gap: 10 }}>
        <Card style={{ paddingVertical: 4, paddingHorizontal: 14 }}>
          {HIST.map((h, i) => (
            <Pressy key={h.t} accessibilityRole="button" accessibilityLabel={`${h.t}, ${h.s || 'Logged'}, ${h.m}. Open summary`} onPress={() => open(i)} scaleTo={0.985}
              style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, borderBottomWidth: i < HIST.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}>
                <Check size={16} strokeWidth={2.8} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Txt style={{ fontFamily: font.medium }}>{h.t}</Txt>
                <Txt v="caption">{h.s || 'Logged'}</Txt>
              </View>
              <Txt v="mono" muted>{h.m}</Txt>
            </Pressy>
          ))}
        </Card>
        <Txt muted style={{ fontSize: 13, textAlign: 'center' }}>Home or travel workouts count toward your streak.</Txt>
      </ScrollView>
    </View>
  );
}
