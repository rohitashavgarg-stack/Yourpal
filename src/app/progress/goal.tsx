import React, { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { fade, fadeOut } from '@/theme/motion';
import { Button, Card, Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { GOAL_DEFAULT, GOAL_VERB, GOALS, NUMERIC_GOALS } from '@/features/progress/data';
import { StepBtn, SubPage } from '@/features/progress/parts';
import { useProgressScenarios } from '@/features/progress/scenarios';

export default function EditGoal() {
  const { c } = useTheme();
  const { d: dom, set } = useDomain();
  const { toast } = useOverlay();
  const [g, setG] = useState(dom.goal);
  useProgressScenarios('Edit goal', [
    { label: 'Draft target', options: ['Default', 'Big (20 kg)'], value: g.type === 'Weight loss' && g.target > 15 ? 'Big (20 kg)' : 'Default', onPick: (v) => setG({ ...g, type: 'Weight loss', target: v === 'Default' ? 6 : 20 }) },
  ], [], [g]);

  const numeric = NUMERIC_GOALS.includes(g.type);
  const st = g.type === 'Strength' ? 2.5 : 1;
  const byList = Array.from(new Set(['—', dom.goal.by, '15 Dec', '15 Mar', '15 Jun'].filter(Boolean)));
  const save = () => {
    set({ goal: g });
    haptic.success();
    router.back();
    toast('Goal saved · Coach Vikram notified');
  };
  return (
    <SubPage title="Edit goal" fallback="/progress">
      <View accessibilityRole="radiogroup" accessibilityLabel="Goal type" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {GOALS.map((x) => <Pill key={x} label={x} on={g.type === x} onPress={() => setG({ type: x, target: GOAL_DEFAULT[x] ?? 0, by: g.by })} />)}
      </View>
      <Card style={{ padding: 18, gap: 12 }}>
        <Txt v="label">Target</Txt>
        {numeric ? (
          <Row style={{ gap: 10 }}>
            <Txt style={{ flex: 1, fontFamily: font.medium }}>{GOAL_VERB[g.type]}</Txt>
            <StepBtn label="Lower target" sign="−" onPress={() => setG({ ...g, target: Math.max(st, Math.round((g.target - st) * 10) / 10) })} />
            <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.display, fontSize: 29, lineHeight: 38, minWidth: 90, textAlign: 'center' }}>{g.target}</Txt>
            <StepBtn label="Raise target" sign="+" onPress={() => setG({ ...g, target: Math.round((g.target + st) * 10) / 10 })} />
          </Row>
        ) : (
          <Txt muted style={{ fontSize: 14 }}>Measured with assessment tests (deep squat hold, sit-and-reach, shuttle run). Coach Vikram sets the targets with you.</Txt>
        )}
        {g.type === 'Weight loss' && g.target > 15 && (
          <Animated.View entering={fade()} exiting={fadeOut()} style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.warnSoft }}>
            <Txt style={{ fontSize: 13, color: c.warn }}>That’s a big target. Coach Vikram may suggest milestones on the way.</Txt>
          </Animated.View>
        )}
        <Txt v="label">By (optional)</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {byList.map((b) => <Pill key={b} label={b === '—' ? 'No date' : b} on={g.by === b} onPress={() => setG({ ...g, by: b })} />)}
        </View>
      </Card>
      <Txt v="caption" style={{ fontSize: 13, paddingHorizontal: 6 }}>Coach Vikram will be notified. Goals are per programme; quick trackers are shared.</Txt>
      <Button label="Save goal" onPress={save} />
      <Button kind="secondary" label="Also ask for a new plan" onPress={() => router.navigate('/plans')} />
    </SubPage>
  );
}
