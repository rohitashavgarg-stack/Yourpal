import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Field, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { CheckCircle } from '@/design-system/primitives/CheckCircle';
import { goBack, Label, SubPage } from '@/features/shell/parts';
import { radii, fontSizes } from '@/design-system/tokens';
import { WAIVER_TITLE, WAIVER_POINTS, fmtSigned } from '@/features/profile/waiver';

// The gym's waiver: read it, tick that you agree, type your full name as your signature. Once signed it shows as Completed with the date.
export default function Waiver() {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const { toast } = useOverlay();
  const w = state.profile.waiver;
  const [agree, setAgree] = useState(false);
  const [name, setName] = useState(state.profile.name);
  const ok = agree && name.trim().length >= 2;
  const sign = () => {
    if (!ok) return;
    setProfile({ waiver: { name: name.trim(), signedAt: new Date().toISOString() } });
    haptic.success();
    goBack('/profile');
    toast('Waiver signed');
  };
  return (
    <SubPage title="Waiver" fallback="/profile" footer={w ? undefined : <Button kind="accent" label="Sign waiver" disabled={!ok} onPress={sign} />}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="title" style={{ fontSize: fontSizes.xl, lineHeight: 27, flex: 1 }}>{WAIVER_TITLE}</Txt>
        <Chip label={w ? 'Completed' : 'Pending'} tone={w ? 'good' : 'warn'} />
      </Row>
      <View style={{ borderRadius: radii.lg, backgroundColor: c.surface, padding: 16, gap: 12 }}>
        {WAIVER_POINTS.map((t, i) => (
          <Row key={i} style={{ gap: 10, alignItems: 'flex-start' }}>
            <Txt style={{ fontFamily: font.semibold, color: c.accentText, width: 18 }}>{i + 1}</Txt>
            <Txt style={{ flex: 1, fontSize: fontSizes.md, lineHeight: 21 }}>{t}</Txt>
          </Row>
        ))}
      </View>
      {w ? (
        <View style={{ borderRadius: radii.lg, backgroundColor: c.goodSoft, padding: 16, gap: 2 }}>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Signed by</Txt>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{w.name}</Txt>
          <Txt muted style={{ fontSize: fontSizes.md }}>{fmtSigned(w.signedAt)}</Txt>
        </View>
      ) : (
        <>
          <Pressy accessibilityRole="checkbox" accessibilityState={{ checked: agree }} accessibilityLabel="I have read and agree to the waiver" onPress={() => { setAgree((v) => !v); haptic.tick(); }} scaleTo={0.99}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 14, borderRadius: radii.lg, backgroundColor: c.surface }}>
            <CheckCircle on={agree} size={28} tone="good" label="I agree" onPress={() => { setAgree((v) => !v); haptic.tick(); }} />
            <Txt style={{ flex: 1 }}>I have read and agree</Txt>
          </Pressy>
          <Label>Type your full name to sign</Label>
          <View style={{ marginTop: -6 }}>
            <Field value={name} onChangeText={setName} accessibilityLabel="Your full name as signature" autoCapitalize="words" returnKeyType="done" />
          </View>
        </>
      )}
    </SubPage>
  );
}
