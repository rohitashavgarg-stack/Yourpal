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
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { radii, fontSizes, fixed } from '@/design-system/tokens';

export default function WorkoutHistory() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { openSheet } = useOverlay();
  const open = (i: number) => openSheet(<HistSheet h={HIST[i]} />, { label: 'Workout summary' });
  useScenarios({ title: 'Workout history', rows: [], actions: HIST.map((h, i) => ({ label: `Open ${h.t}`, run: () => open(i) })) }, []);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title="History" />
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 32, gap: 16 }}>
        <Card style={{ paddingVertical: 8, paddingHorizontal: 18 }}>
          {HIST.map((h, i) => (
            <Pressy key={h.t} accessibilityRole="button" accessibilityLabel={`${h.t}, ${h.s || 'Logged'}, ${h.m}. Open summary`} onPress={() => open(i)} scaleTo={0.985}
              style={{ minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 2, borderBottomWidth: i < HIST.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
              <IconBadge size={40} radius={radii.md} bg={c.good}>
                <Check size={16} strokeWidth={2.8} color={fixed.white} />
              </IconBadge>
              <View style={{ flex: 1, gap: 3 }}>
                {/* the date small and above, the workout's name bigger */}
                <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{h.t.split(' · ')[0]}</Txt>
                <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{h.t.split(' · ').slice(1).join(' · ') || h.t}</Txt>
                <Txt v="caption">{h.s || 'Logged'}</Txt>
              </View>
              <Txt v="mono" muted>{h.m}</Txt>
            </Pressy>
          ))}
        </Card>
        <Txt muted style={{ fontSize: fontSizes.sm, textAlign: 'center' }}>Home or travel workouts count toward your streak.</Txt>
      </ScrollView>
    </View>
  );
}
