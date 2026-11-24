import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Segmented, Txt } from '@/components/ui';
import { Row } from '@/design-system/primitives/Row';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';
import { SubPage } from '@/design-system/primitives/SubPage';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { Hint } from '@/features/progress/parts';
import { Subscription, isPast, useSubscriptions } from '@/features/subscriptions/data';
import { SubStatus } from '@/features/subscriptions/parts';

type Tab = 'Active' | 'Past';

function SubCard({ s }: { s: Subscription }) {
  const { c } = useTheme();
  const open = (path: '/profile/subscription' | '/profile/subscription-payments') => () => router.push({ pathname: path, params: { id: s.id } });
  return (
    <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 16, gap: 12, overflow: 'hidden' }}>
      <CardEdge radius={radii.lg} />
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.5 }}>{s.name}</Txt>
          <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{`${s.months} months`}</Txt>
        </View>
        <SubStatus s={s} />
      </Row>
      {isPast(s)
        ? <Button kind="grey" label="View payments" onPress={open('/profile/subscription-payments')} />
        : <Button label="Manage" onPress={open('/profile/subscription')} />}
    </View>
  );
}

// The plans the member bought from a provider, Active first and Past after. Not the gym membership: that is in Gym, Memberships.
export default function Subscriptions() {
  const { c } = useTheme();
  const all = useSubscriptions();
  const [tab, setTab] = useState<Tab>('Active');
  const list = all.filter((s) => (tab === 'Past') === isPast(s));
  return (
    <SubPage title="Subscriptions" fallback="/profile" backdrop={<TopGlow color={c.accent} />}>
      <Segmented accessibilityLabel="Subscriptions" value={tab} onChange={setTab} options={[{ value: 'Active' as Tab, label: 'Active' }, { value: 'Past' as Tab, label: 'Past' }]} />
      {list.map((s) => <SubCard key={s.id} s={s} />)}
      {!list.length && (
        <View style={{ padding: 24, borderRadius: radii.lg, backgroundColor: c.cardLift, alignItems: 'center', gap: 4 }}>
          <CardEdge radius={radii.lg} />
          <Txt style={{ fontFamily: font.semibold }}>{tab === 'Past' ? 'No past subscriptions' : 'No subscription plans yet'}</Txt>
          <Txt muted style={{ textAlign: 'center' }}>{tab === 'Past' ? 'Plans that end or are cancelled show here.' : 'Your provider adds a plan here when you buy one. For help, ask Contact us in Profile.'}</Txt>
        </View>
      )}
      <Hint>Your gym membership is in Gym, Memberships.</Hint>
    </SubPage>
  );
}
