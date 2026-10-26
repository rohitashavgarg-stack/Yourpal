import React from 'react';
import { View } from 'react-native';
import { Phone } from '@/lib/icons';
import { Button, Card, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Hint, ListCard, SubPage } from '@/features/progress/parts';
import { membershipView } from '@/features/gym/data';
import { useGymScenarios } from '@/features/gym/state';
import { radii, fontSizes } from '@/design-system/tokens';
import { Callout } from '@/design-system/primitives/Callout';
import { FadeIn } from '@/design-system/primitives/FadeIn';

export default function Membership() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { toast } = useOverlay();
  useGymScenarios('Gym · Membership');
  const M = membershipView(d.membership, c);
  const call = () => {
    toast("Calling Wulf Fitness front desk…");
  };
  return (
    <SubPage title="Membership" fallback="/gym">
      <FadeIn key={d.membership} style={{ padding: 18, borderRadius: radii.xl, backgroundColor: M.rbg, gap: 4, borderWidth: d.membership === 'Active' ? 1 : 0, borderColor: c.line }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, color: M.rfg }}>{M.rt}</Txt>
        <Txt style={{ fontSize: fontSizes.md, color: M.rfg }}>{M.rs}</Txt>
      </FadeIn>
      <ListCard rows={[
        { l: 'Plan', v: 'Annual', muted: true }, { l: 'Member ID', v: 'GLD-4821', muted: true }, { l: 'Started', v: '14 Oct 2025', muted: true },
        { l: 'Ends', v: M.ends, muted: true }, { l: 'Branch', v: 'Vaishali Nagar', muted: true },
      ]} />
      <Card style={{ padding: 18, gap: 4 }}>
        <Txt v="label">Your last quarter</Txt>
        <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 33 }}>42 workouts · 3 PRs · ↓2.1 kg</Txt>
      </Card>
      <Txt v="label" style={{ paddingHorizontal: 6 }}>Payment history</Txt>
      <ListCard style={{ marginTop: -6 }} rows={[
        { l: 'Annual membership', sub: '14 Oct 2025 · paid at front desk', v: '[AMOUNT]' },
        { l: 'Joining fee', sub: '14 Oct 2025', v: '[AMOUNT]' },
      ]} />
      <Callout size="lg" gap={10}>
        <Txt style={{ fontFamily: font.semibold }}>Renewals and freezes happen at the front desk</Txt>
        <Txt muted style={{ fontSize: fontSizes.md }}>The app shows your membership but can’t renew or pause it. The front desk can renew, freeze or change your plan.</Txt>
        <Button label="Call front desk" icon={<Phone size={18} color={c.bg} />} onPress={call} style={{ height: 48, borderRadius: radii.card }} />
      </Callout>
      <Hint>When it ends, your history stays visible and logging pauses until you renew.</Hint>
    </SubPage>
  );
}
