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

/** A plan the member can still buy. The price is for the whole period; `was` is the price before the offer. Sample data; the real list comes from the provider. */
export type Plan = {
  id: string; kind: SubKind; provider: string; name: string; tagline: string; days: number; price: number; was: number;
  benefits: string[];
};
export const PLANS: Plan[] = [
  { id: 'p1', kind: 'Fitness', provider: 'Cubicurl', name: 'Elite Fitness', tagline: 'A workout plan built for your goal, with a coach to check it.', days: 30, price: 500, was: 800,
    benefits: ['Personalised health assessment', 'Smart dashboard access', 'Downloadable assessment report', 'Chat with your coach', 'Consultations', 'Personalised workout plan'] },
  { id: 'p2', kind: 'Wellness', provider: 'Omasra Wellness', name: 'Healthy Diet', tagline: 'A diet plan that fits how you eat, with a nutritionist to adjust it.', days: 30, price: 500, was: 800,
    benefits: ['Personalised health assessment', 'Smart dashboard access', 'Downloadable assessment report', 'Chat with your nutritionist', 'Consultations', 'AI-powered meal tracking', 'Personalised diet plan'] },
  { id: 'p3', kind: 'Fitness', provider: 'Cubicurl', name: 'Strength Builder', tagline: 'Three months of progressive strength training, reviewed every month.', days: 90, price: 1200, was: 1800,
    benefits: ['Personalised health assessment', 'Progressive strength plan', 'Monthly progress review', 'Chat with your coach', 'Downloadable assessment report'] },
  { id: 'p4', kind: 'Wellness', provider: 'Omasra Wellness', name: 'Sleep and Stress', tagline: 'Sleep and stress habits, tracked and coached for a month.', days: 30, price: 400, was: 600,
    benefits: ['Sleep and stress check', 'Daily habit plan', 'Smart dashboard access', 'Chat with your nutritionist'] },
];

export type PlanTab = 'Active' | 'Available' | 'Past';
/** Plans the member has cancelled in the app move to Past as Cancelled; plans bought in the app are active at once. `tab` is the tab the Subscriptions page shows. */
export const subStore = createStore(() => ({ cancelled: [] as string[], bought: [] as string[], tab: 'Active' as PlanTab, /** the demo switch: does the next payment go through */ pay: 'Succeeds' as 'Succeeds' | 'Fails' }), 'subscriptions');

export const dateText = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

/** A plan bought today, as a subscription: active for the days it covers, one paid payment. */
function fromPlan(p: Plan): Subscription {
  const now = new Date();
  const end = addDays(now, p.days);
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  const pay: SubPayment = { id: 'b-' + p.id + '-pay', no: 'SUB-' + (5000 + Number(p.id.slice(1))), item: p.name, date: dateText(now), time, period: dateText(now) + ' to ' + dateText(end), amount: p.price, method: 'UPI', status: 'Paid' };
  return { id: 'b-' + p.id, kind: p.kind, provider: p.provider, name: p.name, months: Math.max(1, Math.round(p.days / 30)), price: p.price, status: 'Active', validTill: dateText(end), benefits: p.benefits, payments: [pay] };
}

export function useSubscriptions(): Subscription[] {
  const { cancelled, bought } = subStore.use();
  const mine = [...bought.map((id) => PLANS.find((p) => p.id === id)).filter(Boolean).map((p) => fromPlan(p!)), ...SUBSCRIPTIONS];
  return mine.map((s) => (cancelled.includes(s.id) ? { ...s, status: 'Cancelled' as const } : s));
}
export const isPast = (s: Subscription) => s.status !== 'Active';

/** Plans the member has not bought yet. */
export function useAvailablePlans(): Plan[] {
  const { bought } = subStore.use();
  return PLANS.filter((p) => !bought.includes(p.id));
}
export const saving = (p: Plan) => p.was - p.price;
