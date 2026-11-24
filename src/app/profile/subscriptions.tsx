import React from 'react';
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
import { PlanTab, Subscription, isPast, subStore, useAvailablePlans, useSubscriptions } from '@/features/subscriptions/data';
import { PlanCard } from '@/features/subscriptions/plans';
import { SubStatus } from '@/features/subscriptions/parts';

function SubCard({ s }: { s: Subscription }) {
  const { c } = useTheme();
  const open = (path: '/profile/subscription' | '/profile/subscription-payments') => () => router.push({ pathname: path, params: { id: s.id } });
  return (
    <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 16, gap: 12, overflow: 'hidden' }}>
      <CardEdge radius={radii.lg} />
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.5 }}>{s.name}</Txt>
          <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{`${s.months} ${s.months === 1 ? 'month' : 'months'}`}</Txt>
        </View>
        <SubStatus s={s} />
      </Row>
      {isPast(s)
        ? <Button kind="grey" label="View payments" onPress={open('/profile/subscription-payments')} />
        : <Button label="Manage" onPress={open('/profile/subscription')} />}
    </View>
  );
}

// Three tabs: the plans the member has (Active), the plans they can still buy (Available) and the ones that ended (Past). Not the gym membership: that is in Gym, Memberships.
export default function Subscriptions() {
  const { c } = useTheme();
  const all = useSubscriptions();
  const plans = useAvailablePlans();
  const tab = subStore.use().tab;
  const setTab = (t: PlanTab) => subStore.set({ tab: t });
  const list = all.filter((s) => (tab === 'Past') === isPast(s));
  const empty = (title: string, line: string, action?: React.ReactNode) => (
    <View style={{ padding: 24, borderRadius: radii.lg, backgroundColor: c.cardLift, alignItems: 'center', gap: 6, overflow: 'hidden' }}>
      <CardEdge radius={radii.lg} />
      <Txt style={{ fontFamily: font.semibold }}>{title}</Txt>
      <Txt muted style={{ textAlign: 'center' }}>{line}</Txt>
      {action ? <View style={{ alignSelf: 'stretch', marginTop: 8 }}>{action}</View> : null}
    </View>
  );
  return (
    <SubPage title="Subscriptions" fallback="/profile" backdrop={<TopGlow color={c.accent} />}>
      <Segmented accessibilityLabel="Subscriptions" value={tab} onChange={setTab} options={[{ value: 'Active' as PlanTab, label: 'Active' }, { value: 'Available' as PlanTab, label: 'Available' }, { value: 'Past' as PlanTab, label: 'Past' }]} />
      {tab === 'Available' ? (
        <>
          {plans.map((p) => <PlanCard key={p.id} p={p} />)}
          {!plans.length && empty('You have every plan', 'New plans show here when your provider adds them.')}
        </>
      ) : (
        <>
          {list.map((s) => <SubCard key={s.id} s={s} />)}
          {!list.length && (tab === 'Past'
            ? empty('No past subscriptions', 'Plans that end or are cancelled show here.')
            : empty('No active plans', 'Pick a plan for your goal and it starts at once.', <Button label="See available plans" onPress={() => setTab('Available')} />))}
        </>
      )}
      <Hint>Your gym membership is in Gym, Memberships.</Hint>
    </SubPage>
  );
}
