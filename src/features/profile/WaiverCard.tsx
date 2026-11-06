import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { PenLine } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { CardEdge } from '@/design-system/primitives/CardEdge';

// A member of a gym signs the gym's waiver once. Until then this card stays on Today.
export function useNeedsWaiver() {
  const { state } = useStore();
  const { d } = useDomain();
  return d.hasGym && !state.profile.waiver;
}

export function WaiverCard() {
  const { c } = useTheme();
  const open = () => router.push('/profile/waiver');
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Sign the gym waiver" onPress={open} scaleTo={0.98}
      style={{ alignSelf: 'stretch', borderRadius: radii.block, overflow: 'hidden', paddingVertical: 12, paddingHorizontal: 14 }}>
      {/* a warm yellow gradient fill and a 1 px gradient yellow stroke */}
      <LinearGradient pointerEvents="none" colors={[c.warn + '40', c.warn + '0D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <CardEdge radius={radii.block} from={c.warn + '66'} to={c.warn + '0A'} />
      <Row style={{ gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.warn + '2E', alignItems: 'center', justifyContent: 'center' }}><PenLine size={17} color={c.warn} /></View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21, color: c.ink }}>Sign your gym waiver</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.ink, opacity: 0.8 }}>It takes a minute.</Txt>
        </View>
        <Button kind="primary" size="compact" label="Sign" accessibilityLabel="Sign waiver" onPress={open} />
      </Row>
    </Pressy>
  );
}
