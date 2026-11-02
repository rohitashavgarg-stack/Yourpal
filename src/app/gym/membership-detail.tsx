import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CreditCard, Download } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Hint, SubPage } from '@/features/progress/parts';
import { LineRow, ListCard as PayList } from '@/features/shell/parts';
import { IconButton } from '@/design-system/primitives/Button';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { useMemberships } from '@/features/gym/memberships';
import { PAUSE_HISTORY, PAUSE_TOTAL } from '@/features/gym/data';
import { gymStore } from '@/features/gym/state';
import { StatusChip, TimeBar } from '@/app/gym/membership';
import { sharePdf } from '@/features/reports/pdf';
import { invoiceHtml } from '@/features/reports/templates';
import { rupees } from '@/features/reports/payments';
import type { Payment } from '@/features/reports/payments';
import { radii, fontSizes } from '@/design-system/tokens';

// One membership: its time left and dates, personal training sessions (if it has them), pauses (view only, the front desk sets them) and payments with invoices.
// Personal training and pauses are small rows in a list, not cards: the time left is the main thing on this page.
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
  const value = (t: string) => <Txt style={{ fontFamily: font.semibold }}>{t}</Txt>;

  return (
    <SubPage title="Membership" fallback="/gym/membership">
      {/* The icon first, then the big heading and the status. */}
      <View style={{ gap: 12, paddingTop: 4 }}>
        <IconBadge size={64} radius={radii.lg} bg={c.surface} borderWidth={1} borderColor={c.line}><CreditCard size={32} strokeWidth={1.9} color={c.accentText} /></IconBadge>
        <Row style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Txt accessibilityRole="header" v="display">{m.name}</Txt>
          <StatusChip m={m} />
        </Row>
      </View>

      {/* Time left in big numbers, the bar, and the two dates under it. Straight on the page, no card. */}
      <View style={{ gap: 14 }}>
        {m.status === 'Active' && (
          <Row style={{ alignItems: 'baseline', gap: 6 }}>
            <Txt style={{ fontFamily: font.displayBold, fontSize: 40, lineHeight: 52, letterSpacing: -1.2, color: m.warn ? c.warn : c.ink }}>{m.left.n}</Txt>
            <Txt muted>{m.left.unit}</Txt>
          </Row>
        )}
        {m.status === 'Active' && <TimeBar pct={m.pct} warn={m.warn} />}
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ gap: 1 }}>
            <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Started</Txt>
            <Txt style={{ fontFamily: font.semibold }}>{m.start}</Txt>
          </View>
          <View style={{ gap: 1, alignItems: 'flex-end' }}>
            <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{m.status === 'Expired' ? 'Ended' : 'Ends'}</Txt>
            <Txt style={{ fontFamily: font.semibold }}>{m.end}</Txt>
          </View>
        </Row>
        {m.status !== 'Active' && <Txt muted style={{ fontSize: fontSizes.md }}>{m.note}</Txt>}
      </View>

      <View style={{ height: 1, backgroundColor: c.line }} />

      {(m.pt || showPauses) && (
        <PayList>
          {m.pt && <LineRow title="Personal training" sub={m.pt.trainer} right={value(`${m.pt.left} of ${m.pt.total} sessions left`)} last={!showPauses} />}
          {showPauses && <LineRow title="Pauses" sub="Set by the front desk" right={value(`${left} of ${PAUSE_TOTAL} left`)} last={history.length === 0} />}
          {history.map((h, i) => <LineRow key={h.from} title={`${h.from} – ${h.to}`} sub={h.reason} right={<Txt muted>{`${h.days} days`}</Txt>} minH={52} last={i === history.length - 1} />)}
        </PayList>
      )}

      <Txt v="label" style={{ paddingHorizontal: 6 }}>PAYMENTS</Txt>
      <PayList>
        {m.payments.map((p, i) => (
          <LineRow key={p.id} title={p.item} sub={p.date} last={i === m.payments.length - 1}
            right={(
              <Row style={{ gap: 10 }}>
                {value(rupees(p.amount))}
                <IconButton label={'Download invoice for ' + p.item} onPress={() => invoice(p)} size={36} disabled={busyId === p.id}><Download size={18} color={c.ink} /></IconButton>
              </Row>
            )} />
        ))}
      </PayList>
      <Hint>Pauses, renewals and plan changes happen at the front desk.</Hint>
    </SubPage>
  );
}
