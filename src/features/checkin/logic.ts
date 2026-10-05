import { CheckInScenario, Domain, nowMin } from '@/lib/domain';

export const LIMIT_MIN = 90;      // auto check-out
export const WARN_BEFORE = 10;    // prompt at 80
export const EXTEND_MIN = 30;     // "Keep going"
export const HOLD_MIN = 10;       // after a workout that ran past the limit

export const isIn = (d: Domain) => d.ciStart != null && !d.ciOut;
export const limitOf = (d: Domain) => LIMIT_MIN + d.ciExtend;
export const elapsedMin = (d: Domain, now: number) => (d.ciStart == null ? 0 : Math.max(0, (now - d.ciStart) / 60000));

export function checkOutPatch(d: Domain, now: number, auto?: 'time' | 'left'): Partial<Domain> {
  const mins = Math.max(1, Math.round(elapsedMin(d, now)));
  return { ciOut: { at: (d.ciAt ?? nowMin(d)) + mins, mins, auto }, ciHold: null };
}

// Keep going: 30 more minutes from now if we are already past the limit, otherwise from the limit.
export function keepGoingPatch(d: Domain, now: number): Partial<Domain> {
  const base = Math.max(limitOf(d), Math.ceil(elapsedMin(d, now)));
  return { ciExtend: base + EXTEND_MIN - LIMIT_MIN, ciHold: null };
}

export function undoCheckOutPatch(d: Domain, now: number): Partial<Domain> {
  // Undoing a check-out that happened at or past the limit would just fire again, so extend too.
  return { ciOut: null, ...(elapsedMin(d, now) >= limitOf(d) - WARN_BEFORE ? keepGoingPatch(d, now) : {}) };
}

// Edge-case panel: choosing a location scenario. Leaving the gym area while checked in checks you out.
export function ciPatch(d: Domain, v: CheckInScenario, now: number): Partial<Domain> {
  const clear = { ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null };
  if (v === 'Checked in') return { ci: v, ciAt: 1098, ciStart: now - 42 * 60000, ciOut: null, ciExtend: 0, ciHold: null };
  if ((v === 'Away' || v === 'Near (25 m)') && isIn(d)) return { ci: v, ...checkOutPatch(d, now, 'left') };
  return { ci: v, ...clear };
}
