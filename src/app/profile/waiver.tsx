import React, { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PenLine } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { CheckCircle } from '@/design-system/primitives/CheckCircle';
import { SubPage, useShake } from '@/features/shell/parts';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { WAIVER_TITLE, WAIVER_POINTS } from '@/features/profile/waiver';
import { WaiverSigned } from '@/features/profile/WaiverSigned';
import { SignSheet } from '@/features/profile/SignSheet';

// Read the waiver, tick that you agree, then sign on the sign pad. Once signed this page turns into the signed screen.
export default function Waiver() {
  const { c } = useTheme();
  const { state } = useStore();
  const w = state.profile.waiver;
  const { openSheet } = useOverlay();
  const insets = useSafeAreaInsets();
  const [agree, setAgree] = useState(false);
  const [tries, setTries] = useState(0);
  const shake = useShake(tries);
  const toggle = () => { setAgree((v) => !v); haptic.tick(); };
  // Signing needs the tick. Tapping Sign without it shakes the tick row instead of doing nothing.
  const sign = () => {
    if (!agree) { setTries((n) => n + 1); return; }
    openSheet(<SignSheet />, { label: 'Sign here', fixed: true });
  };

  // Signed: the signed screen built from the designer's SVGs, with the member's own signature on the paper. Profile opens this every time.
  if (w) return <WaiverSigned sig={w} />;

  const bottom = Math.max(insets.bottom, 16) + 6;
  return (
    <SubPage title="Waiver" variant="progress" fallback="/profile"
      // The tick and the Sign button stay together at the bottom of the screen while the points scroll behind them.
      footer={(
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <LinearGradient pointerEvents="none" colors={[c.bg + '00', c.bg]} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
          <View pointerEvents="box-none" style={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: bottom, gap: 10 }}>
            <Animated.View style={shake}>
              <Pressy accessibilityRole="checkbox" accessibilityState={{ checked: agree }} accessibilityLabel="I have read and agree to the waiver" onPress={toggle} scaleTo={0.99}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 14, borderRadius: radii.lg, backgroundColor: c.surface, borderWidth: 1, borderColor: tries && !agree ? c.warn : c.line }}>
                <CheckCircle on={agree} size={28} tone="good" label="I agree" onPress={toggle} />
                <Txt style={{ flex: 1, fontFamily: font.medium }}>I have read and agree</Txt>
              </Pressy>
            </Animated.View>
            <Button kind={agree ? 'accent' : 'secondary'} label="Sign" icon={<PenLine size={18} color={agree ? c.accentInk : c.muted} />} onPress={sign}
              style={agree ? { shadowColor: fixed.black, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 } : undefined} />
          </View>
        </View>
      )}>
      <Row style={{ gap: 14, alignItems: 'center' }}>
        <View style={{ width: 52, height: 52, borderRadius: radii.lg, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <PenLine size={24} color={c.accentText} />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Txt v="title" style={{ fontSize: fontSizes.xl, lineHeight: 27 }}>{WAIVER_TITLE}</Txt>
          <Row style={{ gap: 6 }}>
            <Chip label="Pending" tone="warn" />
            <Chip label={`${WAIVER_POINTS.length} points`} />
          </Row>
        </View>
      </Row>
      <View style={{ borderRadius: radii.lg, backgroundColor: c.surface, overflow: 'hidden' }}>
        {WAIVER_POINTS.map((t, i) => (
          <Row key={i} style={{ gap: 12, alignItems: 'flex-start', padding: 16, borderBottomWidth: i === WAIVER_POINTS.length - 1 ? 0 : 1, borderBottomColor: c.line }}>
            <View style={{ width: 28, height: 28, borderRadius: radii.pill, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.accentText }}>{i + 1}</Txt>
            </View>
            <Txt style={{ flex: 1, fontSize: fontSizes.md, lineHeight: 22 }}>{t}</Txt>
          </Row>
        ))}
      </View>
      <View style={{ height: 170 }} />
    </SubPage>
  );
}
