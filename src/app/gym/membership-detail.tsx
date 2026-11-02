import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Download } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Hint, ListCard, SubPage } from '@/features/progress/parts';
import { LineRow, ListCard as PayList } from '@/features/shell/parts';
import { IconButton } from '@/design-system/primitives/Button';
import { useMemberships } from '@/features/gym/memberships';
import { StatusChip, TimeBar } from '@/app/gym/membership';
import { sharePdf } from '@/features/reports/pdf';
import { invoiceHtml } from '@/features/reports/templates';
import { rupees } from '@/features/reports/payments';
import type { Payment } from '@/features/reports/payments';
import { radii, fontSizes } from '@/design-system/tokens';

// One membership: its dates, its payments (each with an invoice to download), and what the app can and cannot do with it.
export default function MembershipDetail() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const m = useMemberships().find((x) => x.id === id);
  const { state } = useStore();
  const { toast } = useOverlay();
  const [busyId, setBusyId] = useState<string | null>(null);
  if (!m) return <SubPage title="Membership" fallback="/gym/membership"><Txt muted>This membership is not here any more.</Txt></SubPage>;

  const invoice = async (p: Payment) => {
    setBusyId(p.id);
    try {
      const html = invoiceHtml({ no: p.no, date: p.date, gym: 'Wulf Fitness', member: state.profile.name || 'Member', memberId: m.memberId, item: p.item, amount: rupees(p.amount), method: p.method });
      const ok = await sharePdf(html, 'Invoice ' + p.no);
      if (!ok) toast('Saving a file is not available on this phone');
    } catch { toast('Could not make the invoice. Try again'); }
    setBusyId(null);
  };

  return (
    <SubPage title={m.name} fallback="/gym/membership">
      <View style={{ borderRadius: radii.xl, backgroundColor: c.surface, padding: 18, gap: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg }}>{m.name}</Txt>
          <StatusChip m={m} />
        </Row>
        {m.status === 'Active' && <TimeBar pct={m.pct} warn={m.warn} />}
        <Txt style={{ fontSize: fontSizes.md, color: m.warn ? c.warn : c.muted }}>{m.note}</Txt>
      </View>
      <ListCard rows={[
        { l: 'Plan', v: m.name, muted: true }, { l: 'Member ID', v: m.memberId, muted: true },
        { l: 'Started', v: m.start, muted: true }, { l: m.status === 'Expired' ? 'Ended' : 'Ends', v: m.end, muted: true },
      ]} />
      <Txt v="label" style={{ paddingHorizontal: 6 }}>Payments</Txt>
      <PayList>
        {m.payments.map((p, i) => (
          <LineRow key={p.id} title={p.item} sub={p.date} last={i === m.payments.length - 1}
            right={(
              <Row style={{ gap: 10 }}>
                <Txt style={{ fontFamily: font.semibold }}>{rupees(p.amount)}</Txt>
                <IconButton label={'Download invoice for ' + p.item} onPress={() => invoice(p)} size={36} disabled={busyId === p.id}><Download size={18} color={c.ink} /></IconButton>
              </Row>
            )} />
        ))}
      </PayList>
      {m.status === 'Active' && (
        <PayList>
          <LineRow title="Pause this membership" sub="Request a break" last onPress={() => router.push('/gym/break')} />
        </PayList>
      )}
      <Hint>Renewals, freezes and plan changes happen at the front desk.</Hint>
    </SubPage>
  );
}
