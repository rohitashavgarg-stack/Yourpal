import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { basePlans, Ex, FoodType, legDay, MealId, MEALS, PlanDay } from './data';

// Shared in-app state for Today, Workout, Plans, Progress and Gym.
// Everything is local (mock backend). Screens read with useDomain() and write with set().

export type Extra = { n: string; k: number; p: number; est?: boolean; type?: FoodType };
export type MealLog = { eaten: number[]; extra: Extra[]; repl: Record<number, Extra>; skip?: boolean; at?: number };
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';
export type CheckInScenario = 'Away' | 'Near (25 m)' | 'At the gym' | 'Checked in' | 'Location off';

export type Session = {
  startAt: number;
  phase: 'warmup' | 'main' | 'cooldown';
  exIdx: number;
  ex: Ex[];
  listDone: Record<string, boolean>;
  rest: { endAt: number; total: number } | null;
  setTimer?: { exIdx: number; i: number; endAt: number; total: number } | null; // timed set running
  itemTimer?: { id: string; endAt: number } | null; // warm-up / cool-down timer
};

export type Domain = {
  time: TimeOfDay; // the part of the day, derived from min
  min: number; // minutes since midnight: the app's "now" (set by the hourly slider in the edge-case panel)
  todayVariant: 'Regular' | 'With updates' | 'Comeback';
  loading: boolean;
  hc: boolean; // the phone's health store is connected (steps)
  hasGym: boolean; // the member belongs to a gym: Gym tab, check-in, coach, facility step in onboarding
  askGym: boolean; // onboarding asks which gym you are joining (off by default)
  wearable: boolean; // the member has a watch or band (heart rate, sleep, active energy, burned kcal); needs hc too
  water: number; // litres
  weight: number;
  weightLog: { t: string; v: number }[];
  meals: Partial<Record<MealId, MealLog>>;
  wkScenario: 'Not started' | 'Done' | 'Rest day';
  wkDone: { a: number; b: number; k: number } | null;
  session: Session | null;
  ci: CheckInScenario;
  ciAt: number | null;      // check-in time, minutes of the day (display)
  ciStart: number | null;   // check-in moment, epoch ms (drives elapsed time and auto check-out)
  ciOut: { at: number; mins: number; auto?: 'time' | 'left' } | null; // last check-out
  ciExtend: number;         // minutes added by "Keep going"
  ciHold: number | null;    // epoch ms: auto check-out 10 min after a workout that ran past the limit
  scanFails: boolean;
  dismissed: Record<string, boolean>;
  plans: Record<number, PlanDay>;
  planReq: 'none' | 'requested' | 'ready';
  coachUpdated: boolean;
  goal: { type: string; target: number; by: string };
  membership: 'Active' | 'Expiring' | 'Grace' | 'Grace over';
  assess: 'Two done' | 'Only first' | 'Due now' | 'None yet';
  ptLeft: number;
  onBreak: boolean;
  chat: { me: boolean; t: string; meta: string; ctx?: string; failed?: boolean; img?: string; audio?: { uri: string; dur: number } }[];
  offline: boolean;
  notifsRead: Record<string, boolean>;
  openMeal: MealId | 'none' | null; // Today accordion: null = auto (next un-logged meal)
};

export const NOWS: Record<TimeOfDay, number> = { Morning: 520, Afternoon: 800, Evening: 1100 };
export const ACTIVE_KCAL: Record<TimeOfDay, number> = { Morning: 60, Afternoon: 180, Evening: 320 };

export function mealsFor(t: TimeOfDay): Partial<Record<MealId, MealLog>> {
  const m: Partial<Record<MealId, MealLog>> = { bf: { eaten: [0, 1], extra: [], repl: {}, at: 490 } };
  if (t === 'Evening') m.lu = { eaten: [0, 1, 2], extra: [], repl: {}, at: 830 };
  return m;
}

export function initialDomain(): Domain {
  return {
    time: 'Evening', min: 1100, todayVariant: 'Regular', loading: false, hc: true, wearable: true, hasGym: true, askGym: false,
    water: 1.8, weight: 72.4, weightLog: [{ t: 'Mon 22', v: 72.6 }, { t: 'Tue 23', v: 72.5 }],
    meals: mealsFor('Evening'), wkScenario: 'Not started', wkDone: null, session: null,
    ci: 'At the gym', ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null, scanFails: false, dismissed: {}, plans: basePlans(), planReq: 'none', coachUpdated: false,
    goal: { type: 'Weight loss', target: 6, by: '30 Nov' }, membership: 'Active', assess: 'Two done', ptLeft: 8, onBreak: false,
    chat: [{ me: true, t: 'Is my squat depth ok?', ctx: 'Squat', meta: 'Yesterday · Seen' }, { me: false, t: 'Go to parallel. Film one set and send it.', meta: '2 hours ago' }],
    offline: false, notifsRead: {}, openMeal: null,
  };
}

