// Earlier months of attendance, for looking back. September is VISITS in data.ts; these are sample months made from a simple pattern
// (mostly Monday, Wednesday and Friday, some home workouts and PT sessions). The real log comes from the gym.
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SEPTEMBER = new Date(2026, 8, 1);

export type PastMonth = { name: string; days: number; lead: number; visits: Record<number, 'c' | 'h' | 'p'>; count: number };

/** The month `back` months before September 2026. lead is how many empty cells come before the 1st (the app's calendar has 1 Sep on a Monday). */
export function pastMonth(back: number): PastMonth {
  const first = new Date(2026, 8 - back, 1);
  const days = new Date(2026, 9 - back, 0).getDate();
  const gap = Math.round((first.getTime() - SEPTEMBER.getTime()) / 86400000);
  const lead = ((gap % 7) + 7) % 7;
  const visits: PastMonth['visits'] = {};
  for (let d = 1; d <= days; d++) {
    const w = (lead + d - 1) % 7;
    if ([0, 2, 4].includes(w) || (d + back) % 5 === 0) visits[d] = (d + back) % 9 === 0 ? 'p' : 'c';
  }
  return { name: first.toLocaleString('en-US', { month: 'long' }), days, lead, visits, count: Object.keys(visits).length };
}

/** The day's name in that month, like "Fri 28". */
export const dayName = (m: PastMonth, d: number) => `${DOW[(m.lead + d - 1) % 7]} ${d}`;
