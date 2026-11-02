// Self assessment. The steps and their wording come from the app's assessment flow in Figma ("Assessment", 18 steps),
// keeping the ones a member can do alone. Left out: the client's gender (the profile has it), the body composition report upload
// and the treadmill test (they need the gym's machines). The coach can enter the same form from his own app.

export type NumKey = 'height' | 'weight' | 'chest' | 'waist' | 'hip' | 'arms' | 'legs' | 'calves' | 'sleep' | 'bench' | 'legpress' | 'breath' | 'sys' | 'dia' | 'pulse' | 'sugar';
export type SelfEntry = { id: string; at: string; by: 'member' | 'coach'; answers: Record<string, string>; tests: Partial<Record<NumKey, number>> };

// dir: which way is better (none: it is just a size, so there is no better or worse)
export const NUMS: Record<NumKey, { label: string; unit: string; dir: 'down' | 'up' | 'none'; dp: number }> = {
  height: { label: 'Height', unit: 'cm', dir: 'none', dp: 0 },
  weight: { label: 'Weight', unit: 'kg', dir: 'down', dp: 1 },
  chest: { label: 'Chest', unit: 'cm', dir: 'none', dp: 0 },
  waist: { label: 'Waist', unit: 'cm', dir: 'down', dp: 0 },
  hip: { label: 'Hip', unit: 'cm', dir: 'none', dp: 0 },
  arms: { label: 'Arms', unit: 'cm', dir: 'none', dp: 0 },
  legs: { label: 'Legs', unit: 'cm', dir: 'none', dp: 0 },
  calves: { label: 'Calves', unit: 'cm', dir: 'none', dp: 0 },
  sleep: { label: 'Sleep', unit: 'h', dir: 'up', dp: 1 },
  bench: { label: 'Bench press', unit: 'kg', dir: 'up', dp: 0 },
  legpress: { label: 'Leg press', unit: 'kg', dir: 'up', dp: 0 },
  breath: { label: 'Breath-hold', unit: 's', dir: 'up', dp: 0 },
  sys: { label: 'Systolic', unit: 'mm/hg', dir: 'down', dp: 0 },
  dia: { label: 'Diastolic', unit: 'mm/hg', dir: 'down', dp: 0 },
  pulse: { label: 'Pulse rate', unit: 'bpm', dir: 'down', dp: 0 },
  sugar: { label: 'Blood sugar', unit: 'mg/dl', dir: 'down', dp: 0 },
};

type Field = { k: NumKey; label?: string; placeholder: string };
type Opt = { v: string; sub?: string };
export type Step =
  | { id: string; kind: 'fields'; title: string; sub?: string; fields: Field[]; how?: string[] }
  | { id: string; kind: 'choice'; title: string; sub?: string; key: string; options: Opt[]; how?: string[] }
  | { id: string; kind: 'injuries'; title: string; sub: string }
  | { id: string; kind: 'next'; title: string; sub: string };

export const INJURY_AREAS = ['Neck', 'Shoulder', 'Arm', 'Back', 'Hip', 'Leg', 'Knee', 'Ankle', 'Foot', 'Chest'];

