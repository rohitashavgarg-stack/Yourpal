import React from 'react';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { SubPage } from '@/features/shell/parts';
import { radii, fontSizes } from '@/design-system/tokens';
import { Signature } from '@/features/profile/Signature';
import { WAIVER_GYM, WAIVER_POINTS, fmtSigned } from '@/features/profile/waiver';

type Sig = { signedAt: string; path: string; w: number; h: number };

// What the member signed, opened from Profile: the gym, a Signed chip, their own signature with the date, then the points they agreed to.
export function WaiverDetails({ sig }: { sig: Sig }) {
  const { c } = useTheme();
  return (
    <SubPage title="Waiver" fallback="/profile" gap={16}
      // A soft tint from the top of the screen, like the other pages.
      backdrop={<TopGlow color={c.warn} />}>
      {/* The form icon first, then the big heading: the gym. The page title above already says "Waiver". */}
      <View style={{ gap: 12, paddingTop: 4 }}>
        <IconBadge size={64} radius={radii.lg} bg={c.surface} borderWidth={1} borderColor={c.line}><FileText size={32} strokeWidth={1.9} color={c.ink} /></IconBadge>
        <Txt accessibilityRole="header" v="display">{WAIVER_GYM}</Txt>
        <Row style={{ gap: 6 }}>
          <Chip label="Signed" tone="good" />
          <Chip label={fmtSigned(sig.signedAt)} />
        </Row>
      </View>
      <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 16, gap: 8 }}>
        <CardEdge radius={radii.lg} />
        <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Your signature</Txt>
        <View style={{ width: 220 }}><Signature d={sig.path} w={sig.w} h={sig.h} color={c.ink} /></View>
        <View style={{ height: 1.5, backgroundColor: c.chipLine }} />
      </View>
      <View style={{ gap: 8 }}>
        <Txt v="label" style={{ paddingHorizontal: 4 }}>WHAT YOU AGREED TO</Txt>
        <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, overflow: 'hidden' }}>
          <CardEdge radius={radii.lg} />
          {WAIVER_POINTS.map((t, i) => (
            <Row key={i} style={{ gap: 12, alignItems: 'flex-start', padding: 16, borderBottomWidth: i === WAIVER_POINTS.length - 1 ? 0 : 1, borderBottomColor: c.line }}>
              <View style={{ width: 28, height: 28, borderRadius: radii.pill, backgroundColor: c.surface3, alignItems: 'center', justifyContent: 'center' }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.ink }}>{i + 1}</Txt>
              </View>
              <Txt style={{ flex: 1, fontSize: fontSizes.md, lineHeight: 22 }}>{t}</Txt>
            </Row>
          ))}
        </View>
      </View>
    </SubPage>
  );
}
