import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, CalendarDays, Check } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { SubPage } from '@/design-system/primitives/SubPage';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';
import { rupees } from '@/features/reports/payments';
import { isPast, useSubscriptions } from '@/features/subscriptions/data';
import { CancelSubSheet, PaymentRow, SubStatus, useMemberName } from '@/features/subscriptions/parts';

// One subscription: what it is, what it includes, its latest payments with invoices, and cancelling.
export default function SubscriptionDetail() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const s = useSubscriptions().find((x) => x.id === id);
  const { openSheet } = useOverlay();
  const member = useMemberName();
  if (!s) return <SubPage title="Subscription" fallback="/profile/subscriptions"><Txt muted>This subscription is not here any more.</Txt></SubPage>;
  const card = { borderRadius: radii.lg, backgroundColor: c.cardLift, paddingHorizontal: 16, overflow: 'hidden' as const };
  return (
    <SubPage title="Subscription" fallback="/profile/subscriptions" backdrop={<TopGlow color={c.accent} />}>
      <View style={{ gap: 6 }}>
        <Row style={{ gap: 10, flexWrap: 'wrap' }}>
          <Txt accessibilityRole="header" v="display" style={{ includeFontPadding: false }}>{s.name}</Txt>
          <View style={{ marginTop: 4 }}><SubStatus s={s} /></View>
        </Row>
        <Row style={{ gap: 6 }}>
          <CalendarDays size={16} color={c.muted} />
          <Txt muted>{`${isPast(s) ? 'Ended' : 'Valid till'} ${s.validTill}`}</Txt>
        </Row>
      </View>
      <Row style={{ alignItems: 'baseline', gap: 6 }}>
        <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl5, lineHeight: 44, letterSpacing: -1 }}>{rupees(s.price)}</Txt>
        <Txt muted>per month</Txt>
      </Row>

      <View style={{ height: 1, backgroundColor: c.line }} />

      <SectionLabel>Benefits</SectionLabel>
      <View style={{ ...card, paddingVertical: 14, gap: 12 }}>
        <CardEdge radius={radii.lg} />
        {s.benefits.map((b) => (
          <Row key={b} style={{ gap: 12 }}>
            <Check size={18} color={c.good} />
            <Txt style={{ flex: 1 }}>{b}</Txt>
          </Row>
        ))}
      </View>

      <Row style={{ justifyContent: 'space-between' }}>
        <SectionLabel>Payment history</SectionLabel>
        <Button kind="secondary" small label="View all" iconAfter={<ArrowRight size={16} color={c.ink} />} onPress={() => router.push({ pathname: '/profile/subscription-payments', params: { id: s.id } })} />
      </Row>
      <View style={card}>
        <CardEdge radius={radii.lg} />
        {s.payments.slice(0, 4).map((p, i, a) => <PaymentRow key={p.id} p={p} member={member} last={i === a.length - 1} />)}
      </View>

      {!isPast(s) && <Button kind="secondary" label="Cancel subscription" onPress={() => openSheet(<CancelSubSheet s={s} />, { label: 'Cancel subscription' })} />}
    </SubPage>
  );
}
