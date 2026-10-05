// Trend data for every Progress metric, for any Day / Week / Month / Year window.
// Values are deterministic mock numbers (same date, same value) that follow the story in the rest
// of the app: joined 2 Sep at 74.5 kg, now 72.4 kg, today is Wed 24 Sep 2026.
import { stepsStore } from '@/features/today/StepsCards';


export type Range = 'day' | 'week' | 'month' | 'year';
export const RANGES: { value: Range; label: string }[] = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }];
export type MetricKey = 'weight' | 'cons' | 'diet' | 'steps' | 'meas' | 'hr' | 'sleep' | 'water';

export const TODAY = new Date(2026, 8, 24);
export const START = new Date(2026, 8, 2);
const FIRST = new Date(2026, 0, 1); // how far back the date picker goes
const MS = 86400000;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// Monday = 0. Anchored on the app's own calendar (today, 24 Sep, is a Wednesday).
export const dow = (d: Date) => ((Math.round((sod(d).getTime() - sod(TODAY).getTime()) / MS) + 2) % 7 + 7) % 7;
const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dayIdx = (d: Date) => Math.round((sod(d).getTime() - sod(START).getTime()) / MS);
export const fmtDay = (d: Date) => `${DOW[dow(d)]} ${d.getDate()} ${MON[d.getMonth()]}`;

export type Win = { start: Date; end: Date; label: string; current: boolean; canNext: boolean; canPrev: boolean };
export function windowOf(range: Range, anchor: Date): Win {
  const a = sod(anchor);
  let start = a, end = a, label = '';
  if (range === 'day') {
    label = same(a, TODAY) ? `Today · ${fmtDay(a)}` : same(a, addDays(TODAY, -1)) ? `Yesterday · ${fmtDay(a)}` : fmtDay(a);
  } else if (range === 'week') {
    start = addDays(a, -dow(a)); end = addDays(start, 6);
    const span = start.getMonth() === end.getMonth() ? `${start.getDate()} – ${end.getDate()} ${MON[end.getMonth()]}` : `${start.getDate()} ${MON[start.getMonth()]} – ${end.getDate()} ${MON[end.getMonth()]}`;
    label = TODAY >= start && TODAY <= end ? `This week · ${span}` : span;
  } else if (range === 'month') {
    start = new Date(a.getFullYear(), a.getMonth(), 1); end = new Date(a.getFullYear(), a.getMonth() + 1, 0);
    label = TODAY >= start && TODAY <= end ? `This month · ${MONTH[a.getMonth()]}` : `${MONTH[a.getMonth()]} ${a.getFullYear()}`;
  } else {
    start = new Date(a.getFullYear(), 0, 1); end = new Date(a.getFullYear(), 11, 31);
    label = TODAY >= start && TODAY <= end ? `This year · ${a.getFullYear()}` : String(a.getFullYear());
  }
  const current = TODAY >= start && TODAY <= end;
  return { start, end, label, current, canNext: !current && end < TODAY, canPrev: start > FIRST };
}

export function shift(range: Range, anchor: Date, n: number): Date {
  const a = sod(anchor);
  const r = range === 'day' ? addDays(a, n) : range === 'week' ? addDays(a, 7 * n) : range === 'month' ? new Date(a.getFullYear(), a.getMonth() + n, 1) : new Date(a.getFullYear() + n, 0, 1);
  // Never past today; landing on the current window means "now".
  return r > TODAY ? sod(TODAY) : r;
}

// ---- daily values ----
const rnd = (seed: number) => { const x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); };
const IDX: Record<MetricKey, number> = { weight: 1, cons: 2, diet: 3, steps: 4, meas: 5, hr: 6, sleep: 7, water: 8 };
export type Live = { weight: number; water: number };

export function dayVal(k: MetricKey, d: Date, live: Live): number | null {
  const day = sod(d);
  if (day < sod(START) || day > sod(TODAY)) return null;
  const i = dayIdx(day), r = rnd(i * 13 + IDX[k] * 101), today = same(day, TODAY);
  switch (k) {
    case 'weight': return today ? live.weight : Math.round((74.5 - 0.095 * i + (r - 0.5) * 0.3) * 10) / 10;
    case 'meas': return Math.round((92 - 0.13 * i) * 10) / 10;
    case 'cons': return today ? 0 : [0, 2, 3, 5].includes(dow(day)) && r > 0.12 ? 1 : 0;
    case 'diet': return Math.round(Math.min(96, 68 + i * 0.5 + r * 22));
    case 'steps': return today ? 5230 + stepsStore.get().manual.reduce((a, e) => a + e.n, 0) : Math.round(4200 + r * 5400 + (dow(day) >= 5 ? 900 : 0));
    case 'water': return today ? live.water : Math.round((1.6 + r * 1.6) * 10) / 10;
    case 'hr': return Math.round(70 - i * 0.25 + (r - 0.5) * 2);
    case 'sleep': return Math.round((6.2 + r * 1.6) * 10) / 10;
  }
}

