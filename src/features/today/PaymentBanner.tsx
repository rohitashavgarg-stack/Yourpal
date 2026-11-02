import React from 'react';
import { router } from 'expo-router';
import { useDomain } from '@/lib/domain';
import { membershipState, useMembershipState, useMemberships } from '@/features/gym/memberships';
import { Banner } from '@/design-system/patterns/Banner';

// Membership is view-only in the app: this only tells the member what is going on and points to the membership page.
// One card design for the membership everywhere (the Today banner and the Gym tab card), full card width:
// title = what is happening, line = what it means, act = what to do, as quiet info text on its own line (it is not a button). Never "text · text" in one line.
// When the membership has ended, logging and the other member features pause, and the card says so.
// once: a one-time notice (it is ending or has ended): the member can cross it away. A paused membership is never dismissible: it stays at the top.
type Notice = { icon: 'clock' | 'pause' | 'ok'; tone: 'warn' | 'plain'; title: string; line: string; act?: string; once?: boolean };
const ACT = 'Renew at Wulf Fitness reception.';

export function useMembershipNotice(): Notice {
  const ms = useMemberships();
  switch (membershipState(ms)) {
    case 'Expiring': {
      const m = ms.find((x) => x.status === 'Active' && x.warn);
      return { icon: 'clock', tone: 'warn', once: true, title: `Membership ends in ${m?.left.n ?? '12'} days`, line: `Expires on ${m?.end ?? '6 Oct'}.`, act: ACT };
    }
    case 'Expired': {
      // none is active: say whether one was suspended by the gym or they have all ended
      const suspended = ms.some((x) => x.status === 'Suspended');
      return suspended
        ? { icon: 'pause', tone: 'warn', title: 'Membership suspended', line: 'Logging and other features are paused. Ask at the front desk.', act: 'Talk to Wulf Fitness reception.' }
        : { icon: 'pause', tone: 'warn', title: 'Membership expired', line: 'Logging and other features are paused. Your history is safe.', act: ACT };
    }
    default: {
      const next = ms.filter((x) => x.status === 'Active').sort((x, y) => y.pct - x.pct)[0];
      return { icon: 'ok', tone: 'plain', title: 'Membership is active', line: next ? `Next one ends on ${next.end}.` : '', act: 'Renew early at Wulf Fitness reception.' };
    }
  }
}

// Today only shows it when something needs attention.
export function usePaymentNotice() {
  const { d } = useDomain();
  const n = useMembershipNotice();
  const state = useMembershipState();
  // only an ended membership gets the strip (it stays at the top); "ends in 12 days" is a card in the updates stack
  if (!d.hasGym || state !== 'Expired') return null;
  return n;
}

// The two looks of the account banner are one pattern (src/design-system/patterns/Banner.tsx). These feed it.
export function MembershipCard({ n }: { n: Notice }) {
  return <Banner variant="card" icon={n.icon} tone={n.tone} title={n.title} line={n.line} act={n.act} onPress={() => router.push('/gym/membership')} />;
}

// The strip at the top of Today: edge to edge under the header, the title and one sentence on the left, "See plan" on the right.
// (The "what to do" line stays on the Gym tab card; the strip only says what is happening and what it means.)
export function PaymentBanner() {
  const { d, set } = useDomain();
  const n = usePaymentNotice();
  const state = useMembershipState();
  if (!n) return null;
  const cross = () => set((x) => ({ dismissed: { ...x.dismissed, ['membership-' + state]: true } }));
  return <Banner variant="strip" icon={n.icon} tone={n.tone} title={n.title} line={n.line} once={n.once} onPress={() => router.push('/gym/membership')} onDismiss={cross} />;
}