export const STEPS: Step[] = [
  { id: 'hw', kind: 'fields', title: 'Choose height and weight', fields: [{ k: 'height', label: 'Height', placeholder: 'cm' }, { k: 'weight', label: 'Weight', placeholder: 'kg' }] },
  { id: 'body', kind: 'fields', title: 'Body Measurements', sub: 'Track body metrics for accurate assessment', fields: (['chest', 'waist', 'hip', 'arms', 'legs', 'calves'] as NumKey[]).map((k) => ({ k, label: NUMS[k].label, placeholder: `Enter ${NUMS[k].label.toLowerCase()} size` })) },
  { id: 'fat', kind: 'choice', title: 'Body fat %?', sub: 'Pick the range that looks most like you.', key: 'fat', options: ['3-5 %', '6-9 %', '10-12 %', '13-17 %', '17-22 %', '23-27 %', '28-32 %', '33-37 %', 'Not sure'].map((v) => ({ v })) },
  { id: 'sleep', kind: 'fields', title: 'Sleep duration', sub: 'To provide you with the best results, tell us how long you sleep at night.', fields: [{ k: 'sleep', label: 'Hours of sleep', placeholder: 'For example 8' }] },
  { id: 'activity', kind: 'choice', title: 'Activity Level', key: 'activity', options: [{ v: '1', sub: 'Not active' }, { v: '2', sub: 'Lightly active' }, { v: '3', sub: 'Moderately active' }, { v: '4', sub: 'Somewhat athletic' }, { v: '5', sub: 'Very athletic' }] },
  { id: 'freq', kind: 'choice', title: 'Workout Frequency per week', key: 'freq', options: [{ v: '1', sub: 'Day per week' }, { v: '2', sub: 'Days per week' }, { v: '3', sub: 'Days per week' }, { v: '4', sub: 'Days per week' }, { v: '5', sub: 'Days per week' }, { v: "I don't workout" }] },
  { id: 'water', kind: 'choice', title: 'How much water do you drink in a day?', key: 'water', options: ['More than 4 l', '3-4 l', '1-2 l', 'Less than 1 l'].map((v) => ({ v })) },
  { id: 'level', kind: 'choice', title: 'Training Level', key: 'level', options: [{ v: 'Beginner', sub: 'New to fitness training' }, { v: 'Intermediate', sub: 'Workout regularly' }, { v: 'Advanced', sub: 'Seasoned athlete seeking new challenges' }] },
  {
    id: 'strength', kind: 'fields', title: 'Strength Test', sub: 'Bench press measures upper body strength. Leg press measures lower body strength. Skip what you did not do.',
    fields: [{ k: 'bench', label: 'Bench Press Test', placeholder: 'Kg' }, { k: 'legpress', label: 'Leg Press Test', placeholder: 'Kg' }],
    how: ['Bench press: lie on the bench with feet flat and grip the bar evenly, lower the bar slowly to your chest, press it up in a controlled motion, and stop at your max reps and re-rack the bar safely.', 'Leg press: sit with your back supported and feet on the platform, push it until your legs are almost straight, lower it with control, and stop at your max reps and lock the safety handle.'],
  },
  {
    id: 'flex', kind: 'choice', title: 'Flexibility Test', sub: 'Sit & Reach Flexibility Test helps to find the flexibility', key: 'flex', options: ['Poor', 'Moderate', 'Good', 'Very Good', 'Excellent'].map((v) => ({ v })),
    how: ['Sit with legs straight and feet against the box.', 'Start when you are ready.', 'Reach forward as far as you can and hold for 2 seconds.', 'Note how far you reached, then pick the closest picture.'],
  },
  {
    id: 'breath', kind: 'fields', title: 'Breath-Hold Test', sub: 'Check breath-hold endurance', fields: [{ k: 'breath', label: 'Time you held your breath', placeholder: 'Seconds' }],
    how: ['Sit relaxed and take a normal breath in and out.', 'Take a deep breath and start holding.', 'Stay still and maintain calm breathing control.', 'Stop the timer when you cannot hold your breath any longer.'],
  },
  { id: 'injuries', kind: 'injuries', title: 'Injuries & Diseases', sub: 'Please mention any existing injuries for better assessment' },
  { id: 'bp', kind: 'fields', title: 'Blood Pressure', sub: 'Please check and enter your blood pressure for better understanding. Skip it if you have no monitor.', fields: [{ k: 'sys', label: 'Systolic', placeholder: 'mm/hg' }, { k: 'dia', label: 'Diastolic', placeholder: 'mm/hg' }, { k: 'pulse', label: 'Pulse rate', placeholder: 'bpm' }] },
  { id: 'sugar', kind: 'fields', title: 'Blood Glucose', sub: 'Please check and enter your blood sugar for better understanding. Skip it if you have no meter.', fields: [{ k: 'sugar', label: 'Sugar', placeholder: 'mg/dl' }] },
  { id: 'next', kind: 'next', title: 'Next assessment', sub: 'When would you like to take the next assessment?' },
];

// The assessment the coach did on 30 Sep, so there is something to compare a first self assessment with.
export const COACH_SAMPLE: SelfEntry = {
  id: 'coach-1', at: '2026-09-30T10:00:00.000Z', by: 'coach',
  answers: { activity: '3', freq: '3', water: '1-2 l', level: 'Beginner', flex: 'Moderate', injuries: 'None' },
  tests: { weight: 72.4, chest: 98, waist: 89, hip: 99, arms: 31, legs: 56, calves: 36, sleep: 7, bench: 40, legpress: 120, breath: 35, sys: 124, dia: 82, pulse: 72 },
};

export const fmtAt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Each measurement the entry has, with the change since the other one and whether it is an improvement (sizes have no better or worse). */
export function compare(now: SelfEntry, prev: SelfEntry | undefined) {
  return (Object.keys(NUMS) as NumKey[]).flatMap((k) => {
    const a = now.tests[k];
    if (a == null) return [];
    const n = NUMS[k];
    const b = prev?.tests[k];
    if (b == null) return [{ k, n, now: a, prev: undefined as number | undefined, diff: 0, good: false }];
    const diff = Math.round((a - b) * 10 ** n.dp) / 10 ** n.dp;
    return [{ k, n, now: a, prev: b, diff, good: n.dir === 'down' ? diff < 0 : n.dir === 'up' ? diff > 0 : false }];
  });
}

export const habitLabel: Record<string, string> = { fat: 'Body fat', activity: 'Activity', freq: 'Workouts a week', water: 'Water', level: 'Level', flex: 'Flexibility', injuries: 'Injuries' };