type Ctx = { d: Domain; set: (p: Partial<Domain> | ((d: Domain) => Partial<Domain>)) => void; reset: () => void };
const DomainCtx = createContext<Ctx | null>(null);

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const [d, setD] = useState<Domain>(initialDomain);
  const set = useCallback<Ctx['set']>((p) => setD((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })), []);
  const reset = useCallback(() => setD(initialDomain()), []);
  const v = useMemo(() => ({ d, set, reset }), [d, set, reset]);
  return <DomainCtx.Provider value={v}>{children}</DomainCtx.Provider>;
}

export function useDomain() {
  const c = useContext(DomainCtx);
  if (!c) throw new Error('useDomain outside DomainProvider');
  return c;
}

// ---------- Derived helpers used by several screens ----------
export const bucketOf = (m: number): TimeOfDay => (m < 720 ? 'Morning' : m < 1020 ? 'Afternoon' : 'Evening');
export const nowMin = (d: Domain) => d.min;
// Heart rate, sleep, active energy and burned kcal come from a wearable through the health store.
export const hasWearableData = (d: Pick<Domain, 'hc' | 'wearable'>) => d.hc && d.wearable;

export function mealLog(d: Domain, id: MealId): MealLog {
  const x = d.meals[id];
  return { eaten: x?.eaten ?? [], extra: x?.extra ?? [], repl: x?.repl ?? {}, skip: !!x?.skip, at: x?.at };
}

export function itemNow(d: Domain, id: MealId, k: number) {
  const m = MEALS.find((q) => q.id === id)!;
  const r = mealLog(d, id).repl[k];
  return r ? { n: r.n, k: r.k, p: r.p, est: !!r.est, replaced: true } : { n: m.items[k].n, k: m.items[k].k, p: m.items[k].p, est: false, replaced: false };
}

export function totals(d: Domain) {
  let k = 0, p = 0, onPlan = 0, done = 0;
  for (const m of MEALS) {
    const x = mealLog(d, m.id);
    x.eaten.forEach((i) => { const it = itemNow(d, m.id, i); k += it.k; p += it.p; });
    x.extra.forEach((e) => { k += e.k; p += e.p; });
    const full = x.eaten.length === m.items.length;
    if (full && !x.extra.length && !Object.keys(x.repl).length) onPlan++;
    if (x.skip || full || (x.eaten.length + x.extra.length > 0 && x.extra.length > 0)) done++;
  }
  return { k, p, onPlan, done };
}

export function workoutState(d: Domain): 'hidden' | 'rest' | 'done' | 'live' | 'todo' {
  if (d.todayVariant === 'Comeback') return 'hidden';
  if (d.wkScenario === 'Rest day') return 'rest';
  if (d.wkDone || d.wkScenario === 'Done') return 'done';
  if (d.session) return 'live';
  return 'todo';
}
export const wkDoneInfo = (d: Domain) => d.wkDone ?? { a: 1122, b: 1168, k: 380 };
export const burned = (d: Domain) => Math.round(320 * Math.min(1, Math.max(0, (d.min - 360) / 740))) + (workoutState(d) === 'done' ? wkDoneInfo(d).k : 0);

// Meal mutations
export function useMeals() {
  const { d, set } = useDomain();
  const patch = useCallback((id: MealId, p: Partial<MealLog>) => set((s) => {
    const cur = mealLog(s, id);
    return { meals: { ...s.meals, [id]: { ...cur, ...p } }, openMeal: s.openMeal ?? id };
  }), [set]);
  const toggleItem = useCallback((id: MealId, k: number) => set((s) => {
    const cur = mealLog(s, id); const e = cur.eaten.includes(k) ? cur.eaten.filter((x) => x !== k) : [...cur.eaten, k];
    // Pin the accordion to this meal so ticking an item never collapses it.
    return { meals: { ...s.meals, [id]: { ...cur, eaten: e, skip: false, at: cur.at ?? s.min } }, openMeal: s.openMeal ?? id };
  }), [set]);
  const snapshot = () => d.meals;
  const restore = (m: Domain['meals']) => set({ meals: m });
  return { patch, toggleItem, snapshot, restore };
}
