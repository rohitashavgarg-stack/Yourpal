import React from 'react';
import { router } from 'expo-router';
import { useDomain } from '@/lib/domain';
import { Banner } from '@/design-system/patterns/Banner';

// Membership is view-only in the app: this only tells the member what is going on and points to the membership page.
// One card design for the membership everywhere (the Today banner and the Gym tab card), full card width:
// title = what is happening, line = what it means, act = what to do, as quiet info text on its own line (it is not a button). Never "text · text" in one line.
// When the membership has ended, logging and the other member features pause, and the card says so.
// once: a one-time notice (it is ending or has ended): the member can cross it away. A paused membership is never dismissible: it stays at the top.
type Notice = { icon: 'clock' | 'pause' | 'ok'; tone: 'warn' | 'plain'; title: string; line: string; act?: string; once?: boolean };
const ACT = 'Renew at Wulf Fitness reception.';

export function useMembershipNotice(): Notice {
  const { d } = useDomain();
  switch (d.membership) {
    case 'Expiring': return { icon: 'clock', tone: 'warn', once: true, title: 'Membership ends in 12 days', line: 'Expires on 6 Oct.', act: ACT };
    case 'Expired': return { icon: 'pause', tone: 'warn', title: 'Membership expired', line: 'Logging and other features are paused. Your history is safe.', act: ACT };
    default: return { icon: 'ok', tone: 'plain', title: 'Annual plan is active', line: 'Expires on 14 Oct 2027.', act: 'Renew early at Wulf Fitness reception.' };
  }
}

// Today only shows it when something needs attention.
export function usePaymentNotice() {
  const { d } = useDomain();
  const n = useMembershipNotice();
  // only an ended membership gets the strip (it stays at the top); "ends in 12 days" is a card in the updates stack
  if (!d.hasGym || d.membership !== 'Expired') return null;
  return n;
}

// The two looks of the account banner are one pattern (src/design-system/patterns/Banner.tsx). These feed it.
export function MembershipCard({ n }: { n: Notice }) {
  return <Banner variant="card" icon={n.icon} tone={n.tone} title={n.title} line={n.line} act={n.act} onPress={() => router.push('/gym/membership')} />;
}

// The strip at the top of Today: edge to edge under the header, the title and one sentence on the left, "View plan" on the right.
// (The "what to do" line stays on the Gym tab card; the strip only says what is happening and what it means.)
export function PaymentBanner() {
  const { d, set } = useDomain();
  const n = usePaymentNotice();
  if (!n) return null;
  const cross = () => set((x) => ({ dismissed: { ...x.dismissed, ['membership-' + d.membership]: true } }));
  return <Banner variant="strip" icon={n.icon} tone={n.tone} title={n.title} line={n.line} once={n.once} onPress={() => router.push('/gym/membership')} onDismiss={cross} />;
}
