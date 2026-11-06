import React, { useState } from 'react';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, PenLine } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { SubPage } from '@/features/shell/parts';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { WAIVER_GYM, WAIVER_POINTS } from '@/features/profile/waiver';
import { WaiverSigned } from '@/features/profile/WaiverSigned';
import { WaiverDetails } from '@/features/profile/WaiverDetails';
import { SignSheet } from '@/features/profile/SignSheet';

// Read the waiver, then tap Agree and sign to sign on the sign pad. Once signed this page turns into the signed screen.
export default function Waiver() {
  const { c } = useTheme();
  const { state } = useStore();
  const w = state.profile.waiver;
  const { openSheet } = useOverlay();
  const insets = useSafeAreaInsets();
  const [fresh] = useState(!w); // signed during this visit: the celebration. Opened later from Profile: what was signed.
  // One button: tapping it means "I have read and agree", and opens the sign pad.
  const sign = () => openSheet(<SignSheet />, { label: 'Sign here', fixed: true });

  // Just signed: the celebration screen. Opened again from Profile: the signed details (paper with the signature, the date and the points).
  if (w) return fresh ? <WaiverSigned sig={w} /> : <WaiverDetails sig={w} />;

  const bottom = Math.max(insets.bottom, 16) + 6;
  return (
    <SubPage title="Waiver" variant="progress" fallback="/profile"
      // A soft tint from the top of the screen, like the other pages.
      backdrop={<LinearGradient pointerEvents="none" colors={[c.accent + '40', c.accent + '14', c.accent + '00']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260 }} />}
      // The Agree and sign button stays at the bottom of the screen while the points scroll behind it.
      footer={(
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <LinearGradient pointerEvents="none" colors={[c.bg + '00', c.bg]} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
          <View pointerEvents="box-none" style={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: bottom, gap: 10 }}>
            <Button kind="accent" label="Agree and sign" accessibilityLabel="I have read the waiver. Agree and sign" icon={<PenLine size={18} color={c.accentInk} />} onPress={sign}
              style={{ shadowColor: fixed.black, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }} />
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
      <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, overflow: 'hidden' }}>
        <CardEdge radius={radii.lg} />
        {WAIVER_POINTS.map((t, i) => (
          <Row key={i} style={{ gap: 12, alignItems: 'flex-start', padding: 16, borderBottomWidth: i === WAIVER_POINTS.length - 1 ? 0 : 1, borderBottomColor: c.line }}>
            <View style={{ width: 28, height: 28, borderRadius: radii.pill, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.accentText }}>{i + 1}</Txt>
            </View>
            <Txt style={{ flex: 1, fontSize: fontSizes.md, lineHeight: 22 }}>{t}</Txt>
          </Row>
        ))}
      </View>
      <View style={{ height: 110 }} />
    </SubPage>
  );
}
