import React from 'react';
import { View } from 'react-native';
import { CalendarClock } from '@/lib/icons';
import { Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Card } from '@/design-system/primitives/Card';
import { radii, fontSizes } from '@/design-system/tokens';

// Today when no workout or diet plan is assigned: one calm card that says what happens next and what the member can do meanwhile.
export function NoPlanCard() {
  const { c } = useTheme();
  return (
    <Card variant="tight" flat accessible accessibilityLabel="No plan assigned yet. Your coach shares your workout and diet plan after your assessment. Until then, track your weight, water and Health data." gap={12} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><CalendarClock size={19} color={c.accentText} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>No plan assigned yet</Txt>
        <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>Your coach shares your workout and diet plan after your assessment. Until then, track your weight, water and Health data here.</Txt>
      </View>
    </Card>
  );
}
