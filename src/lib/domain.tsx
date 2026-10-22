import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { basePlans, Ex, FoodType, legDay, MealId, MEALS, PlanDay } from './data';
import { devParam } from './devParams';

// Shared in-app state for Today, Workout, Plans, Progress and Gym.
// Everything is local (mock backend). Screens read with useDomain() and write with set().

export type Extra = { n: string; k: number; p: number; est?: boolean; type?: FoodType };
// por: how much of a planned item was eaten, as a multiple of the planned amount (1 is as planned, 1.5 is half as much again)
export type MealLog = { eaten: number[]; extra: Extra[]; repl: Record<number, Extra>; por?: Record<number, number>; skip?: boolean; at?: number };
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
  awayDays: number; // Comeback: days since the last session
  autoNote: string; // what the app switched off by itself on the last change, so conflicting states never show together
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
  membership: 'Active' | 'Expiring' | 'Expired';
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

// What has been eaten by a given minute of the day: every meal that was due more than 90 minutes ago, logged on time.
export function mealsAt(min: number): Partial<Record<MealId, MealLog>> {
  const m: Partial<Record<MealId, MealLog>> = {};
  for (const q of MEALS) if (q.t + 90 <= min) m[q.id] = { eaten: q.items.map((_, i) => i), extra: [], repl: {}, at: q.t + 10 };
  return m;
}
export function mealsFor(t: TimeOfDay): Partial<Record<MealId, MealLog>> {
  return mealsAt(NOWS[t]);
}
// Keeps the state believable. A comeback means no workout, no check-in and nothing running today; starting or finishing a workout ends the comeback;
// a workout cannot run on a rest day. Whatever it had to switch off is named in autoNote.
function settle(prev: Domain, next: Domain): Domain {
  let n = next;
  const notes: string[] = [];
  if (n.todayVariant === 'Comeback' && prev.todayVariant !== 'Comeback') {
    const off: string[] = [];
    if (n.wkDone || n.wkScenario !== 'Not started') off.push('workout');
    if (n.session) off.push('running workout');
    if (n.ci !== 'Away') off.push('check-in');
    if (off.length) { n = { ...n, wkScenario: 'Not started', wkDone: null, session: null, ci: 'Away', ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null }; notes.push(`Comeback turned off: ${off.join(', ')}`); }
  } else if (n.todayVariant === 'Comeback' && (n.wkDone || n.wkScenario === 'Done' || n.session)) {
    n = { ...n, todayVariant: 'Regular' };
    notes.push('Comeback ended: the workout started');
  }
  if (n.session && n.wkScenario === 'Rest day') { n = { ...n, wkScenario: 'Not started' }; notes.push('Rest day turned off: a workout is running'); }
  const note = notes.join(' · ');
  return note === n.autoNote ? n : { ...n, autoNote: note };
}

export function initialDomain(): Domain {
  return {
    time: 'Evening', min: 1100, todayVariant: 'Regular', awayDays: 4, autoNote: '', loading: false, hc: false, wearable: false, hasGym: true, askGym: false,
    water: 1.8, weight: 72.4, weightLog: [{ t: 'Mon 22', v: 72.6 }, { t: 'Tue 23', v: 72.5 }],
    meals: {}, wkScenario: 'Not started', wkDone: null, session: null,
    ci: 'At the gym', ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null, scanFails: false, dismissed: {}, plans: basePlans(), planReq: 'none', coachUpdated: false,
    goal: { type: 'Weight loss', target: 6, by: '30 Nov' }, membership: 'Active', assess: 'Two done', ptLeft: 8, onBreak: false,
    chat: [{ me: true, t: 'Is my squat depth ok?', ctx: 'Squat', meta: 'Yesterday · Seen' }, { me: false, t: 'Go to parallel. Film one set and send it.', meta: '2 hours ago' }],
    offline: false, notifsRead: {}, openMeal: null,
  };
}

type Ctx = { d: Domain; set: (p: Partial<Domain> | ((d: Domain) => Partial<Domain>)) => void; reset: () => void };
const DomainCtx = createContext<Ctx | null>(null);

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const [d, setD] = useState<Domain>(() => ({ ...initialDomain(), ...devParam<Partial<Domain>>('dom') }));
  const set = useCallback<Ctx['set']>((p) => setD((s) => settle(s, { ...s, ...(typeof p === 'function' ? p(s) : p) })), []);
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
// When the member trains, from the time of day they chose in onboarding (minutes since midnight).
// Early morning 6:00 am, Morning 9:30 am, Afternoon 4:30 pm, Evening 6:30 pm: each sits between the meal times (7:00, 1:00, 3:30, 8:00).
export const PLAN_MIN: Record<string, number> = { 'Early morning': 360, Morning: 570, Afternoon: 990, Evening: 1110, 'Changes a lot': 1110 };
export const plannedMin = (time?: string) => PLAN_MIN[time ?? ''] ?? PLAN_MIN.Evening;
export const bucketOf = (m: number): TimeOfDay => (m < 720 ? 'Morning' : m < 1020 ? 'Afternoon' : 'Evening');
export const nowMin = (d: Domain) => d.min;
// Heart rate, sleep, active energy and burned kcal come from a wearable through the health store.
export const hasWearableData = (d: Pick<Domain, 'hc' | 'wearable'>) => d.hc && d.wearable;

export function mealLog(d: Domain, id: MealId): MealLog {
  const x = d.meals[id];
  return { eaten: x?.eaten ?? [], extra: x?.extra ?? [], repl: x?.repl ?? {}, por: x?.por ?? {}, skip: !!x?.skip, at: x?.at };
}

export function itemNow(d: Domain, id: MealId, k: number) {
  const m = MEALS.find((q) => q.id === id)!;
  const x = mealLog(d, id);
  const r = x.repl[k];
  const por = x.por?.[k] ?? 1;
  return r ? { n: r.n, k: r.k, p: r.p, est: !!r.est, replaced: true } : { n: m.items[k].n, k: Math.round(m.items[k].k * por), p: Math.round(m.items[k].p * por), est: false, replaced: false };
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
