// A payment on a membership. The real list comes from the gym's billing.
export type Payment = { id: string; no: string; item: string; date: string; amount: number; method: string };

export const rupees = (n: number) => '₹' + n.toLocaleString('en-IN');
