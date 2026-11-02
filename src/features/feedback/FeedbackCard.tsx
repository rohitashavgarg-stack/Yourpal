import React from 'react';
import { View } from 'react-native';
import { Star } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { FeedbackSheet } from '@/features/feedback/FeedbackSheet';

// Shown on Today when it is time to ask. Tapping opens the feedback sheet; "Maybe later" in the sheet asks again in a few days.
export function FeedbackCard() {
  const { c } = useTheme();
  const { openSheet } = useOverlay();
  const open = () => openSheet(<FeedbackSheet fromCard />, { label: 'Feedback' });
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="How is your gym going? Give feedback" onPress={open} scaleTo={0.98}
      style={{ alignSelf: 'stretch', borderRadius: radii.block, backgroundColor: c.accentSoft, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.accent + '2E', alignItems: 'center', justifyContent: 'center' }}><Star size={17} color={c.accentText} /></View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21, color: c.ink }}>How is your gym going?</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.ink, opacity: 0.8 }}>Rate it in a few taps.</Txt>
        </View>
        <Button kind="primary" size="compact" label="Rate" accessibilityLabel="Give feedback" onPress={open} />
      </Row>
    </Pressy>
  );
}
