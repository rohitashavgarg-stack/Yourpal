import type { Profile } from '@/lib/store';

export const needsTarget = (goal: string) => goal === 'Weight loss' || goal === 'Muscle gain';
export const dirOf = (goal: string) => (goal === 'Muscle gain' ? 1 : -1);
export const RATE = { loss: 0.5, gain: 0.25 }; // kg per week, a pace we are happy to promise

export function planMath(p: Profile) {
  const cur = +p.weightKg || 70;
  const target = +p.targetKg || cur;
  const gain = p.goal === 'Muscle gain';
  const delta = Math.abs(Math.round((target - cur) * 10) / 10);
  const weeks = Math.max(2, Math.ceil(delta / (gain ? RATE.gain : RATE.loss)));
  return { cur, target, gain, delta, weeks, has: needsTarget(p.goal) && !!p.targetKg && delta > 0 };
}
