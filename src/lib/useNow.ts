import { useEffect, useState } from 'react';

// Re-renders every `ms` while `active`, returning Date.now(). Used by timers.
export function useNow(active: boolean, ms = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return now;
}

export function mmss(sec: number) {
  const t = Math.max(0, Math.ceil(sec));
  const m = Math.floor(t / 60), r = t % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

export const fmt1 = (n: number) => (Math.round(n * 10) / 10).toString();
export const inr = (n: number) => n.toLocaleString('en-IN');
