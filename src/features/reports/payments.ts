// Sample payment history for the Membership page. The real list comes from the gym's billing.
export type Payment = { id: string; no: string; item: string; date: string; amount: number; method: string };

export const PAYMENTS: Payment[] = [
  { id: 'p1', no: 'INV-2025-0412', item: 'Annual membership', date: '14 Oct 2025', amount: 12000, method: 'front desk' },
  { id: 'p2', no: 'INV-2025-0411', item: 'Joining fee', date: '14 Oct 2025', amount: 1000, method: 'front desk' },
];

export const rupees = (n: number) => '₹' + n.toLocaleString('en-IN');
