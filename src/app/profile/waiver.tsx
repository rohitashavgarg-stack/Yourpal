import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, PenLine } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { CheckCircle } from '@/design-system/primitives/CheckCircle';
import { Label, SubPage } from '@/features/shell/parts';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { WAIVER_TITLE, WAIVER_POINTS, fmtSigned } from '@/features/profile/waiver';
import { Signature } from '@/features/profile/Signature';
import { SignSheet } from '@/features/profile/SignSheet';

function Points() {
  const { c } = useTheme();
  return (
    <View style={{ borderRadius: radii.lg, backgroundColor: c.surface, padding: 16, gap: 12 }}>
      {WAIVER_POINTS.map((t, i) => (
        <Row key={i} style={{ gap: 10, alignItems: 'flex-start' }}>
          <Txt style={{ fontFamily: font.semibold, color: c.accentText, width: 18 }}>{i + 1}</Txt>
          <Txt style={{ flex: 1, fontSize: fontSizes.md, lineHeight: 21 }}>{t}</Txt>
        </Row>
      ))}
    </View>
  );
}

// Read the waiver, tick that you agree, then sign on the sign pad. Once signed this page turns into the signed screen.
export default function Waiver() {
  const { c } = useTheme();
  const { state } = useStore();
  const w = state.profile.waiver;
  const { openSheet } = useOverlay();
  const insets = useSafeAreaInsets();
  const [agree, setAgree] = useState(false);
  const toggle = () => { setAgree((v) => !v); haptic.tick(); };

  if (w) {
    return (
      <SubPage title="Waiver" fallback="/profile" gap={16}>
        <View style={{ alignItems: 'center', gap: 8, paddingTop: 8 }}>
          <View style={{ width: 72, height: 72, borderRadius: radii.pill, backgroundColor: c.goodSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Check size={34} color={c.good} strokeWidth={2.4} />
          </View>
          <Txt v="title" style={{ fontSize: fontSizes.xl2, lineHeight: 29 }}>Waiver signed</Txt>
          <Txt muted style={{ fontSize: fontSizes.md }}>{fmtSigned(w.signedAt)}</Txt>
        </View>
        <View style={{ borderRadius: radii.lg, backgroundColor: c.surface, padding: 16, gap: 8 }}>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Your signature</Txt>
          <Signature d={w.path} w={w.w} h={w.h} color={c.ink} />
        </View>
        <Label>{WAIVER_TITLE}</Label>
        <View style={{ marginTop: -6 }}><Points /></View>
      </SubPage>
    );
  }

  // Not signed yet: the Sign button floats over the page near the bottom and stays there while it scrolls. It opens the sign pad as a sheet.
  return (
    <SubPage title="Waiver" variant="progress" fallback="/profile"
      footer={(
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 16) + 6 }}>
          <Button kind="accent" label="Sign" icon={<PenLine size={18} color={c.accentInk} />} disabled={!agree} onPress={() => openSheet(<SignSheet />, { label: 'Sign here' })}
            style={{ shadowColor: fixed.black, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }} />
        </View>
      )}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="title" style={{ fontSize: fontSizes.xl, lineHeight: 27, flex: 1 }}>{WAIVER_TITLE}</Txt>
        <Chip label="Pending" tone="warn" />
      </Row>
      <Points />
      <Pressy accessibilityRole="checkbox" accessibilityState={{ checked: agree }} accessibilityLabel="I have read and agree to the waiver" onPress={toggle} scaleTo={0.99}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 14, borderRadius: radii.lg, backgroundColor: c.surface }}>
        <CheckCircle on={agree} size={28} tone="good" label="I agree" onPress={toggle} />
        <Txt style={{ flex: 1 }}>I have read and agree</Txt>
      </Pressy>
      <View style={{ height: 64 }} />
    </SubPage>
  );
}
