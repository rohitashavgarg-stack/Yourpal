import React from 'react';
import { PersonAvatar } from '@/components/Brand';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fade } from '@/theme/motion';
import { Button, Card, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { TODAY_IDX } from '@/lib/data';
import { useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { applyCoachUpdate, COACH_CHANGES, COACH_HL } from '@/features/plans/content';
import { Highlight, InfoBox, PageHeader } from '@/features/plans/parts';
import { setP, usePlans } from '@/features/plans/store';

export default function WhatChanged() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { p } = usePlans();
  const mid = p.mid || !!d.session;

  useScenarios({
    title: 'What changed',
    rows: [{ label: 'Mid-workout when the update arrives', options: ['Off', 'On'], value: p.mid ? 'On' : 'Off', onPick: (v) => setP({ mid: v === 'On' }) }],
  }, [p.mid]);

  const gotIt = () => {
    haptic.success();
    if (!p.applied) set((s) => ({ plans: applyCoachUpdate(s.plans) }));
    set({ planReq: 'none', coachUpdated: true });
    setP({ applied: true, hl: COACH_HL, day: TODAY_IDX, week: 0, seg: 'workout' });
    router.back();
  };
  const tone = (t: string) => (t === 'Added' ? { bg: c.goodSoft, fg: c.good } : t === 'Removed' ? { bg: c.surface2, fg: c.muted } : { bg: c.accentSoft, fg: c.accentText });

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title="What changed" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 28, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}><PersonAvatar who="coach" size={28} /><Txt v="label">Coach Vikram · today</Txt></View>
        <Card style={{ paddingVertical: 6, paddingHorizontal: 14 }}>
          {COACH_CHANGES.map((ch, i) => {
            const t = tone(ch.tag);
            return (
              <Highlight key={ch.name} on delay={i * 150}>
                <View accessible accessibilityLabel={`${ch.tag}: ${ch.name}, ${ch.meta}`} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 64, gap: 12, paddingHorizontal: 4, borderBottomWidth: i < COACH_CHANGES.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                  <Tag label={ch.tag} bg={t.bg} fg={t.fg} style={{ alignSelf: 'center' }} />
                  <Txt style={{ flex: 1, fontFamily: font.medium }}>{ch.name}</Txt>
                  <Txt v="mono" muted style={{ fontSize: 12 }}>{ch.meta}</Txt>
                </View>
              </Highlight>
            );
          })}
        </Card>
        <InfoBox tone="plain">Your earlier edits were replaced by Coach's new version. You can edit again.</InfoBox>
        {mid && (
          <Animated.View entering={fade()}>
            <InfoBox tone="warn">You're mid-workout. These changes start from your next session, so today's workout stays as it is.</InfoBox>
          </Animated.View>
        )}
        <Button label="Got it" onPress={gotIt} />
      </ScrollView>
    </View>
  );
}
