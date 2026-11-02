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
    <Pressy accessibilityRole="button" accessibilityLabel="Your next assessment is due" onPress={open} scaleTo={0.98}
      style={{ alignSelf: 'stretch', borderRadius: radii.block, backgroundColor: c.accentSoft, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.accent + '2E', alignItems: 'center', justifyContent: 'center' }}><ClipboardCheck size={17} color={c.accentText} /></View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21, color: c.ink }}>Your next assessment is due</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.ink, opacity: 0.8 }}>It takes about 5 minutes. Once a month.</Txt>
        </View>
        <Button kind="primary" size="compact" label="Start" accessibilityLabel="Start the assessment" onPress={open} />
      </Row>
    </Pressy>
  );
}
