import React, { useState } from 'react';
import { Download } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Hint, SubPage } from '@/features/progress/parts';
import { LineRow, ListCard } from '@/features/shell/parts';
import { IconButton } from '@/design-system/primitives/Button';
import { Chip } from '@/design-system/primitives/Chip';
import { useMemberships } from '@/features/gym/memberships';
import { shareInvoice } from '@/features/reports/invoice';
import { rupees } from '@/features/reports/payments';
import type { Payment } from '@/features/reports/payments';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// "14 Oct 2025" as a number that sorts: the dates in the sample data are written this way.
const when = (d: string) => { const [day, mon, year] = d.split(' '); return Number(year) * 10000 + MON.indexOf(mon) * 100 + Number(day); };

// Every payment across all of the member's memberships: what is coming up first, then what has been paid, newest first, each with its invoice.
export default function AllPayments() {
  const { c } = useTheme();
  const { state } = useStore();
  const { toast } = useOverlay();
  const [busyId, setBusyId] = useState<string | null>(null);
  const ms = useMemberships();
  const upcoming = ms.filter((m) => m.next && m.status === 'Active').map((m) => ({ m, n: m.next! }));
  const paid = ms.flatMap((m) => m.payments.map((p) => ({ m, p }))).sort((a, b) => when(b.p.date) - when(a.p.date));

  const invoice = async (p: Payment) => {
    setBusyId(p.id);
    try {
      const ok = await shareInvoice(p, state.profile.name || 'Member');
      if (!ok) toast('Saving a file is not available on this phone');
    } catch { toast('Could not make the invoice. Try again'); }
    setBusyId(null);
  };

  const amount = (n: number) => <Txt style={{ fontFamily: font.semibold }}>{rupees(n)}</Txt>;
  return (
    <SubPage title="Payments" fallback="/profile">
      {upcoming.length > 0 && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>UPCOMING</Txt>
          <ListCard>
            {upcoming.map(({ m, n }, i) => (
              <LineRow key={m.id} title={n.item} sub={`${m.name}, due ${n.due}`} last={i === upcoming.length - 1}
                right={<Row style={{ gap: 10 }}>{amount(n.amount)}<Chip label="Upcoming" tone="warn" /></Row>} />
            ))}
          </ListCard>
        </>
      )}
      <Txt v="label" style={{ paddingHorizontal: 6 }}>PAID</Txt>
      {paid.length ? (
        <ListCard>
          {paid.map(({ m, p }, i) => (
            <LineRow key={p.id} title={p.item} sub={`${m.name}, ${p.date}`} last={i === paid.length - 1}
              right={(
                <Row style={{ gap: 10 }}>
                  {amount(p.amount)}
                  <IconButton label={'Download invoice for ' + p.item} onPress={() => invoice(p)} size={36} disabled={busyId === p.id}><Download size={18} color={c.ink} /></IconButton>
                </Row>
              )} />
          ))}
        </ListCard>
      ) : <Txt muted style={{ paddingHorizontal: 6 }}>No payments yet.</Txt>}
      <Hint>Payments are taken at the front desk. Each one has its invoice to download.</Hint>
    </SubPage>
  );
}