const HOUR_LABELS = ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'];
const HOUR_SUB = ['12 – 3 am', '3 – 6 am', '6 – 9 am', '9 am – 12 pm', '12 – 3 pm', '3 – 6 pm', '6 – 9 pm', '9 pm – 12 am'];
const STEP_W = [0.01, 0, 0.09, 0.2, 0.17, 0.2, 0.28, 0.05];
const WATER_W = [0, 0, 0.1, 0.25, 0.2, 0.2, 0.2, 0.05];
const HR_H = [58, 56, 66, 78, 74, 80, 96, 70];
const NOW_BUCKET = 6; // it is about 6:20 pm

export const HOURLY: MetricKey[] = ['steps', 'water', 'hr'];
export type Bucket = { label: string; sub: string };
export type Kind = 'bars' | 'line';
export const KIND: Record<MetricKey, Kind> = { steps: 'bars', water: 'bars', cons: 'bars', diet: 'bars', sleep: 'bars', weight: 'line', hr: 'line', meas: 'line' };
export const GOAL: Partial<Record<MetricKey, number>> = { steps: 8000, water: 3 };

function daysOf(win: Win) { const out: Date[] = []; for (let d = win.start; d <= win.end; d = addDays(d, 1)) out.push(d); return out; }
const isSum = (k: MetricKey) => k === 'cons';

function agg(k: MetricKey, vs: (number | null)[]) {
  const v = vs.filter((x): x is number => x != null);
  if (!v.length) return null;
  const s = v.reduce((a, b) => a + b, 0);
  return isSum(k) ? s : s / v.length;
}

export type Trend = {
  win: Win; buckets: Bucket[]; vals: (number | null)[]; kind: Kind; goal?: number; key: string;
  big: string; unit: string; sub: string; hasData: boolean; empty?: string; stats: { l: string; v: string }[];
  fmt: (n: number) => string;
};

function formatter(k: MetricKey) {
  return (n: number) => {
    switch (k) {
      case 'weight': case 'meas': return `${Math.round(n * 10) / 10}`;
      case 'steps': return Math.round(n).toLocaleString('en-IN');
      case 'water': return `${Math.round(n * 10) / 10}`;
      case 'hr': return `${Math.round(n)}`;
      case 'sleep': { const h = Math.floor(n), m = Math.round((n - h) * 60); return `${h}h ${m < 10 ? '0' : ''}${m}m`; }
      case 'diet': return `${Math.round(n)}%`;
      case 'cons': return `${Math.round(n * 10) / 10}`;
    }
  };
}
const UNIT_OF: Record<MetricKey, string> = { weight: ' kg', meas: ' cm', steps: '', water: ' L', hr: ' bpm', sleep: '', diet: '', cons: '' };

