import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheck, Download, TriangleAlert } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { SubPage } from '@/design-system/primitives/SubPage';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { rupees } from '@/features/reports/payments';
import { shareInvoice } from '@/features/reports/invoice';
import { PLANS, dateText, subStore, useSubscriptions } from '@/features/subscriptions/data';
import { BuyPlanSheet } from '@/features/subscriptions/plans';
import { useMemberName } from '@/features/subscriptions/parts';

const Title = ({ children }: { children: string }) => (
  <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl3Plus, lineHeight: 37, letterSpacing: -1.1, textAlign: 'center' }}>{children}</Txt>
);

// The result of paying for a plan. Payment successful: the plan is active, with what was paid. Payment failed: nothing was taken, and the next step is one tap.
// Opens from the bottom with a close button, like the other task pages.
export default function SubscriptionPay() {
  const { c } = useTheme();
  const { id, status, method } = useLocalSearchParams<{ id?: string; status?: string; method?: string }>();
  const p = PLANS.find((x) => x.id === id);
  const sub = useSubscriptions().find((x) => x.id === 'b-' + id);
  const { openSheet, toast } = useOverlay();
  const member = useMemberName();
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());
  if (!p) return <SubPage title="Payment" close fallback="/profile/subscriptions"><Txt muted>This plan is not here any more.</Txt></SubPage>;
  const ok = status === 'ok';
  // after a reload the purchase is gone from memory: still say when the plan ends
  const till = sub?.validTill ?? dateText(new Date(now + p.days * 86400000));
  const toPlans = () => { subStore.set({ tab: 'Active' }); router.dismissTo('/profile/subscriptions'); };
  const invoice = async () => {
    const pay = sub?.payments[0];
    if (!pay) return;
    setBusy(true);
    try { if (!(await shareInvoice(pay, member))) toast('Saving a file is not available on this phone'); } catch { toast('Could not make the invoice. Try again'); }
    setBusy(false);
  };
  const row = (l: string, v: string, last?: boolean) => (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      <Txt muted>{l}</Txt>
      <Txt style={{ fontFamily: font.semibold }}>{v}</Txt>
    </Row>
  );

  return (
    <SubPage title="Payment" close fallback="/profile/subscriptions" backdrop={<TopGlow color={ok ? c.good : c.warn} />} floatingFooter
      footer={ok ? (
        <View style={{ gap: 10 }}>
          <Button label="See my plans" onPress={toPlans} />
          <Button kind="secondary" label={busy ? 'Making your invoice' : 'Download invoice'} icon={<Download size={17} color={c.ink} />} disabled={busy} onPress={invoice} />
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <Button label="Try again" onPress={() => openSheet(<BuyPlanSheet p={p} />, { label: 'Review and pay' })} />
          <Button kind="secondary" label="Cancel" onPress={toPlans} />
        </View>
      )}>
      <View style={{ alignItems: 'center', gap: 14, paddingTop: 36 }}>
        {ok ? <CircleCheck size={72} strokeWidth={1.6} color={c.good} /> : <TriangleAlert size={72} strokeWidth={1.6} color={c.warn} />}
        <Title>{ok ? 'Payment successful' : 'Payment failed'}</Title>
        <Txt muted style={{ textAlign: 'center', maxWidth: 300 }}>
          {ok ? `${p.name} is active till ${till}. You can use it now.` : 'Your bank did not take the payment, and no money was taken. Try again or pay another way.'}
        </Txt>
      </View>

      <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, paddingHorizontal: 16, marginTop: 12, overflow: 'hidden' }}>
        <CardEdge radius={radii.lg} />
        {row('Plan', p.name)}
        {row('Amount', rupees(p.price))}
        {row('Paid with', method === 'Card' ? 'Card' : 'UPI')}
        {ok && sub ? row('Invoice', sub.payments[0].no, true) : row('Date', dateText(new Date(now)), true)}
      </View>
    </SubPage>
  );
}
