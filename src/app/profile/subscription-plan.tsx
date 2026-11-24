import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Check } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { SubPage } from '@/design-system/primitives/SubPage';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';
import { PLANS, subStore } from '@/features/subscriptions/data';
import { rupees } from '@/features/reports/payments';
import { BuyPlanSheet, KindBadge, PlanPrice, useKindColors } from '@/features/subscriptions/plans';

// One plan the member can buy: what it is, the price, everything it includes, how it works, and one button to subscribe.
export default function SubscriptionPlan() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const p = PLANS.find((x) => x.id === id);
  const bought = subStore.use().bought.includes(id ?? '');
  const { openSheet } = useOverlay();
  const k = useKindColors(p?.kind ?? 'Fitness');
  if (!p) return <SubPage title="Plan" fallback="/profile/subscriptions"><Txt muted>This plan is not here any more.</Txt></SubPage>;
  const steps = [`You pay once for ${p.days} days.`, 'Your plan starts today and shows under Active.', 'Cancel any time. It keeps working till its end date.'];
  return (
    <SubPage title="Plan" fallback="/profile/subscriptions" backdrop={<TopGlow color={k.fg} />} floatingFooter
      footer={<Button label={bought ? 'You are subscribed' : `Subscribe for ${rupees(p.price)}`} disabled={bought} onPress={() => openSheet(<BuyPlanSheet p={p} />, { label: 'Review and pay' })} />}>
      <View style={{ gap: 10 }}>
        <Row style={{ gap: 12 }}>
          <KindBadge kind={p.kind} size={52} />
          <Txt style={{ fontFamily: font.medium, color: k.fg }}>{`${p.kind} plan`}</Txt>
        </Row>
        <Txt accessibilityRole="header" v="display" style={{ includeFontPadding: false }}>{p.name}</Txt>
        <Txt muted>{p.tagline}</Txt>
      </View>

      <PlanPrice p={p} big />

      <View style={{ height: 1, backgroundColor: c.line }} />

      <SectionLabel>What is included</SectionLabel>
      <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, paddingHorizontal: 16, paddingVertical: 14, gap: 12, overflow: 'hidden' }}>
        <CardEdge radius={radii.lg} />
        {p.benefits.map((b) => (
          <Row key={b} style={{ gap: 12 }}>
            <Check size={18} color={c.good} />
            <Txt style={{ flex: 1 }}>{b}</Txt>
          </Row>
        ))}
      </View>

      <SectionLabel>How it works</SectionLabel>
      <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, paddingHorizontal: 16, paddingVertical: 14, gap: 14, overflow: 'hidden' }}>
        <CardEdge radius={radii.lg} />
        {steps.map((t, i) => (
          <Row key={t} style={{ gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 28, height: 28, borderRadius: radii.pill, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20 }}>{String(i + 1)}</Txt>
            </View>
            <Txt style={{ flex: 1 }}>{t}</Txt>
          </Row>
        ))}
      </View>
    </SubPage>
  );
}
