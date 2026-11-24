import { createStore } from '@/lib/createStore';
import type { Payment } from '@/features/reports/payments';

// A subscription is a programme plan the member buys from a provider (Wellness or Fitness). It is not the gym membership: the gym membership lives in Gym, Memberships.
// Sample data; the real list comes from the provider.
export type SubKind = 'Wellness' | 'Fitness';
export type SubPayment = Payment & { status: 'Paid' | 'Failed'; period: string; time: string };
export type Subscription = {
  id: string; kind: SubKind; provider: string; name: string; months: number; price: number; // per month
  status: 'Active' | 'Expired' | 'Cancelled'; validTill: string; benefits: string[]; payments: SubPayment[];
};

const BENEFITS = ['Smart dashboard access', 'Personalised health assessment', 'Downloadable assessment report', 'AI-powered meal tracking', 'Smart food logging', 'Personalised diet plan', 'Personalised workout plan'];
const pay = (id: string, n: number, date: string, time: string, period: string, method: string, status: 'Paid' | 'Failed' = 'Paid'): SubPayment => ({ id, no: 'SUB-' + n, item: 'Subscription', date, time, period, amount: 5200, method, status });
const history = (p: string): SubPayment[] => [
  pay(p + '1', 4120, '10 Jan 2026', '6:45 am', '1 May to 31 May 2026', 'UPI'),
  pay(p + '2', 4101, '10 Dec 2025', '6:45 am', '1 Apr to 30 Apr 2026', 'Card'),
  pay(p + '3', 4087, '10 Nov 2025', '6:41 am', '1 Mar to 31 Mar 2026', 'UPI', 'Failed'),
  pay(p + '4', 4075, '10 Nov 2025', '6:46 am', '1 Mar to 31 Mar 2026', 'UPI'),
  pay(p + '5', 4032, '10 Oct 2025', '6:45 am', '1 Feb to 28 Feb 2026', 'Card'),
];

export const SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', kind: 'Wellness', provider: 'Omasra Wellness', name: 'Premium plan', months: 2, price: 5000, status: 'Active', validTill: '20 Jun 2026', benefits: BENEFITS, payments: history('a') },
  { id: 's2', kind: 'Fitness', provider: 'Omasra Wellness', name: 'Premium plan', months: 2, price: 5000, status: 'Active', validTill: '14 Jul 2026', benefits: BENEFITS, payments: history('b') },
  { id: 's3', kind: 'Fitness', provider: 'Omasra Wellness', name: 'Premium plan', months: 2, price: 5000, status: 'Active', validTill: '2 Aug 2026', benefits: BENEFITS, payments: history('c') },
  { id: 's4', kind: 'Wellness', provider: 'Omasra Wellness', name: 'Premium plan', months: 2, price: 5000, status: 'Expired', validTill: '30 Nov 2025', benefits: BENEFITS, payments: history('d').slice(2) },
  { id: 's5', kind: 'Fitness', provider: 'Omasra Wellness', name: 'Premium plan', months: 2, price: 5000, status: 'Expired', validTill: '31 Aug 2025', benefits: BENEFITS, payments: history('e').slice(3) },
];

/** Plans the member has cancelled in the app: they move to Past as Cancelled. */
export const subStore = createStore(() => ({ cancelled: [] as string[] }), 'subscriptions');

export function useSubscriptions(): Subscription[] {
  const { cancelled } = subStore.use();
  return SUBSCRIPTIONS.map((s) => (cancelled.includes(s.id) ? { ...s, status: 'Cancelled' as const } : s));
}
export const isPast = (s: Subscription) => s.status !== 'Active';
