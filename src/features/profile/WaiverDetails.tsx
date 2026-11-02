import React from 'react';
import { View } from 'react-native';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { SubPage } from '@/features/shell/parts';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { Signature } from '@/features/profile/Signature';
import { WaiverSheetBack1, WaiverSheetBack2, WaiverSheetFront, WAIVER_ART } from '@/features/profile/WaiverIllustration';
import { WAIVER_POINTS, WAIVER_TITLE, fmtSigned } from '@/features/profile/waiver';

type Sig = { signedAt: string; path: string; w: number; h: number };

// What the member signed, opened from Profile: the signed paper with their own signature, when they signed, and the points they agreed to.
export function WaiverDetails({ sig }: { sig: Sig }) {
  const { c } = useTheme();
  const width = 220;
  const s = width / WAIVER_ART.w;
  const sigW = 112 * s;
  const sigH = (sigW * sig.h) / sig.w;
  const fill = { position: 'absolute', left: 0, top: 0 } as const;
  return (
    <SubPage title="Waiver" fallback="/profile" gap={16}>
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 4 }}>
        <View style={{ width, height: WAIVER_ART.h * s, backgroundColor: 'transparent' }}>
          {/* the paper is white and the sheets behind it are faint, so it sits on a navy tile that works in both themes */}
          <View style={[fill, { width: width + 24, height: WAIVER_ART.h * s + 24, left: -12, top: -12, borderRadius: radii.xl, backgroundColor: fixed.dark }]} />
          <View style={fill}><WaiverSheetBack1 width={width} /></View>
          <View style={fill}><WaiverSheetBack2 width={width} /></View>
          <View style={fill}><WaiverSheetFront width={width} /></View>
          <View pointerEvents="none" style={{ position: 'absolute', left: 46 * s, top: 279 * s - sigH, width: sigW, height: sigH, transformOrigin: 'left bottom', transform: [{ rotate: '-5deg' }] } as any}>
            <Signature d={sig.path} w={sig.w} h={sig.h} color={fixed.dark} />
          </View>
        </View>
        <Row style={{ gap: 6, marginTop: 12 }}>
          <Chip label="Signed" tone="good" />
          <Chip label={fmtSigned(sig.signedAt)} />
        </Row>
      </View>
      <View style={{ gap: 8 }}>
        <Txt v="label" style={{ paddingHorizontal: 4 }}>{WAIVER_TITLE.toUpperCase()}</Txt>
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
      </View>
    </SubPage>
  );
}
