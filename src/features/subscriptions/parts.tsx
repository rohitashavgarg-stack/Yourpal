import React, { useState } from 'react';
import { View } from 'react-native';
import { Download, LayoutGrid } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { shareInvoice } from '@/features/reports/invoice';
import { rupees } from '@/features/reports/payments';
import { haptic } from '@/lib/haptics';
import { Subscription, SubPayment, subStore } from '@/features/subscriptions/data';

/** The plan's status: Active is green, Expired and Cancelled are plain. Never red. */
export function SubStatus({ s }: { s: Subscription }) {
  return <Chip label={s.status} tone={s.status === 'Active' ? 'good' : 'default'} />;
}

/** Provider line: a small grid icon and the provider's name. */
export function ProviderLine({ name }: { name: string }) {
  const { c } = useTheme();
  return (
    <Row style={{ gap: 6 }}>
      <LayoutGrid size={14} color={c.muted} />
      <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, color: c.muted }}>{name}</Txt>
    </Row>
  );
}

/** One payment: when it was made, what it paid for, the amount, and its invoice (a failed payment has none and says so). */
export function PaymentRow({ p, last, member }: { p: SubPayment; last?: boolean; member: string }) {
  const { c } = useTheme();
  const { toast } = useOverlay();
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try { if (!(await shareInvoice(p, member))) toast('Saving a file is not available on this phone'); } catch { toast('Could not make the invoice. Try again'); }
    setBusy(false);
  };
  return (
    <View style={{ paddingVertical: 14, gap: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 23 }}>{`${p.date}, ${p.time}`}</Txt>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{`Subscription for ${p.period}`}</Txt>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl, lineHeight: 28 }}>{rupees(p.amount)}</Txt>
          {p.status === 'Failed' ? <Chip label="Failed" tone="warn" /> : null}
        </View>
      </Row>
      {p.status === 'Paid' ? (
        <Button kind="secondary" small label={busy ? 'Making your invoice' : 'Download invoice'} icon={<Download size={17} color={c.ink} />} disabled={busy} onPress={download} />
      ) : (
        <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Your bank did not take this payment. No invoice was made.</Txt>
      )}
    </View>
  );
}

/** Cancel an active plan: it keeps working until the date it is paid to, then moves to Past as Cancelled. */
export function CancelSubSheet({ s }: { s: Subscription }) {
  const { closeSheet, toast } = useOverlay();
  return (
    <>
      <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.5 }}>{`Cancel ${s.name}?`}</Txt>
      <Txt muted>{`It stays active until ${s.validTill}. After that it moves to Past and nothing more is charged.`}</Txt>
      <Button label="Cancel subscription" onPress={() => closeSheet(() => {
        subStore.set((x) => ({ cancelled: [...x.cancelled, s.id] }));
        haptic.medium();
        toast(`Cancelled. ${s.name} moved to Past`);
      })} />
      <Button kind="secondary" label="Keep subscription" onPress={() => closeSheet()} />
    </>
  );
}

export const useMemberName = () => useStore().state.profile.name || 'Member';
export const cardRadius = radii.lg;