export function trend(k: MetricKey, range: Range, anchor: Date, live: Live): Trend {
  const win = windowOf(range, anchor);
  const fmt = formatter(k);
  let buckets: Bucket[] = [];
  let vals: (number | null)[] = [];
  const dayOfWin = sod(anchor);

  if (range === 'day' && HOURLY.includes(k)) {
    const total = dayVal(k, dayOfWin, live);
    const today = same(dayOfWin, TODAY);
    buckets = HOUR_LABELS.map((label, i) => ({ label, sub: HOUR_SUB[i] }));
    if (total == null) vals = buckets.map(() => null);
    else if (k === 'hr') vals = HR_H.map((h, i) => (today && i > NOW_BUCKET ? null : Math.round(h - (70 - total))));
    else {
      const w = k === 'steps' ? STEP_W : WATER_W;
      const live_w = w.map((x, i) => (today && i > NOW_BUCKET ? 0 : x));
      const sum = live_w.reduce((a, b) => a + b, 0) || 1;
      vals = live_w.map((x, i) => (today && i > NOW_BUCKET ? null : k === 'steps' ? Math.round((x / sum) * total) : Math.round(((x / sum) * total) * 100) / 100));
    }
  } else if (range === 'day') {
    // one reading a day: show the seven days that lead up to it
    for (let n = 6; n >= 0; n--) { const d = addDays(dayOfWin, -n); buckets.push({ label: DOW[dow(d)][0], sub: fmtDay(d) }); vals.push(dayVal(k, d, live)); }
  } else if (range === 'week') {
    daysOf(win).forEach((d) => { buckets.push({ label: DOW[dow(d)][0], sub: fmtDay(d) }); vals.push(dayVal(k, d, live)); });
  } else if (range === 'month') {
    daysOf(win).forEach((d) => { const n = d.getDate(); buckets.push({ label: n === 1 || n % 5 === 0 ? String(n) : '', sub: fmtDay(d) }); vals.push(dayVal(k, d, live)); });
  } else {
    for (let m = 0; m < 12; m++) {
      const from = new Date(win.start.getFullYear(), m, 1), to = new Date(win.start.getFullYear(), m + 1, 0);
      const ds: (number | null)[] = []; for (let d = from; d <= to; d = addDays(d, 1)) ds.push(dayVal(k, d, live));
      buckets.push({ label: MON[m][0], sub: `${MONTH[m]} ${win.start.getFullYear()}` });
      vals.push(agg(k, ds));
    }
  }

  // headline number for the window
  const dayVals = daysOf(win).map((d) => dayVal(k, d, live));
  const have = dayVals.filter((x) => x != null) as number[];
  const totalKind = range === 'day' && (k === 'steps' || k === 'water');
  let bigN: number | null = null;
  if (range === 'day') bigN = dayVal(k, dayOfWin, live);
  else bigN = agg(k, dayVals);
  const hasData = bigN != null && (have.length > 0);

  // compare with the window before
  const prevAnchor = shift(range, anchor, -1);
  const prevWin = windowOf(range, prevAnchor);
  const prevN = range === 'day' ? dayVal(k, prevAnchor, live) : agg(k, daysOf(prevWin).map((d) => dayVal(k, d, live)));
  const word = { day: 'yesterday', week: 'last week', month: 'last month', year: 'last year' }[range];
  let sub = 'First data';
  if (bigN != null && prevN != null && prevWin.end >= sod(START)) {
    const dv = bigN - prevN;
    const arrow = Math.abs(dv) < (k === 'weight' ? 0.05 : 0.5) ? '→' : dv > 0 ? '↑' : '↓';
    const mag = k === 'steps' ? Math.round(Math.abs(dv)).toLocaleString('en-IN') : k === 'sleep' ? `${Math.round(Math.abs(dv) * 60)} min` : fmt(Math.abs(dv)).replace('%', '');
    sub = arrow === '→' ? `About the same as ${word}` : `${arrow}${mag}${k === 'weight' ? ' kg' : k === 'diet' ? '%' : ''} vs ${word}`;
  }
  if (k === 'steps' || k === 'water') sub = `${totalKind ? 'Total today' : range === 'day' ? 'Total' : 'Daily average'} · ${sub}`;
  if (k === 'sleep') sub = `Average per night · ${sub}`;
  if (k === 'weight') sub = `${range === 'day' ? 'Reading' : 'Average'} · ${sub}`;

  const big = bigN == null ? '—' : fmt(bigN);
  const unit = k === 'diet' ? ' on plan' : k === 'cons' ? (range === 'day' ? ' workouts' : ' workouts') : UNIT_OF[k];

  // stats under the chart
  const stats: { l: string; v: string }[] = [];
  if (hasData) {
    const shown = vals.filter((x): x is number => x != null);
    if (shown.length) {
      stats.push({ l: 'Highest', v: `${fmt(Math.max(...shown))}${UNIT_OF[k]}` }, { l: 'Lowest', v: `${fmt(Math.min(...shown))}${UNIT_OF[k]}` });
    }
    if (k === 'steps') { const gd = have.filter((x) => x >= 8000).length; stats.push({ l: 'Days at 8,000+', v: `${gd} of ${have.length}` }, { l: 'Total steps', v: have.reduce((a, b) => a + b, 0).toLocaleString('en-IN') }); }
    if (k === 'water') { const gd = have.filter((x) => x >= 3).length; stats.push({ l: 'Days at 3 L', v: `${gd} of ${have.length}` }); }
    if (k === 'cons') stats.push({ l: 'Active days', v: `${have.filter((x) => x > 0).length} of ${have.length}` });
    if (k === 'diet') stats.push({ l: 'Days above 80%', v: `${have.filter((x) => x >= 80).length} of ${have.length}` });
  }

  const empty = !hasData ? (win.end < sod(START) ? `No data yet. You joined on ${fmtDay(START)}.` : win.start > TODAY ? 'Nothing here yet.' : 'No entries for this period.') : undefined;
  return { win, buckets, vals, kind: KIND[k], goal: GOAL[k], key: `${k}-${range}-${win.start.getTime()}`, big, unit, sub, hasData, empty, stats, fmt };
}
