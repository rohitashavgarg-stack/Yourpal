import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ClipboardCheck } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';

// The monthly nudge on Today. It opens the self assessment; the flow's first screen has "Maybe later".
export function SelfAssessCard() {
  const { c } = useTheme();
  const open = () => router.push('/gym/self-assessment');
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Time for your monthly check-in. Do a self assessment" onPress={open} scaleTo={0.98}
      style={{ alignSelf: 'stretch', borderRadius: radii.block, backgroundColor: c.accentSoft, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.accent + '2E', alignItems: 'center', justifyContent: 'center' }}><ClipboardCheck size={17} color={c.accentText} /></View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21, color: c.ink }}>Time for your monthly check-in</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.ink, opacity: 0.8 }}>A self assessment takes about 5 minutes.</Txt>
        </View>
        <Button kind="primary" size="compact" label="Start" accessibilityLabel="Start self assessment" onPress={open} />
      </Row>
    </Pressy>
  );
}
