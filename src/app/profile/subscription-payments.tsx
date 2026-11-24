import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
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

type Filter = 'All' | 'Paid' | 'Failed' | 'UPI' | 'Card';
const FILTERS: Filter[] = ['All', 'Paid', 'Failed', 'UPI', 'Card'];

// Every payment of one subscription, newest first, filtered by status and how it was paid.
export default function SubscriptionPayments() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const s = useSubscriptions().find((x) => x.id === id);
  const member = useMemberName();
  const [f, setF] = useState<Filter>('All');
  if (!s) return <SubPage title="Payment history" fallback="/profile/subscriptions"><Txt muted>This subscription is not here any more.</Txt></SubPage>;
  const list = s.payments.filter((p) => f === 'All' || p.status === f || p.method === f);
  return (
    <SubPage title="Payment history" fallback="/profile/subscriptions" backdrop={<TopGlow color={c.accent} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="radiogroup" contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0 }}>
        {FILTERS.map((o) => <Pill key={o} label={o} on={f === o} onPress={() => setF(o)} />)}
      </ScrollView>
      {list.length ? (
        <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, paddingHorizontal: 16, overflow: 'hidden' }}>
          <CardEdge radius={radii.lg} />
          {list.map((p, i) => <PaymentRow key={p.id} p={p} member={member} last={i === list.length - 1} />)}
        </View>
      ) : <Txt muted style={{ paddingHorizontal: 6, fontSize: fontSizes.md }}>No payments match these filters.</Txt>}
    </SubPage>
  );
}
