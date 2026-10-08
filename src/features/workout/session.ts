import { Ex, legDay, SetT } from '@/lib/data';
import { Session } from '@/lib/domain';
import { fmt1 } from '@/lib/useNow';

export const WORKOUT_MIN = 50;

// One version of the workout: the coach's plan as written.
export function buildExercises(): Ex[] {
  return legDay();
}

export function newSession(): Session {
  return { startAt: Date.now(), phase: 'warmup', exIdx: 0, ex: buildExercises(), listDone: {}, rest: null, setTimer: null, itemTimer: null };
}

export const firstTodo = (e: Ex) => e.sets.findIndex((s) => s.st === 'todo');
export const openSets = (s: Session) => s.ex.reduce((a, e) => a + e.sets.filter((x) => x.st === 'todo').length, 0);

// Warm-up sets never get a bare "W": they show a "Warm-up" pill and don't take a number.
export function setLabel(e: Ex, i: number) {
  if (e.sets[i].w) return 'Warm-up';
  let n = 0;
  for (let j = 0; j <= i; j++) if (!e.sets[j].w) n++;
  return String(n);
}

export function setText(e: Ex, x: SetT, done = false) {
  const r = done ? x.dr ?? x.r : x.r, k = done ? x.dk ?? x.k : x.k, t = done ? x.dt ?? x.t : x.t;
  if (e.mode === 'rw') return `${fmt1(k)} kg × ${r}`;
  if (e.mode === 'r') return `${r} reps`;
  if (e.mode === 't') return `${t} s`;
  return `${t} s · ${fmt1(k)} kg`;
}

export const COL_LABEL = { rw: 'kg × reps', r: 'Reps', t: 'Time', tw: 'Time · kg' } as const;

export function stats(s: Session) {
  const mins = Math.max(1, Math.round((Date.now() - s.startAt) / 60000));
  let sets = 0;
  let pr: { name: string; kg: number } | null = null;
  const base = legDay();
  s.ex.forEach((e) => {
    const plan = base.find((b) => b.id === e.id);
    const planMax = Math.max(0, ...(plan?.sets.filter((x) => !x.w).map((x) => x.k) ?? [0]));
    e.sets.forEach((x) => {
      if (x.st !== 'done') return;
      sets++;
      if (!x.w && (e.mode === 'rw' || e.mode === 'tw') && (x.dk ?? x.k) > planMax && (!pr || (x.dk ?? x.k) > pr.kg)) pr = { name: e.name, kg: x.dk ?? x.k };
    });
  });
  const exercises = s.ex.filter((e) => e.sets.some((x) => x.st === 'done')).length;
  return { mins, sets, exercises, totalEx: s.ex.length, pr: pr as { name: string; kg: number } | null, kcal: Math.max(40, mins * 7) };
}
