import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, CalendarCheck, Check } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/shell/parts';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { Signature } from '@/features/profile/Signature';
import { WaiverSheetBack1, WaiverSheetBack2, WaiverSheetFront, WAIVER_ART } from '@/features/profile/WaiverIllustration';
import { WAIVER_GYM, WAIVER_POINTS, WAIVER_TITLE, fmtSigned } from '@/features/profile/waiver';

type Sig = { signedAt: string; path: string; w: number; h: number };

// What the member signed, opened from Profile. A navy card with the signed paper and their own signature, then the facts (gym, date, status),
// then the points they agreed to.
export function WaiverDetails({ sig }: { sig: Sig }) {
  const { c } = useTheme();
  const width = 232;
  const s = width / WAIVER_ART.w;
  const sigW = 112 * s;
  const sigH = (sigW * sig.h) / sig.w;
  const fill = { position: 'absolute', left: 0, top: 0 } as const;
  const facts = [
    { icon: <Building2 size={18} color={c.accentText} />, l: 'Gym', v: WAIVER_GYM },
    { icon: <CalendarCheck size={18} color={c.accentText} />, l: 'Signed on', v: fmtSigned(sig.signedAt) },
  ];
  return (
    <SubPage title="Waiver" fallback="/profile" gap={16}>
      <View style={{ borderRadius: radii.xl, overflow: 'hidden', backgroundColor: fixed.dark, alignItems: 'center', paddingTop: 26, paddingBottom: 22, gap: 18 }}>
        <LinearGradient pointerEvents="none" colors={[c.accent + '8C', fixed.dark]} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260 }} />
        <View style={{ width, height: WAIVER_ART.h * s }}>
          <View style={fill}><WaiverSheetBack1 width={width} /></View>
          <View style={fill}><WaiverSheetBack2 width={width} /></View>
          <View style={fill}><WaiverSheetFront width={width} /></View>
          <View pointerEvents="none" style={{ position: 'absolute', left: 46 * s, top: 279 * s - sigH, width: sigW, height: sigH, transformOrigin: 'left bottom', transform: [{ rotate: '-5deg' }] } as any}>
            <Signature d={sig.path} w={sig.w} h={sig.h} color={fixed.dark} />
          </View>
        </View>
        <Row style={{ gap: 6, height: 30, paddingHorizontal: 12, borderRadius: radii.pill, backgroundColor: c.good + '2E', alignItems: 'center' }}>
          <Check size={15} color={c.good} strokeWidth={2.6} />
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.good }}>Signed</Txt>
        </Row>
      </View>

      <View style={{ borderRadius: radii.lg, backgroundColor: c.surface, overflow: 'hidden' }}>
        {facts.map((f, i) => (
          <Row key={f.l} style={{ gap: 12, minHeight: 60, paddingHorizontal: 16, borderBottomWidth: i === facts.length - 1 ? 0 : 1, borderBottomColor: c.line }}>
            <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>{f.icon}</View>
            <Txt muted style={{ flex: 1 }}>{f.l}</Txt>
            <Txt style={{ fontFamily: font.semibold }}>{f.v}</Txt>
          </Row>
        ))}
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
