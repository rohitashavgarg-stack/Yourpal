import { PlanDay } from '@/lib/data';
import { Food } from './store';

// Mock content that only the Plans area uses (ported from reference/Plans.dc.html).

export const TIPS: Record<string, string> = {
  Squat: 'Feet shoulder-width · chest up · knees track toes',
  'Leg press': "Lower back stays on the pad · don't lock your knees",
  'Walking lunges': 'Long step · back knee just above the floor',
  Lunges: 'Long step · back knee just above the floor',
  'Romanian deadlift': 'Soft knees · push the hips back · bar stays close to the legs',
  Plank: 'Straight line from head to heels · squeeze glutes',
};
export const tipFor = (n: string) => TIPS[n] ?? 'Control the lowering part · breathe out as you push · stop if it hurts';
export const histFor = (n: string) => (n === 'Squat' ? 'Last: 4 × 8 · 57.5 kg · PR 62.5 kg' : n === 'Bench press' ? 'Last: 4 × 8 · 57.5 kg · PR 57.5 kg' : n === 'Deadlift' ? 'Last: 3 × 5 · 80 kg · PR 80 kg' : 'No history yet. Log it once to see it here.');

// Food catalogue for "What did you eat?" (includes egg / non-veg so the diet filter matters).
export const FOOD: Food[] = [
  { n: 'Poha, 1 plate', k: 250, p: 5 }, { n: 'Poha with peanuts', k: 300, p: 7 }, { n: 'Idli, 2 pieces', k: 150, p: 4 }, { n: 'Masala dosa, 1', k: 350, p: 6 },
  { n: 'Aloo paratha, 1', k: 290, p: 6 }, { n: 'Rajma chawal, 1 plate', k: 420, p: 14 }, { n: 'Dal tadka, 1 katori', k: 160, p: 9 }, { n: 'Roti, 1', k: 70, p: 2 },
  { n: 'Sprouts chaat, 1 bowl', k: 150, p: 9 }, { n: 'Samosa, 1', k: 260, p: 4 }, { n: 'Curd, 1 katori', k: 100, p: 6 }, { n: 'Paneer bhurji, 100 g', k: 260, p: 16 },
  { n: 'Banana, 1', k: 105, p: 1 }, { n: 'Masala chai, 1 cup', k: 90, p: 3 }, { n: 'Veg sandwich, 1', k: 230, p: 7 }, { n: 'Boiled eggs, 2', k: 150, p: 12, type: 'egg' },
  { n: 'Fish curry, 1 katori', k: 220, p: 20, type: 'nv' }, { n: 'Egg bhurji, 2 eggs', k: 200, p: 13, type: 'egg' }, { n: 'Chicken biryani, 1 plate', k: 500, p: 22, type: 'nv' },
];
export const RECENT = ['Curd, 1 katori', 'Masala chai, 1 cup', 'Roti, 1', 'Banana, 1'];
export const SCAN_PHOTO: Food = { n: 'Rajma chawal + 1 roti', k: 490, p: 16, c: 82, f: 10, type: 'veg' };
export const macroLine = (f: Food) => `P ${f.p} · C ${f.c ?? Math.round((f.k * 0.5) / 4)} · F ${f.f ?? Math.round((f.k * 0.3) / 9)} g`;

export const HIST = [
  { t: 'Wed 17 · Leg day', s: 'Quick version', m: '48 min', b: 'Squat 4 × 8 · 60 kg\nLeg press 3 × 12 · 125 kg\nWalking lunges 3 × 10\nPlank 3 × 45 s' },
  { t: 'Mon 22 · Push', s: '2 PRs', m: '45 min', b: 'Bench press 4 × 8 · 57.5 kg  PR\nShoulder press 3 × 10 · 22.5 kg  PR\nTricep pushdown 3 × 12 · 20 kg' },
  { t: 'Sat 20 · Home workout', s: 'No check-in', m: '25 min', b: 'Push-ups 3 × 15\nBodyweight squats 3 × 20\nPlank 3 × 45 s' },
  { t: 'Thu 18 · Pull', s: '', m: '52 min', b: 'Deadlift 3 × 5 · 80 kg\nLat pulldown 3 × 10 · 45 kg\nSeated row 3 × 12 · 40 kg' },
];
export type Hist = (typeof HIST)[number];

