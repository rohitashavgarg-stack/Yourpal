import React, { useState } from 'react';
import { Download } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Hint, SubPage } from '@/features/progress/parts';
import { LineRow, ListCard } from '@/features/shell/parts';
import { Chip } from '@/design-system/primitives/Chip';
import { useMemberships } from '@/features/gym/memberships';
import { shareStatement } from '@/features/reports/invoice';
import { rupees } from '@/features/reports/payments';

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

  // one download for every payment, not one for each
  const download = async () => {
    setBusyId('all');
    try {
      const ok = await shareStatement(paid.map((x) => x.p), state.profile.name || 'Member', 'All memberships');
      if (!ok) toast('Saving a file is not available on this phone');
    } catch { toast('Could not make the PDF. Try again'); }
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
              right={amount(p.amount)} />
          ))}
        </ListCard>
      ) : <Txt muted style={{ paddingHorizontal: 6 }}>No payments yet.</Txt>}
      {paid.length > 0 && <Button kind="secondary" small label={busyId === 'all' ? 'Making your PDF' : 'Download all payments'} icon={<Download size={17} color={c.ink} />} disabled={busyId === 'all'} onPress={download} />}
      <Hint>Payments are taken at the front desk. One download has all of them.</Hint>
    </SubPage>
  );
}
