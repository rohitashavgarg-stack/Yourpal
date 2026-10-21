import { useSyncExternalStore } from 'react';
import { devParam } from './devParams';

// Tiny module-level store so the Progress / Gym tab and their pushed pages share
// screen-local state without touching the shared domain or root layout.
// devKey: the name the screenshot scripts use to patch this store from the URL (see devParams.ts).
export function createStore<T extends object>(init: () => T, devKey?: string) {
  const patch = devKey ? (devParam<Record<string, object>>('stores') ?? {})[devKey] : undefined;
  let s = { ...init(), ...patch } as T;
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
