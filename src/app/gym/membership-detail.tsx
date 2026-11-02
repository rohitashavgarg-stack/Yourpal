import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Download } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { GrowBar, Hint, ListCard, SubPage } from '@/features/progress/parts';
import { LineRow, ListCard as PayList } from '@/features/shell/parts';
import { IconButton } from '@/design-system/primitives/Button';
import { Card } from '@/design-system/primitives/Card';
import { useMemberships } from '@/features/gym/memberships';
import { PAUSE_HISTORY, PAUSE_TOTAL } from '@/features/gym/data';
import { gymStore } from '@/features/gym/state';
import { StatusChip, TimeBar } from '@/app/gym/membership';
import { sharePdf } from '@/features/reports/pdf';
import { invoiceHtml } from '@/features/reports/templates';
import { rupees } from '@/features/reports/payments';
import type { Payment } from '@/features/reports/payments';
import { radii, fontSizes } from '@/design-system/tokens';

// One membership: its dates, personal training sessions (if it has them), pauses (view only, the front desk sets them) and payments with invoices.
export default function MembershipDetail() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const m = useMemberships().find((x) => x.id === id);
  const { state } = useStore();
  const g = gymStore.use();
  const { toast } = useOverlay();
  const [busyId, setBusyId] = useState<string | null>(null);
  if (!m) return <SubPage title="Membership" fallback="/gym/membership"><Txt muted>This membership is not here any more.</Txt></SubPage>;

  const invoice = async (p: Payment) => {
    setBusyId(p.id);
    try {
      const html = invoiceHtml({ no: p.no, date: p.date, gym: 'Wulf Fitness', member: state.profile.name || 'Member', item: p.item, amount: rupees(p.amount), method: p.method });
      const ok = await sharePdf(html, 'Invoice ' + p.no);
      if (!ok) toast('Saving a file is not available on this phone');
    } catch { toast('Could not make the invoice. Try again'); }
    setBusyId(null);
  };

  // Pauses: the main plan reads the real count; the others have none in the sample.
  const used = m.id === 'm1' ? Math.min(g.pausesUsed, PAUSE_TOTAL) : 0;
  const left = PAUSE_TOTAL - used;
  const history = PAUSE_HISTORY.slice(0, used);
  const showPauses = m.status !== 'Expired';

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
        { l: 'Started', v: m.start, muted: true }, { l: m.status === 'Expired' ? 'Ended' : 'Ends', v: m.end, muted: true },
      ]} />

      {m.pt && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>PERSONAL TRAINING</Txt>
          <Card variant="roomy" gap={10}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt style={{ fontFamily: font.semibold }}>{m.pt.trainer}</Txt>
              <Tag label="Trainer" bg={c.accentSoft} fg={c.accentText} />
            </Row>
            <Row style={{ alignItems: 'baseline', gap: 6 }}>
              <Txt style={{ fontFamily: font.displayBold, fontSize: 40, lineHeight: 52, letterSpacing: -1.2 }}>{m.pt.left}</Txt>
              <Txt muted>{`of ${m.pt.total} sessions left`}</Txt>
            </Row>
            <GrowBar pct={Math.round((m.pt.left / m.pt.total) * 100)} color={c.accent} />
          </Card>
        </>
      )}

      {showPauses && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>PAUSES</Txt>
          <Card variant="roomy" gap={10}>
            <Row style={{ alignItems: 'baseline', gap: 6 }}>
              <Txt style={{ fontFamily: font.displayBold, fontSize: 40, lineHeight: 52, letterSpacing: -1.2 }}>{left}</Txt>
              <Txt muted>{`of ${PAUSE_TOTAL} pauses left`}</Txt>
            </Row>
            <GrowBar pct={Math.round((left / PAUSE_TOTAL) * 100)} color={c.accent} />
            {history.length === 0 ? <Txt muted style={{ fontSize: fontSizes.md }}>No pauses yet.</Txt> : history.map((h) => (
              <Row key={h.from} style={{ justifyContent: 'space-between' }}>
                <View style={{ gap: 1 }}>
                  <Txt style={{ fontFamily: font.medium }}>{h.from} – {h.to}</Txt>
                  <Txt v="caption">{h.reason}</Txt>
                </View>
                <Tag label={`${h.days} days`} bg={c.accentSoft} fg={c.accentText} />
              </Row>
            ))}
          </Card>
        </>
      )}

      <Txt v="label" style={{ paddingHorizontal: 6 }}>PAYMENTS</Txt>
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
      <Hint>Pauses, renewals and plan changes happen at the front desk.</Hint>
    </SubPage>
  );
}
