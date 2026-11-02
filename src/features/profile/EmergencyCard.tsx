import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Phone } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';

// A gym member must have someone the gym can call. Until one is added this card stays on Today; it cannot be crossed away.
export function useNeedsEmergency() {
  const { state } = useStore();
  const { d } = useDomain();
  return d.hasGym && !state.profile.emergency;
}

export function EmergencyCard() {
  const { c } = useTheme();
  const open = () => router.push('/profile/emergency' as any);
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Add an emergency contact. Your gym needs someone to call if you need help." onPress={open} scaleTo={0.98}
      style={{ alignSelf: 'stretch', borderRadius: radii.block, backgroundColor: c.warnSoft, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.warn + '2E', alignItems: 'center', justifyContent: 'center' }}><Phone size={17} color={c.warn} /></View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21, color: c.ink }}>Add an emergency contact</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.ink, opacity: 0.8 }}>Someone your gym can call if you need help.</Txt>
        </View>
        <Button small kind="secondary" label="Add" accessibilityLabel="Add emergency contact" onPress={open} />
      </Row>
    </Pressy>
  );
}
