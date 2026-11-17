import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { PT_TOTAL } from '@/features/gym/data';
import type { Payment } from '@/features/reports/payments';

// A member can hold several gym memberships at the same time (for example an annual plan and a quarterly plan),
// and keeps the old ones as history. These are sample memberships; the real list comes from the gym.
export type MStatus = 'Active' | 'Paused' | 'Upcoming' | 'Suspended' | 'Expired';
export type MTab = 'Active' | 'Suspended' | 'Past'; // an Upcoming membership has no tab of its own: it shows on Active, under a "Starts next" heading
export type Membership = {
  id: string; name: string; start: string; end: string; status: MStatus;
  pct: number;       // how much of the time has gone, 0 to 100
  note: string;      // one line under the card: what is happening
  warn?: boolean;    // the note needs attention (ending soon)
  left: { n: string; unit: string }; // time left in big numbers for the small cards: 37 days left, 13 months left
  pt?: { trainer: string; total: number; left: number }; // personal training sessions that come with this membership
  price: number;     // what the membership costs
  paused?: { from: string; until: string; days: number }; // a paused membership: the gym paused it for these dates, its end date moves by the days
  next?: { item: string; due: string; amount: number }; // the next payment that is coming up
  payments: Payment[];
  /** A plan another member transferred to this member. It keeps its own state (Active, Suspended or Past) and only carries a tag. */
  transferred?: { from?: string; on?: string; /** the other member's photo (a link from the CRM), when there is one */ photo?: string };
};

// How the admin's statuses show in the app. Paused is still an Active membership (the pause shows on it); Transferred is a Past one.
export const fromAdmin = (s: 'Active' | 'Paused' | 'Suspended' | 'Expired' | 'Transferred'): MStatus =>
  s === 'Suspended' ? 'Suspended' : s === 'Paused' ? 'Paused' : s === 'Expired' || s === 'Transferred' ? 'Expired' : 'Active';

export const tabOf = (m: Membership): MTab => (m.status === 'Active' || m.status === 'Paused' || m.status === 'Upcoming' ? 'Active' : m.status === 'Suspended' ? 'Suspended' : 'Past');
export const MTABS: MTab[] = ['Active', 'Suspended', 'Past'];

const pay = (id: string, no: string, item: string, date: string, amount: number, method: string): Payment => ({ id, no, item, date, amount, method });

/** A block of personal training sessions. One can come with a membership; others are bought on their own at the front desk. */
export type PtPack = { id: string; name: string; source: string; trainer: string; total: number; left: number; ends: string; pct: number; start: string; price?: number; past?: boolean; /** days until it ends */ daysLeft?: number; /** how much of its time has gone, 0 to 100 */ timePct?: number };

/** The member's PT packs: the active ones (the one in use first), then the past ones (past: true), which stay as history.  Empty unless the member is in personal training. Sample data; the real list comes from the gym. */
export function usePtPackages(): PtPack[] {
  const { d } = useDomain();
  const { state } = useStore();
  if (state.sc.member !== 'PT member') return [];
  return [
    { id: 'pt1', name: PT_TOTAL + ' session pack', source: 'With your Annual plan', trainer: 'Coach Vikram', total: PT_TOTAL, left: d.ptLeft, ends: '30 Oct', start: '1 Aug', daysLeft: 36, timePct: 60, pct: Math.round((d.ptLeft / PT_TOTAL) * 100) },
    { id: 'pt2', name: 'Single sessions', source: 'At the front desk', trainer: 'Coach Vikram', total: 5, left: 3, ends: '15 Dec', start: '15 Sep', price: 5000, daysLeft: 82, timePct: 10, pct: 60 },
    { id: 'pt5', name: '10 session pack', source: 'At the front desk', trainer: 'Coach Vikram', total: 10, left: 0, ends: '29 Aug 2025', start: '27 Jun 2025', price: 10000, pct: 0, past: true },
    { id: 'pt6', name: 'Trial sessions', source: 'At the front desk', trainer: 'Coach Vikram', total: 2, left: 0, ends: '20 Jun 2025', start: '13 Jun 2025', price: 2000, pct: 0, past: true },
  ];
}

