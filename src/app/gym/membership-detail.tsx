import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CreditCard, Download, PauseCircle } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Hint, SubPage } from '@/features/progress/parts';
import { LineRow, ListCard as PayList } from '@/features/shell/parts';
import { IconButton } from '@/design-system/primitives/Button';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { Chip } from '@/design-system/primitives/Chip';
import { useMemberships } from '@/features/gym/memberships';
import { PAUSE_HISTORY, PAUSE_TOTAL } from '@/features/gym/data';
import { dateLabel, gymStore } from '@/features/gym/state';
import { useDomain } from '@/lib/domain';
import { StatusDot } from '@/design-system/primitives/StatusDot';
import { StatusChip, TimeBar } from '@/app/gym/membership';
import { sharePdf } from '@/features/reports/pdf';
import { invoiceHtml } from '@/features/reports/templates';
import { rupees } from '@/features/reports/payments';
import type { Payment } from '@/features/reports/payments';
import { radii, fontSizes } from '@/design-system/tokens';

// A row of dots: one for each session or pause. The ones still to come are blue, the ones already used are grey.
function Dots({ total, left, size = 10 }: { total: number; left: number; size?: number }) {
  const { c } = useTheme();
  return (
    <View accessible accessibilityLabel={`${left} of ${total} left`} style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
      {Array.from({ length: total }, (_, i) => <StatusDot key={i} size={size} color={i < total - left ? c.surface3 : c.accent} />)}
    </View>
  );
}

// "14 to 27 Jul" when both dates are in one month.
const range = (from: string, to: string) => {
  const [d1, m1] = from.split(' ');
  const [d2, m2] = to.split(' ');
  return m1 === m2 ? `${d1} to ${d2} ${m2}` : `${from} to ${to}`;
};

// One pause as its own small card: a pause icon, the dates, the reason and how many days. The one on right now is amber.
function PauseCard({ title, sub, days, warn }: { title: string; sub: string; days?: number; warn?: boolean }) {
  const { c } = useTheme();
  return (
    <Row style={{ gap: 12, padding: 14, borderRadius: radii.lg, backgroundColor: warn ? c.warnSoft : c.surface }}>
      <View style={{ width: 40, height: 40, borderRadius: radii.md, backgroundColor: warn ? c.warn + '2E' : c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <PauseCircle size={20} color={warn ? c.warn : c.accentText} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Txt style={{ fontFamily: font.semibold, color: warn ? c.warn : c.ink }}>{title}</Txt>
        <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{sub}</Txt>
      </View>
      {days != null && <Chip label={`${days} days`} />}
    </Row>
  );
}

// One membership: its time left and dates, personal training sessions (if it has them), pauses (view only, the front desk sets them) and payments with invoices.
// Personal training and pauses are small rows in a list, not cards: the time left is the main thing on this page.
export default function MembershipDetail() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const m = useMemberships().find((x) => x.id === id);
  const { state } = useStore();
  const g = gymStore.use();
  const { d } = useDomain();
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
  const paused = m.id === 'm1' && d.onBreak;

  return (
    <SubPage title="Membership" fallback="/gym/membership">
      {/* The icon first, then the big heading and the status. */}
      <View style={{ gap: 12, paddingTop: 4 }}>
        <IconBadge size={64} radius={radii.lg} bg={c.surface} borderWidth={1} borderColor={c.line}><CreditCard size={32} strokeWidth={1.9} color={c.accentText} /></IconBadge>
        <Row style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Txt accessibilityRole="header" v="display" style={{ includeFontPadding: false }}>{m.name}</Txt>
          {/* the big text's line box is taller than its letters, so the chip is nudged down to sit on the middle of the letters */}
          <View style={{ marginTop: 4 }}><StatusChip m={m} /></View>
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

      {/* Each part has its own heading and its own list, like Payments. */}
      <Txt v="label" style={{ paddingHorizontal: 6 }}>DETAILS</Txt>
      <PayList>
        <LineRow title="Price" right={value(rupees(m.price))} last />
      </PayList>

      {m.pt && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>PERSONAL TRAINING</Txt>
          <View style={{ borderRadius: radii.lg, backgroundColor: c.surface, padding: 16, gap: 14 }}>
            <View style={{ gap: 1 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base }}>{m.pt.trainer}</Txt>
              <Txt v="caption">Personal trainer</Txt>
            </View>
            {/* one dot for each session, six to a row: blue for the ones still to come, grey for the ones used. The count sits beside them. */}
            <Row style={{ gap: 16, alignItems: 'center' }}>
              <View style={{ width: 6 * 18 + 5 * 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {Array.from({ length: m.pt.total }, (_, i) => <StatusDot key={i} size={18} color={i < m.pt!.total - m.pt!.left ? c.surface3 : c.accent} />)}
              </View>
              <View accessible accessibilityLabel={`${m.pt.left} of ${m.pt.total} sessions left`} style={{ flex: 1, alignItems: 'flex-end' }}>
                <Txt style={{ fontFamily: font.displayBold, fontSize: 40, lineHeight: 48, letterSpacing: -1.2 }}>{m.pt.left}</Txt>
                <Txt muted style={{ fontSize: fontSizes.sm }}>{`of ${m.pt.total} left`}</Txt>
              </View>
            </Row>
          </View>
        </>
      )}

      {showPauses && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>PAUSES</Txt>
          <View style={{ gap: 8 }}>
            {paused && <PauseCard warn title={`Paused until ${dateLabel(g.breakUntil)}`} sub="Your end date moves out by the paused days" />}
            <PayList>
              <LineRow title="Pauses left" right={<Row style={{ gap: 10 }}><Dots total={PAUSE_TOTAL} left={left} size={14} />{value(`${left} of ${PAUSE_TOTAL}`)}</Row>} last />
            </PayList>
            {history.map((h) => <PauseCard key={h.from} title={range(h.from, h.to)} sub={h.reason} days={h.days} />)}
          </View>
        </>
      )}

      <Txt v="label" style={{ paddingHorizontal: 6 }}>PAYMENTS</Txt>
      <PayList>
        {m.next && (
          <LineRow title={m.next.item} sub={`Due ${m.next.due}`} last={m.payments.length === 0}
            right={<Row style={{ gap: 10 }}>{value(rupees(m.next.amount))}<Chip label="Upcoming" tone="warn" /></Row>} />
        )}
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