export const REASONS = {
  workout: ['Too easy', 'Too hard', 'New goal', 'Schedule changed', 'Bored', 'Injury or pain'],
  diet: ['Too hard to follow', 'Schedule changed', 'Eating out a lot', 'New goal'],
};

// Coach Vikram's update to Leg day (what "What changed" lists).
export const COACH_CHANGES = [
  { tag: 'Added', name: 'Romanian deadlift', meta: '3 × 10 · Leg day' },
  { tag: 'Removed', name: "Farmer's carry", meta: 'Leg day' },
  { tag: 'Changed', name: 'Squat 60 → 62.5 kg', meta: 'Leg day' },
] as const;
export const COACH_BANNER = "Leg day: Romanian deadlift added, farmer's carry removed";
export const COACH_HL = ['sq', 'rd'];

export function applyCoachUpdate(plans: Record<number, PlanDay>): Record<number, PlanDay> {
  const leg = plans[2];
  if (!leg) return plans;
  const ex = leg.ex.filter((e) => e.id !== 'fc').map((e) => { const n = { ...e }; delete n.by; if (n.id === 'sq') n.kg = 62.5; return n; });
  if (!ex.some((e) => e.id === 'rd')) ex.splice(3, 0, { id: 'rd', name: 'Romanian deadlift', sets: 3, reps: 10, kg: 40, mode: 'rw' });
  return { ...plans, 2: { ...leg, ex } };
}

// Line icons for exercise tiles (same drawings as the prototype).
const I = {
  squat: 'M12 3.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM4.5 8h15M12 7.5v5l-4 2.5v5M12 12.5l4 2.5v5',
  lunge: 'M11 3.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM11 7.5v6l-5 2.5v4M11 13.5l5 1 1 5.5',
  legpress: 'M4 20l6-6M10 14l6-4M16 10V5M13 5h6M3 20h8',
  machine: 'M5 18h10M9 18V9h6M15 9l4 6M7 9h4M5 21h10',
  calf: 'M12 3.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM12 7.5v7M9 20l3-5.5 3 5.5M8 21h8M8 10h8',
  bench: 'M4 15h16M7 15v5M17 15v5M6 10h12M8 7v6M16 7v6',
  pull: 'M4 4h16M8 4l2 6M16 4l-2 6M12 9.5v6.5M9 21l3-5 3 5',
  dead: 'M3 19h18M6 16v6M18 16v6M12 3.4a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM12 8v5l-3 6M12 13l3 6',
  arm: 'M8 20v-7l4-4M12 9l3-3M13.5 3.5l4 4M6 20h4',
  core: 'M4 16h16M7 16l3-4h6l3 4M16 9.5a1.6 1.6 0 1 1 0 .01',
  db: 'M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11',
};
export function iconFor(n: string) {
  const k = n.toLowerCase();
  if (k.includes('leg press')) return I.legpress;
  if (k.includes('squat')) return I.squat;
  if (k.includes('lunge') || k.includes('split')) return I.lunge;
  if (k.includes('calf')) return I.calf;
  if (k.includes('curl') && k.includes('leg')) return I.machine;
  if (k.includes('extension')) return I.machine;
  if (k.includes('deadlift') || k.includes('thrust')) return I.dead;
  if (k.includes('bench') || k.includes('press') || k.includes('push-up')) return I.bench;
  if (k.includes('pull') || k.includes('row')) return I.pull;
  if (k.includes('curl') || k.includes('tricep')) return I.arm;
  if (k.includes('plank') || k.includes('dead bug')) return I.core;
  return I.db;
}

// New exercise from the library: time-based moves start as time sets.
export function newEx(name: string, by: 'you' | 'created') {
  const timed = /plank|hold|carry/i.test(name);
  return { id: `x${Date.now()}`, name, sets: 3, reps: timed ? 0 : 10, kg: 0, mode: timed ? ('t' as const) : ('rw' as const), t: timed ? 45 : undefined, by };
}
