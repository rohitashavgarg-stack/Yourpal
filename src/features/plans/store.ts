import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { FoodType, MealId, MEALS, Mode, TODAY_IDX } from '@/lib/data';
import { Domain, mealLog, wkDoneInfo, workoutState } from '@/lib/domain';
import { fmtT } from '@/lib/data';

// Plans-only state lives in a tiny module store (no provider needed), so the tab,
// its pushed pages and its sheets (rendered in the root overlay) all read the same thing.
// Shared facts (the weekly plan, meal log, request status, offline) stay in the domain.

export type PEx = { id: string; name: string; sets: number; reps: number; kg: number; mode: Mode; t?: number; by?: 'you' | 'coach' | 'created'; hl?: boolean };
export type DayPlan = { name: string; time?: string; wu?: { n: string; s: string }[]; cd?: { n: string; s: string }[]; ex: PEx[]; done?: string; created?: boolean };
export type Food = { n: string; k: number; p: number; c?: number; f?: number; type?: FoodType; mine?: boolean; est?: boolean; written?: boolean };
export type DietRow = { key: string; n: string; k: number; p: number; por: number; type: FoodType; mine: boolean; added?: Food };
export type Draft =
  | { kind: 'workout'; day: number; rows: PEx[]; orig: string }
  | { kind: 'diet'; meal: MealId; rows: DietRow[]; orig: string };
export type Diet = 'Veg' | 'Eggetarian' | 'Non-veg';

export type PlansState = {
  seg: 'workout' | 'diet';
  day: number;
  week: number; // 0 = this week, -1 = last week, 1 = next week, ...
  created: Record<number, { name: string; ex: PEx[] }>;
  applied: boolean; // coach update applied ("Got it")
  hl: string[]; // exercise ids that are "New from Coach"
  noPlan: boolean;
  mid: boolean; // scenario: mid-workout when the update arrives
  diet: Diet;
  detail: 'Detailed' | 'Simple';
  cam: 'Allowed' | 'Denied';
  camOk: boolean | null;
  por: Record<string, number>; // `${meal}:${key}` → portion multiplier
  skip: Record<string, boolean>; // `${meal}:${key}` → skipped for today
  order: Partial<Record<MealId, string[]>>;
  always: Record<string, boolean>;
  myFoods: Food[];
  openMeal: MealId | 'none' | null;
  draft: Draft | null;
  eiKey: string | null;
  cName: string;
  cDay: number;
  cEx: PEx[];
  cErr: string;
};

export function freshPlans(): PlansState {
  return {
    seg: 'workout', day: TODAY_IDX, week: 0, created: {}, applied: false, hl: [], noPlan: false, mid: false, diet: 'Veg', detail: 'Detailed',
    cam: 'Allowed', camOk: null, por: {}, skip: {}, order: {}, always: {}, myFoods: [], openMeal: null, draft: null, eiKey: null,
    cName: '', cDay: 4, cEx: [], cErr: '',
  };
}

let state: PlansState = freshPlans();
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const getP = () => state;
export function setP(p: Partial<PlansState> | ((s: PlansState) => Partial<PlansState>)) {
  state = { ...state, ...(typeof p === 'function' ? p(state) : p) };
  emit();
}
export function resetPlans() { state = freshPlans(); emit(); }
export function usePlans() {
  const p = useSyncExternalStore(subscribe, getP, getP);
  return { p, setP };
}

// ---------- Workout helpers ----------
export const DAYL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAYN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
// The prototype's week starts Mon 22 Sep; other weeks repeat the same weekly plan.
const dayDate = (i: number, w: number) => new Date(2026, 8, 22 + i + 7 * w);
export const dateOf = (i: number, w = 0) => dayDate(i, w).getDate();
export const monthOf = (i: number, w = 0) => dayDate(i, w).toLocaleString('en-US', { month: 'short' });
// -1 past, 0 today, 1 future, for the day on screen.
export const relDay = (p: { day: number; week: number }) => Math.sign(p.week * 7 + p.day - TODAY_IDX);

export function exSub(e: PEx) {
  const k = Math.round(e.kg * 10) / 10;
  if (e.mode === 't') return `${e.sets} × ${e.t ?? 0} s`;
  if (e.mode === 'tw') return `${e.sets} × ${e.t ?? 0} s · ${k} kg`;
  return `${e.sets} × ${e.reps}${e.kg ? ` · ${k} kg` : ' reps'}`;
}

