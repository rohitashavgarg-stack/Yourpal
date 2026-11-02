import React, { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, PenLine } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { CheckCircle } from '@/design-system/primitives/CheckCircle';
import { SubPage, useShake } from '@/features/shell/parts';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { WAIVER_GYM, WAIVER_POINTS } from '@/features/profile/waiver';
import { WaiverSigned } from '@/features/profile/WaiverSigned';
import { WaiverDetails } from '@/features/profile/WaiverDetails';
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
  const [fresh] = useState(!w); // signed during this visit: the celebration. Opened later from Profile: what was signed.
  const shake = useShake(tries);
  const toggle = () => { setAgree((v) => !v); haptic.tick(); };
  // Signing needs the tick. Tapping Sign without it shakes the tick row instead of doing nothing.
  const sign = () => {
    if (!agree) { setTries((n) => n + 1); return; }
    openSheet(<SignSheet />, { label: 'Sign here', fixed: true });
  };

  // Just signed: the celebration screen. Opened again from Profile: the signed details (paper with the signature, the date and the points).
  if (w) return fresh ? <WaiverSigned sig={w} /> : <WaiverDetails sig={w} />;

  const bottom = Math.max(insets.bottom, 16) + 6;
  return (
    <SubPage title="Waiver" variant="progress" fallback="/profile"
      // A soft tint from the top of the screen, like the other pages.
      backdrop={<LinearGradient pointerEvents="none" colors={[c.accent + '40', c.accent + '14', c.accent + '00']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260 }} />}
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
      {/* The form icon first, then the big heading: the gym. The page title above already says "Waiver". */}
      <View style={{ gap: 12, paddingTop: 4 }}>
        <IconBadge size={64} radius={radii.lg} bg={c.surface} borderWidth={1} borderColor={c.line}><FileText size={32} strokeWidth={1.9} color={c.accentText} /></IconBadge>
        <Txt accessibilityRole="header" v="display">{WAIVER_GYM}</Txt>
        <Row style={{ gap: 6 }}>
          <Chip label="Pending" tone="warn" />
          <Chip label={`${WAIVER_POINTS.length} points`} />
        </Row>
      </View>
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
