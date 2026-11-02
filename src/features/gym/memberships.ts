import { useDomain } from '@/lib/domain';
import type { Payment } from '@/features/reports/payments';

// A member can hold several gym memberships at the same time (for example an annual plan and a quarterly plan),
// and keeps the old ones as history. These are sample memberships; the real list comes from the gym.
export type MStatus = 'Active' | 'Suspended' | 'Expired';
export type MTab = 'Active' | 'Suspended' | 'Past';
export type Membership = {
  id: string; name: string; memberId: string; start: string; end: string; status: MStatus;
  pct: number;       // how much of the time has gone, 0 to 100
  note: string;      // one line under the card: what is happening
  warn?: boolean;    // the note needs attention (ending soon)
  left: { n: string; unit: string }; // time left in big numbers for the small cards: 37 days left, 13 months left
  payments: Payment[];
};

export const tabOf = (m: Membership): MTab => (m.status === 'Active' ? 'Active' : m.status === 'Suspended' ? 'Suspended' : 'Past');
export const MTABS: MTab[] = ['Active', 'Suspended', 'Past'];

const pay = (id: string, no: string, item: string, date: string, amount: number, method: string): Payment => ({ id, no, item, date, amount, method });

/** All of the member's memberships. The first one is the main plan: the scenario switch (Active, Expiring, Expired) changes it. */
export function useMemberships(): Membership[] {
  const { d } = useDomain();
  const main: Membership = d.membership === 'Expired'
    ? { id: 'm1', name: 'Annual plan', memberId: 'GLD-4821', start: '14 Oct 2025', end: '21 Sep 2026', status: 'Expired', pct: 100, note: 'Ended on 21 Sep. Your history stays here.', left: { n: '0', unit: 'days left' }, payments: [] }
    : d.membership === 'Expiring'
      ? { id: 'm1', name: 'Annual plan', memberId: 'GLD-4821', start: '14 Oct 2025', end: '6 Oct 2026', status: 'Active', pct: 96, note: 'Ends in 12 days', warn: true, left: { n: '12', unit: 'days left' }, payments: [] }
      : { id: 'm1', name: 'Annual plan', memberId: 'GLD-4821', start: '14 Oct 2025', end: '14 Oct 2027', status: 'Active', pct: 14, note: 'Active till 14 Oct 2027', left: { n: '13', unit: 'months left' }, payments: [] };
  main.payments = [
    pay('p1', 'INV-2025-0412', 'Annual membership', '14 Oct 2025', 12000, 'front desk'),
    pay('p2', 'INV-2025-0411', 'Joining fee', '14 Oct 2025', 1000, 'front desk'),
  ];
  return [
    main,
    { id: 'm2', name: 'Quarterly plan', memberId: 'GLD-5307', start: '1 Aug 2026', end: '31 Oct 2026', status: 'Active', pct: 70, note: 'Ends in 37 days', left: { n: '37', unit: 'days left' }, payments: [pay('p3', 'INV-2026-0189', 'Quarterly membership', '1 Aug 2026', 4500, 'UPI')] },
    { id: 'm3', name: 'Student plan', memberId: 'GLD-4990', start: '1 Jan 2026', end: '31 Mar 2027', status: 'Suspended', pct: 55, note: 'Suspended by the gym. Ask at the front desk.', left: { n: '—', unit: 'suspended' }, payments: [pay('p4', 'INV-2026-0007', 'Student membership', '1 Jan 2026', 3000, 'cash')] },
    { id: 'm4', name: 'Monthly plan', memberId: 'GLD-4309', start: '1 Jun 2025', end: '30 Jun 2025', status: 'Expired', pct: 100, note: 'Ended on 30 Jun 2025', left: { n: '0', unit: 'days left' }, payments: [pay('p5', 'INV-2025-0201', 'Monthly membership', '1 Jun 2025', 1500, 'cash')] },
    { id: 'm5', name: 'Joining offer', memberId: 'GLD-4120', start: '1 Mar 2025', end: '31 May 2025', status: 'Expired', pct: 100, note: 'Ended on 31 May 2025', left: { n: '0', unit: 'days left' }, payments: [pay('p6', 'INV-2025-0102', 'Joining offer', '1 Mar 2025', 3600, 'UPI')] },
  ];
}
