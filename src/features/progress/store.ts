import { useSyncExternalStore } from 'react';
import { Range, sod, TODAY } from './trends';

// Tiny module-level store so the Progress / Gym tab and their pushed pages share
// screen-local state without touching the shared domain or root layout.
export function createStore<T extends object>(init: () => T) {
  let s = init();
  const ls = new Set<() => void>();
  const emit = () => ls.forEach((l) => l());
  const get = () => s;
  const set = (p: Partial<T> | ((s: T) => Partial<T>)) => {
    s = { ...s, ...(typeof p === 'function' ? p(s) : p) };
    emit();
  };
  const sub = (l: () => void) => { ls.add(l); return () => { ls.delete(l); }; };
  const use = () => useSyncExternalStore(sub, get, get);
  const reset = () => { s = init(); emit(); };
  return { get, set, use, reset };
}

export type LiftName = 'Bench press' | 'Squat' | 'Leg press';

export const progressStore = createStore(() => ({
  range: 'week' as Range,
  anchor: sod(TODAY).getTime(), // any day inside the window being viewed
  data: 'Normal' as 'Normal' | 'New member',
  hidden: 'None' as 'None' | 'Water & steps',
  loading: false,
  refreshing: false,
  lift: 'Leg press' as LiftName,
  metric: 0 as 0 | 1 | 2,
  stallGone: false,
  photos: [{ d: 'Sep 2' }, { d: 'Sep 30' }] as { d: string; fresh?: boolean }[],
}));