export function dayPlan(d: Domain, p: PlansState, i: number): DayPlan | null {
  const cr = p.created[i];
  if (cr) return { name: cr.name, ex: cr.ex.map((e) => ({ ...e })), created: true };
  const b = d.plans[i];
  if (!b) return null;
  let done = p.week === 0 ? b.done : undefined; // logged history only exists for this week
  if (i === TODAY_IDX && p.week === 0 && workoutState(d) === 'done') { const w = wkDoneInfo(d); done = `${fmtT(w.a).full} – ${fmtT(w.b).full} · ${w.k} kcal`; }
  return { name: b.name, time: b.time, wu: b.wu, cd: b.cd, done, ex: b.ex.map((e) => ({ ...e, hl: p.applied && p.hl.includes(e.id) })) };
}

// First free day after today (for "Create a workout").
export function freeDay(d: Domain, p: PlansState, prefer: number) {
  if (!dayPlan(d, p, prefer)) return prefer;
  for (let i = TODAY_IDX + 1; i < 7; i++) if (!dayPlan(d, p, i)) return i;
  for (let i = 0; i < 7; i++) if (!dayPlan(d, p, i)) return i;
  return prefer;
}

// ---------- Diet helpers ----------
export const pk = (mid: MealId, key: string) => `${mid}:${key}`;
export type DItem = {
  key: string; kind: 'plan' | 'extra'; idx: number; n: string; baseN: string; q?: string;
  k: number; p: number; c: number; f: number; type: FoodType; st: 'eaten' | 'todo' | 'skipped'; por: number; mine: boolean; swapped: boolean; est: boolean;
};
const estC = (k: number) => Math.round((k * 0.5) / 4);
const estF = (k: number) => Math.round((k * 0.3) / 9);

export function dietItems(d: Domain, p: PlansState, mid: MealId): DItem[] {
  const m = MEALS.find((x) => x.id === mid)!;
  const x = mealLog(d, mid);
  const planned: DItem[] = m.items.map((it, k) => {
    const key = `p${k}`;
    const r = x.repl[k];
    const st: DItem['st'] = x.skip ? 'skipped' : x.eaten.includes(k) ? 'eaten' : p.skip[pk(mid, key)] ? 'skipped' : 'todo';
    return r
      ? { key, kind: 'plan', idx: k, n: r.n, baseN: it.n, k: r.k, p: r.p, c: estC(r.k), f: estF(r.k), type: r.type ?? 'veg', st, por: p.por[pk(mid, key)] ?? 1, mine: false, swapped: true, est: !!r.est }
      : { key, kind: 'plan', idx: k, n: `${it.q} ${it.n.toLowerCase()}`, baseN: it.n, q: it.q, k: it.k, p: it.p, c: it.c, f: it.f, type: it.type, st, por: p.por[pk(mid, key)] ?? 1, mine: false, swapped: false, est: false };
  });
  const extras: DItem[] = x.extra.map((e, j) => ({
    key: `x${j}`, kind: 'extra', idx: j, n: e.n, baseN: e.n, k: e.k, p: e.p, c: estC(e.k), f: estF(e.k), type: e.type ?? 'veg',
    st: 'eaten', por: p.por[pk(mid, `x${j}`)] ?? 1, mine: true, swapped: false, est: !!e.est,
  }));
  const all = [...planned, ...extras];
  const ord = p.order[mid];
  if (!ord) return all;
  const pos = (k: string) => { const i = ord.indexOf(k); return i < 0 ? 999 : i; };
  return all.map((it, i) => ({ it, i })).sort((a, b) => pos(a.it.key) - pos(b.it.key) || a.i - b.i).map((z) => z.it);
}

export function dietTotals(d: Domain, p: PlansState) {
  const t = { k: 0, p: 0, c: 0, f: 0, plan: 0 };
  MEALS.forEach((m) => dietItems(d, p, m.id).forEach((i) => {
    if (i.st !== 'skipped') t.plan += i.k * i.por;
    if (i.st === 'eaten') { t.k += i.k * i.por; t.p += i.p * i.por; t.c += i.c * i.por; t.f += i.f * i.por; }
  }));
  return t;
}

export const allowedFor = (diet: Diet, type?: FoodType) => (type === 'nv' ? diet === 'Non-veg' : type === 'egg' ? diet !== 'Veg' : true);

// ---------- Small hooks ----------
// Counts a number up / down with an ease-out, like the prototype's protein counter.
export function useCountUp(v: number, ms = 700, from = 0) {
  const [shown, setShown] = useState(from);
  const cur = useRef(from);
  useEffect(() => {
    const a = cur.current; const t0 = Date.now(); let raf = 0;
    const step = () => {
      const pr = Math.min(1, (Date.now() - t0) / ms); const e = 1 - Math.pow(1 - pr, 3);
      const val = Math.round(a + (v - a) * e); cur.current = val; setShown(val);
      if (pr < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [v, ms]);
  return shown;
}