/** All of the member's memberships. The first one is the main plan: the scenario switch (Active, Expiring, Expired) changes it. */
export function useMemberships(): Membership[] {
  const { d } = useDomain();
  const { state } = useStore();
  const main: Membership = d.membership === 'Expired'
    ? { id: 'm1', name: 'Annual plan', price: 12000, start: '14 Oct 2025', end: '21 Sep 2026', status: 'Expired', pct: 100, note: 'Ended on 21 Sep. Your history stays here.', left: { n: '0', unit: 'days left' }, payments: [] }
    : d.membership === 'Expiring'
      ? { id: 'm1', name: 'Annual plan', price: 12000, start: '14 Oct 2025', end: '6 Oct 2026', status: 'Active', pct: 96, note: 'Ends in 12 days', warn: true, left: { n: '12', unit: 'days left' }, payments: [] }
      : { id: 'm1', name: 'Annual plan', price: 12000, start: '14 Oct 2025', end: '14 Oct 2027', status: 'Active', pct: 14, note: 'Active till 14 Oct 2027', left: { n: '13', unit: 'months left' }, payments: [] };
  if (state.sc.member === 'PT member') main.pt = { trainer: 'Coach Vikram', total: PT_TOTAL, left: d.ptLeft }; // a PT member's sessions come with the main plan
  if (d.membership !== 'Expired') main.next = { item: 'Annual membership renewal', due: d.membership === 'Expiring' ? '6 Oct 2026' : '14 Oct 2027', amount: 12000 };
  main.payments = [
    pay('p1', 'INV-2025-0412', 'Annual membership', '14 Oct 2025', 12000, 'front desk'),
    pay('p2', 'INV-2025-0411', 'Joining fee', '14 Oct 2025', 1000, 'front desk'),
  ];
  // In the Expiring and Expired scenarios the quarterly plan has ended too, so the app can show those states.
  const second: Membership = d.membership === 'Active'
    ? { id: 'm2', name: 'Quarterly plan', price: 4500, next: { item: 'Quarterly membership renewal', due: '31 Oct 2026', amount: 4500 }, start: '1 Aug 2026', end: '31 Oct 2026', status: 'Active', pct: 70, note: 'Ends in 37 days', left: { n: '37', unit: 'days left' }, payments: [pay('p3', 'INV-2026-0189', 'Quarterly membership', '1 Aug 2026', 4500, 'UPI')] }
    : { id: 'm2', name: 'Quarterly plan', price: 4500, start: '1 Aug 2026', end: '20 Sep 2026', status: 'Expired', pct: 100, note: 'Ended on 20 Sep 2026', left: { n: '0', unit: 'days left' }, payments: [pay('p3', 'INV-2026-0189', 'Quarterly membership', '1 Aug 2026', 4500, 'UPI')] };
  // A plan the member has already bought that starts when the current one ends. Nothing runs on it yet, so it has no bar; it starts the day after the main plan.
  const upcoming: Membership = {
    id: 'm6', name: 'Annual plan', price: 12000, start: d.membership === 'Active' ? '15 Oct 2027' : d.membership === 'Expiring' ? '7 Oct 2026' : '22 Sep 2026', end: d.membership === 'Active' ? '14 Oct 2028' : d.membership === 'Expiring' ? '6 Oct 2027' : '21 Sep 2027',
    status: 'Upcoming', pct: 0, note: d.membership === 'Active' ? 'Starts on 15 Oct 2027, when your current plan ends' : d.membership === 'Expiring' ? 'Starts on 7 Oct 2026, when your current plan ends' : 'Starts on 22 Sep 2026', left: { n: '12', unit: 'months' }, payments: [pay('p7', 'INV-2026-0388', 'Annual membership', '30 Oct 2026', 12000, 'front desk')],
  };
  // A paused plan: the gym paused it, so the time stops running. It stays on the Active tab, marked as paused.
  const paused: Membership = {
    id: 'm7', name: 'Couple plan', price: 9000, start: '1 Jul 2026', end: '30 Jun 2027', status: 'Paused', pct: 38,
    note: 'Paused until 30 Nov 2026. Your end date moves by the 28 days you are away', left: { n: '28', unit: 'days paused' },
    paused: { from: '2 Nov 2026', until: '30 Nov 2026', days: 28 }, payments: [pay('p8', 'INV-2026-0341', 'Couple membership', '1 Jul 2026', 9000, 'front desk')],
  };
  const all: Membership[] = [
    main,
    second,
    paused,
    upcoming,
    { id: 'm3', name: 'Student plan', price: 3000, start: '1 Jan 2026', end: '31 Mar 2027', status: 'Suspended', pct: 55, note: 'Suspended by the gym. Ask at the front desk.', left: { n: '—', unit: 'suspended' }, payments: [pay('p4', 'INV-2026-0007', 'Student membership', '1 Jan 2026', 3000, 'cash')] },
    { id: 'm4', name: 'Monthly plan', price: 1500, start: '1 Jun 2025', end: '30 Jun 2025', status: 'Expired', pct: 100, note: 'Ended on 30 Jun 2025', left: { n: '0', unit: 'days left' }, payments: [pay('p5', 'INV-2025-0201', 'Monthly membership', '1 Jun 2025', 1500, 'cash')] },
    { id: 'm5', name: 'Joining offer', price: 3600, start: '1 Mar 2025', end: '31 May 2025', status: 'Expired', pct: 100, note: 'Ended on 31 May 2025', left: { n: '0', unit: 'days left' }, payments: [pay('p6', 'INV-2025-0102', 'Joining offer', '1 Mar 2025', 3600, 'UPI')] },
  ];
  // Plans other members transferred to this member (sample). Which plan, from whom and when comes from the CRM; the name is optional.
  const TRANSFERRED: Record<string, Membership['transferred']> = { m2: { from: 'Rahul Mehta', on: '2 Aug 2026' }, m3: { from: 'Anita Rao', on: '28 Dec 2025' }, m4: { on: '28 May 2025' } };
  return all.map((m) => (TRANSFERRED[m.id] ? { ...m, transferred: TRANSFERRED[m.id] } : m));
}

/** What the rest of the app reads: Expired when no membership is active (logging pauses), Expiring when every active one is ending soon, otherwise Active. */
export function membershipState(ms: Membership[]): 'Active' | 'Expiring' | 'Expired' {
  const active = ms.filter((m) => m.status === 'Active');
  if (active.length === 0) return 'Expired';
  return active.every((m) => m.warn) ? 'Expiring' : 'Active';
}
export const useMembershipState = () => membershipState(useMemberships());
