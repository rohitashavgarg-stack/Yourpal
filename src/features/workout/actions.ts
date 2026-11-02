import { useCallback, useMemo } from 'react';
import { Ex, SetT } from '@/lib/data';
import { Session, useDomain } from '@/lib/domain';
import { haptic } from '@/lib/haptics';

export const REST_SEC = 105;

// All writes to the live session go through here (functional updates, so sheets never hold stale state).
export function useSessionActions() {
  const { set } = useDomain();
  const upd = useCallback((fn: (s: Session) => Partial<Session>) => set((d) => (d.session ? { session: { ...d.session, ...fn(d.session) } } : {})), [set]);
  const updEx = useCallback((exIdx: number, fn: (e: Ex) => Ex, extra?: (s: Session) => Partial<Session>) => upd((s) => {
    const ex = s.ex.slice();
    ex[exIdx] = fn({ ...ex[exIdx], sets: ex[exIdx].sets.map((x) => ({ ...x })) });
    return { ex, ...(extra ? extra(s) : {}) };
  }), [upd]);

  return useMemo(() => ({
    upd,
    updEx,
    logSet(exIdx: number, i: number, vals: { r: number; k: number; t: number } | null) {
      haptic.success();
      updEx(exIdx, (e) => {
        const s = e.sets[i];
        e.sets[i] = { ...s, st: 'done', dr: vals ? vals.r : s.r, dk: vals ? vals.k : s.k, dt: vals ? vals.t : s.t };
        return e;
      }, () => ({ setTimer: null, rest: { endAt: Date.now() + REST_SEC * 1000, total: REST_SEC } }));
    },
    unlogSet(exIdx: number, i: number) {
      haptic.light();
      updEx(exIdx, (e) => { e.sets[i] = { ...e.sets[i], st: 'todo', dr: undefined, dk: undefined, dt: undefined }; return e; });
    },
    setStatus(exIdx: number, i: number, st: SetT['st']) {
      updEx(exIdx, (e) => { e.sets[i] = { ...e.sets[i], st }; return e; });
    },
    addSet(exIdx: number) {
      haptic.light();
      updEx(exIdx, (e) => { const l = e.sets[e.sets.length - 1]; e.sets.push({ r: l.r, k: l.k, t: l.t, w: false, st: 'todo' }); return e; });
    },
    toggleWarm(exIdx: number, i: number) { updEx(exIdx, (e) => { e.sets[i] = { ...e.sets[i], w: !e.sets[i].w }; return e; }); },
    setNote(exIdx: number, i: number, note: string) { updEx(exIdx, (e) => { e.sets[i] = { ...e.sets[i], note }; return e; }); },
    copyToAll(exIdx: number, k: number, r: number) { updEx(exIdx, (e) => { e.sets = e.sets.map((x) => (x.st === 'todo' && !x.w ? { ...x, k, r } : x)); return e; }); },
    skipExercise(exIdx: number) { updEx(exIdx, (e) => { e.sets = e.sets.map((x) => (x.st === 'todo' ? { ...x, st: 'skipped' } : x)); return e; }); },
    swap(exIdx: number, name: string, plan: boolean) { updEx(exIdx, (e) => ({ ...e, name, swapped: !plan })); },
    completeAll(exIdx: number) { updEx(exIdx, (e) => { e.sets = e.sets.map((x) => (x.st === 'todo' ? { ...x, st: 'done', dr: x.r, dk: x.k, dt: x.t } : x)); return e; }); },
    skipOpenSets() { upd((s) => ({ ex: s.ex.map((e) => ({ ...e, sets: e.sets.map((x) => (x.st === 'todo' ? { ...x, st: 'skipped' as const } : x)) })) })); },
    add30() {
      haptic.medium();
      upd((s) => {
        if (!s.rest) return {};
        const left = Math.max(0, (s.rest.endAt - Date.now()) / 1000);
        return { rest: { endAt: Date.now() + (left + 30) * 1000, total: Math.max(s.rest.total, left + 30) } };
      });
    },
    skipRest() { upd(() => ({ rest: null })); },
    goEx(exIdx: number) { upd(() => ({ exIdx, rest: null })); },
    phase(phase: Session['phase']) { upd(() => ({ phase, itemTimer: null, rest: null, ...(phase === 'cooldown' ? { listDone: {} } : {}) })); },
  }), [upd, updEx]);
}
