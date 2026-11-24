import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Txt } from '@/components/ui';
import { Pill } from '@/design-system/primitives/Pill';
import { useTheme } from '@/theme/ThemeProvider';
import { fontSizes, radii } from '@/design-system/tokens';
import { SubPage } from '@/design-system/primitives/SubPage';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { useSubscriptions } from '@/features/subscriptions/data';
import { PaymentRow, useMemberName } from '@/features/subscriptions/parts';

type Status = 'All' | 'Paid' | 'Failed';
type Method = 'All' | 'UPI' | 'Card';

// Every payment of one subscription, newest first, filtered by status and how it was paid.
export default function SubscriptionPayments() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const s = useSubscriptions().find((x) => x.id === id);
  const member = useMemberName();
  const [status, setStatus] = useState<Status>('All');
  const [method, setMethod] = useState<Method>('All');
  if (!s) return <SubPage title="Payment history" fallback="/profile/subscriptions"><Txt muted>This subscription is not here any more.</Txt></SubPage>;
  const list = s.payments.filter((p) => (status === 'All' || p.status === status) && (method === 'All' || p.method === method));
  const group = <T extends string>(label: string, opts: T[], v: T, set: (x: T) => void) => (
    <View style={{ gap: 8 }}>
      <Txt v="label" style={{ paddingHorizontal: 6 }}>{label}</Txt>
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {opts.map((o) => <Pill key={o} label={o} on={v === o} onPress={() => set(o)} />)}
      </View>
    </View>
  );
  return (
    <SubPage title="Payment history" fallback="/profile/subscriptions" backdrop={<TopGlow color={c.accent} />}>
      {group<Status>('STATUS', ['All', 'Paid', 'Failed'], status, setStatus)}
      {group<Method>('PAYMENT TYPE', ['All', 'UPI', 'Card'], method, setMethod)}
      {list.length ? (
        <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, paddingHorizontal: 16, overflow: 'hidden' }}>
          <CardEdge radius={radii.lg} />
          {list.map((p, i) => <PaymentRow key={p.id} p={p} member={member} last={i === list.length - 1} />)}
        </View>
      ) : <Txt muted style={{ paddingHorizontal: 6, fontSize: fontSizes.md }}>No payments match these filters.</Txt>}
    </SubPage>
  );
}
