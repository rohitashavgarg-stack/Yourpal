// Quantity helpers: "2", "1 katori", "100 g" -> a number and a unit, and back to friendly text.
export type Qty = { n: number; unit: string };

export function parseQty(q: string | undefined): Qty | null {
  if (!q) return null;
  const m = q.trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!m) return null;
  return { n: parseFloat(m[1]), unit: m[2].trim().toLowerCase() };
}

// 1.5 -> "1½", 0.5 -> "½", 2 -> "2"
export function fmtNum(n: number): string {
  const whole = Math.floor(n + 1e-6);
  const frac = n - whole;
  const half = Math.abs(frac - 0.5) < 0.01;
  if (half) return whole ? `${whole}½` : '½';
  return String(Math.round(n * 100) / 100);
}

export const unitLabel = (unit: string) => unit || 'pcs';
export const fmtQty = (n: number, unit: string) => `${fmtNum(n)} ${unitLabel(unit)}`;

// Sensible step per unit: grams and ml in 25s, katori/cup/bowl/plate in halves, pieces one at a time.
export function stepFor(unit: string): number {
  if (unit === 'g' || unit === 'ml') return 25;
  if (unit) return 0.5;
  return 1;
}
export const minFor = (unit: string) => stepFor(unit);

// Split a row into the food and how much of it. Swapped foods keep "Name, amount" in one string.
export function splitFood(it: { kind: string; swapped: boolean; n: string; baseN: string; q?: string }): { name: string; qty: Qty | null } {
  if (it.kind === 'plan' && !it.swapped) return { name: it.baseN, qty: parseQty(it.q) };
  const i = it.n.lastIndexOf(', ');
  if (i > 0) return { name: it.n.slice(0, i), qty: parseQty(it.n.slice(i + 2)) };
  return { name: it.n, qty: null };
}
