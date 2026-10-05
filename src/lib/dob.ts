// Date of birth is stored as 'YYYY-MM-DD'. Age is always derived from it.
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate(); // m is 1-12
export const MIN_AGE = 14, MAX_AGE = 90;

export function parseDob(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}
export const toDob = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export function ageFrom(s: string, now = new Date()) {
  const p = parseDob(s);
  if (!p) return null;
  let a = now.getFullYear() - p.y;
  if (now.getMonth() + 1 < p.m || (now.getMonth() + 1 === p.m && now.getDate() < p.d)) a--;
  return a;
}
export const fmtDob = (s: string) => { const p = parseDob(s); return p ? `${p.d} ${MONTHS[p.m - 1]} ${p.y}` : ''; };
export const defaultDob = (now = new Date()) => toDob(now.getFullYear() - 28, 6, 15);
